/**
 * NHAFLOWER - General Settings JavaScript
 * Quản lý cài đặt chung cho admin panel
 */

$(document).ready(function () {
    console.log("General Settings page initializing...");
    loadSettings();
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logo upload preview
    $('#logoUpload').on('change', function() {
        previewImage(this, 'logoPreview');
    });
    
    // Favicon upload preview
    $('#faviconUpload').on('change', function() {
        previewImage(this, 'faviconPreview');
    });
    
    // Form change detection
    $('input, select, textarea').on('change', function() {
        markAsChanged();
    });
    
    // Auto-save functionality
    let autoSaveTimer;
    $('input, select, textarea').on('input', function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            autoSaveSettings();
        }, 2000);
    });
}

/**
 * Preview uploaded image
 */
function previewImage(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#' + previewId).attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Load current settings
 */
function loadSettings() {
    console.log("Loading settings...");
    
    $.ajax({
        url: '../api/settings.php',
        method: 'GET',
        data: { action: 'get_general' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                populateForm(response.data);
            } else {
                console.error('Error loading settings:', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading settings:', error);
            // Load default settings if API fails
            loadDefaultSettings();
        }
    });
}

/**
 * Populate form with settings data
 */
function populateForm(data) {
    if (data.website) {
        $('#storeName').val(data.website.name || 'NHAFLOWER');
        $('#storeSlogan').val(data.website.slogan || 'Hoa tươi - Tình yêu thương');
        $('#storeDescription').val(data.website.description || '');
        $('#contactEmail').val(data.website.email || '');
        $('#contactPhone').val(data.website.phone || '');
        $('#storeAddress').val(data.website.address || '');
    }
    
    if (data.display) {
        $('#colorTheme').val(data.display.theme || 'pink');
        $('#productsPerPage').val(data.display.products_per_page || '12');
        $('#showStock').prop('checked', data.display.show_stock !== false);
        $('#showReviews').prop('checked', data.display.show_reviews !== false);
        $('#showWishlist').prop('checked', data.display.show_wishlist !== false);
    }
    
    if (data.seo) {
        $('#metaTitle').val(data.seo.title || '');
        $('#metaDescription').val(data.seo.description || '');
        $('#metaKeywords').val(data.seo.keywords || '');
    }
    
    if (data.security) {
        $('#sessionTimeout').val(data.security.session_timeout || 30);
        $('#maxLoginAttempts').val(data.security.max_login_attempts || 5);
        $('#enableTwoFactor').prop('checked', data.security.two_factor === true);
        $('#forceHttps').prop('checked', data.security.force_https !== false);
        $('#enableMaintenanceMode').prop('checked', data.security.maintenance_mode === true);
    }
}

/**
 * Load default settings if API fails
 */
function loadDefaultSettings() {
    console.log("Loading default settings...");
    const defaults = {
        website: {
            name: 'NHAFLOWER',
            slogan: 'Hoa tươi - Tình yêu thương',
            description: 'NHAFLOWER - Cửa hàng hoa tươi hàng đầu tại Việt Nam.',
            email: 'contact@nhaflower.com',
            phone: '0901234567',
            address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
        },
        display: {
            theme: 'pink',
            products_per_page: 12,
            show_stock: true,
            show_reviews: true,
            show_wishlist: true
        },
        seo: {
            title: 'NHAFLOWER - Hoa tươi đẹp, giao hàng tận nơi',
            description: 'Cửa hàng hoa tươi NHAFLOWER - Chuyên cung cấp hoa tươi đẹp, chất lượng cao',
            keywords: 'hoa tươi, cửa hàng hoa, giao hoa tận nơi'
        },
        security: {
            session_timeout: 30,
            max_login_attempts: 5,
            two_factor: false,
            force_https: true,
            maintenance_mode: false
        }
    };
    
    populateForm(defaults);
}

/**
 * Save all settings
 */
function saveAllSettings() {
    const formData = collectFormData();
    
    Swal.fire({
        title: 'Lưu cài đặt',
        text: 'Bạn có chắc chắn muốn lưu tất cả cài đặt?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Lưu',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            performSave(formData);
        }
    });
}

/**
 * Auto-save settings
 */
function autoSaveSettings() {
    const formData = collectFormData();
    
    // Show auto-save indicator
    showAutoSaveIndicator();
    
    $.ajax({
        url: '../api/settings.php',
        method: 'POST',
        data: {
            action: 'save_general',
            settings: JSON.stringify(formData)
        },
        dataType: 'json',
        success: function(response) {
            hideAutoSaveIndicator(true);
            if (!response.success) {
                console.error('Auto-save failed:', response.message);
            }
        },
        error: function(xhr, status, error) {
            hideAutoSaveIndicator(false);
            console.error('Auto-save error:', error);
        }
    });
}

/**
 * Collect form data
 */
function collectFormData() {
    return {
        website: {
            name: $('#storeName').val(),
            slogan: $('#storeSlogan').val(),
            description: $('#storeDescription').val(),
            email: $('#contactEmail').val(),
            phone: $('#contactPhone').val(),
            address: $('#storeAddress').val()
        },
        display: {
            theme: $('#colorTheme').val(),
            products_per_page: parseInt($('#productsPerPage').val()),
            show_stock: $('#showStock').is(':checked'),
            show_reviews: $('#showReviews').is(':checked'),
            show_wishlist: $('#showWishlist').is(':checked')
        },
        seo: {
            title: $('#metaTitle').val(),
            description: $('#metaDescription').val(),
            keywords: $('#metaKeywords').val()
        },
        security: {
            session_timeout: parseInt($('#sessionTimeout').val()),
            max_login_attempts: parseInt($('#maxLoginAttempts').val()),
            two_factor: $('#enableTwoFactor').is(':checked'),
            force_https: $('#forceHttps').is(':checked'),
            maintenance_mode: $('#enableMaintenanceMode').is(':checked')
        }
    };
}

/**
 * Perform save operation
 */
function performSave(formData, isUpload = false) {
    let url = '../api/settings.php';
    let data = {
        action: 'save_general',
        settings: JSON.stringify(formData)
    };
    
    // Handle file uploads
    if (isUpload) {
        let uploadData = new FormData();
        uploadData.append('action', 'save_general');
        uploadData.append('settings', JSON.stringify(formData));
        
        if ($('#logoUpload')[0].files.length > 0) {
            uploadData.append('logo', $('#logoUpload')[0].files[0]);
        }
        
        if ($('#faviconUpload')[0].files.length > 0) {
            uploadData.append('favicon', $('#faviconUpload')[0].files[0]);
        }
        
        data = uploadData;
    }
    
    $.ajax({
        url: url,
        method: 'POST',
        data: data,
        processData: !isUpload,
        contentType: isUpload ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Cài đặt đã được lưu thành công.',
                    icon: 'success',
                    confirmButtonColor: '#e91e63'
                });
                markAsSaved();
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
 * Reset settings to defaults
 */
function resetSettings() {
    Swal.fire({
        title: 'Khôi phục cài đặt',
        text: 'Bạn có chắc chắn muốn khôi phục về cài đặt mặc định? Thao tác này không thể hoàn tác.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Khôi phục',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            loadDefaultSettings();
            Swal.fire({
                title: 'Khôi phục thành công!',
                text: 'Cài đặt đã được khôi phục về mặc định.',
                icon: 'success',
                confirmButtonColor: '#e91e63'
            });
        }
    });
}

/**
 * Mark form as changed
 */
function markAsChanged() {
    $('body').addClass('settings-changed');
}

/**
 * Mark form as saved
 */
function markAsSaved() {
    $('body').removeClass('settings-changed');
}

/**
 * Show auto-save indicator
 */
function showAutoSaveIndicator() {
    if ($('#autoSaveIndicator').length === 0) {
        $('body').append('<div id="autoSaveIndicator" class="auto-save-indicator">Đang lưu...</div>');
    }
    $('#autoSaveIndicator').fadeIn();
}

/**
 * Hide auto-save indicator
 */
function hideAutoSaveIndicator(success = true) {
    const indicator = $('#autoSaveIndicator');
    if (success) {
        indicator.text('Đã lưu').removeClass('error').addClass('success');
    } else {
        indicator.text('Lỗi lưu').removeClass('success').addClass('error');
    }
    
    setTimeout(() => {
        indicator.fadeOut();
    }, 1500);
}

/**
 * Validate form data
 */
function validateForm() {
    let isValid = true;
    const errors = [];
    
    // Validate required fields
    if (!$('#storeName').val().trim()) {
        errors.push('Tên cửa hàng không được để trống');
        isValid = false;
    }
    
    if (!$('#contactEmail').val().trim()) {
        errors.push('Email liên hệ không được để trống');
        isValid = false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ($('#contactEmail').val() && !emailRegex.test($('#contactEmail').val())) {
        errors.push('Định dạng email không hợp lệ');
        isValid = false;
    }
    
    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/;
    if ($('#contactPhone').val() && !phoneRegex.test($('#contactPhone').val().replace(/\s/g, ''))) {
        errors.push('Số điện thoại không hợp lệ');
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
 * Handle form submission with file uploads
 */
function saveWithUploads() {
    if (!validateForm()) {
        return;
    }
    
    const formData = collectFormData();
    performSave(formData, true);
}

// Add CSS for auto-save indicator
$(document).ready(function() {
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .auto-save-indicator {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #17a2b8;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 9999;
                display: none;
                transition: all 0.3s;
            }
            
            .auto-save-indicator.success {
                background: #28a745;
            }
            
            .auto-save-indicator.error {
                background: #dc3545;
            }
            
            .settings-changed .btn-success {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `)
        .appendTo('head');
});
