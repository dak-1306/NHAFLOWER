<?php
include_once("../../config/connect.php");
$id = $_POST['id_thongbao'];
$sql = "DELETE FROM thongbao WHERE id_thongbao = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
