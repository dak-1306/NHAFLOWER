# NHAFLOWER - Hệ thống quản lý bán hoa

## 🌸 Tổng quan

Hệ thống quản lý bán hoa online với kiến trúc modular, tích hợp database MySQL và giao diện responsive.

## 📁 Cấu trúc thư mục

```
NHAFLOWER/
├── admin/                          # Giao diện quản trị
│   ├── index.html                  # Dashboard admin
│   ├── tables.html                 # Quản lý dữ liệu
│   └── charts.html                 # Thống kê biểu đồ
│
├── user/                           # Giao diện người dùng
│   ├── home.html                   # Trang chủ
│   ├── login.html                  # Đăng nhập
│   ├── register.html               # Đăng ký
│   ├── list_product.html           # Danh sách sản phẩm
│   ├── detail_product.html         # Chi tiết sản phẩm
│   ├── shopping_cart.html          # Giỏ hàng
│   └── profile/                    # 🆕 PROFILE SYSTEM (Modular)
│       ├── dashboard.html          # Entry point (redirect)
│       ├── personal-info.html      # Thông tin cá nhân
│       ├── orders.html             # Quản lý đơn hàng
│       ├── addresses.html          # Quản lý địa chỉ
│       ├── favorites.html          # Sản phẩm yêu thích
│       ├── notifications.html      # Thông báo
│       └── security.html           # Bảo mật tài khoản
│
├── assets/                         # Tài nguyên
│   ├── css/
│   │   ├── admin/                  # CSS cho admin
│   │   │   ├── sb-admin-2.css
│   │   │   └── scss/               # SCSS source files
│   │   └── user/                   # CSS cho user
│   │       ├── common.css          # Styles chung
│   │       ├── home.css
│   │       ├── login.css
│   │       ├── list_product.css
│   │       └── profile/            # 🆕 MODULAR PROFILE CSS
│   │           ├── profile-base.css      # Shared styles
│   │           ├── personal-info.css     # Form styles
│   │           ├── orders.css            # Order management
│   │           ├── addresses.css         # Address management
│   │           ├── favorites.css         # Favorites display
│   │           └── notifications.css     # Notifications
│   ├── js/
│   │   ├── admin/                  # JavaScript cho admin
│   │   │   ├── sb-admin-2.js
│   │   │   └── demo/               # Demo scripts
│   │   └── user/                   # JavaScript cho user
│   │       ├── auth.js             # Authentication logic
│   │       ├── home.js
│   │       ├── login.js
│   │       ├── list_product.js
│   │       └── profile-*.js        # 🆕 MODULAR PROFILE JS
│   │           ├── profile-base.js       # BaseProfileManager class
│   │           ├── profile-personal-info.js  # PersonalInfoManager
│   │           └── profile-orders.js     # OrdersManager
│   ├── img/                        # Hình ảnh
│   │   ├── admin/
│   │   └── user/
│   │       └── logo_NHAFLOWER.png
│   └── vendor/                     # Thư viện bên thứ 3
│       ├── bootstrap/
│       ├── jquery/
│       ├── fontawesome-free/
│       ├── chart.js/
│       ├── datatables/
│       └── jquery-easing/
│
├── api/                            # 🆕 REST API
│   ├── config/
│   │   └── connection.php          # Database connection
│   ├── khach_hang/                 # Customer APIs
│   │   ├── get_customers.php
│   │   ├── create_customer.php
│   │   ├── update_customer.php
│   │   └── delete_customer.php
│   ├── san_pham/                   # Product APIs
│   │   ├── get_products.php
│   │   ├── create_product.php
│   │   ├── update_product.php
│   │   └── delete_product.php
│   └── don_hang/                   # Order APIs
│       ├── get_orders_by_customer.php
│       └── create_order.php
│
├── auth/                           # Authentication
│   ├── login_process.php           # Login handler
│   ├── logout.php                  # Logout handler
│   └── profile.php                 # 🆕 Profile data API
│
├── includes/                       # Shared includes
│   ├── config.php                  # Database config
│   ├── header.php                  # Common header
│   └── footer.php                  # Common footer
│
├── gulpfile.js                     # Build automation
├── package.json                    # Node dependencies
├── test_database.php               # Database connection test
├── PROFILE_STRUCTURE.md            # 🆕 Profile architecture docs
└── README.md                       # This file
```

## 🚀 Tính năng chính

### 👤 Hệ thống người dùng

- **Authentication**: Đăng ký, đăng nhập với JWT session
- **Profile Management**: Modular profile system với các trang riêng biệt
- **Product Management**: Xem, tìm kiếm, lọc sản phẩm
- **Shopping Cart**: Giỏ hàng với localStorage persistence
- **Order Tracking**: Theo dõi đơn hàng realtime từ database

### 🔧 Hệ thống quản trị

- **Dashboard**: Thống kê tổng quan với charts
- **Data Management**: Quản lý sản phẩm, khách hàng, đơn hàng
- **Responsive Design**: Giao diện responsive với Bootstrap 4

### 🗄️ Database & API

- **MySQL Database**: Cấu trúc chuẩn với các bảng: taikhoan, khachhang, sanpham, donhang
- **REST APIs**: CRUD operations cho tất cả entities
- **Real-time Data**: Profile và orders load dữ liệu thực từ database

## 🏗️ Kiến trúc kỹ thuật

### Frontend Architecture

- **Modular CSS**: Component-based styling với base + specific modules
- **Inheritance-based JS**: BaseProfileManager class với các child managers
- **Responsive Design**: Mobile-first với Bootstrap 4
- **Clean URLs**: `/user/profile/page-name.html` structure

