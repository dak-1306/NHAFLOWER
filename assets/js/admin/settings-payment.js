/**
 * NHAFLOWER - Payment Settings JavaScript
 * Quản lý cài đặt thanh toán cho admin panel
 */

$(document).ready(function () {
    console.log("Payment Settings page initializing...");
    loadPaymentSettings();
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Payment method card clicks
    $('.payment-method-card').on('click', function() {
        const method = $(this).data('method');
        showPaymentConfig(method);
        
        // Update card states
        $('.payment-method-card').removeClass('active');
        $(this).addClass('active');
    });
    
    // Checkbox changes
    $('input[type="checkbox"][id^="enable"]').on('change', function() {
        updatePaymentMethodStatus(this);
    });
    
    // Form validation
    $('input[required]').on('blur', function() {
        validateField(this);
    });
    
    // Auto-save
    let autoSaveTimer;
    $('input, select, textarea').on('input', function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            autoSavePaymentSettings();
        }, 3000);
    });
}

/**
 * Show payment configuration section
 */
function showPaymentConfig(method) {
    // Hide all config sections
    $('.config-section').removeClass('active');
    
    // Show relevant config section
    const configId = method + 'Config';
    $('#' + configId).addClass('active');
    
    console.log('Showing config for:', method);
}

/**
 * Load payment settings
 */
function loadPaymentSettings() {
    $.ajax({
        url: '../api/settings.php',
        method: 'GET',
        data: { action: 'get_payment' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                populatePaymentForm(response.data);
            } else {
                console.error('Error loading payment settings:', response.message);
                loadDefaultPaymentSettings();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading payment settings:', error);
            loadDefaultPaymentSettings();
        }
    });
}

/**
 * Populate payment form
 */
function populatePaymentForm(data) {
    // Enable/disable payment methods
    if (data.methods) {
        $('#enableCash').prop('checked', data.methods.cash !== false);
        $('#enableBank').prop('checked', data.methods.bank !== false);
        $('#enableMomo').prop('checked', data.methods.momo === true);
        $('#enableVNPay').prop('checked', data.methods.vnpay === true);
        $('#enablePaypal').prop('checked', data.methods.paypal === true);
    }
    
    // Bank settings
    if (data.bank) {
        $('#bankName').val(data.bank.name || '');
        $('#bankAccount').val(data.bank.account || '');
        $('#bankOwner').val(data.bank.owner || '');
        $('#bankBranch').val(data.bank.branch || '');
        $('#bankNote').val(data.bank.note || '');
    }
    
    // MoMo settings
    if (data.momo) {
        $('#momoPartnerCode').val(data.momo.partner_code || '');
        $('#momoAccessKey').val(data.momo.access_key || '');
        $('#momoSecretKey').val(data.momo.secret_key || '');
        $('#momoSandbox').prop('checked', data.momo.sandbox !== false);
    }
    
    // VNPay settings
    if (data.vnpay) {
        $('#vnpayTmnCode').val(data.vnpay.tmn_code || '');
        $('#vnpayHashSecret').val(data.vnpay.hash_secret || '');
        $('#vnpayUrl').val(data.vnpay.url || '');
        $('#vnpaySandbox').prop('checked', data.vnpay.sandbox !== false);
    }
    
    // PayPal settings
    if (data.paypal) {
        $('#paypalClientId').val(data.paypal.client_id || '');
        $('#paypalClientSecret').val(data.paypal.client_secret || '');
        $('#paypalWebhook').val(data.paypal.webhook || '');
        $('#paypalSandbox').prop('checked', data.paypal.sandbox !== false);
    }
    
    // General settings
    if (data.general) {
        $('#defaultCurrency').val(data.general.currency || 'VND');
        $('#transactionFee').val(data.general.transaction_fee || 0);
        $('#paymentTimeout').val(data.general.timeout || 15);
        $('#autoConfirmPayment').prop('checked', data.general.auto_confirm !== false);
        $('#sendPaymentEmail').prop('checked', data.general.send_email !== false);
    }
    
    // Update status badges
    updateStatusBadges();
}

/**
 * Load default payment settings
 */
