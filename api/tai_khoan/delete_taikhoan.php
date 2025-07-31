<?php
include '../connect.php';
$id = $_GET['id'];

$conn->query("DELETE FROM taikhoan WHERE id_taikhoan = $id");
echo json_encode(["status" => "deleted"]);
?>
