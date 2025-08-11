<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../config/connect.php';

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Get all active categories
    $sql = "SELECT id_loaihoa as id_danhmuc, ten_loai as ten_danhmuc FROM loaihoa ORDER BY ten_loai ASC";
    $result = $conn->query($sql);
    
    if ($result) {
        $categories = [];
        
        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'id_danhmuc' => $row['id_danhmuc'],
                'ten_danhmuc' => $row['ten_danhmuc']
            ];
        }
        
        sendResponse(true, 'Lấy danh sách danh mục thành công', $categories);
    } else {
        sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $conn->error);
    }
    
} catch (Exception $e) {
    sendResponse(false, 'Lỗi server: ' . $e->getMessage());
}

$conn->close();
?>