function loadDefaultPaymentSettings() {
    const defaults = {
        methods: {
            cash: true,
            bank: true,
            momo: false,
            vnpay: false,
            paypal: false
        },
        bank: {
            name: 'Techcombank',
            account: '19035559988888',
            owner: 'NGUYEN VAN A',
            branch: 'Quận 1, TP.HCM',
            note: 'Thanh toan don hang [ORDER_ID] tai NHAFLOWER'
        },
        general: {
            currency: 'VND',
            transaction_fee: 0,
            timeout: 15,
            auto_confirm: true,
            send_email: true
        }
    };
    
    populatePaymentForm(defaults);
}

/**
 * Update payment method status
 */
function updatePaymentMethodStatus(checkbox) {
    const methodId = $(checkbox).attr('id');
    const isEnabled = $(checkbox).is(':checked');
    const card = $(checkbox).closest('.payment-method-card');
    const statusBadge = card.find('.status-badge');
    
    if (isEnabled) {
        statusBadge.removeClass('status-inactive').addClass('status-active');
        statusBadge.text('Hoạt động');
    } else {
        statusBadge.removeClass('status-active').addClass('status-inactive');
        statusBadge.text('Tạm dừng');
    }
    
    // Special handling for methods that need configuration
    if (['enableMomo', 'enableVNPay', 'enablePaypal'].includes(methodId)) {
        const method = methodId.replace('enable', '').toLowerCase();
        if (isEnabled && !isMethodConfigured(method)) {
            statusBadge.removeClass('status-active').addClass('status-inactive');
            statusBadge.text('Chưa cấu hình');
            
            Swal.fire({
                title: 'Cần cấu hình',
                text: 'Phương thức thanh toán này cần được cấu hình trước khi sử dụng.',
                icon: 'warning',
                confirmButtonColor: '#e91e63'
            });
        }
    }
}

/**
 * Check if payment method is configured
 */
function isMethodConfigured(method) {
    switch(method) {
        case 'momo':
            return $('#momoPartnerCode').val() && $('#momoAccessKey').val() && $('#momoSecretKey').val();
        case 'vnpay':
            return $('#vnpayTmnCode').val() && $('#vnpayHashSecret').val();
        case 'paypal':
            return $('#paypalClientId').val() && $('#paypalClientSecret').val();
        default:
            return true;
    }
}

/**
 * Update status badges
 */
function updateStatusBadges() {
    // Check each payment method
    const methods = ['cash', 'bank', 'momo', 'vnpay', 'paypal'];
    
    methods.forEach(method => {
        const checkbox = $('#enable' + method.charAt(0).toUpperCase() + method.slice(1));
        const card = $(`.payment-method-card[data-method="${method}"]`);
        const statusBadge = card.find('.status-badge');
        
        if (checkbox.is(':checked')) {
            if (method === 'cash' || method === 'bank' || isMethodConfigured(method)) {
                statusBadge.removeClass('status-inactive').addClass('status-active');
                statusBadge.text('Hoạt động');
            } else {
                statusBadge.removeClass('status-active').addClass('status-inactive');
                statusBadge.text('Chưa cấu hình');
            }
        } else {
            statusBadge.removeClass('status-active').addClass('status-inactive');
            statusBadge.text('Tạm dừng');
        }
    });
}

/**
 * Save payment settings
 */
function savePaymentSettings() {
    if (!validatePaymentForm()) {
        return;
    }
    
    const formData = collectPaymentFormData();
    
    Swal.fire({
        title: 'Lưu cài đặt thanh toán',
        text: 'Bạn có chắc chắn muốn lưu tất cả cài đặt thanh toán?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            performPaymentSave(formData);
        }
    });
}

/**
 * Auto-save payment settings
 */
