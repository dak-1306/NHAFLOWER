# NHAFLOWER - Hệ thống quản lý bán hoa

## 🌸 Tổng quan

NHAFLOWER là hệ thống quản lý bán hoa online, gồm giao diện người dùng và quản trị, sử dụng PHP/MySQL, REST API, layout responsive với Bootstrap, tối ưu cho desktop/mobile.

## 📁 Cấu trúc thư mục

```
NHAFLOWER/
├── admin/                  # Giao diện quản trị
│   ├── 404.html
│   ├── blank.html
│   ├── categories.html
│   ├── charts.html
│   ├── customers.html
│   ├── forgot-password.html
│   ├── index.html
│   ├── notifications.html
│   ├── orders.html
│   ├── products.html
│   ├── reports.html
│   ├── settings-general.html
│   ├── settings-payment.html
│   ├── settings-shipping.html
│   ├── tables.html
│   ├── update-notifications.html
│   └── ... (các trang quản trị khác)
│
├── api/                    # REST API backend
│   ├── api_thongke.php
│   ├── categories.php
│   ├── checkout.php
│   ├── config/
│   │   └── connection.php
│   ├── danh_gia.php
│   ├── export_reports.php
│   ├── khach_hang.php
│   ├── khuyen_mai.php
│   ├── loai_hoa.php
│   ├── orders.php
│   ├── products.php
│   ├── settings.php
│   ├── tai_khoan.php
│   ├── thong_bao.php
│   └── ... (các endpoint khác)
│
├── assets/                 # Tài nguyên tĩnh
│   ├── css/
│   │   ├── admin/
│   │   │   ├── css/
│   │   │   ├── custom-admin.css
│   │   │   ├── notifications.css
│   │   │   ├── sb-admin-2.css
│   │   │   ├── sb-admin-2.min.css
│   │   │   └── scss/
│   │   └── user/
│   │       ├── common.css
│   │       ├── detail_product.css
│   │       ├── home.css
│   │       ├── list_product.css
│   │       ├── login.css
│   │       ├── profile/
│   │       │   ├── addresses.css
│   │       │   ├── notifications.css
│   │       │   ├── orders.css
│   │       │   ├── personal-info.css
│   │       │   ├── profile-base.css
│   │       │   └── profile.css
│   │       ├── register.css
│   │       └── shopping_cart.css
│   ├── img/
│   │   ├── admin/
│   │   ├── products/
│   │   └── user/
│   ├── js/
│   │   ├── admin/
│   │   │   ├── categories.js
│   │   │   ├── charts.js
│   │   │   ├── customers.js
│   │   │   ├── demo/
│   │   │   ├── notifications.js
│   │   │   ├── orders.js
│   │   │   ├── products.js
│   │   │   ├── reports.js
│   │   │   ├── sb-admin-2.js
│   │   │   ├── sb-admin-2.min.js
│   │   │   ├── settings-general.js
│   │   │   ├── settings-payment.js
│   │   │   └── settings-shipping.js
│   │   └── user/
│   │       ├── auth.js
│   │       ├── detail_product.js
│   │       ├── home.js
│   │       ├── index.js
│   │       ├── list_product.js
│   │       ├── login.js
│   │       ├── profile/
│   │       │   ├── profile-addresses.js
│   │       │   ├── profile-base.js
│   │       │   ├── profile-dashboard.js
│   │       │   ├── profile-notifications.js
│   │       │   ├── profile-orders.js
│   │       │   ├── profile-personal-info.js
│   │       │   ├── profile-security.js
│   │       │   └── sidebar-loader.js
│   │       ├── register.js
│   │       └── shopping_cart.js
│   └── vendor/
│       ├── bootstrap/
│       ├── chart.js/
│       ├── datatables/
│       ├── fontawesome-free/
│       ├── jquery/
│       └── jquery-easing/
│
├── auth/                   # Xác thực người dùng
│   ├── login.php
│   ├── login_process.php
│   ├── logout.php
│   ├── profile.php
│   └── register.php
│
├── database/               # Cơ sở dữ liệu
│   └── nhaflower.sql
│
├── includes/               # Chỉ còn dùng config.php
│   └── config.php
│
├── user/                   # Giao diện người dùng
│   ├── checkout.html
│   ├── detail_product.html
│   ├── home.html
│   ├── index.html
│   ├── list_product.html
│   ├── login.html
│   ├── profile/
│   │   ├── addresses.html
│   │   ├── dashboard.html
│   │   ├── notification-preferences.html
│   │   ├── notifications.html
│   │   ├── orders.html
│   │   ├── personal-info.html
│   │   ├── security.html
│   │   └── sidebar-profile.html
│   ├── register.html
│   └── shopping_cart.html
│
├── README.md               # Tài liệu dự án
└── .gitignore              # Git ignore file
```

