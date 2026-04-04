# Thiết Kế Database PostgreSQL Cho EcoCollect

## Tóm tắt
Phiên bản này rút gọn database xuống còn `8 bảng` để phục vụ MVP. Mục tiêu là:
- đủ chạy guest booking và account cơ bản
- đủ quản lý catalog dịch vụ, slot, đơn hàng, ảnh, thanh toán
- giảm số lượng quan hệ và bảng phụ để BE triển khai nhanh hơn
- giữ nguyên nguyên tắc `orders` và `order_items` phải lưu snapshot tại thời điểm đặt

Nguyên tắc chốt:
- `services` là catalog nguồn sự thật
- `orders` là bảng trung tâm
- chỉ dùng `1 bảng users` cho mọi đối tượng: guest customer, registered customer, staff, admin
- guest vẫn có record trong `users`, nhưng không cần `password_hash`
- phân công staff, ghi chú nội bộ, chốt giá cuối được lưu trực tiếp trong `orders`
- voucher, notification, refund, audit log chi tiết để phase sau

## Danh sách 8 bảng
- `users`
- `services`
- `service_variants`
- `time_slots`
- `orders`
- `order_items`
- `order_images`
- `payments`

## Thiết kế bảng
### 1. Identity
#### `users`
Dùng chung cho mọi đối tượng trong hệ thống.

Cột chính:
- `id uuid pk`
- `role text not null check in ('customer','staff','admin')`
- `account_type text not null check in ('guest','registered','staff','admin')`
- `full_name text not null`
- `email citext unique null`
- `phone varchar(20) unique null`
- `password_hash text null`
- `status text not null check in ('active','inactive','locked')`
- `prepaid_required boolean not null default false`
- `is_blacklisted boolean not null default false`
- `no_show_count integer not null default 0`
- `notes text null`
- `last_login_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Index:
- unique index `users_email_uq`
- unique index `users_phone_uq`
- index `(role, status)`
- index `(account_type, status)`
- index `(prepaid_required, is_blacklisted)`

Rule:
- guest customer vẫn có record trong `users` với `role='customer'`, `account_type='guest'`, `password_hash=null`
- registered customer có `role='customer'`, `account_type='registered'`
- staff có `role='staff'`, `account_type='staff'`
- admin có `role='admin'`, `account_type='admin'`
- nếu guest sau này đăng ký bằng cùng phone hoặc email thì update record hiện có từ `guest` sang `registered`

### 2. Catalog dịch vụ
#### `services`
Cột chính:
- `id uuid pk`
- `code varchar(50) unique not null`
- `category text not null check in ('furniture','electronics','other')`
- `name text not null`
- `description text null`
- `icon text null`
- `pricing_type text not null check in ('fixed','weight_based','quote_only')`
- `default_unit text not null check in ('item','bag','kg')`
- `base_price numeric(12,2) null`
- `manual_quote_required boolean not null default false`
- `requires_image boolean not null default true`
- `requires_custom_name boolean not null default false`
- `active boolean not null default true`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rule nghiệp vụ:
- `construction` là `weight_based`, `default_unit='kg'`, `base_price=7000`
- `custom` là `quote_only`, `requires_custom_name=true`, `manual_quote_required=true`
- không tách `service_categories`, category lưu trực tiếp trên service

#### `service_variants`
Dùng cho các món có size riêng như tủ quần áo.

Cột chính:
- `id uuid pk`
- `service_id uuid not null fk -> services.id`
- `code varchar(50) not null`
- `label text not null`
- `unit text not null check in ('item','bag','kg')`
- `price numeric(12,2) not null`
- `sort_order integer not null default 0`
- `active boolean not null default true`

Constraint:
- unique `(service_id, code)`

Rule:
- nếu service không có variant thì dùng `services.base_price`
- nếu có variant thì quote engine ưu tiên giá variant

### 3. Slot booking
#### `time_slots`
Cột chính:
- `id uuid pk`
- `code varchar(50) unique not null`
- `label text not null`
- `start_time time not null`
- `end_time time not null`
- `max_orders integer not null`
- `active boolean not null default true`

Seed gợi ý:
- `08_10`, `10_12`, `12_14`, `14_16`, `16_18`, `18_20`

Rule:
- chưa tách `booking_capacity_overrides`
- công suất slot ở MVP được tính trực tiếp từ `time_slots.max_orders`

### 4. Orders
#### `orders`
Đây là bảng trung tâm.

Cột chính:
- `id uuid pk`
- `order_code varchar(30) unique not null`
- `user_id uuid not null fk -> users.id`
- `customer_name_snapshot text not null`
- `customer_phone_snapshot varchar(20) not null`
- `customer_email_snapshot citext null`
- `street_address_snapshot text not null`
- `district_snapshot text not null`
- `city_snapshot text not null`
- `full_address_snapshot text not null`
- `latitude_snapshot numeric(10,7) null`
- `longitude_snapshot numeric(10,7) null`
- `booking_date date not null`
- `time_slot_id uuid not null fk -> time_slots.id`
- `status text not null check in ('draft','awaiting_payment','pending_confirmation','confirmed','assigned','in_progress','completed','cancelled','no_show')`
- `payment_method text not null check in ('cash','online')`
- `payment_status text not null check in ('unpaid','awaiting_payment','paid','failed','refunded')`
- `handling_mode text not null check in ('inside','outside','stairs')`
- `stairs_floors integer null`
- `handling_fee numeric(12,2) not null default 0`
- `service_subtotal numeric(12,2) not null default 0`
- `estimated_total numeric(12,2) not null default 0`
- `final_total numeric(12,2) null`
- `manual_quote_required boolean not null default false`
- `cash_policy_accepted boolean not null default false`
- `assigned_staff_user_id uuid null fk -> users.id`
- `adjustment_reason text null`
- `notes text null`
- `internal_note text null`
- `confirmed_at timestamptz null`
- `assigned_at timestamptz null`
- `completed_at timestamptz null`
- `cancelled_at timestamptz null`
- `no_show_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Index:
- index `(user_id, created_at desc)`
- index `(status, booking_date)`
- index `(booking_date, time_slot_id, status)`
- index `(payment_method, payment_status)`
- index `(assigned_staff_user_id, booking_date)`
- index `(customer_phone_snapshot)`
- index `(customer_email_snapshot)`

