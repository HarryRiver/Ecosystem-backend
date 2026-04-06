
# Đặc Tả BE Toàn Dự Án EcoCollect

# Chức năng
1. Chức năng cho khách hàng

Đăng ký tài khoản. (rồi)
Đăng nhập, đăng xuất. (rồi)
Xem và cập nhật thông tin cá nhân qua GET/PATCH /me. (rồi)
Đặt lịch thu gom mà không cần đăng nhập theo mô hình guest checkout. (rồi)
Tạo đơn khi đã có tài khoản. (rồi)
<!-- Hệ thống tự nhận diện guest cũ theo phone rồi tới email.
Guest có thể được nâng cấp thành tài khoản registered mà vẫn giữ lịch sử đơn. -->
Xem danh sách đơn của mình qua GET /me/orders. (rồi)
Xem chi tiết một đơn qua GET /orders/{id}. (rồi)
Hủy đơn qua POST /orders/{id}/cancel. (rồi)
2. Chức năng catalog dịch vụ

- Lấy danh sách dịch vụ qua GET /services. (rồi)
- Quản lý nhiều loại dịch vụ: fixed, weight_based, quote_only. (rồi)
- Hỗ trợ biến thể dịch vụ như tủ nhỏ, tủ lớn qua service_variants. (rồi)
- Hỗ trợ đơn vị tính khác nhau: item, bag, kg. (rồi)
- Cho phép dịch vụ yêu cầu ảnh hoặc yêu cầu nhập tên món tùy loại. (rồi)
3. Chức năng báo giá

- Tính báo giá trước khi tạo đơn qua POST /pricing/quote.
- Tính service_subtotal, handling_fee, estimated_total.
- Kiểm tra item hợp lệ trước khi tính giá.
- Hỗ trợ item tính theo số lượng.
- Hỗ trợ item tính theo khối lượng.
- Hỗ trợ item cần báo giá thủ công.
- Tự động tính phụ phí theo handling_mode.
- Không tin số tiền từ frontend, backend luôn tính lại lần cuối.
- Áp dụng mã voucher (nếu có) để tính discount và update estimated_total.
4. Chức năng tạo đơn

- Tạo đơn mới qua POST /orders. (rồi)
- Lưu snapshot thông tin khách tại thời điểm đặt. (rồi)
- Lưu snapshot địa chỉ tại thời điểm đặt. (rồi)
- Lưu snapshot tên dịch vụ, variant, đơn giá trong order_items. (rồi)
- Chọn ngày hẹn và khung giờ. (rồi)
- Kiểm tra slot còn chỗ trước khi tạo đơn. (rồi)
- Chọn phương thức thanh toán cash hoặc online. (rồi)
- Bắt buộc xác nhận policy nếu chọn cash. (rồi)
- Gắn cờ manual_quote_required nếu đơn có item quote-only. (rồi)
- Sinh order_code duy nhất để admin tra cứu.
- Lưu voucher_id và discount_amount vào đơn hàng để đối soát.
5. Chức năng ảnh

- Upload ảnh cho đơn qua POST /orders/{id}/images.
- Hỗ trợ ảnh khách upload trước khi đặt.
<!-- Hỗ trợ ảnh staff chụp onsite. -->
- Hỗ trợ ảnh xác nhận hoàn tất.
- Có thể upload một hoặc nhiều ảnh.
6. Chức năng thanh toán

- Tạo payment intent cho đơn online qua POST /orders/{id}/payment-intent.
- Nhận callback thanh toán qua POST /payments/callback.
- Chỉ xác nhận đơn online khi payment thành công.
- Theo dõi trạng thái payment: pending, paid, failed, cancelled, refunded.
- Với đơn tiền mặt, cho đi vào luồng pending_confirmation.
7. Chức năng xử lý vòng đời đơn

