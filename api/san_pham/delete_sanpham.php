<?php
include_once("../../config/connect.php");
$id = $_POST['id_sanpham'];
$sql = "DELETE FROM sanpham WHERE id_sanpham = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