Rule:
- mọi order đều gắn với một `users.id`, kể cả guest
- `estimated_total` luôn là số BE tự tính lúc tạo đơn hoặc confirm
- `final_total` chỉ set khi staff/admin chốt cuối
- `assigned_staff_user_id` dùng thay cho bảng phân công riêng
- `adjustment_reason` bắt buộc nếu `final_total` khác `estimated_total`

#### `order_items`
Cột chính:
- `id uuid pk`
- `order_id uuid not null fk -> orders.id on delete cascade`
- `service_id uuid null fk -> services.id`
- `service_variant_id uuid null fk -> service_variants.id`
- `service_code_snapshot varchar(50) not null`
- `service_name_snapshot text not null`
- `variant_code_snapshot varchar(50) null`
- `variant_label_snapshot text null`
- `pricing_type text not null check in ('fixed','weight_based','quote_only')`
- `unit text not null check in ('item','bag','kg')`
- `quantity integer not null default 1`
- `measurement_value numeric(12,2) null`
- `unit_price numeric(12,2) null`
- `line_total numeric(12,2) null`
- `custom_item_name text null`
- `custom_item_note text null`
- `manual_quote_required boolean not null default false`
- `display_order integer not null default 0`
- `created_at timestamptz not null default now()`

Constraint:
- `quantity >= 1`
- nếu `unit='kg'` thì `measurement_value > 0`
- nếu `pricing_type='quote_only'` thì `manual_quote_required=true`

Rule:
- `custom_item_name` bắt buộc nếu item ngoài danh sách
- `line_total` có thể null với `quote_only`

#### `order_images`
Cột chính:
- `id uuid pk`
- `order_id uuid not null fk -> orders.id on delete cascade`
- `file_url text not null`
- `mime_type varchar(100) null`
- `file_size integer null`
- `image_role text not null check in ('customer_upload','staff_onsite','completion_proof')`
- `uploaded_by_user_id uuid null fk -> users.id`
- `created_at timestamptz not null default now()`

Index:
- index `(order_id, image_role)`

Rule:
- tối thiểu 1 ảnh khách upload với các service yêu cầu ảnh

### 5. Payment
#### `payments`
Cột chính:
- `id uuid pk`
- `order_id uuid not null fk -> orders.id`
- `payment_code varchar(40) unique not null`
- `method text not null check in ('cash','online')`
- `provider text null`
- `provider_ref text null`
- `status text not null check in ('pending','paid','failed','cancelled','refunded')`
- `amount numeric(12,2) not null`
- `paid_at timestamptz null`
- `failed_at timestamptz null`
- `metadata jsonb null`
- `created_at timestamptz not null default now()`

Index:
- index `(order_id, status)`
- index `(provider_ref)`

Rule:
- cash order có thể không cần tạo payment record ngay ở giai đoạn đầu
- online payment callback thành công mới được đẩy order sang `confirmed`

## Những bảng đã bỏ trong bản MVP
- `customers`: bỏ, vì gộp toàn bộ thông tin khách vào `users`
- `customer_addresses`: bỏ, vì địa chỉ lưu snapshot trực tiếp trong `orders`
- `staff_profiles`, `admin_profiles`: bỏ, vì dùng `users.role`
- `service_categories`: bỏ, vì dùng `services.category`
- `booking_capacity_overrides`: bỏ, phase sau mới thêm nếu cần khóa ngày đặc biệt
- `staff_assignments`: bỏ, thay bằng `orders.assigned_staff_user_id`
- `order_status_logs`: bỏ, phase sau mới thêm audit chi tiết
- `order_price_adjustments`: bỏ, thay bằng `orders.final_total` và `orders.adjustment_reason`
- `refunds`: bỏ, hoàn tiền xử lý tạm trong `payments`
- `vouchers`, `customer_vouchers`, `order_vouchers`: bỏ, phase sau
- `notifications`: bỏ, gửi mail qua service ngoài nếu cần
- `customer_flags`: bỏ, dùng cột boolean trực tiếp trong `users`