- Quản lý các trạng thái: draft, awaiting_payment, pending_confirmation, confirmed, completed, cancelled, no_show.
- Chặn nhảy trạng thái sai quy tắc.
- Chuyển trạng thái khác nhau cho đơn online và cash.
- Cho phép admin đánh dấu no_show.
- Tăng no_show_count cho customer khi no-show.
- Tự bật prepaid_required nếu khách vi phạm nhiều lần.
- Không cho khách bị prepaid_required tạo đơn cash.
<!--
8. Chức năng cho staff

- Xem danh sách đơn staff được giao qua GET /staff/orders.
- Bắt đầu xử lý đơn qua POST /staff/orders/{id}/start.
- Hoàn tất đơn qua POST /staff/orders/{id}/complete.
- Đánh dấu no-show qua POST /staff/orders/{id}/no-show.
- Upload ảnh hiện trường.
- Cập nhật ghi chú hiện trường.
- Chốt final_total nếu giá thực tế khác dự kiến.
- Bắt buộc nhập adjustment_reason nếu đổi giá cuối.
-->
9. Chức năng cho admin

- Xem danh sách đơn qua GET /admin/orders.
- Sửa thông tin đơn qua PATCH /admin/orders/{id}.
<!-- Gán staff cho đơn qua POST /admin/orders/{id}/assign. -->
- Quản lý dịch vụ.
- Quản lý biến thể dịch vụ.
- Quản lý khung giờ time_slots.
- Quản lý user.
- Tìm kiếm đơn theo code, phone, email, status, date, district.
Hủy đơn.
Ghi nhận no-show.
Chỉnh final_total có lý do.
Bật prepaid_required hoặc is_blacklisted cho customer.
- Xem thống kê cơ bản qua GET /admin/metrics. (rồi)
- Quản lý Voucher: Tạo mới, cập nhật thông tin, bật/tắt hoặc xóa mã voucher.
- Xem danh sách voucher và lọc trạng thái (active, expired). (rồi)
10. Chức năng hệ thống và rule nền

Match customer theo phone trước, rồi email.
Một guest tạo lại đơn bằng cùng số điện thoại sẽ reuse cùng record user.
orders luôn lưu snapshot để không lệ thuộc catalog sau này.
Tự đếm số đơn active theo booking_date + time_slot_id để giữ công suất slot.
Kiểm tra measurement_value > 0 với item tính theo kg.
Kiểm tra custom_item_name nếu là item ngoài danh sách.
<!-- Kiểm tra assigned_staff_user_id phải là user có role='staff'. -->
Kiểm tra orders.user_id phải là user có role='customer'.
11. Chức năng chưa có trong MVP

Loyalty (tích điểm).
Notification lưu vào DB.
Refund tách bảng riêng.
Audit log trạng thái chi tiết.
Sổ địa chỉ riêng cho khách.
<!-- Bảng phân công staff riêng. -->
Real-time tracking GPS.

# admin
1. Đăng nhập Admin

Nhập email hoặc số điện thoại.
Nhập mật khẩu.
Đăng nhập.
Hiển thị lỗi sai tài khoản hoặc sai mật khẩu.
Chặn tài khoản locked.
Điều hướng theo role, chỉ admin vào được admin panel.
2. Dashboard (rồi)

Hiển thị KPI: tổng đơn, đơn hôm nay, doanh thu, tỷ lệ hoàn thành, tỷ lệ no-show. (rồi)
Hiển thị số đơn theo trạng thái. (rồi)
Hiển thị số đơn chờ xác nhận cash. (rồi)
<!-- Hiển thị số đơn chưa phân công staff. -->
Hiển thị top dịch vụ được đặt nhiều. (rồi)
Hiển thị biểu đồ đơn theo ngày hoặc tuần. (rồi)
Có shortcut đi tới Orders, Reports.
3. Danh sách Đơn Hàng

