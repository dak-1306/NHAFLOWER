<?php
include_once("../../config/connect.php");
$id = $_POST['id_loaihoa'];
$ten_loai = $_POST['ten_loai'];

$sql = "UPDATE loaihoa SET ten_loai = '$ten_loai' WHERE id_loaihoa = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
