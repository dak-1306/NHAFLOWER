<?php
/**
 * NHAFLOWER - Settings Management API
 * API quản lý cài đặt hệ thống cho admin
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/connection.php';

$method = $_SERVER['REQUEST_METHOD'];
$response = ['success' => false, 'message' => '', 'data' => null];

// Initialize database tables if they don't exist
initializeSettingsTables($conn);

try {
    $category = $_GET['category'] ?? $_POST['category'] ?? '';
    
    // Handle different request methods
    switch ($method) {
        case 'GET':
            if ($category) {
                getSettingsByCategory($conn, $category, $response);
            } else {
                getAllSettings($conn, $response);
            }
            break;
            
        case 'POST':
            $action = $_POST['action'] ?? '';
            if ($action === 'save' && $category) {
                saveSettingsByCategory($conn, $category, $response);
            } else {
                $response['message'] = 'Hành động không hợp lệ';
                http_response_code(400);
            }
            break;
            
        default:
            $response['message'] = 'Phương thức không được hỗ trợ';
            http_response_code(405);
            break;
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Lỗi server: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

// Initialize settings tables
function initializeSettingsTables($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS cai_dat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (setting_category),
        INDEX idx_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->query($sql);
}

// Get settings by category
function getSettingsByCategory($conn, $category, &$response) {
    try {
        $sql = "SELECT setting_key, setting_value FROM cai_dat WHERE setting_category = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $settings = [];
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        // Add default values for missing settings
        $settings = array_merge(getDefaultSettings($category), $settings);
        
        $response['success'] = true;
        $response['data'] = $settings;
        
    } catch (Exception $e) {
        $response['message'] = 'Lỗi khi tải cài đặt: ' . $e->getMessage();
        throw $e;
    }
}

// Get all settings
function getAllSettings($conn, &$response) {
    try {
        $sql = "SELECT setting_key, setting_value, setting_category FROM cai_dat";
        $result = $conn->query($sql);
        
        $settings = [];
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_category']][$row['setting_key']] = $row['setting_value'];
        }
        
        $response['success'] = true;
        $response['data'] = $settings;
        
    } catch (Exception $e) {
        $response['message'] = 'Lỗi khi tải cài đặt: ' . $e->getMessage();
        throw $e;
    }
}

// Save settings by category
function saveSettingsByCategory($conn, $category, &$response) {
    try {
        $conn->begin_transaction();
        
        // Get settings data - handle both JSON string and array formats
        $settings = [];
        
        if (isset($_POST['settings'])) {
            if (is_string($_POST['settings'])) {
                // JSON string format
                $settings = json_decode($_POST['settings'], true);
            } else if (is_array($_POST['settings'])) {
                // Array format (from FormData)
                $settings = $_POST['settings'];
            }
        }
        
        if (empty($settings)) {
            throw new Exception('Không có dữ liệu cài đặt để lưu');
        }
        
        // Save each setting
        foreach ($settings as $key => $value) {
            saveSettingWithCategory($conn, $key, $value, $category);
        }
        
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = 'Lưu cài đặt thành công';
        
    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = 'Lỗi khi lưu cài đặt: ' . $e->getMessage();
        throw $e;
    }
}

// Save setting with category
function saveSettingWithCategory($conn, $key, $value, $category) {
    $sql = "INSERT INTO cai_dat (setting_key, setting_value, setting_category) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            setting_category = VALUES(setting_category),
            updated_at = CURRENT_TIMESTAMP";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sss', $key, $value, $category);
    $stmt->execute();
}

// Get default settings by category
function getDefaultSettings($category) {
    $defaults = [        'general' => [
            'site_name' => 'NHAFLOWER',
            'site_slogan' => 'Hoa tươi - Tình yêu thương',
            'site_description' => 'Cửa hàng hoa tươi',
            'admin_email' => 'admin@nhaflower.com',
            'phone' => '',
            'address' => '',
            'logo_path' => '',
            'favicon_path' => '',
            'primary_color' => '#007bff',
            'secondary_color' => '#6c757d',
            'products_per_page' => '12',
            'show_stock' => '1',
            'show_reviews' => '1',
            'show_wishlist' => '1',
            'meta_title' => '',
            'meta_description' => '',
            'meta_keywords' => '',
            'session_timeout' => '30',
            'max_login_attempts' => '5',
            'enable_2fa' => '0',
            'force_https' => '0',
            'maintenance_mode' => '0'
        ],
        'payment' => [
            'currency' => 'VND',
            'payment_timeout' => '15',
            'cash_enabled' => '1',
            'bank_enabled' => '0',
            'momo_enabled' => '0',
            'vnpay_enabled' => '0',
            'paypal_enabled' => '0',
            'bank_name' => '',
            'account_number' => '',
            'account_name' => '',
            'momo_partner_code' => '',
            'momo_access_key' => '',
            'momo_secret_key' => '',
            'vnpay_tmn_code' => '',
            'vnpay_hash_secret' => '',
            'vnpay_url' => '',
            'paypal_client_id' => '',
            'paypal_client_secret' => '',
            'paypal_sandbox' => '1'
        ],
        'shipping' => [
            'local_rate' => '30000',
            'nationwide_rate' => '50000',
            'standard_enabled' => '1',
            'express_enabled' => '1',
            'pickup_enabled' => '1',
            'standard_time' => '2',
            'express_time' => '1',
            'express_fee' => '20000',
            'max_weight' => '5',
            'overweight_fee' => '10000',
            'processing_time' => '1',
            'cutoff_time' => '16:00',
            'weekend_delivery' => '0',
            'holiday_delivery' => '0',
            'signature_required' => '0',
            'delivery_instructions' => '',
            'return_policy' => '',
            'delivery_slots' => json_encode([
                ['day_type' => 'weekday', 'start_time' => '08:00', 'end_time' => '18:00', 'fee' => '0'],
                ['day_type' => 'weekend', 'start_time' => '09:00', 'end_time' => '17:00', 'fee' => '5000']
            ])
        ]
    ];
    
    return $defaults[$category] ?? [];
}
?>