- Hiển thị bảng danh sách đơn. (rồi)
- Tìm kiếm theo mã đơn, tên khách, phone, email. (rồi)
- Lọc theo trạng thái, ngày, quận huyện, payment method. (rồi)
- Sắp xếp theo thời gian tạo, ngày hẹn, trạng thái. (rồi)
- Hiển thị nhanh: mã đơn, khách hàng, slot, tổng tiền, trạng thái. (rồi)
- Vào chi tiết đơn khi bấm từng dòng. (rồi)
- Có action nhanh: xác nhận, hủy đơn. (rồi)
4. Chi Tiết Đơn Hàng

- Xem đầy đủ thông tin khách hàng snapshot. (rồi)
- Xem địa chỉ snapshot. (rồi)
- Xem ngày hẹn và khung giờ. (rồi)
- Xem danh sách order_items. (rồi)
- Xem ảnh khách upload và ảnh hiện trường. (rồi)
- Xem estimated_total, final_total, payment_status. (rồi)
<!-- Xem staff được gán. -->
- Cập nhật ghi chú nội bộ. (rồi)
- Chỉnh final_total. (rồi)
- Bắt buộc nhập adjustment_reason nếu đổi giá. (rồi)
- Xác nhận đơn cash. (rồi)
- Hủy đơn. (rồi)
- Đánh dấu no_show. (rồi)
<!-- Gán hoặc đổi staff. -->
- Xem trạng thái hiện tại và thao tác chuyển trạng thái hợp lệ. (rồi)
<!--
5. Phân Công Staff

Hiển thị danh sách đơn đang confirmed hoặc chưa có staff.
Hiển thị danh sách staff khả dụng.
Gán staff cho đơn.
Đổi staff phụ trách.
Lọc theo ngày, khu vực, trạng thái.
Xem staff nào đang có bao nhiêu đơn.
Cảnh báo khi staff đã có quá nhiều đơn cùng khung giờ.
-->
6. Quản Lý Dịch Vụ

- Hiển thị danh sách services. (rồi)
- Tạo service mới. (rồi)
- Sửa service. (rồi)
- Bật hoặc tắt service. (rồi)
- Quản lý: code, name, category, pricing type, default unit, base price. (rồi)
- Cấu hình requires_image, requires_custom_name, manual_quote_required. (rồi)
- Sắp xếp thứ tự hiển thị. (rồi)
7. Quản Lý Biến Thể Dịch Vụ (rồi)

- Hiển thị danh sách service_variants theo từng service. (rồi)
- Tạo variant mới. (rồi)
- Sửa variant. (rồi)
- Bật hoặc tắt variant. (rồi)
- Quản lý: label, code, unit, price, sort order. (rồi)
- Gắn variant vào service tương ứng. (rồi)
8. Quản Lý Khung Giờ (rồi)

- Hiển thị danh sách time_slots. (rồi)
- Tạo slot mới. (rồi)
- Sửa slot. (rồi)
- Bật hoặc tắt slot. (rồi)
- Quản lý: code, label, start time, end time, max_orders. (rồi)
- Xem nhanh số đơn đang chiếm từng slot theo ngày. (rồi)
9. Quản Lý Người Dùng (rồi)

- Hiển thị danh sách users. (rồi)
- Tìm kiếm theo tên, phone, email. (rồi)
- Lọc theo role và status. (rồi)
- Xem chi tiết user. (rồi)
- Cập nhật thông tin user. (rồi)
- Khóa hoặc mở khóa tài khoản. (rồi)
- Đổi trạng thái active, inactive, locked. (rồi)
10. Chi Tiết Customer (rồi)

- Xem thông tin customer. (rồi)
- Xem loại account: guest hoặc registered. (rồi)
- Xem lịch sử đơn của customer. (rồi)
- Xem no_show_count. (rồi)
- Bật hoặc tắt prepaid_required. (rồi)
- Bật hoặc tắt is_blacklisted. (rồi)
- Cập nhật ghi chú nội bộ. (rồi)
11. Quản Lý Thanh Toán (rồi)