## 🚀 Tính năng chính

### Người dùng

- Đăng ký, đăng nhập, quản lý thông tin cá nhân, đổi mật khẩu.
- Xem, tìm kiếm, lọc, chi tiết sản phẩm, đánh giá, khuyến mãi.
- Giỏ hàng, đặt hàng, theo dõi đơn hàng, thông báo trạng thái.
- Giao diện profile modular: thông tin cá nhân, đơn hàng, địa chỉ, bảo mật, thông báo.

### Quản trị viên

- Dashboard thống kê, biểu đồ doanh thu, sản phẩm, khách hàng, đơn hàng.
- Quản lý sản phẩm, đơn hàng, khách hàng, danh mục, khuyến mãi, đánh giá.
- Cấu hình hệ thống, xuất báo cáo Excel/PDF, quản lý thông báo.

### Kỹ thuật

- RESTful API PHP trả về JSON, đồng bộ frontend/backend.
- MySQL chuẩn hóa, bảo mật, chỉ còn bảng cần thiết.
- Responsive layout với Bootstrap, tối ưu cho mobile/desktop.
- Tối ưu hiệu năng: lazy loading, code splitting, caching assets.

## 🗄️ Database Schema (ví dụ)

```sql
taikhoan (id, username, password, email, role)
khachhang (id, ho_ten, email, so_dien_thoai, dia_chi, tai_khoan_id)
sanpham (id, ten_san_pham, mo_ta, gia, hinh_anh, danh_muc)
donhang (id, khach_hang_id, ngay_dat, tong_tien, trang_thai)
chitietdonhang (id, don_hang_id, san_pham_id, so_luong, gia)
danhgia (id, san_pham_id, khach_hang_id, so_sao, noi_dung, ngay)
khuyenmai (id, ten, mo_ta, gia_tri, ngay_bat_dau, ngay_ket_thuc)
```

## 🔄 API Endpoints (tiêu biểu)

- `/api/products.php` - CRUD sản phẩm
- `/api/orders.php` - CRUD đơn hàng
- `/api/khach_hang.php` - CRUD khách hàng
- `/api/khuyen_mai.php` - CRUD khuyến mãi
- `/api/danh_gia.php` - CRUD đánh giá
- `/api/api_thongke.php` - Thống kê dashboard
- `/auth/login_process.php` - Đăng nhập
- `/auth/logout.php` - Đăng xuất
- `/auth/profile.php` - Lấy thông tin profile

## 🛠️ Hướng dẫn cài đặt

1. **Yêu cầu hệ thống**

   - XAMPP/WAMP với PHP 7.4+
   - MySQL 5.7+
   - Trình duyệt hiện đại (Chrome, Firefox, Edge)

2. **Thiết lập database**

   - Tạo database `nhaflower`
   - Import file `database/nhaflower.sql` vào MySQL

3. **Cấu hình kết nối**

   - Sửa thông tin trong `includes/config.php` hoặc `api/config/connection.php`

4. **Khởi động hệ thống**
   - Chạy Apache/MySQL
   - Truy cập: `http://localhost/NHAFLOWER/`

## 🎯 Hướng dẫn sử dụng

- Người dùng: Truy cập `/user/home.html`, đăng ký/đăng nhập, xem sản phẩm, đặt hàng, quản lý profile, theo dõi đơn hàng.
- Quản trị viên: Truy cập `/admin/index.html`, quản lý sản phẩm, đơn hàng, khách hàng, danh mục, khuyến mãi, xem dashboard.

## 🛠️ Troubleshooting

- Kiểm tra kết nối database khi API trả về lỗi.
- Kiểm tra console JS khi giao diện không hiển thị đúng.
- Đảm bảo cấu hình đúng trong `includes/config.php`.

## 📝 Ghi chú kỹ thuật & bảo mật

- Chỉ còn dùng `includes/config.php` cho kết nối database, không dùng header/footer include.
- Sử dụng prepared statements, sanitize input, session-based authentication.
- Tối ưu layout, dọn code JS/CSS, loại bỏ chức năng không cần thiết.

## 📞 Liên hệ & Hỗ trợ

- Repository: https://github.com/dak-1306/NhAFLOWER
- Issues: https://github.com/dak-1306/NhAFLOWER/issues
- Documentation: PROFILE_STRUCTURE.md

_Last updated: August 2025 - Refactor profile, đồng bộ dữ liệu thật, loại bỏ mock, tối ưu layout, chỉ còn dùng includes/config.php_
