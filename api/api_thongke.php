<?php
include "db_connect.php";
header('Content-Type: application/json');

// Xác định loại thống kê thông qua GET
$type = $_GET['type'] ?? '';

switch ($type) {
    case 'doanh_thu_hom_nay':
        $sql = "SELECT 
                    SUM(ct.so_luong * ct.don_gia) AS tong_doanh_thu,
                    COUNT(DISTINCT dh.id_donhang) AS tong_don_hang
                FROM donhang dh
                JOIN chitiet_donhang ct ON dh.id_donhang = ct.id_donhang
                WHERE DATE(dh.ngay_dat) = CURDATE()
                  AND dh.trang_thai = 'hoan_tat'";
        break;

    case 'doanh_thu_7_ngay':
        $sql = "SELECT 
                    DATE(dh.ngay_dat) AS ngay,
                    SUM(ct.so_luong * ct.don_gia) AS doanh_thu
                FROM donhang dh
                JOIN chitiet_donhang ct ON dh.id_donhang = ct.id_donhang
                WHERE dh.trang_thai = 'hoan_tat'
                  AND dh.ngay_dat >= CURDATE() - INTERVAL 7 DAY
                GROUP BY DATE(dh.ngay_dat)
                ORDER BY ngay ASC";
        break;

    case 'sanpham_ban_chay':
        $sql = "SELECT 
                    ct.id_sanpham,
                    sp.ten_sanpham,
                    SUM(ct.so_luong) AS tong_so_luong_ban,
                    SUM(ct.so_luong * ct.don_gia) AS tong_doanh_thu
                FROM chitiet_donhang ct
                JOIN donhang dh ON ct.id_donhang = dh.id_donhang
                JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
                WHERE dh.trang_thai = 'hoan_tat'
                GROUP BY ct.id_sanpham
                ORDER BY tong_so_luong_ban DESC
                LIMIT 5";
        break;

    case 'so_don_dang_giao':
        $sql = "SELECT COUNT(*) AS so_don_dang_giao
                FROM donhang
                WHERE trang_thai = 'dang_giao'";
        break;

    case 'sanpham_con_lai':
        $sql = "SELECT SUM(so_luong) AS tong_so_luong_con_lai
                FROM sanpham";
        break;

    default:
        echo json_encode(["error" => "Loại thống kê không hợp lệ."]);
        exit;
}

// Thực thi truy vấn
$result = mysqli_query($conn, $sql);
$data = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["error" => mysqli_error($conn)]);
}
?>