- Hiển thị danh sách payments. (rồi)
- Tìm kiếm theo mã đơn, mã payment, provider ref. (rồi)
- Lọc theo trạng thái payment. (rồi)
- Xem payment gắn với order nào. (rồi)
- Xem số tiền, phương thức, thời điểm thanh toán. (rồi)
12. Báo Cáo

- Báo cáo số đơn theo ngày, tuần, tháng.
- Báo cáo doanh thu theo ngày, tuần, tháng.
- Báo cáo tỷ lệ hoàn thành.
- Báo cáo tỷ lệ hủy và no-show.
- Báo cáo cơ cấu dịch vụ được đặt.
<!-- Báo cáo hiệu suất staff. -->
Báo cáo số đơn theo khung giờ.
13. Hồ Sơ Admin

Xem thông tin admin hiện tại.
Cập nhật tên, email, phone.
Đổi mật khẩu.
Đăng xuất.
14. Quản Lý Voucher (Mới)

- Tạo mã voucher với các thuộc tính: code, type (percent/fixed), value, max_discount, min_order_value, usage_limit, per_user_limit, start_date, end_date.
- Kiểm tra tính hợp lệ của voucher:
    - Trạng thái active = true.
    - Trong thời hạn hiệu lực.
    - Còn lượt sử dụng (usage_limit).
    - Khách hàng chưa dùng quá giới hạn (per_user_limit).
    - Giá trị đơn hàng thỏa mãn min_order_value.
- Logic tính tiền:
    - Nếu là percent: discount = estimated_total * (value/100), không vượt quá max_discount.
    - Nếu là fixed: discount = value.
- Cập nhật số tiền cuối cùng sau khi giảm giá.

## Tóm tắt
EcoCollect là hệ thống thu gom rác và đồ cồng kềnh theo mô hình `guest checkout + optional account`, gồm 2 vai trò chính: `Customer`, `Admin`.

Phiên bản BE này được rút gọn để bám theo schema `8 bảng` trong [Database.md](/Users/macbookair/Documents/rác%20thải/be/Database.md). Mục tiêu là triển khai nhanh MVP, nên backend tập trung vào:
- catalog dịch vụ
- báo giá
- tạo đơn và quản lý trạng thái đơn
- upload ảnh
<!-- phân công staff ở mức cơ bản -->
- thanh toán online/cash

Các phần sau sẽ để phase sau:
- loyalty
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
- `Order`: `id`, `order_code`, `user_id`, `customer_name_snapshot`, `customer_phone_snapshot`, `customer_email_snapshot?`, `address_snapshot`, `booking_date`, `time_slot_id`, `status`, `payment_method`, `payment_status`, `handling_mode`, `handling_fee`, `service_subtotal`, `estimated_total`, `final_total?`, `manual_quote_required`, `adjustment_reason?`, `notes`
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
- `GET /admin/orders`
- `PATCH /admin/orders/{id}`
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
- Order code phải sinh duy nhất theo format dễ tra cứu cho admin.

### 4. Handling mode và phụ phí
- `inside`: phí `0`
- `outside`: giảm `30.000`
- `stairs`: phí `50.000 + 30.000 * (floors - 1)`, minimum floor là `1`
- Handling fee luôn do BE tính, FE chỉ gửi lựa chọn.
- Nếu admin chốt giá cuối khác giá ước tính thì phải lưu `final_total` và `adjustment_reason` trên `orders`.

### 5. Thanh toán, xác nhận và no-show
- `online`: tạo payment intent, callback thành công thì cập nhật `payments.status='paid'` và cho order sang `confirmed`.
- `cash`: order vào `pending_confirmation`; admin xác nhận xong mới chuyển `confirmed`.
- Nếu customer chọn cash mà thiếu `cash_policy_accepted=true` thì BE reject request.
- Nếu user có `prepaid_required=true` thì chỉ được tạo order với `payment_method=online`.
- `no_show` được ghi nhận khi admin xác nhận khách vi phạm theo policy.
- Khi `no_show`, backend tăng `users.no_show_count`; nếu vượt ngưỡng thì set `prepaid_required=true`.

