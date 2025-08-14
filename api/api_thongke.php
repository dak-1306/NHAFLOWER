<?php
/**
 * NHAFLOWER - Statistics API
 * API thống kê và báo cáo cho admin dashboard
 */

// Clean output buffer and disable error display
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// Initialize response
$response = ['success' => false, 'message' => '', 'data' => null];

try {
    // Clear any output that might have been generated
    ob_clean();
    
    // Include database connection
    include_once __DIR__ . '/config/connection.php';
    
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'overview':
            getOverviewStats($conn, $response);
            break;
        case 'revenue_chart':
            getRevenueChartData($conn, $response);
            break;
        case 'category_stats':
            getCategoryStats($conn, $response);
            break;
        case 'top_products':
            getTopProducts($conn, $response);
            break;
        case 'order_status_stats':
            getOrderStatusStats($conn, $response);
            break;
        case 'revenue_report':
            getRevenueReport($conn, $response);
            break;
        case 'top_customers':
            getTopCustomers($conn, $response);
            break;
        default:
            // Legacy support for old API calls
            handleLegacyRequests($conn, $response);
            break;
    }
} catch (Exception $e) {
    // Clean any previous output
    ob_clean();
    
    $response['success'] = false;
    $response['message'] = 'Lỗi server: ' . $e->getMessage();
    $response['error_code'] = $e->getCode();
    http_response_code(500);
    
    // Log error for debugging
    error_log("NHAFLOWER API Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
} finally {
    // Ensure clean output
    ob_end_clean();
    
    // Output JSON response
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

/**
 * Get overview statistics
 */
function getOverviewStats($conn, &$response) {
    try {
        $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : date('Y-m-01'); // First day of current month
        $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : date('Y-m-d'); // Today
        
        // Validate dates only if they are not empty
        if (!empty($_GET['date_from']) && !validateDate($dateFrom)) {
            throw new Exception('Định dạng ngày bắt đầu không hợp lệ');
        }
        
        if (!empty($_GET['date_to']) && !validateDate($dateTo)) {
            throw new Exception('Định dạng ngày kết thúc không hợp lệ');
        }
        
        if ($dateFrom > $dateTo) {
            throw new Exception('Ngày bắt đầu không thể sau ngày kết thúc');
        }
        
        $stats = [];
        
        // Monthly revenue
        $sql = "SELECT COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS monthly_revenue
                FROM donhang dh
                JOIN chitietdonhang ct ON dh.id_donhang = ct.id_donhang
                WHERE DATE(dh.ngay_dat) BETWEEN ? AND ?
                  AND dh.trang_thai = 'hoan_tat'";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
        }
        
        $stmt->bind_param('ss', $dateFrom, $dateTo);
        if (!$stmt->execute()) {
            throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $stats['monthly_revenue'] = floatval($result->fetch_assoc()['monthly_revenue'] ?? 0);
        
        // Total orders
        $sql = "SELECT COUNT(*) AS total_orders
                FROM donhang
                WHERE DATE(ngay_dat) BETWEEN ? AND ?";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
        }
        
        $stmt->bind_param('ss', $dateFrom, $dateTo);
        if (!$stmt->execute()) {
            throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $stats['total_orders'] = intval($result->fetch_assoc()['total_orders'] ?? 0);
          // Total products (no trang_thai field in sanpham table)
        $sql = "SELECT COUNT(*) AS total_products FROM sanpham";
        $result = $conn->query($sql);
        if (!$result) {
            throw new Exception('Lỗi truy vấn sản phẩm: ' . $conn->error);
        }
        $stats['total_products'] = intval($result->fetch_assoc()['total_products'] ?? 0);
        
        // Total customers
        $sql = "SELECT COUNT(*) AS total_customers FROM khachhang";
        $result = $conn->query($sql);
        if (!$result) {
            throw new Exception('Lỗi truy vấn khách hàng: ' . $conn->error);
        }
        $stats['total_customers'] = intval($result->fetch_assoc()['total_customers'] ?? 0);
        
        // Enhanced calculations
        // Conversion rate (assuming 1000 visitors per month)
        $visitors = 1000; // This should come from analytics
        $stats['conversion_rate'] = $stats['total_orders'] > 0 ? 
            round(($stats['total_orders'] / $visitors) * 100, 2) : 0;
        
        // Average order value
        $stats['avg_order_value'] = $stats['total_orders'] > 0 ? 
            round($stats['monthly_revenue'] / $stats['total_orders'], 0) : 0;
          // Customer retention (calculated from actual data)
        $retentionSql = "SELECT COUNT(DISTINCT ret.id_khachhang) as returning_customers, COUNT(DISTINCT ac.id_khachhang) as total_customers FROM (SELECT DISTINCT id_khachhang FROM donhang WHERE DATE(ngay_dat) BETWEEN ? AND ?) ac LEFT JOIN (SELECT DISTINCT id_khachhang FROM donhang WHERE DATE(ngay_dat) < ?) ret ON ac.id_khachhang = ret.id_khachhang";
        
        $stmt = $conn->prepare($retentionSql);
        if ($stmt) {
            $stmt->bind_param('sss', $dateFrom, $dateTo, $dateFrom);
            if ($stmt->execute()) {
                $retentionResult = $stmt->get_result()->fetch_assoc();
                $stats['customer_retention'] = $retentionResult['total_customers'] > 0 ? 
                    round(($retentionResult['returning_customers'] / $retentionResult['total_customers']) * 100, 1) : 0;
            } else {
                $stats['customer_retention'] = 0;
            }
        } else {
            $stats['customer_retention'] = 0;
        }
        
        // Inventory turnover (simplified)
        $stats['inventory_turnover'] = 2.5; // This needs complex calculation with inventory data
        
        $response['success'] = true;
        $response['data'] = $stats;
        $response['message'] = 'Lấy thống kê tổng quan thành công';
        $response['date_range'] = ['from' => $dateFrom, 'to' => $dateTo];
        
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = 'Lỗi lấy thống kê tổng quan: ' . $e->getMessage();
        throw $e; // Re-throw to be caught by main handler
    }
}

/**
 * Get revenue chart data with enhanced error handling
 */
function getRevenueChartData($conn, &$response) {
    try {
        $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : date('Y-m-01');
        $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : date('Y-m-d');
        
        // Validate dates only if they are not empty
        if (!empty($_GET['date_from']) && !validateDate($dateFrom)) {
            throw new Exception('Định dạng ngày bắt đầu không hợp lệ');
        }
        
        if (!empty($_GET['date_to']) && !validateDate($dateTo)) {
            throw new Exception('Định dạng ngày kết thúc không hợp lệ');
        }
        
        $sql = "SELECT 
                    DATE(dh.ngay_dat) AS date,
                    COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS revenue,
                    COUNT(DISTINCT dh.id_donhang) AS order_count
                FROM donhang dh
                LEFT JOIN chitietdonhang ct ON dh.id_donhang = ct.id_donhang
                WHERE DATE(dh.ngay_dat) BETWEEN ? AND ?
                  AND dh.trang_thai = 'hoan_tat'
                GROUP BY DATE(dh.ngay_dat)
                ORDER BY date ASC";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
        }
        
        $stmt->bind_param('ss', $dateFrom, $dateTo);
        if (!$stmt->execute()) {
            throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $data = [];
        
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                'date' => $row['date'],
                'revenue' => floatval($row['revenue']),
                'order_count' => intval($row['order_count'])
            ];
        }
        
        // Fill missing dates with zero values
        $data = fillMissingDates($data, $dateFrom, $dateTo);
        
        $response['success'] = true;
        $response['data'] = $data;
        $response['message'] = 'Lấy dữ liệu biểu đồ doanh thu thành công';
        $response['total_records'] = count($data);
        
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = 'Lỗi lấy dữ liệu biểu đồ doanh thu: ' . $e->getMessage();
        throw $e;
    }
}

