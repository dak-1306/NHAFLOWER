<?php
include_once("../../config/connect.php");

$data = json_decode(file_get_contents("php://input"), true);

$id_kh = $data['id_khachhang'];
$ngay = $data['ngay_dat']; // format: "2025-07-30 15:30:00"
$diachi = $data['dia_chi_giao'];
$trangthai = $data['trang_thai'];

$sql = "INSERT INTO DonHang (id_khachhang, ngay_dat, dia_chi_giao, trang_thai) 
        VALUES ($id_kh, '$ngay', '$diachi', '$trangthai')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Đơn hàng đã được tạo']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
