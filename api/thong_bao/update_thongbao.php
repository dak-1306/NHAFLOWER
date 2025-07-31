<?php
include_once("../../config/connect.php");
$id = $_POST['id_thongbao'];
$tieu_de = $_POST['tieu_de'];
$noi_dung = $_POST['noi_dung'];

$sql = "UPDATE thongbao 
        SET tieu_de = '$tieu_de', noi_dung = '$noi_dung'
        WHERE id_thongbao = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
