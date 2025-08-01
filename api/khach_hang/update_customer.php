<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once("../../config/connect.php");
$id = $_GET['id'] ?? 0;
$data = json_decode(file_get_contents("php://input"), true);

$ten = $conn->real_escape_string($data['ten_khachhang']);
$sdt = $conn->real_escape_string($data['so_dien_thoai']);
$diachi = $conn->real_escape_string($data['dia_chi']);
$ngay_sinh = isset($data['ngay_sinh']) && !empty($data['ngay_sinh']) ? 
    "'" . $conn->real_escape_string($data['ngay_sinh']) . "'" : "NULL";

$sql = "UPDATE KhachHang SET ten = '$ten', sdt = '$sdt', dia_chi = '$diachi', ngay_sinh = $ngay_sinh
        WHERE id_khachhang = $id";
if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