### 6. Vòng đời đơn hàng
- Trạng thái chuẩn: `draft`, `awaiting_payment`, `pending_confirmation`, `confirmed`, `completed`, `cancelled`, `no_show`.
- `online`: `draft -> awaiting_payment -> confirmed`
- `cash`: `draft -> pending_confirmation -> confirmed`
- Admin hoàn tất đơn: `confirmed -> completed`
- Có thể kết thúc sớm bằng `cancelled` hoặc `no_show`
- Mọi đổi trạng thái phải đi qua service rule, không cho FE cập nhật trực tiếp

<!--
### 7. Staff workflow
- Staff xem danh sách đơn được gán hoặc đơn chờ xử lý theo ngày.
- Staff identity lấy từ `users.role='staff'`.
- Khi admin gán việc, backend lưu `orders.assigned_staff_user_id`.
- Staff có thể `start`, upload ảnh onsite, cập nhật ghi chú, chốt `final_total`, rồi `complete`.
- Nếu hiện trường khác mô tả, staff phải nhập `adjustment_reason`.
- Staff có thể đánh dấu `no_show` nếu không liên hệ được khách.
-->

### 8. Admin workflow
- Admin CRUD `services`, `service_variants`, `time_slots`, `users`.
- Admin tìm kiếm đơn theo `code`, `phone`, `email`, `status`, `date`, `district`.
- Admin hủy đơn, ghi nhận no-show, chỉnh `final_total` có lý do.
- Admin xem báo cáo cơ bản từ `orders`, `order_items`, `payments`: `số đơn`, `doanh thu`, `tỷ lệ hoàn thành`, `tỷ lệ no-show`, `cơ cấu loại rác`.
- Admin có quyền bật `users.prepaid_required` hoặc `users.is_blacklisted` cho customer.

### 9. Những gì chưa làm trong MVP
- Chưa có voucher và loyalty
- Chưa có notification lưu DB
- Chưa có refund tách bảng riêng
- Chưa có audit log trạng thái riêng như `order_status_logs`
- Chưa có address book riêng cho customer
<!-- Chưa có bảng phân công staff riêng, vì đang lưu trực tiếp trên `orders` -->

## Thiết Kế Dữ Liệu và Rule Bắt Buộc
- `orders` và `order_items` phải lưu snapshot tên dịch vụ, giá, variant tại thời điểm tạo đơn; không phụ thuộc catalog hiện tại.
- `address_snapshot` không được chỉ lưu reference đến bảng khác.
- `order_items` phải hỗ trợ song song `quantity` và `measurement_value`.
- `manual_quote_required` là cờ cấp item và cấp order.
- khi match customer phải ưu tiên `phone`, sau đó `email`
- `quote engine` phải idempotent và dùng chung cho `preview quote` và `create order`
<!-- `assigned_staff_user_id` nếu có thì phải là `users.role='staff'` -->
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
- Admin không được complete order nếu đơn chưa `confirmed`.
- Chỉnh `final_total` phải có `adjustment_reason`.
- Order có item quote phải bật `manual_quote_required`.

## Assumptions Chốt Cho BE
- V1 chỉ cần một thành phố mặc định là `TP. Hồ Chí Minh`, nhưng schema vẫn hỗ trợ mở rộng.
- V1 dùng email là kênh xác nhận chính; SMS có thể thêm sau mà không cần bảng riêng.
- V1 chưa cần real-time tracking GPS; chỉ cần trạng thái theo workflow.
- V1 cho phép 1 ảnh hoặc nhiều ảnh, API nên hỗ trợ nhiều ảnh ngay từ đầu.
- V1 chưa làm voucher, loyalty, notification center, refund riêng.
- Reporting ban đầu lấy trực tiếp từ bảng nghiệp vụ chính, chưa cần data warehouse.