/**
 * Get category statistics
 */
function getCategoryStats($conn, &$response) {
    $sql = "SELECT 
                lh.ten_loai AS category_name,
                COUNT(sp.id_sanpham) AS product_count
            FROM loaihoa lh
            LEFT JOIN sanpham sp ON lh.id_loaihoa = sp.id_loaihoa
            GROUP BY lh.id_loaihoa, lh.ten_loai
            ORDER BY product_count DESC";
    
    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Lỗi truy vấn thống kê danh mục: ' . $conn->error);
    }
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy thống kê danh mục thành công';
}

/**
 * Get top selling products
 */
function getTopProducts($conn, &$response) {
    $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : date('Y-m-01');
    $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : date('Y-m-d');
    $limit = intval($_GET['limit'] ?? 5);
    
    $sql = "SELECT 
                sp.ten_hoa AS product_name,
                SUM(ct.so_luong) AS quantity_sold,
                SUM(ct.so_luong * ct.don_gia) AS total_revenue
            FROM chitietdonhang ct
            JOIN donhang dh ON ct.id_donhang = dh.id_donhang
            JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
            WHERE DATE(dh.ngay_dat) BETWEEN ? AND ?
              AND dh.trang_thai = 'hoan_tat'
            GROUP BY ct.id_sanpham, sp.ten_hoa
            ORDER BY quantity_sold DESC
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
    }
    
    $stmt->bind_param('ssi', $dateFrom, $dateTo, $limit);
    if (!$stmt->execute()) {
        throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'product_name' => $row['product_name'],
            'quantity_sold' => intval($row['quantity_sold']),
            'total_revenue' => floatval($row['total_revenue'])
        ];
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy top sản phẩm bán chạy thành công';
}

