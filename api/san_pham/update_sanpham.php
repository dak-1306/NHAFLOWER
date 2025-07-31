<?php
include_once("../../config/connect.php");

$id = $_POST['id_sanpham'];
$ten_hoa = $_POST['ten_hoa'];
$gia = $_POST['gia'];
$mo_ta = $_POST['mo_ta'];
$so_luong = $_POST['so_luong'];
$id_loaihoa = $_POST['id_loaihoa'];
$id_khuyenmai = $_POST['id_khuyenmai'];
$hinh_anh = $_POST['hinh_anh'];

$sql = "UPDATE sanpham SET 
            ten_hoa = '$ten_hoa', 
            gia = '$gia',
            mo_ta = '$mo_ta',
            so_luong = '$so_luong',
            id_loaihoa = '$id_loaihoa',
            id_khuyenmai = '$id_khuyenmai',
            hinh_anh = '$hinh_anh'
        WHERE id_sanpham = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