function autoSavePaymentSettings() {
    const formData = collectPaymentFormData();
    
    $.ajax({
        url: '../api/settings.php',
        method: 'POST',
        data: {
            action: 'save_payment',
            settings: JSON.stringify(formData)
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                console.log('Payment settings auto-saved');
            } else {
                console.error('Auto-save failed:', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Auto-save error:', error);
        }
    });
}

/**
 * Collect payment form data
 */
function collectPaymentFormData() {
    return {
        methods: {
            cash: $('#enableCash').is(':checked'),
            bank: $('#enableBank').is(':checked'),
            momo: $('#enableMomo').is(':checked'),
            vnpay: $('#enableVNPay').is(':checked'),
            paypal: $('#enablePaypal').is(':checked')
        },
        bank: {
            name: $('#bankName').val(),
            account: $('#bankAccount').val(),
            owner: $('#bankOwner').val(),
            branch: $('#bankBranch').val(),
            note: $('#bankNote').val()
        },
        momo: {
            partner_code: $('#momoPartnerCode').val(),
            access_key: $('#momoAccessKey').val(),
            secret_key: $('#momoSecretKey').val(),
            sandbox: $('#momoSandbox').is(':checked')
        },
        vnpay: {
            tmn_code: $('#vnpayTmnCode').val(),
            hash_secret: $('#vnpayHashSecret').val(),
            url: $('#vnpayUrl').val(),
            sandbox: $('#vnpaySandbox').is(':checked')
        },
        paypal: {
            client_id: $('#paypalClientId').val(),
            client_secret: $('#paypalClientSecret').val(),
            webhook: $('#paypalWebhook').val(),
            sandbox: $('#paypalSandbox').is(':checked')
        },
        general: {
            currency: $('#defaultCurrency').val(),
            transaction_fee: parseFloat($('#transactionFee').val()) || 0,
            timeout: parseInt($('#paymentTimeout').val()) || 15,
            auto_confirm: $('#autoConfirmPayment').is(':checked'),
            send_email: $('#sendPaymentEmail').is(':checked')
        }
    };
}

/**
 * Perform payment save
 */
function performPaymentSave(formData) {
    $.ajax({
        url: '../api/settings.php',
        method: 'POST',
        data: {
            action: 'save_payment',
            settings: JSON.stringify(formData)
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Cài đặt thanh toán đã được lưu thành công.',
                    icon: 'success',
                    confirmButtonColor: '#e91e63'
                });
                updateStatusBadges();
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: response.message || 'Có lỗi xảy ra khi lưu cài đặt.',
                    icon: 'error',
                    confirmButtonColor: '#e91e63'
                });
            }
        },
        error: function(xhr, status, error) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể kết nối đến server. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#e91e63'
            });
            console.error('Save error:', error);
        }
    });
}

/**
 * Validate payment form
 */
function validatePaymentForm() {
    let isValid = true;
    const errors = [];
    
    // Check if at least one payment method is enabled
    const anyMethodEnabled = $('#enableCash').is(':checked') || 
                           $('#enableBank').is(':checked') || 
                           $('#enableMomo').is(':checked') || 
                           $('#enableVNPay').is(':checked') || 
                           $('#enablePaypal').is(':checked');
    
    if (!anyMethodEnabled) {
        errors.push('Phải bật ít nhất một phương thức thanh toán');
        isValid = false;
    }
    
    // Validate enabled payment methods
    if ($('#enableBank').is(':checked')) {
        if (!$('#bankName').val()) {
            errors.push('Tên ngân hàng không được để trống');
            isValid = false;
        }
        if (!$('#bankAccount').val()) {
            errors.push('Số tài khoản không được để trống');
            isValid = false;
        }
    }
    
    if ($('#enableMomo').is(':checked')) {
        if (!$('#momoPartnerCode').val() || !$('#momoAccessKey').val() || !$('#momoSecretKey').val()) {
            errors.push('Thông tin MoMo không đầy đủ');
            isValid = false;
        }
    }
    
    if ($('#enableVNPay').is(':checked')) {
        if (!$('#vnpayTmnCode').val() || !$('#vnpayHashSecret').val()) {
            errors.push('Thông tin VNPay không đầy đủ');
            isValid = false;
        }
    }
    
    if ($('#enablePaypal').is(':checked') && (!$('#paypalClientId').val() || !$('#paypalClientSecret').val())) {
        errors.push('Thông tin PayPal không đầy đủ');
        isValid = false;
    }
    
    // Validate transaction fee
    const fee = parseFloat($('#transactionFee').val());
    if (isNaN(fee) || fee < 0 || fee > 10) {
        errors.push('Phí giao dịch phải từ 0% đến 10%');
        isValid = false;
    }
    
    // Validate timeout
    const timeout = parseInt($('#paymentTimeout').val());
    if (isNaN(timeout) || timeout < 5 || timeout > 60) {
        errors.push('Thời gian chờ thanh toán phải từ 5 đến 60 phút');
        isValid = false;
    }
    
    if (!isValid) {
        Swal.fire({
            title: 'Lỗi nhập liệu!',
            html: errors.join('<br>'),
            icon: 'error',
            confirmButtonColor: '#e91e63'
        });
    }
    
    return isValid;
}