/**
 * Get order status statistics
 */
function getOrderStatusStats($conn, &$response) {
    $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : date('Y-m-01');
    $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : date('Y-m-d');
    
    $sql = "SELECT 
                trang_thai,
                COUNT(*) AS count
            FROM donhang
            WHERE DATE(ngay_dat) BETWEEN ? AND ?
            GROUP BY trang_thai";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
    }
    
    $stmt->bind_param('ss', $dateFrom, $dateTo);
    if (!$stmt->execute()) {
        throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $data = [
        'pending' => 0,
        'shipping' => 0,
        'completed' => 0
    ];
    
    while ($row = $result->fetch_assoc()) {
        switch ($row['trang_thai']) {
            case 'cho':
                $data['pending'] = intval($row['count']);
                break;
            case 'dang_giao':
                $data['shipping'] = intval($row['count']);
                break;
            case 'hoan_tat':
                $data['completed'] = intval($row['count']);
                break;
            default:
                // Handle empty or unknown status
                $data['pending'] += intval($row['count']);
                break;
        }
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy thống kê trạng thái đơn hàng thành công';
}

/**
 * Get revenue report
 */
function getRevenueReport($conn, &$response) {
    try {
        $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : date('Y-m-01');
        $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : date('Y-m-d');
        
        // Validate dates only if they are not empty
        if (!empty($_GET['date_from']) && !validateDate($dateFrom)) {
            throw new Exception('Định dạng ngày bắt đầu không hợp lệ');
        }
        
        if (!empty($_GET['date_to']) && !validateDate($dateTo)) {
            throw new Exception('Định dạng ngày kết thúc không hợp lệ');
        }
    
    $sql = "SELECT 
                DATE(dh.ngay_dat) AS date,
                COUNT(DISTINCT dh.id_donhang) AS order_count,
                COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS revenue,
                COALESCE(SUM(ct.so_luong * ct.don_gia * 0.3), 0) AS profit,
                ROUND(COUNT(DISTINCT dh.id_donhang) / 100 * 100, 2) AS conversion_rate
            FROM donhang dh
            LEFT JOIN chitietdonhang ct ON dh.id_donhang = ct.id_donhang
            WHERE DATE(dh.ngay_dat) BETWEEN ? AND ?
              AND dh.trang_thai = 'hoan_tat'
            GROUP BY DATE(dh.ngay_dat)
            ORDER BY date DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
    }
    
    $stmt->bind_param('ss', $dateFrom, $dateTo);
    if (!$stmt->execute()) {
        throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'date' => $row['date'],
            'order_count' => intval($row['order_count']),
            'revenue' => floatval($row['revenue']),
            'profit' => floatval($row['profit']),
            'conversion_rate' => floatval($row['conversion_rate'])
        ];
    }
      $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy báo cáo doanh thu thành công';
    
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
        $response['data'] = [];
    }
}

/**
 * Get top customers
 */
