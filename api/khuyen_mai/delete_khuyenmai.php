<?php
include_once("../../config/connect.php");
$id = $_GET['id'];

$sql = "DELETE FROM KhuyenMai WHERE id_khuyenmai = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Xóa khuyến mãi thành công']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
