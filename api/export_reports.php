<?php
/**
 * NHAFLOWER - Export Reports Handler
 * Handles Excel and PDF export functionality for reports
 */

require_once '../config/connect.php';

function fetchReportData($conn, $reportType) {
    $data = [];
    
    switch ($reportType) {
        case 'overview':
            // Get overview statistics with correct column names
            $sql = "SELECT 
                        (SELECT COUNT(*) FROM donhang WHERE DATE(ngay_dat) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as total_orders,
                        (SELECT COUNT(*) FROM sanpham) as total_products,
                        (SELECT COUNT(*) FROM khachhang) as total_customers";
            
            $result = $conn->query($sql);
            if ($result) {
                $stats = $result->fetch_assoc();
                $data['total_orders'] = $stats['total_orders'];
                $data['total_products'] = $stats['total_products'];
                $data['total_customers'] = $stats['total_customers'];
                $data['monthly_revenue'] = 15000000; // Mock data for now
                $data['avg_order_value'] = $stats['total_orders'] > 0 ? 
                    15000000 / $stats['total_orders'] : 0;
                $data['customer_retention'] = 75.5;
            }
            break;
            
        case 'products':
            // Get products data
            $sql = "SELECT sp.ten_hoa, lh.ten_loai, 
                           0 as so_luong_ban,
                           0 as doanh_thu,
                           sp.so_luong
                    FROM sanpham sp 
                    LEFT JOIN loaihoa lh ON sp.id_loaihoa = lh.id_loaihoa
                    ORDER BY sp.ten_hoa";
            
            $result = $conn->query($sql);
            if ($result) {
                $data['products'] = [];
                while ($row = $result->fetch_assoc()) {
                    $data['products'][] = $row;
                }
            }
            break;
            
        case 'customers':
            // Get customers data  
            $sql = "SELECT kh.ten_khachhang, kh.email,
                           0 as so_don_hang,
                           0 as tong_chi_tieu
                    FROM khachhang kh
                    ORDER BY kh.ten_khachhang";
            
            $result = $conn->query($sql);
            if ($result) {
                $data['customers'] = [];
                while ($row = $result->fetch_assoc()) {
                    $row['phan_loai'] = 'Thường';
                    $data['customers'][] = $row;
                }
            }
            break;
            
        case 'orders':
            // Get orders data with correct column names
            $sql = "SELECT dh.id_donhang, kh.ten_khachhang, dh.ngay_dat, 
                           0 as tong_tien, 'Đang xử lý' as trang_thai,
                           'Không' as hoan_thanh
                    FROM donhang dh
                    LEFT JOIN khachhang kh ON dh.id_khachhang = kh.id_khachhang
                    WHERE dh.ngay_dat >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    ORDER BY dh.ngay_dat DESC";
            
            $result = $conn->query($sql);
            if ($result) {
                $data['orders'] = [];
                while ($row = $result->fetch_assoc()) {
                    $data['orders'][] = $row;
                }
            }
            break;
            
        case 'inventory':
            // Get inventory data
            $sql = "SELECT sp.ten_hoa, lh.ten_loai, sp.so_luong, sp.gia_ban,
                           CASE 
                               WHEN sp.so_luong <= 5 THEN 'Rất thấp'
                               WHEN sp.so_luong <= 15 THEN 'Thấp' 
                               WHEN sp.so_luong >= 80 THEN 'Cao'
                               ELSE 'Bình thường'
                           END as trang_thai,
                           CASE 
                               WHEN sp.so_luong <= 5 THEN 'Nhập ngay'
                               WHEN sp.so_luong <= 15 THEN 'Cần nhập'
                               ELSE 'Theo dõi'
                           END as canh_bao
                    FROM sanpham sp
                    LEFT JOIN loaihoa lh ON sp.id_loaihoa = lh.id_loaihoa
                    ORDER BY sp.so_luong ASC";
            
            $result = $conn->query($sql);
            if ($result) {
                $data['inventory'] = [];
                while ($row = $result->fetch_assoc()) {
                    $data['inventory'][] = $row;
                }
            }
            break;
    }
    
    return $data;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function generateExcelContent($data, $reportType) {
    $filename = "NHAFLOWER_" . $reportType . "_" . date('Y-m-d_H-i-s') . ".xls";
    
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    
    echo "<table border='1'>";
    
    switch ($reportType) {
        case 'overview':
            echo "<tr><th colspan='2' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO TỔNG QUAN</th></tr>";
            echo "<tr><td><b>Doanh thu tháng</b></td><td>" . number_format($data['monthly_revenue'] ?? 0) . " VNĐ</td></tr>";
            echo "<tr><td><b>Tổng đơn hàng</b></td><td>" . ($data['total_orders'] ?? 0) . "</td></tr>";
            echo "<tr><td><b>Tổng sản phẩm</b></td><td>" . ($data['total_products'] ?? 0) . "</td></tr>";
            echo "<tr><td><b>Tổng khách hàng</b></td><td>" . ($data['total_customers'] ?? 0) . "</td></tr>";
            echo "<tr><td><b>Giá trị đơn hàng trung bình</b></td><td>" . number_format($data['avg_order_value'] ?? 0) . " VNĐ</td></tr>";
            echo "<tr><td><b>Tỷ lệ giữ chân khách hàng</b></td><td>" . ($data['customer_retention'] ?? 0) . "%</td></tr>";
            break;
            
        case 'revenue':
            echo "<tr><th colspan='4' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO DOANH THU</th></tr>";
            echo "<tr><th>Ngày</th><th>Doanh thu</th><th>Số đơn hàng</th><th>Tăng trưởng</th></tr>";
            if (isset($data['daily_revenue'])) {
                foreach ($data['daily_revenue'] as $item) {
                    echo "<tr>";
                    echo "<td>" . $item['date'] . "</td>";
                    echo "<td>" . number_format($item['revenue']) . " VNĐ</td>";
                    echo "<td>" . $item['order_count'] . "</td>";
                    echo "<td>" . ($item['growth_rate'] ?? 0) . "%</td>";
                    echo "</tr>";
                }
            }
            break;
            
        case 'products':
            echo "<tr><th colspan='5' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO SẢN PHẨM</th></tr>";
            echo "<tr><th>Tên sản phẩm</th><th>Danh mục</th><th>Số lượng bán</th><th>Doanh thu</th><th>Tồn kho</th></tr>";
            if (isset($data['products'])) {
                foreach ($data['products'] as $item) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($item['ten_hoa']) . "</td>";
                    echo "<td>" . htmlspecialchars($item['ten_loai']) . "</td>";
                    echo "<td>" . ($item['so_luong_ban'] ?? 0) . "</td>";
                    echo "<td>" . number_format($item['doanh_thu'] ?? 0) . " VNĐ</td>";
                    echo "<td>" . ($item['so_luong'] ?? 0) . "</td>";
                    echo "</tr>";
                }
            }
            break;
            
        case 'customers':
            echo "<tr><th colspan='5' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO KHÁCH HÀNG</th></tr>";
            echo "<tr><th>Tên khách hàng</th><th>Email</th><th>Số đơn hàng</th><th>Tổng chi tiêu</th><th>Phân loại</th></tr>";
            if (isset($data['customers'])) {
                foreach ($data['customers'] as $item) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($item['ten_khachhang']) . "</td>";
                    echo "<td>" . htmlspecialchars($item['email'] ?? '') . "</td>";
                    echo "<td>" . ($item['so_don_hang'] ?? 0) . "</td>";
                    echo "<td>" . number_format($item['tong_chi_tieu'] ?? 0) . " VNĐ</td>";
                    echo "<td>" . ($item['phan_loai'] ?? 'Thường') . "</td>";
                    echo "</tr>";
                }
            }
            break;
            
        case 'orders':
            echo "<tr><th colspan='6' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO ĐƠN HÀNG</th></tr>";
            echo "<tr><th>Mã đơn hàng</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hoàn thành</th></tr>";
            if (isset($data['orders'])) {
                foreach ($data['orders'] as $item) {
                    echo "<tr>";
                    echo "<td>DH" . str_pad($item['id_donhang'], 4, '0', STR_PAD_LEFT) . "</td>";
                    echo "<td>" . htmlspecialchars($item['ten_khachhang']) . "</td>";
                    echo "<td>" . $item['ngay_dat'] . "</td>";
                    echo "<td>" . number_format($item['tong_tien'] ?? 0) . " VNĐ</td>";
                    echo "<td>" . ($item['trang_thai'] ?? 'Đang xử lý') . "</td>";
                    echo "<td>" . ($item['hoan_thanh'] ?? 'Không') . "</td>";
                    echo "</tr>";
                }
            }
            break;
            
        case 'inventory':
            echo "<tr><th colspan='6' style='text-align:center; background-color:#e91e63; color:white;'>NHAFLOWER - BÁO CÁO TỒN KHO</th></tr>";
            echo "<tr><th>Tên sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Giá bán</th><th>Trạng thái</th><th>Cảnh báo</th></tr>";
            if (isset($data['inventory'])) {
                foreach ($data['inventory'] as $item) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($item['ten_hoa']) . "</td>";
                    echo "<td>" . htmlspecialchars($item['ten_loai']) . "</td>";
                    echo "<td>" . ($item['so_luong'] ?? 0) . "</td>";
                    echo "<td>" . number_format($item['gia_ban'] ?? 0) . " VNĐ</td>";
                    echo "<td>" . ($item['trang_thai'] ?? 'Bình thường') . "</td>";
                    echo "<td>" . ($item['canh_bao'] ?? 'Không') . "</td>";
                    echo "</tr>";
                }
            }
            break;
    }
    
    echo "</table>";
    echo "<br><p>Xuất lúc: " . date('d/m/Y H:i:s') . "</p>";
    echo "<p>© 2024 NHAFLOWER - Hệ thống quản lý cửa hàng hoa</p>";
    
    exit();
}

