<?php
/**
 * NHAFLOWER - Add Category API
 * API thêm danh mục loại hoa
 */

// Set headers for CORS and JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once("../../config/connect.php");

$response = ['success' => false, 'message' => '', 'data' => null];

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get and validate input data
    $ten_loai = $_POST['ten_loai'] ?? '';
    $mo_ta = $_POST['mo_ta'] ?? '';
    
    // Validate required fields
    if (empty(trim($ten_loai))) {
        throw new Exception('Tên danh mục không được để trống');
    }
    
    // Validate length
    if (strlen($ten_loai) > 100) {
        throw new Exception('Tên danh mục không được vượt quá 100 ký tự');
    }
    
    // Check for duplicate category name
    $checkSql = "SELECT id_loaihoa FROM loaihoa WHERE ten_loai = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param('s', $ten_loai);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception('Tên danh mục đã tồn tại');
    }
    
    // Insert new category using prepared statement
    $sql = "INSERT INTO loaihoa (ten_loai, mo_ta) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }
    
    $stmt->bind_param('ss', $ten_loai, $mo_ta);
    
    if ($stmt->execute()) {
        $new_id = $conn->insert_id;
        $response['success'] = true;
        $response['message'] = 'Thêm danh mục thành công';
        $response['data'] = [
            'id_loaihoa' => $new_id,
            'ten_loai' => $ten_loai,
            'mo_ta' => $mo_ta
        ];
    } else {
        throw new Exception('Lỗi khi thêm danh mục: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>
