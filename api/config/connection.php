<?php
// Database configuration for NHAFLOWER
$host = "localhost";
$port = 3306;
$user = "root";
$password = "dang13062005";
$dbname = "nhaflower";

// Create connection with error handling
$conn = new mysqli($host, $user, $password, $dbname, $port);

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    
    // Only output JSON if we're in an API context
    if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            "success" => false, 
            "message" => "Không thể kết nối database",
            "error_code" => $conn->connect_errno
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // For non-API contexts, just set conn to null
    $conn = null;
    return;
}

// Set charset to UTF8 for Vietnamese characters
if (!$conn->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $conn->error);
}

// Optional: Set timezone
$conn->query("SET time_zone = '+07:00'");
?>