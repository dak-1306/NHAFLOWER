<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../config/connection.php';

try {
    // Query to get all flower categories
    $sql = "SELECT id_loaihoa, ten_loai FROM loaihoa ORDER BY ten_loai ASC";
    $result = $conn->query($sql);
    
    if ($result) {
        $categories = [];
        
        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'id_loaihoa' => $row['id_loaihoa'],
                'ten_loai' => $row['ten_loai']
            ];
        }
        
        // Return successful response
        echo json_encode($categories, JSON_UNESCAPED_UNICODE);
        
    } else {
        throw new Exception("Lỗi truy vấn database: " . $conn->error);
    }
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lỗi server: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
