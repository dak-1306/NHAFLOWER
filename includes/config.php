<?php
// File cấu hình cơ sở dữ liệu và các thiết lập chung
define('DB_HOST', 'localhost');
define('DB_NAME', 'nhaflower');
define('DB_USER', 'root');
define('DB_PASS', '');

// Kết nối cơ sở dữ liệu
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Lỗi kết nối: " . $e->getMessage());
}

// Các hằng số khác
define('SITE_URL', 'http://localhost/nhaflower');
define('UPLOAD_PATH', 'assets/img/uploads/');
?>
