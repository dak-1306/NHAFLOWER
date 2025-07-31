<?php
include_once("../../config/connect.php");
$id = $_GET['id'];

$sql = "DELETE FROM DonHang WHERE id_donhang = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['message' => 'Xóa đơn hàng thành công']);
} else {
    echo json_encode(['error' => mysqli_error($conn)]);
}
?>
