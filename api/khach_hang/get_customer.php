<?php
include '../config/connection.php';
$id = $_GET['id'] ?? 0;
$sql = "SELECT * FROM KhachHang WHERE id_khachhang = $id";
$result = $conn->query($sql);

echo json_encode($result->fetch_assoc());
?>
