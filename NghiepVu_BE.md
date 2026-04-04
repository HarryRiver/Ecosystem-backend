# Đặc Tả BE Toàn Dự Án EcoCollect

## Tóm tắt
EcoCollect là hệ thống thu gom rác và đồ cồng kềnh theo mô hình `guest checkout + optional account`, gồm 3 vai trò chính: `Customer`, `Staff`, `Admin`.

Phiên bản BE này được rút gọn để bám theo schema `8 bảng` trong [Database.md](/Users/macbookair/Documents/rác%20thải/be/Database.md). Mục tiêu là triển khai nhanh MVP, nên backend tập trung vào:
- catalog dịch vụ
- báo giá
- tạo đơn và quản lý trạng thái đơn
- upload ảnh
- phân công staff ở mức cơ bản
- thanh toán online/cash

Các phần sau sẽ để phase sau:
- voucher
- notification lưu DB
- refund tách bảng riêng
- audit log trạng thái chi tiết
- address book riêng cho customer

## Public Interfaces / Core Types
Các kiểu dữ liệu cốt lõi BE phải chuẩn hóa:
- `User`: `id`, `role`, `account_type`, `full_name`, `email`, `phone`, `password_hash`, `status`, `prepaid_required`, `is_blacklisted`, `no_show_count`
- `Service`: `id`, `code`, `category`, `name`, `pricing_type`, `default_unit`, `base_price`, `active`, `manual_quote_required`
- `ServiceVariant`: `id`, `service_id`, `label`, `price`, `unit`, `sort_order`
- `TimeSlot`: `id`, `code`, `label`, `start_time`, `end_time`, `max_orders`, `active`
- `Order`: `id`, `order_code`, `user_id`, `customer_name_snapshot`, `customer_phone_snapshot`, `customer_email_snapshot?`, `address_snapshot`, `booking_date`, `time_slot_id`, `status`, `payment_method`, `payment_status`, `handling_mode`, `handling_fee`, `service_subtotal`, `estimated_total`, `final_total?`, `manual_quote_required`, `assigned_staff_user_id?`, `adjustment_reason?`, `notes`
- `OrderItem`: `id`, `order_id`, `service_id?`, `service_name_snapshot`, `variant_id?`, `variant_label_snapshot?`, `pricing_type`, `unit`, `quantity`, `measurement_value`, `unit_price`, `line_total`, `manual_quote_required`
- `OrderImage`: `id`, `order_id`, `file_url`, `image_role`
- `Payment`: `id`, `order_id`, `method`, `status`, `provider_ref`, `amount`

API tối thiểu:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `PATCH /me`
- `GET /me/orders`
- `GET /services`
- `POST /pricing/quote`
- `POST /orders`
- `GET /orders/{id}`
- `POST /orders/{id}/images`
- `POST /orders/{id}/cancel`
- `POST /orders/{id}/payment-intent`
- `POST /payments/callback`
- `GET /staff/orders`
- `POST /staff/orders/{id}/start`
- `POST /staff/orders/{id}/complete`
- `POST /staff/orders/{id}/no-show`
- `GET /admin/orders`
- `PATCH /admin/orders/{id}`
- `POST /admin/orders/{id}/assign`
- `GET /admin/metrics`

## Nghiệp vụ Cốt Lõi
### 1. Catalog dịch vụ và báo giá
- Service catalog là dữ liệu quản trị, không hardcode ở frontend.
- Mỗi service thuộc một trong 3 nhóm giá: `fixed`, `weight_based`, `quote_only`.
- `fixed`: tính theo `quantity`, ví dụ sofa, tivi, máy giặt.
- `weight_based`: tính theo `measurement_value`, hiện tại dùng cho `phế thải xây dựng` theo `kg`.
- `quote_only`: không chốt giá tức thời, ví dụ `hạng mục khác`.
- Service có thể có `variants`, ví dụ `tủ quần áo` gồm `Nhỏ`, `Tiêu chuẩn`, `Khổ lớn`.
- Quote API nhận toàn bộ item đã chọn, handling mode, số tầng, rồi trả về `service_subtotal`, `handling_fee`, `estimated_total`, `manual_quote_required`.
- Nếu order có item `quote_only`, tổng hiển thị phải theo rule: chỉ quote thì `Cần báo giá`, quote + fixed thì `Từ X đ`.

