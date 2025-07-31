<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once("../../config/config/connection.php");
$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$mat_khau = password_hash($data['mat_khau'], PASSWORD_DEFAULT);
$vai_tro = $data['vai_tro'];
$trang_thai = $data['trang_thai'];

$stmt = $conn->prepare("INSERT INTO taikhoan (email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $email, $mat_khau, $vai_tro, $trang_thai);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conn->insert_id], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["success" => false, "error" => $conn->error], JSON_UNESCAPED_UNICODE);
}
?>
