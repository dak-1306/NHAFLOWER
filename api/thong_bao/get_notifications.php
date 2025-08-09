<?php
header('Content-Type: application/json');
require_once '../../config/connection.php';

$sql = "SELECT id_thongbao, tieu_de, noi_dung, ngay_gui FROM thongbao ORDER BY ngay_gui DESC";
$result = mysqli_query($conn, $sql);
$list = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $list[] = $row;
    }
}
echo json_encode($list);