### 2. Guest booking và account
- Khách không cần account vẫn tạo đơn được.
- Khi guest tạo đơn, backend tạo hoặc reuse một record trong `users` với `role='customer'` và `account_type='guest'`.
- Nếu có account, order gắn trực tiếp `user_id` của account hiện tại.
- Nếu guest đăng ký bằng cùng `email` hoặc `phone` đã dùng trước đó, backend phải update record `users` hiện có từ `guest` sang `registered`.
- Guest không bắt buộc có `password_hash`; registered customer thì bắt buộc có.
- Luồng account không được chặn guest checkout.

### 3. Quy trình tạo đơn
- Step 1: backend xác nhận item hợp lệ, variant hợp lệ, `kg > 0` cho item weight-based, `custom_item_name` bắt buộc cho item ngoài danh sách.
- Step 2: backend validate `name`, `phone`, `email?`, `address`; địa chỉ phải lưu snapshot đầy đủ trong `orders`.
- Step 3: backend validate `booking_date`, `time_slot`, kiểm tra slot còn chỗ bằng cách đếm số order active trong slot.
- Step 4: backend nhận `handling_mode`, `stairs_floors?`, `payment_method`, `cash_policy_accepted?`.
- Tạo order phải đi qua quote engine lần cuối để tránh FE gửi tổng tiền sai.
- Nếu có ảnh, backend lưu `order_images` và gắn vào order ngay khi tạo hoặc qua upload endpoint trước submit.
- Order code phải sinh duy nhất theo format dễ tra cứu cho admin/staff.

### 4. Handling mode và phụ phí
- `inside`: phí `0`
- `outside`: giảm `30.000`
- `stairs`: phí `50.000 + 30.000 * (floors - 1)`, minimum floor là `1`
- Handling fee luôn do BE tính, FE chỉ gửi lựa chọn.
- Nếu staff hoặc admin chốt giá cuối khác giá ước tính thì phải lưu `final_total` và `adjustment_reason` trên `orders`.

### 5. Thanh toán, xác nhận và no-show
- `online`: tạo payment intent, callback thành công thì cập nhật `payments.status='paid'` và cho order sang `confirmed`.
- `cash`: order vào `pending_confirmation`; admin hoặc staff xác nhận xong mới chuyển `confirmed`.
- Nếu customer chọn cash mà thiếu `cash_policy_accepted=true` thì BE reject request.
- Nếu user có `prepaid_required=true` thì chỉ được tạo order với `payment_method=online`.
- `no_show` được ghi nhận khi staff đến nơi nhưng không liên hệ được khách, hoặc khách hủy sát giờ theo policy.
- Khi `no_show`, backend tăng `users.no_show_count`; nếu vượt ngưỡng thì set `prepaid_required=true`.

### 6. Vòng đời đơn hàng
- Trạng thái chuẩn: `draft`, `awaiting_payment`, `pending_confirmation`, `confirmed`, `assigned`, `in_progress`, `completed`, `cancelled`, `no_show`.
- `online`: `draft -> awaiting_payment -> confirmed`
- `cash`: `draft -> pending_confirmation -> confirmed`
- Admin gán staff: `confirmed -> assigned`
- Staff bắt đầu xử lý: `assigned -> in_progress`
- Hoàn tất đơn: `in_progress -> completed`
- Có thể kết thúc sớm bằng `cancelled` hoặc `no_show`
- Mọi đổi trạng thái phải đi qua service rule, không cho FE cập nhật trực tiếp

