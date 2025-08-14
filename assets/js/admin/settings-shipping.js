$(document).ready(function() {
    // Initialize shipping settings
    initializeShippingSettings();
    
    // Auto-save functionality
    let autoSaveTimer;
    
    // Form elements change handler
    $('input, select, textarea').on('input change', function() {
        clearTimeout(autoSaveTimer);
        $('.save-indicator').removeClass('d-none').find('small').text('Đang lưu...');
        
        autoSaveTimer = setTimeout(function() {
            autoSaveSettings();
        }, 2000);
    });

    // Manual save button
    $('#saveShippingSettings').on('click', function() {
        saveShippingSettings();
    });

    // Add delivery slot
    $('#addDeliverySlot').on('click', function() {
        addDeliverySlot();
    });

    // Remove delivery slot
    $(document).on('click', '.remove-slot', function() {
        $(this).closest('.delivery-slot-item').remove();
        updateSlotIndices();
    });

    // Shipping method toggle
    $('.method-toggle').on('change', function() {
        const methodId = $(this).data('method');
        const isEnabled = $(this).is(':checked');
        
        if (isEnabled) {
            $(`#${methodId}Settings`).removeClass('d-none');
        } else {
            $(`#${methodId}Settings`).addClass('d-none');
        }
        
        updateMethodBadge(methodId, isEnabled);
    });

    // Zone selection change
    $('select[name="shipping_zone"]').on('change', function() {
        const zone = $(this).val();
        loadZoneSettings(zone);
    });
});

// Initialize shipping settings
function initializeShippingSettings() {
    // Show loading
    showLoading();
    
    // Load current settings
    $.ajax({
        url: '../api/settings.php',
        method: 'GET',
        data: { category: 'shipping' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                populateShippingForm(response.data);
            } else {
                showError('Không thể tải cài đặt vận chuyển');
            }
        },
        error: function() {
            showError('Lỗi kết nối server');
        },
        complete: function() {
            hideLoading();
        }
    });
}

// Populate form with shipping data
function populateShippingForm(data) {
    // Shipping methods
    const methods = ['standard', 'express', 'pickup'];
    methods.forEach(method => {
        const enabled = data[`${method}_enabled`] === '1';
        $(`input[data-method="${method}"]`).prop('checked', enabled);
        
        if (enabled) {
            $(`#${method}Settings`).removeClass('d-none');
        }
        
        updateMethodBadge(method, enabled);
    });

    // Shipping zones and rates
    if (data.local_rate) $('input[name="local_rate"]').val(data.local_rate);
    if (data.nationwide_rate) $('input[name="nationwide_rate"]').val(data.nationwide_rate);
    if (data.standard_time) $('input[name="standard_time"]').val(data.standard_time);
    if (data.express_time) $('input[name="express_time"]').val(data.express_time);
    if (data.express_fee) $('input[name="express_fee"]').val(data.express_fee);

    // Weight limits
    if (data.max_weight) $('input[name="max_weight"]').val(data.max_weight);
    if (data.overweight_fee) $('input[name="overweight_fee"]').val(data.overweight_fee);

    // Processing settings
    if (data.processing_time) $('select[name="processing_time"]').val(data.processing_time);
    if (data.cutoff_time) $('input[name="cutoff_time"]').val(data.cutoff_time);

    // Special instructions
    if (data.delivery_instructions) $('textarea[name="delivery_instructions"]').val(data.delivery_instructions);
    if (data.return_policy) $('textarea[name="return_policy"]').val(data.return_policy);

    // Delivery slots
    if (data.delivery_slots) {
        const slots = JSON.parse(data.delivery_slots);
        populateDeliverySlots(slots);
    }

    // Checkboxes
    const checkboxFields = ['weekend_delivery', 'holiday_delivery', 'signature_required'];
    checkboxFields.forEach(field => {
        if (data[field] === '1') {
            $(`input[name="${field}"]`).prop('checked', true);
        }
    });
}

// Populate delivery slots
function populateDeliverySlots(slots) {
    const container = $('#deliverySlotsList');
    container.empty();

    slots.forEach((slot, index) => {
        addDeliverySlot(slot);
    });

    if (slots.length === 0) {
        addDeliverySlot(); // Add default slot
    }
}

