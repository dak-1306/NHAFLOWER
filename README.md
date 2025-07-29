# NHAFLOWER - Hệ thống quản lý bán hoa

## Cấu trúc thư mục

```
NHAFLOWER/
├── admin/                          # Giao diện quản trị
│   ├── index.html                  # Trang dashboard admin
│   ├── gulpfile.js                 # Build tool configuration
│   └── package.json                # Dependencies cho admin
│
├── user/                           # Giao diện người dùng
│   ├── home.html                   # Trang chủ
│   ├── login.html                  # Trang đăng nhập
│   └── register.html               # Trang đăng ký
│
├── assets/                         # Tài nguyên chung
│   ├── css/
│   │   ├── admin/                  # CSS cho admin
│   │   │   ├── sb-admin-2.css
│   │   │   ├── sb-admin-2.min.css
│   │   │   └── scss/               # SCSS source files
│   │   └── user/                   # CSS cho user
│   │       ├── home.css
│   │       ├── login.css
│   │       └── register.css
│   ├── js/
│   │   ├── admin/                  # JavaScript cho admin
│   │   │   ├── sb-admin-2.js
│   │   │   ├── sb-admin-2.min.js
│   │   │   └── demo/               # Demo scripts
│   │   └── user/                   # JavaScript cho user
│   │       ├── home.js
│   │       ├── login.js
│   │       └── register.js
│   ├── img/                        # Hình ảnh
│   │   └── admin/                  # Hình ảnh admin
│   └── vendor/                     # Thư viện bên thứ 3
│       ├── bootstrap/
│       ├── jquery/
│       ├── fontawesome-free/
│       ├── chart.js/
│       ├── datatables/
│       └── jquery-easing/
│
├── includes/                       # File include chung
│   ├── config.php                  # Cấu hình database
│   ├── header.php                  # Header chung
│   └── footer.php                  # Footer chung
│
├── auth/                          # Xử lý authentication
│   ├── login_process.php          # Xử lý đăng nhập
│   └── logout.php                 # Xử lý đăng xuất
│
└── README.md                      # File này
```

## Ưu điểm của cấu trúc này:

1. **Phân tách rõ ràng theo chức năng**: Admin và User riêng biệt
2. **Tài nguyên được tổ chức tốt**: CSS/JS/Images được phân loại
3. **Thư viện vendor tập trung**: Tránh trùng lặp, dễ quản lý
4. **Includes riêng biệt**: Dễ maintain và tái sử dụng
5. **Auth logic độc lập**: Bảo mật tốt hơn

## Hướng dẫn sử dụng:

1. **Để truy cập giao diện user**: `/user/home.html`
2. **Để truy cập giao diện admin**: `/admin/index.html`
3. **Cấu hình database**: Chỉnh sửa file `/includes/config.php`
4. **Thêm CSS mới**: Đặt vào `/assets/css/user/` hoặc `/assets/css/admin/`
5. **Thêm JS mới**: Đặt vào `/assets/js/user/` hoặc `/assets/js/admin/`

## Lưu ý quan trọng:

- Tất cả đường dẫn trong HTML đã được cập nhật để trỏ đúng vị trí mới
- Vendor libraries được dùng chung giữa admin và user
- File PHP trong `/auth/` và `/includes/` cần server hỗ trợ PHP để chạy
# NhAFLOWER
