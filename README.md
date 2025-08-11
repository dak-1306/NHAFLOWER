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
└── # 🌸 NHAFLOWER - Hệ thống Quản lý Bán Hoa

Hệ thống quản lý bán hoa chuyên nghiệp với dashboard admin đầy đủ, biểu đồ thống kê và báo cáo chi tiết.

## 🚀 Tính năng chính

### 📊 Dashboard & Analytics
- **Biểu đồ doanh thu** - Theo dõi doanh thu theo thời gian thực
- **Thống kê sản phẩm** - Phân bố theo danh mục, top sản phẩm bán chạy
- **Quản lý đơn hàng** - Theo dõi trạng thái đơn hàng, thống kê chuyển đổi
- **Báo cáo khách hàng** - Khách hàng VIP, tỷ lệ quay lại
- **Xuất báo cáo** - Excel, PDF, in ấn

### 🛠️ Quản lý
- **Sản phẩm** - CRUD đầy đủ với hình ảnh, danh mục
- **Đơn hàng** - Xử lý đơn hàng, cập nhật trạng thái
- **Khách hàng** - Quản lý thông tin khách hàng
- **Danh mục** - Phân loại sản phẩm

### 🎨 Giao diện
- **Responsive Design** - Tối ưu cho mọi thiết bị
- **NHAFLOWER Theme** - Màu hồng (#e91e63) chủ đạo
- **Modern UI** - Bootstrap 5, Font Awesome icons
- **Interactive Charts** - Chart.js với animations mượt mà

## 📁 Cấu trúc Project

```
NHAFLOWER/
├── admin/                    # Admin Dashboard
│   ├── charts.html          # Biểu đồ & Báo cáo ⭐
│   ├── orders.html          # Quản lý đơn hàng
│   ├── products.html        # Quản lý sản phẩm
│   ├── categories.html      # Quản lý danh mục ⭐
│   └── customers.html       # Quản lý khách hàng
├── api/                     # REST APIs
│   ├── api_thongke.php     # Statistics API ⭐
│   ├── export_report.php   # Export functionality ⭐
│   ├── orders.php          # Orders API
│   └── products.php        # Products API
├── assets/                  # Static assets
│   ├── js/admin/           # Admin JavaScript
│   │   ├── charts.js       # Charts functionality ⭐
│   │   ├── orders.js       # Orders management ⭐
│   │   └── categories.js   # Categories management ⭐
│   ├── css/admin/          # Admin styles
│   └── vendor/             # Third-party libraries
├── config/                  # Configuration
│   └── connect.php         # Database connection
├── user/                   # User frontend
└── database/               # Database files
    └── nhaflower.sql       # Database schema
```

## 🚀 Cài đặt

### 1. Yêu cầu hệ thống
- **XAMPP** hoặc **WAMP** với PHP 7.4+
- **MySQL 5.7+**
- **Web Browser** hiện đại (Chrome, Firefox, Edge)

### 2. Thiết lập Database
```sql
-- Import database
mysql -u root -p < database/nhaflower.sql

-- Hoặc sử dụng phpMyAdmin để import file nhaflower.sql
```

### 3. Cấu hình kết nối
Chỉnh sửa `config/connect.php`:
```php
<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "nhaflower";

$conn = new mysqli($servername, $username, $password, $dbname);
?>
```

### 4. Tạo dữ liệu mẫu (Optional)
```bash
# Chạy script tạo dữ liệu mẫu
php generate_sample_data.php
```

### 5. Khởi động hệ thống
```bash
# Khởi động XAMPP
# Truy cập: http://localhost/NHAFLOWER/
```

## 📊 Demo & Testing

### 🎯 Quick Demo
- **Demo Dashboard**: `demo_charts.html` - Giao diện demo đầy đủ
- **API Testing**: `test_statistics.html` - Test các API endpoints
- **Admin Dashboard**: `admin/charts.html` - Dashboard chính thức

### 🧪 Test APIs
```javascript
// Test Overview Stats
GET /api/api_thongke.php?action=overview&date_from=2025-01-01&date_to=2025-08-11

// Test Revenue Chart
GET /api/api_thongke.php?action=revenue_chart&date_from=2025-01-01&date_to=2025-08-11

// Test Category Stats
GET /api/api_thongke.php?action=category_stats

// Test Top Products
GET /api/api_thongke.php?action=top_products&limit=5
```

## 🎛️ Hướng dẫn sử dụng

### 📈 Dashboard Analytics

1. **Truy cập Admin Dashboard**
   ```
   http://localhost/NHAFLOWER/admin/charts.html
   ```

2. **Chọn khoảng thời gian**
   - Sử dụng date picker để chọn từ ngày - đến ngày
   - Hệ thống sẽ tự động cập nhật biểu đồ

3. **Tính năng nâng cao**
   - **Auto Refresh**: Tự động làm mới dữ liệu mỗi 30 giây
   - **Settings Panel**: Tùy chỉnh refresh interval, theme, animations
   - **Export Reports**: Xuất báo cáo Excel, PDF
   - **Keyboard Shortcuts**: 
     - `Ctrl+R`: Refresh data
     - `F1`: Toggle auto refresh
     - `Esc`: Close modals

### 🛒 Quản lý Đơn hàng

1. **Truy cập Orders Management**
   ```
   http://localhost/NHAFLOWER/admin/orders.html
   ```

2. **Chức năng**
   - Xem danh sách đơn hàng với DataTable
   - Cập nhật trạng thái: Chờ → Đang giao → Hoàn thành
   - Xem chi tiết đơn hàng
   - In hóa đơn
   - Tìm kiếm và lọc

### 🏷️ Quản lý Danh mục

1. **Truy cập Categories Management**
   ```
   http://localhost/NHAFLOWER/admin/categories.html
   ```

2. **Chức năng CRUD**
   - Thêm danh mục mới
   - Chỉnh sửa thông tin
   - Xóa danh mục (với xác nhận)
   - Quản lý trạng thái

## 🎨 Customization

### 🎯 Theme Colors
File: `assets/css/admin/custom-admin.css`
```css
:root {
  --primary-color: #e91e63;    /* NHAFLOWER Pink */
  --primary-light: #f48fb1;
  --primary-dark: #ad1457;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --info-color: #2196f3;
  --danger-color: #f44336;
}
```

### 📊 Chart Configuration
File: `assets/js/admin/charts.js`
```javascript
// Tùy chỉnh màu sắc biểu đồ
const colors = {
    primary: '#e91e63',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    danger: '#f44336'
};

// Tùy chỉnh cấu hình
const config = {
    maxRetries: 3,
    retryDelay: 1000,
    autoRefresh: false,
    refreshInterval: 30000,
    debug: false
};
```

## 🔧 API Documentation

### 📊 Statistics API (`/api/api_thongke.php`)

#### Overview Stats
```http
GET /api/api_thongke.php?action=overview&date_from=2025-01-01&date_to=2025-08-11
```
**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_revenue": 15000000,
    "total_orders": 45,
    "total_products": 10,
    "total_customers": 5,
    "conversion_rate": 4.5,
    "avg_order_value": 333333,
    "customer_retention": 60.0,
    "inventory_turnover": 2.5
  },
  "message": "Lấy thống kê tổng quan thành công"
}
```

#### Revenue Chart Data
```http
GET /api/api_thongke.php?action=revenue_chart&date_from=2025-01-01&date_to=2025-08-11
```

#### Category Statistics
```http
GET /api/api_thongke.php?action=category_stats
```

#### Top Products
```http
GET /api/api_thongke.php?action=top_products&limit=5&date_from=2025-01-01&date_to=2025-08-11
```

#### Order Status Stats
```http
GET /api/api_thongke.php?action=order_status_stats&date_from=2025-01-01&date_to=2025-08-11
```

### 📋 Orders API (`/api/orders.php`)
- `GET`: Lấy danh sách đơn hàng
- `POST`: Tạo đơn hàng mới
- `PUT`: Cập nhật đơn hàng
- `DELETE`: Xóa đơn hàng

### 🏷️ Categories API (`/api/categories.php`)
- Full CRUD operations for product categories

## 🚀 Advanced Features

### 🔄 Real-time Updates
- Auto refresh functionality with configurable intervals
- Connection status monitoring
- Graceful error handling with retry mechanism

### 🎛️ Settings Management
- User preferences saved in localStorage
- Theme customization (Default, Dark, Light)
- Chart animation settings
- Performance monitoring in debug mode

### 📤 Export Functionality
- Excel export with formatting
- PDF reports with company branding
- Print-friendly layouts

### ⌨️ Keyboard Shortcuts
- `Ctrl+R`: Refresh all data
- `Ctrl+S`: Save settings (in settings modal)
- `F1`: Toggle auto refresh
- `Esc`: Close any open modal

## 🛠️ Troubleshooting

### ❓ Common Issues

**1. API returns empty data**
```bash
# Check database connection
php api/test_db.php

