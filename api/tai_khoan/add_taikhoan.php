<?php
include '../connect.php';
$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$mat_khau = password_hash($data->mat_khau, PASSWORD_DEFAULT);
$vai_tro = $data->vai_tro;
$trang_thai = $data->trang_thai;

$stmt = $conn->prepare("INSERT INTO taikhoan (email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $email, $mat_khau, $vai_tro, $trang_thai);
$stmt->execute();

echo json_encode(["status" => "success"]);
?>
