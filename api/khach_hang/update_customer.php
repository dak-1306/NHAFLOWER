<?php
include_once("../../config/connect.php");
$id = $_GET['id'] ?? 0;
$data = json_decode(file_get_contents("php://input"), true);

$ten = $data['ten_khachhang'];
$sdt = $data['so_dien_thoai'];
$diachi = $data['dia_chi'];

$sql = "UPDATE KhachHang SET ten_khachhang = '$ten', so_dien_thoai = '$sdt', dia_chi = '$diachi'
        WHERE id_khachhang = $id";
if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
