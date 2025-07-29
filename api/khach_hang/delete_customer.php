<?php
include '../config/connection.php';
$id = $_GET['id'] ?? 0;

$sql = "DELETE FROM KhachHang WHERE id_khachhang = $id";
if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