/**
 * Test payment gateway connections
 */
function testMoMoConnection() {
    if (!isMethodConfigured('momo')) {
        Swal.fire({
            title: 'Chưa cấu hình',
            text: 'Vui lòng nhập đầy đủ thông tin MoMo trước khi kiểm tra.',
            icon: 'warning',
            confirmButtonColor: '#e91e63'
        });
        return;
    }
    
    const testData = {
        partner_code: $('#momoPartnerCode').val(),
        access_key: $('#momoAccessKey').val(),
        secret_key: $('#momoSecretKey').val(),
        sandbox: $('#momoSandbox').is(':checked')
    };
    
    Swal.fire({
        title: 'Đang kiểm tra...',
        text: 'Vui lòng đợi trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    $.ajax({
        url: '../api/payment-test.php',
        method: 'POST',
        data: {
            action: 'test_momo',
            config: JSON.stringify(testData)
        },
        dataType: 'json',
        success: function(response) {
            Swal.close();
            if (response.success) {
                Swal.fire({
                    title: 'Kết nối thành công!',
                    text: 'MoMo API hoạt động bình thường.',
                    icon: 'success',
                    confirmButtonColor: '#e91e63'
                });
            } else {
                Swal.fire({
                    title: 'Kết nối thất bại!',
                    text: response.message || 'Không thể kết nối đến MoMo.',
                    icon: 'error',
                    confirmButtonColor: '#e91e63'
                });
            }
        },
        error: function() {
            Swal.close();
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể kiểm tra kết nối MoMo.',
                icon: 'error',
                confirmButtonColor: '#e91e63'
            });
        }
    });
}

function testVNPayConnection() {
    if (!isMethodConfigured('vnpay')) {
        Swal.fire({
            title: 'Chưa cấu hình',
            text: 'Vui lòng nhập đầy đủ thông tin VNPay trước khi kiểm tra.',
            icon: 'warning',
            confirmButtonColor: '#e91e63'
        });
        return;
    }
    
    Swal.fire({
        title: 'Kiểm tra VNPay',
        text: 'Chức năng kiểm tra VNPay sẽ được triển khai sau.',
        icon: 'info',
        confirmButtonColor: '#e91e63'
    });
}

function testPayPalConnection() {
    if (!isMethodConfigured('paypal')) {
        Swal.fire({
            title: 'Chưa cấu hình',
            text: 'Vui lòng nhập đầy đủ thông tin PayPal trước khi kiểm tra.',
            icon: 'warning',
            confirmButtonColor: '#e91e63'
        });
        return;
    }
    
    Swal.fire({
        title: 'Kiểm tra PayPal',
        text: 'Chức năng kiểm tra PayPal sẽ được triển khai sau.',
        icon: 'info',
        confirmButtonColor: '#e91e63'
    });
}

/**
 * Validate individual field
 */
function validateField(field) {
    const $field = $(field);
    const value = $field.val();
    const fieldName = $field.attr('id');
    
    // Remove existing validation classes
    $field.removeClass('is-valid is-invalid');
    
    // Validation rules
    let isValid = true;
    
    if ($field.attr('required') && !value) {
        isValid = false;
    }
    
    // Specific validations
    if (fieldName === 'bankAccount' && value && !/^\d{8,20}$/.test(value)) {
        isValid = false;
    }
    
    // Apply validation class
    $field.addClass(isValid ? 'is-valid' : 'is-invalid');
}