### 7. Staff workflow
- Staff xem danh sách đơn được gán hoặc đơn chờ xử lý theo ngày.
- Staff identity lấy từ `users.role='staff'`.
- Khi admin gán việc, backend lưu `orders.assigned_staff_user_id`.
- Staff có thể `start`, upload ảnh onsite, cập nhật ghi chú, chốt `final_total`, rồi `complete`.
- Nếu hiện trường khác mô tả, staff phải nhập `adjustment_reason`.
- Staff có thể đánh dấu `no_show` nếu không liên hệ được khách.

### 8. Admin workflow
- Admin CRUD `services`, `service_variants`, `time_slots`, `users`.
- Admin tìm kiếm đơn theo `code`, `phone`, `email`, `status`, `date`, `district`, `staff`.
- Admin gán staff, hủy đơn, ghi nhận no-show, chỉnh `final_total` có lý do.
- Admin xem báo cáo cơ bản từ `orders`, `order_items`, `payments`: `số đơn`, `doanh thu`, `tỷ lệ hoàn thành`, `tỷ lệ no-show`, `cơ cấu loại rác`.
- Admin có quyền bật `users.prepaid_required` hoặc `users.is_blacklisted` cho customer.

### 9. Những gì chưa làm trong MVP
- Chưa có voucher và loyalty
- Chưa có notification lưu DB
- Chưa có refund tách bảng riêng
- Chưa có audit log trạng thái riêng như `order_status_logs`
- Chưa có address book riêng cho customer
- Chưa có bảng phân công staff riêng, vì đang lưu trực tiếp trên `orders`

## Thiết Kế Dữ Liệu và Rule Bắt Buộc
- `orders` và `order_items` phải lưu snapshot tên dịch vụ, giá, variant tại thời điểm tạo đơn; không phụ thuộc catalog hiện tại.
- `address_snapshot` không được chỉ lưu reference đến bảng khác.
- `order_items` phải hỗ trợ song song `quantity` và `measurement_value`.
- `manual_quote_required` là cờ cấp item và cấp order.
- khi match customer phải ưu tiên `phone`, sau đó `email`
- `quote engine` phải idempotent và dùng chung cho `preview quote` và `create order`
- `assigned_staff_user_id` nếu có thì phải là `users.role='staff'`
- `orders.user_id` phải là `users.role='customer'`
- mọi thay đổi giá cuối phải đi kèm `adjustment_reason`

## Test Cases / Acceptance
- Tạo order guest thành công mà không cần tài khoản đăng nhập riêng.
- Tạo order member phải gắn đúng `orders.user_id`.
- Guest tạo lại đơn bằng cùng phone phải reuse đúng record `users`.
- Guest đăng ký account sau đó phải update đúng record `users` cũ.
- `construction` không cho submit nếu `kg <= 0`.
- `custom item` không cho submit nếu thiếu tên món.
- Variant `wardrobe` tính đúng giá theo lựa chọn.
- `outside` giảm đúng `30.000`; `stairs` cộng đúng theo số tầng.
- FE gửi tổng tiền sai nhưng BE vẫn trả về tổng đúng từ quote engine.
- Cash order thiếu `cash_policy_accepted` bị reject.
- Online payment thất bại không được chuyển `confirmed`.
- User bị `prepaid_required` không được tạo cash order.
- Slot đầy phải reject create order.
- Staff không được complete order nếu chưa `assigned/in_progress`.
- Chỉnh `final_total` phải có `adjustment_reason`.
- Order có item quote phải bật `manual_quote_required`.

## Assumptions Chốt Cho BE
- V1 chỉ cần một thành phố mặc định là `TP. Hồ Chí Minh`, nhưng schema vẫn hỗ trợ mở rộng.
- V1 dùng email là kênh xác nhận chính; SMS có thể thêm sau mà không cần bảng riêng.
- V1 chưa cần real-time tracking GPS; chỉ cần trạng thái theo workflow.
- V1 cho phép 1 ảnh hoặc nhiều ảnh, API nên hỗ trợ nhiều ảnh ngay từ đầu.
- V1 chưa làm voucher, loyalty, notification center, refund riêng.
- Reporting ban đầu lấy trực tiếp từ bảng nghiệp vụ chính, chưa cần data warehouse.