function getTopCustomers($conn, &$response) {
    $limit = intval($_GET['limit'] ?? 5);
    
    $sql = "SELECT 
                kh.ten AS customer_name,
                COUNT(dh.id_donhang) AS order_count,
                COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS total_spent
            FROM khachhang kh
            JOIN donhang dh ON kh.id_khachhang = dh.id_khachhang
            LEFT JOIN chitietdonhang ct ON dh.id_donhang = ct.id_donhang
            WHERE dh.trang_thai = 'hoan_tat'
            GROUP BY kh.id_khachhang, kh.ten
            ORDER BY total_spent DESC
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Lỗi chuẩn bị câu lệnh SQL: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $limit);
    if (!$stmt->execute()) {
        throw new Exception('Lỗi thực hiện truy vấn: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'customer_name' => $row['customer_name'],
            'order_count' => intval($row['order_count']),
            'total_spent' => floatval($row['total_spent'])
        ];
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy top khách hàng thành công';
}

/**
 * Handle legacy API requests for backward compatibility
 */
function handleLegacyRequests($conn, &$response) {
    $type = $_GET['type'] ?? '';
    
    switch ($type) {
        case 'doanh_thu_hom_nay':
            $sql = "SELECT 
                        COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS tong_doanh_thu,
                        COUNT(DISTINCT dh.id_donhang) AS tong_don_hang
                    FROM donhang dh
                    LEFT JOIN chitietdonhang ct ON dh.id_donhang = ct.id_donhang
                    WHERE DATE(dh.ngay_dat) = CURDATE()
                      AND dh.trang_thai = 'hoan_tat'";
            
            $result = $conn->query($sql);
            if (!$result) {
                throw new Exception('Lỗi truy vấn doanh thu hôm nay: ' . $conn->error);
            }
            
            $data = $result->fetch_assoc();
            // Convert to proper data types
            $data['tong_doanh_thu'] = floatval($data['tong_doanh_thu']);
            $data['tong_don_hang'] = intval($data['tong_don_hang']);
            break;
            
        case 'sanpham_ban_chay':
            $sql = "SELECT 
                        sp.ten_hoa,
                        SUM(ct.so_luong) AS tong_so_luong_ban,
                        SUM(ct.so_luong * ct.don_gia) AS tong_doanh_thu
                    FROM chitietdonhang ct
                    JOIN donhang dh ON ct.id_donhang = dh.id_donhang
                    JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
                    WHERE dh.trang_thai = 'hoan_tat'
                    GROUP BY ct.id_sanpham, sp.ten_hoa
                    ORDER BY tong_so_luong_ban DESC
                    LIMIT 5";
            
            $result = $conn->query($sql);
            if (!$result) {
                throw new Exception('Lỗi truy vấn sản phẩm bán chạy: ' . $conn->error);
            }
            
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = [
                    'ten_hoa' => $row['ten_hoa'],
                    'tong_so_luong_ban' => intval($row['tong_so_luong_ban']),
                    'tong_doanh_thu' => floatval($row['tong_doanh_thu'])
                ];
            }
            break;
            
        default:
            $response['success'] = false;
            $response['message'] = 'Loại thống kê không hợp lệ';
            return;
    }
    
    $response['success'] = true;
    $response['data'] = $data;
    $response['message'] = 'Lấy dữ liệu thành công';
}

/**
 * Utility functions
 */

/**
 * Validate date format
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

/**
 * Fill missing dates with zero values
 */
function fillMissingDates($data, $dateFrom, $dateTo) {
    $result = [];
    $start = new DateTime($dateFrom);
    $end = new DateTime($dateTo);
    $interval = DateInterval::createFromDateString('1 day');
    $period = new DatePeriod($start, $interval, $end->add($interval));
    
    // Create associative array from existing data
    $dataMap = [];
    foreach ($data as $item) {
        $dataMap[$item['date']] = $item;
    }
    
    // Fill missing dates
    foreach ($period as $date) {
        $dateStr = $date->format('Y-m-d');
        if (isset($dataMap[$dateStr])) {
            $result[] = $dataMap[$dateStr];
        } else {
            $result[] = [
                'date' => $dateStr,
                'revenue' => 0,
                'order_count' => 0
            ];
        }
    }
    
    return $result;
}
?>
