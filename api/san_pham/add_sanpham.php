<?php
include("connect.php");

$ten_hoa = $_POST['ten_hoa'];
$gia = $_POST['gia'];
$mo_ta = $_POST['mo_ta'];
$so_luong = $_POST['so_luong'];
$id_loaihoa = $_POST['id_loaihoa'];
$id_khuyenmai = $_POST['id_khuyenmai'];
$hinh_anh = $_POST['hinh_anh']; // Chỉ lưu tên file, upload xử lý riêng

$sql = "INSERT INTO sanpham (ten_hoa, gia, mo_ta, so_luong, id_loaihoa, id_khuyenmai, hinh_anh)
        VALUES ('$ten_hoa', '$gia', '$mo_ta', '$so_luong', '$id_loaihoa', '$id_khuyenmai', '$hinh_anh')";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
