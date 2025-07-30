<?php
include '../config/connection.php';
    if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "SELECT * FROM SanPham WHERE id_sanpham = $id";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_assoc());
}

?>