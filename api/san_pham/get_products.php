<?php
include '../config/connection.php';
    $sql = "SELECT * FROM SanPham";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);

?>