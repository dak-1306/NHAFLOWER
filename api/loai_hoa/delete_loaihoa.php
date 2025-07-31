<?php
include_once("../../config/connect.php");
$id = $_POST['id_loaihoa'];

$sql = "DELETE FROM loaihoa WHERE id_loaihoa = $id";
echo mysqli_query($conn, $sql) ? "success" : "error";
?>
