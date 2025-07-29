<?php
// Test kết nối database NHAFLOWER
header('Content-Type: application/json; charset=utf-8');

echo "<h2>🧪 Test Kết Nối Database NHAFLOWER</h2>";

try {
    // Thông tin kết nối
    $host = "localhost";
    $port = 3307;
    $user = "root";
    $password = "";
    $dbname = "nhaflower";
    
    echo "<p><strong>📋 Thông tin kết nối:</strong></p>";
    echo "<ul>";
    echo "<li>Host: $host</li>";
    echo "<li>Port: $port</li>";
    echo "<li>User: $user</li>";
    echo "<li>Password: " . (empty($password) ? "Không có" : "Có") . "</li>";
    echo "<li>Database: $dbname</li>";
    echo "</ul>";
    
    // Test kết nối MySQL server
    echo "<p><strong>🔗 Test kết nối MySQL server...</strong></p>";
    $conn = new mysqli($host, $user, $password, "", $port);
    
    if ($conn->connect_error) {
        echo "<p style='color: red;'>❌ THẤT BẠI: " . $conn->connect_error . "</p>";
        echo "<h3>🛠️ Cách khắc phục:</h3>";
        echo "<ol>";
        echo "<li>Kiểm tra XAMPP có đang chạy không</li>";
        echo "<li>Mở XAMPP Control Panel</li>";
        echo "<li>Start Apache và MySQL</li>";
        echo "<li>Vào phpMyAdmin: http://localhost/phpmyadmin</li>";
        echo "</ol>";
        exit();
    } else {
        echo "<p style='color: green;'>✅ Kết nối MySQL server THÀNH CÔNG!</p>";
        echo "<p>Server info: " . $conn->server_info . "</p>";
    }
    
    // Test database tồn tại
    echo "<p><strong>🗄️ Kiểm tra database 'nhaflower'...</strong></p>";
    $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$dbname'");
    
    if ($result && $result->num_rows > 0) {
        echo "<p style='color: green;'>✅ Database '$dbname' TỒN TẠI!</p>";
        
        // Kết nối tới database cụ thể
        $conn->select_db($dbname);
        
        // Liệt kê các bảng
        echo "<p><strong>📊 Danh sách bảng trong database:</strong></p>";
        $result = $conn->query("SHOW TABLES");
        if ($result && $result->num_rows > 0) {
            echo "<ul>";
            while ($row = $result->fetch_array()) {
                echo "<li>" . $row[0] . "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color: orange;'>⚠️ Database trống - chưa có bảng nào</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Database '$dbname' KHÔNG TỒN TẠI!</p>";
        echo "<h3>🛠️ Cách tạo database:</h3>";
        echo "<ol>";
        echo "<li>Vào phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
        echo "<li>Click 'New' ở sidebar trái</li>";
        echo "<li>Nhập tên database: <strong>nhaflower</strong></li>";
        echo "<li>Click 'Create'</li>";
        echo "</ol>";
        
        // Thử tạo database tự động
        echo "<p><strong>🔧 Thử tạo database tự động...</strong></p>";
        if ($conn->query("CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
            echo "<p style='color: green;'>✅ Đã tạo database '$dbname' thành công!</p>";
        } else {
            echo "<p style='color: red;'>❌ Không thể tạo database: " . $conn->error . "</p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ LỖI: " . $e->getMessage() . "</p>";
}

if (isset($conn)) {
    $conn->close();
}

echo "<hr>";
echo "<p><em>Chạy file này từ: " . $_SERVER['PHP_SELF'] . "</em></p>";
echo "<p><em>Thời gian: " . date('Y-m-d H:i:s') . "</em></p>";
?>
