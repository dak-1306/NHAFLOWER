<?php
include("connect.php");
$id_admin = $_POST['id_admin'];
$tieu_de = $_POST['tieu_de'];
$noi_dung = $_POST['noi_dung'];
$ngay_gui = date("Y-m-d H:i:s");

$sql = "INSERT INTO thongbao (id_admin, tieu_de, noi_dung, ngay_gui) 
        VALUES ('$id_admin', '$tieu_de', '$noi_dung', '$ngay_gui')";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