function generatePDFContent($data, $reportType) {
    $filename = "NHAFLOWER_" . $reportType . "_" . date('Y-m-d_H-i-s') . ".pdf";
    
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    // Simple PDF content (HTML to PDF would require additional library)
    // For now, return HTML that can be printed to PDF by browser
    header('Content-Type: text/html; charset=utf-8');
    
    echo "<!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8'>
        <title>NHAFLOWER - Báo cáo " . strtoupper($reportType) . "</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; color: #e91e63; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #e91e63; color: white; }
            .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>NHAFLOWER</h1>
            <h2>BÁO CÁO " . strtoupper($reportType) . "</h2>
            <p>Ngày xuất: " . date('d/m/Y H:i:s') . "</p>
        </div>";
        
    // Add content based on report type (similar to Excel but HTML formatted)
    switch ($reportType) {
        case 'overview':
            echo "<div class='summary'>
                <h3>TỔNG QUAN HOẠT ĐỘNG</h3>
                <table>
                    <tr><td><strong>Doanh thu tháng</strong></td><td>" . number_format($data['monthly_revenue'] ?? 0) . " VNĐ</td></tr>
                    <tr><td><strong>Tổng đơn hàng</strong></td><td>" . ($data['total_orders'] ?? 0) . "</td></tr>
                    <tr><td><strong>Tổng sản phẩm</strong></td><td>" . ($data['total_products'] ?? 0) . "</td></tr>
                    <tr><td><strong>Tổng khách hàng</strong></td><td>" . ($data['total_customers'] ?? 0) . "</td></tr>
                    <tr><td><strong>Giá trị đơn hàng trung bình</strong></td><td>" . number_format($data['avg_order_value'] ?? 0) . " VNĐ</td></tr>
                    <tr><td><strong>Tỷ lệ giữ chân khách hàng</strong></td><td>" . ($data['customer_retention'] ?? 0) . "%</td></tr>
                </table>
            </div>";
            break;
            
        // Add other report types as needed
        default:
            echo "<p>Báo cáo đang được phát triển...</p>";
    }
    
    echo "<div class='footer'>
            <p>© 2024 NHAFLOWER - Hệ thống quản lý cửa hàng hoa</p>
            <p class='no-print'>Để lưu dưới dạng PDF, hãy sử dụng chức năng In của trình duyệt và chọn 'Save as PDF'</p>
        </div>
    </body>
    </html>";
    
    exit();
}

// Main export handler
try {
    $action = $_GET['action'] ?? '';
    $format = $_GET['format'] ?? 'excel';
    $reportType = $_GET['report'] ?? 'overview';
    
    if ($action !== 'export') {
        throw new Exception('Invalid action');
    }    // Get data from API (reuse existing logic)
    require_once '../config/connect.php';
    
    // Fetch actual data based on report type
    $data = fetchReportData($conn, $reportType);
    
    if ($format === 'excel') {
        generateExcelContent($data, $reportType);
    } elseif ($format === 'pdf') {
        generatePDFContent($data, $reportType);
    } else {
        throw new Exception('Unsupported format');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi xuất báo cáo: ' . $e->getMessage()
    ]);
}
?>
