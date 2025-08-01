<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

include_once("../../config/connect.php");
$id = $_GET['id'] ?? 0;
$sql = "SELECT * FROM KhachHang WHERE id_khachhang = $id";
$result = $conn->query($sql);

echo json_encode($result->fetch_assoc());
?>