## Luồng dữ liệu chốt
### Guest booking
- FE gửi items + ảnh + contact + address + slot + handling mode + payment method
- BE gọi quote engine
- BE tạo hoặc reuse `users` với `role='customer'`, `account_type='guest'`
- BE insert `orders`
- BE insert `order_items`
- BE insert `order_images`
- nếu online thì tạo `payments`

### Registered booking
- BE lấy `users` hiện tại
- `orders.user_id` trỏ vào account hiện có
- địa chỉ vẫn snapshot vào `orders`

### Guest nâng cấp thành account
- tìm `users` theo phone trước, sau đó theo email
- nếu record đang là `account_type='guest'` thì update thành `registered`
- set `password_hash` và các thông tin đăng nhập cần thiết

### Staff xử lý onsite
- staff nhận đơn qua `orders.assigned_staff_user_id`
- staff cập nhật ảnh hiện trường vào `order_images`
- staff hoặc admin chốt `final_total`
- nếu có chênh lệch giá thì ghi `adjustment_reason`

### No-show
- admin hoặc staff set `orders.status='no_show'`
- tăng `users.no_show_count`
- nếu vượt ngưỡng thì set `users.prepaid_required=true`

## Constraints và logic bắt buộc ở DB/service layer
- không cho tạo cash order nếu user đang `prepaid_required=true`
- không cho `orders.status='confirmed'` với online payment nếu chưa có `payments.status='paid'`
- không cho `order_items.measurement_value` null với item `weight_based`
- không cho `stairs_floors` null nếu `handling_mode='stairs'`
- không cho `cash_policy_accepted=false` nếu `payment_method='cash'`
- count order active theo `booking_date + time_slot_id` để enforce capacity
- `assigned_staff_user_id` phải là user có `role='staff'`
- `user_id` của order phải là user có `role='customer'`

## Indexing chiến lược
Index bắt buộc:
- `orders(order_code)`
- `orders(status, booking_date)`
- `orders(customer_phone_snapshot)`
- `orders(customer_email_snapshot)`
- `orders(user_id, created_at desc)`
- `orders(assigned_staff_user_id, booking_date)`
- `order_items(order_id)`
- `payments(order_id, status)`
- `users(phone)`
- `users(email)`

Khuyến nghị:
- dùng `citext` cho email ở PostgreSQL
- dùng `jsonb` cho `payments.metadata` nhưng không nhét business-critical fields vào jsonb
- dùng `uuid` cho PK toàn hệ thống

## Seed dữ liệu ban đầu
Bắt buộc seed:
- time slots: `08-10`, `10-12`, `12-14`, `14-16`, `16-18`, `18-20`
- services:
  - sofa đơn 150000/item
  - sofa đôi/góc L 250000/item
  - tủ quần áo with variants nhỏ 180000, tiêu chuẩn 260000, khổ lớn 420000
  - tủ bếp/tủ giày 120000/item
  - giường/nệm 220000/item
  - tivi 80000/item
  - tủ lạnh 200000/item
  - máy giặt 180000/item
  - máy lạnh cũ 160000/item
  - bàn/ghế văn phòng 100000/item
  - rác sinh hoạt đóng bao 60000/bag
  - phế thải xây dựng 7000/kg
  - hạng mục khác quote_only

## Test cases cho thiết kế DB
- guest tạo 2 đơn bằng cùng phone phải reuse đúng `users`
- registered user tạo đơn phải có `orders.user_id`
- guest đăng ký sau đó phải update đúng record `users` cũ
- `construction` item với `measurement_value=0` bị reject
- `custom` item không có `custom_item_name` bị reject
- cash order của user có `prepaid_required=true` bị reject
- online payment callback thành công mới cho order sang `confirmed`
- slot đầy phải reject create order
- set `final_total` khác `estimated_total` phải có `adjustment_reason`
- set `no_show` phải tăng `no_show_count`
- xóa order phải cascade `order_items`, `order_images`

## Assumptions
- Engine chốt là `PostgreSQL`
- Chưa dùng multi-warehouse hay multi-tenant
- Một order chỉ có một địa chỉ thu gom
- Một order chỉ có một staff phụ trách chính tại một thời điểm
- V1 chưa cần voucher, notification, audit log riêng, refund riêng
- Reporting ban đầu chạy trực tiếp từ `orders`, `order_items`, `payments`
