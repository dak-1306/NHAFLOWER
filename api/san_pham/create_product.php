<?php
include '../config/connection.php';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO SanPham (ten_hoa, gia, mo_ta, so_luong, id_loaihoa, id_khuyenmai, hinh_anh)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdsiiis", $data['ten_hoa'], $data['gia'], $data['mo_ta'], $data['so_luong'], $data['id_loaihoa'], $data['id_khuyenmai'], $data['hinh_anh']);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}

?>