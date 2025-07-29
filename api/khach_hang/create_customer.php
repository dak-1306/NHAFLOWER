<?php
include '../config/connection.php';
$data = json_decode(file_get_contents("php://input"), true);

$ten = $data['ten_khachhang'];
$sdt = $data['so_dien_thoai'];
$diachi = $data['dia_chi'];
$idtk = $data['id_taikhoan'];

$sql = "INSERT INTO KhachHang (ten_khachhang, so_dien_thoai, dia_chi, ngay_tao, id_taikhoan)
        VALUES ('$ten', '$sdt', '$diachi', CURDATE(), $idtk)";
if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