// Add delivery slot
function addDeliverySlot(slotData = null) {
    const container = $('#deliverySlotsList');
    const index = container.children().length;
    
    const defaultData = {
        day_type: 'weekday',
        start_time: '08:00',
        end_time: '18:00',
        fee: '0'
    };
    
    const data = slotData || defaultData;
    
    const slotHtml = `
        <div class="delivery-slot-item mb-3 p-3 border rounded">
            <div class="row">
                <div class="col-md-3">
                    <label>Loại ngày</label>
                    <select class="form-control" name="slots[${index}][day_type]">
                        <option value="weekday" ${data.day_type === 'weekday' ? 'selected' : ''}>Ngày thường</option>
                        <option value="weekend" ${data.day_type === 'weekend' ? 'selected' : ''}>Cuối tuần</option>
                        <option value="holiday" ${data.day_type === 'holiday' ? 'selected' : ''}>Ngày lễ</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label>Giờ bắt đầu</label>
                    <input type="time" class="form-control" name="slots[${index}][start_time]" value="${data.start_time}">
                </div>
                <div class="col-md-3">
                    <label>Giờ kết thúc</label>
                    <input type="time" class="form-control" name="slots[${index}][end_time]" value="${data.end_time}">
                </div>
                <div class="col-md-2">
                    <label>Phí (VNĐ)</label>
                    <input type="number" class="form-control" name="slots[${index}][fee]" value="${data.fee}" min="0">
                </div>
                <div class="col-md-1 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-sm remove-slot">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.append(slotHtml);
}

// Update slot indices after removal
function updateSlotIndices() {
    $('#deliverySlotsList .delivery-slot-item').each(function(index) {
        $(this).find('select, input').each(function() {
            const name = $(this).attr('name');
            if (name) {
                const newName = name.replace(/slots\[\d+\]/, `slots[${index}]`);
                $(this).attr('name', newName);
            }
        });
    });
}

// Update method badge
function updateMethodBadge(methodId, isEnabled) {
    const badge = $(`.method-card[data-method="${methodId}"] .status-badge`);
    
    if (isEnabled) {
        badge.removeClass('badge-secondary badge-warning')
              .addClass('badge-success')
              .text('Đang hoạt động');
    } else {
        badge.removeClass('badge-success badge-warning')
              .addClass('badge-secondary')
              .text('Tắt');
    }
}

// Load zone-specific settings
function loadZoneSettings(zone) {
    // This would typically load different rates/settings based on zone
    // For now, just show appropriate fields
    if (zone === 'local') {
        $('#localSettings').removeClass('d-none');
        $('#nationwideSettings').addClass('d-none');
    } else {
        $('#localSettings').addClass('d-none');
        $('#nationwideSettings').removeClass('d-none');
    }
}

// Auto-save settings
function autoSaveSettings() {
    const formData = collectShippingData();
    
    $.ajax({
        url: '../api/settings.php',
        method: 'POST',
        data: {
            action: 'save',
            category: 'shipping',
            settings: formData
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                $('.save-indicator').find('small')
                    .text('Đã lưu tự động')
                    .removeClass('text-warning')
                    .addClass('text-success');
                
                setTimeout(function() {
                    $('.save-indicator').addClass('d-none');
                }, 2000);
            } else {
                showError('Lỗi khi lưu: ' + (response.message || 'Không xác định'));
            }
        },
        error: function() {
            $('.save-indicator').find('small')
                .text('Lỗi khi lưu')
                .removeClass('text-warning')
                .addClass('text-danger');
        }
    });
}

// Manual save settings
function saveShippingSettings() {
    if (!validateShippingForm()) {
        return;
    }

    const formData = collectShippingData();
    
    // Show loading
    Swal.fire({
        title: 'Đang lưu cài đặt...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '../api/settings.php',
        method: 'POST',
        data: {
            action: 'save',
            category: 'shipping',
            settings: formData
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Cài đặt vận chuyển đã được lưu',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: response.message || 'Không thể lưu cài đặt',
                    icon: 'error'
                });
            }
        },
        error: function() {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Lỗi kết nối server',
                icon: 'error'
            });
        }
    });
}

// Collect shipping data from form
function collectShippingData() {
    const data = {};

    // Shipping methods
    $('.method-toggle').each(function() {
        const method = $(this).data('method');
        data[`${method}_enabled`] = $(this).is(':checked') ? '1' : '0';
    });

    // Basic settings
    const fields = [
        'local_rate', 'nationwide_rate', 'standard_time', 'express_time', 
        'express_fee', 'max_weight', 'overweight_fee', 'processing_time',
        'cutoff_time', 'delivery_instructions', 'return_policy'
    ];

    fields.forEach(field => {
        const value = $(`[name="${field}"]`).val();
        if (value !== undefined && value !== '') {
            data[field] = value;
        }
    });

    // Checkboxes
    const checkboxes = ['weekend_delivery', 'holiday_delivery', 'signature_required'];
    checkboxes.forEach(field => {
        data[field] = $(`input[name="${field}"]`).is(':checked') ? '1' : '0';
    });

    // Delivery slots
    const slots = [];
    $('#deliverySlotsList .delivery-slot-item').each(function() {
        const slot = {
            day_type: $(this).find('select').val(),
            start_time: $(this).find('input[type="time"]:first').val(),
            end_time: $(this).find('input[type="time"]:last').val(),
            fee: $(this).find('input[type="number"]').val() || '0'
        };
        slots.push(slot);
    });
    data.delivery_slots = JSON.stringify(slots);

    return data;
}

// Validate shipping form
function validateShippingForm() {
    const errors = [];

    // Check if at least one shipping method is enabled
    const enabledMethods = $('.method-toggle:checked').length;
    if (enabledMethods === 0) {
        errors.push('Phải bật ít nhất một phương thức vận chuyển');
    }

    // Validate rates
    const localRate = parseFloat($('input[name="local_rate"]').val());
    const nationwideRate = parseFloat($('input[name="nationwide_rate"]').val());
    
    if (isNaN(localRate) || localRate < 0) {
        errors.push('Phí vận chuyển nội thành không hợp lệ');
    }
    
    if (isNaN(nationwideRate) || nationwideRate < 0) {
        errors.push('Phí vận chuyển toàn quốc không hợp lệ');
    }

    // Validate delivery times
    const standardTime = $('input[name="standard_time"]').val();
    const expressTime = $('input[name="express_time"]').val();
    
    if (!standardTime || parseInt(standardTime) <= 0) {
        errors.push('Thời gian giao hàng tiêu chuẩn không hợp lệ');
    }
    
    if (!expressTime || parseInt(expressTime) <= 0) {
        errors.push('Thời gian giao hàng nhanh không hợp lệ');
    }

    // Validate weight limits
    const maxWeight = parseFloat($('input[name="max_weight"]').val());
    if (isNaN(maxWeight) || maxWeight <= 0) {
        errors.push('Giới hạn trọng lượng không hợp lệ');
    }

    // Validate delivery slots
    let hasValidSlot = false;
    $('#deliverySlotsList .delivery-slot-item').each(function() {
        const startTime = $(this).find('input[type="time"]:first').val();
        const endTime = $(this).find('input[type="time"]:last').val();
        
        if (startTime && endTime) {
            if (startTime >= endTime) {
                errors.push('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
                return false;
            }
            hasValidSlot = true;
        }
    });

    if (!hasValidSlot) {
        errors.push('Phải có ít nhất một khung giờ giao hàng hợp lệ');
    }

    if (errors.length > 0) {
        Swal.fire({
            title: 'Lỗi nhập liệu!',
            html: errors.join('<br>'),
            icon: 'error'
        });
        return false;
    }

    return true;
}

// Utility functions
function showLoading() {
    $('.settings-container').append('<div class="loading-overlay"><div class="spinner-border text-primary"></div></div>');
}

function hideLoading() {
    $('.loading-overlay').remove();
}

function showError(message) {
    Swal.fire({
        title: 'Lỗi!',
        text: message,
        icon: 'error'
    });
}

function showSuccess(message) {
    Swal.fire({
        title: 'Thành công!',
        text: message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}