# Generate sample data
php generate_sample_data.php
```

**2. Charts not displaying**
```javascript
// Check browser console for JavaScript errors
// Ensure Chart.js is loaded properly
```

**3. Database connection failed**
```php
// Check config/connect.php settings
// Ensure MySQL service is running
```

### 🔍 Debug Mode
Enable debug mode in charts settings or:
```javascript
// In browser console
localStorage.setItem('nhaflower_charts_settings', 
  JSON.stringify({debug: true}));
```

## 📱 Browser Compatibility

- ✅ **Chrome 80+**
- ✅ **Firefox 75+**
- ✅ **Safari 13+**
- ✅ **Edge 80+**
- ⚠️ **IE 11** (Limited support)

## 🤝 Contributing

### 📋 Development Guidelines
1. Follow existing code style and conventions
2. Add comments for complex functionality
3. Test thoroughly before committing
4. Update documentation when adding features

### 🔄 Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-chart-type

# Make changes and commit
git add .
git commit -m "Add new chart type for inventory analysis"

# Push and create pull request
git push origin feature/new-chart-type
```

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

- **Email**: support@nhaflower.com
- **Documentation**: Check README.md and inline comments
- **Issues**: Create GitHub issue for bugs/feature requests

---

## 🎉 Phiên bản hiện tại: v1.0.0 Beta

### ✨ Features hoàn thành:
- ✅ **Admin Dashboard** với biểu đồ thống kê đầy đủ
- ✅ **Orders Management System** với CRUD hoàn chỉnh
- ✅ **Categories Management** với giao diện thân thiện
- ✅ **Charts & Reports** với 4 loại biểu đồ chính
- ✅ **Statistics API** với 7 endpoints
- ✅ **Export functionality** (Excel, PDF, Print)
- ✅ **Real-time updates** và auto refresh
- ✅ **Advanced settings** với theme customization
- ✅ **Error handling** và retry mechanism
- ✅ **Responsive design** cho mobile
- ✅ **Performance monitoring** và debugging tools

### 🔮 Roadmap:
- 🚧 **User Management System**
- 🚧 **Advanced Analytics** (Cohort analysis, Forecasting)
- 🚧 **Mobile App** (React Native)
- 🚧 **API Authentication** (JWT tokens)
- 🚧 **Real-time Notifications** (WebSockets)
- 🚧 **Multi-language Support**

**Chúc bạn sử dụng NHAFLOWER thành công! 🌸**                       # This file
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