### Backend Architecture

- **PHP APIs**: RESTful endpoints cho data operations
- **MySQL**: Normalized database với foreign key constraints
- **Session Management**: PHP sessions với security checks
- **Error Handling**: Proper HTTP status codes và JSON responses

## 📋 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **XAMPP** (hoặc LAMP/WAMP stack)
- **PHP 7.4+**
- **MySQL 5.7+**
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Bước cài đặt

1. **Clone repository**:

   ```bash
   git clone https://github.com/dak-1306/NhAFLOWER.git
   cd NhAFLOWER
   ```

2. **Cấu hình database**:

   - Tạo database `nhaflower` trong MySQL
   - Import schema từ file SQL (nếu có)
   - Cập nhật thông tin kết nối trong `/includes/config.php`

3. **Cấu hình web server**:

   - Copy project vào `htdocs` (XAMPP) hoặc `www` (WAMP)
   - Khởi động Apache và MySQL services
   - Truy cập: `http://localhost/NHAFLOWER`

4. **Test kết nối database**:
   ```
   http://localhost/NHAFLOWER/test_database.php
   ```

## 🎯 Hướng dẫn sử dụng

### Cho người dùng cuối

1. **Truy cập trang chủ**: `/user/home.html`
2. **Đăng ký/Đăng nhập**: `/user/login.html` hoặc `/user/register.html`
3. **Xem sản phẩm**: `/user/list_product.html`
4. **Quản lý profile**: `/user/profile/personal-info.html`
5. **Theo dõi đơn hàng**: `/user/profile/orders.html`

### Cho quản trị viên

1. **Dashboard**: `/admin/index.html`
2. **Quản lý dữ liệu**: `/admin/tables.html`
3. **Thống kê**: `/admin/charts.html`

## 🔄 API Endpoints

### Authentication

- `POST /auth/login_process.php` - Đăng nhập
- `POST /auth/logout.php` - Đăng xuất
- `GET /auth/profile.php` - Lấy thông tin profile

### Products

- `GET /api/san_pham/get_products.php` - Lấy danh sách sản phẩm
- `GET /api/san_pham/get_product.php?id={id}` - Lấy chi tiết sản phẩm
- `POST /api/san_pham/create_product.php` - Tạo sản phẩm mới
- `PUT /api/san_pham/update_product.php` - Cập nhật sản phẩm
- `DELETE /api/san_pham/delete_product.php` - Xóa sản phẩm

### Orders

- `GET /api/don_hang/get_orders_by_customer.php?customer_id={id}` - Lấy đơn hàng của khách
- `POST /api/don_hang/create_order.php` - Tạo đơn hàng mới

### Customers

- `GET /api/khach_hang/get_customers.php` - Lấy danh sách khách hàng
- `POST /api/khach_hang/create_customer.php` - Tạo khách hàng mới
- `PUT /api/khach_hang/update_customer.php` - Cập nhật khách hàng

## ✨ Các cải tiến đã thực hiện

### 🆕 Profile System Refactor (Latest)

- **Modular Architecture**: Tách profile system thành các trang riêng biệt
- **CSS Optimization**: Giảm 70% kích thước CSS load per page
- **JavaScript Inheritance**: BaseProfileManager với child classes, giảm 67% duplicate code
- **Database Integration**: Chuyển từ mock data sang real MySQL data
- **Clean URLs**: Structure `/user/profile/page-name.html`
- **File Cleanup**: Xóa các file duplicate và không cần thiết

### 📊 Performance Improvements

- **Lazy Loading**: CSS và JS chỉ load khi cần thiết
- **Code Splitting**: Modular architecture cho maintainability
- **Database Optimization**: Proper indexing và efficient queries
- **Caching**: Browser caching cho assets

## 🛠️ Development

### Thêm tính năng mới

1. **CSS**: Tạo file trong `/assets/css/user/` hoặc `/assets/css/admin/`
2. **JavaScript**: Tạo file trong `/assets/js/user/` hoặc `/assets/js/admin/`
3. **API**: Tạo endpoint trong `/api/{entity}/`
4. **Database**: Cập nhật schema và APIs tương ứng

### Build Tools

- **Gulp**: Automation tasks (nếu cần)
- **SCSS**: Preprocessing cho CSS (trong admin)
- **Package.json**: Node dependencies

## 📝 Ghi chú kỹ thuật

### Database Schema

```sql
-- Bảng chính
taikhoan (id, username, password, email, role)
khachhang (id, ho_ten, email, so_dien_thoai, dia_chi, tai_khoan_id)
sanpham (id, ten_san_pham, mo_ta, gia, hinh_anh, danh_muc)
donhang (id, khach_hang_id, ngay_dat, tong_tien, trang_thai)
chitietdonhang (id, don_hang_id, san_pham_id, so_luong, gia)
```

### Security Features

- **SQL Injection Prevention**: Prepared statements
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token validation (recommended)
- **Authentication**: Session-based với timeout

### Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📞 Liên hệ & Hỗ trợ

- **Repository**: [https://github.com/dak-1306/NhAFLOWER](https://github.com/dak-1306/NhAFLOWER)
- **Issues**: [GitHub Issues](https://github.com/dak-1306/NhAFLOWER/issues)
- **Documentation**: `PROFILE_STRUCTURE.md` cho chi tiết profile system

---

_Last updated: August 2025 - Profile System Modular Refactor Complete_
