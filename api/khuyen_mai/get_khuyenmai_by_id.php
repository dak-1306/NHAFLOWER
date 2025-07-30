<?php
include '../config.php';
$id = $_GET['id'];

$sql = "SELECT * FROM KhuyenMai WHERE id_khuyenmai = $id";
$result = mysqli_query($conn, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode($row);
} else {
    echo json_encode(['message' => 'Không tìm thấy khuyến mãi']);
}
?>
