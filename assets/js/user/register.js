/* JAVASCRIPT CHO TRANG ĐĂNG KÝ - NHAFLOWER */

$(document).ready(function () {
  initializeRegisterForm();
  initializePasswordStrength();
  initializeFormValidation();
  initializeTogglePassword();
});

/* ===========================================
   KHỞI TẠO FORM ĐĂNG KÝ
   =========================================== */

function initializeRegisterForm() {
  const $form = $("#registerForm");

  $form.on("submit", function (e) {
    e.preventDefault();

    if (validateRegisterForm()) {
      submitRegistration();
    }
  });

  // Real-time validation
  $form.find("input").on("blur", function () {
    validateField($(this));
  });

  // Clear validation on input
  $form.find("input").on("input", function () {
    $(this).removeClass("is-invalid");
    $(this).closest(".input-group").removeClass("is-invalid is-valid");
    $(this).closest(".input-group").find(".error-icon").addClass("d-none");
  });
}

/* ===========================================
   XỬ LÝ MẬT KHẨU VÀ STRENGTH METER
   =========================================== */

function initializePasswordStrength() {
  const $password = $("#password");
  const $strengthMeter = $(".strength-meter-fill");
  const $strengthText = $(".strength-text");
  const $passwordGroup = $password.closest(".form-group");

  $password.on("input", function () {
    const password = $(this).val();
    const strength = calculatePasswordStrength(password);

    updateStrengthMeter(
      strength,
      $strengthMeter,
      $strengthText,
      $passwordGroup
    );

    // Validate confirm password if it has value
    const $confirmPassword = $("#confirmPassword");
    if ($confirmPassword.val()) {
      validatePasswordMatch();
    }
  });
}

function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = "";

  if (password.length === 0) {
    return { score: 0, feedback: "Nhập mật khẩu", level: "" };
  }

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  // Determine level and feedback
  if (score < 30) {
    feedback = "Rất yếu";
    level = "weak";
  } else if (score < 50) {
    feedback = "Yếu";
    level = "weak";
  } else if (score < 70) {
    feedback = "Trung bình";
    level = "fair";
  } else if (score < 90) {
    feedback = "Tốt";
    level = "good";
  } else {
    feedback = "Rất mạnh";
    level = "strong";
  }

  return { score, feedback, level };
}

function updateStrengthMeter(strength, $meter, $text, $group) {
  // Remove previous strength classes
  $group.removeClass(
    "strength-weak strength-fair strength-good strength-strong"
  );

  // Add current strength class
  if (strength.level) {
    $group.addClass("strength-" + strength.level);
  }

  $text.text(strength.feedback);

  // Color coding for text
  const colors = {
    weak: "#e74c3c",
    fair: "#f39c12",
    good: "#f1c40f",
    strong: "#27ae60",
  };

  $text.css("color", colors[strength.level] || "#666");
}

/* ===========================================
   TOGGLE PASSWORD VISIBILITY
   =========================================== */

function initializeTogglePassword() {
  $(".toggle-password").on("click", function () {
    const $button = $(this);
    const $input = $button.closest(".input-group").find("input");
    const $icon = $button.find("i");

    if ($input.attr("type") === "password") {
      $input.attr("type", "text");
      $icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      $input.attr("type", "password");
      $icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
}

/* ===========================================
   VALIDATION FUNCTIONS
   =========================================== */

function initializeFormValidation() {
  // Confirm password validation
  $("#confirmPassword").on("input blur", validatePasswordMatch);

  // Email validation
  $("#email").on("blur", function () {
    validateEmail($(this));
  });

  // Terms checkbox validation
  $("#agreeTerms").on("change", function () {
    validateCheckbox($(this));
  });
}

function validateField($field) {
  const fieldName = $field.attr("name");
  let isValid = true;

  switch (fieldName) {
    case "email":
      isValid = validateEmail($field);
      break;
    case "password":
      isValid = validatePassword($field);
      break;
    case "confirmPassword":
      isValid = validatePasswordMatch();
      break;
    case "agreeTerms":
      isValid = validateCheckbox($field);
      break;
    default:
      isValid = validateRequired($field);
  }

  return isValid;
}

function validateEmail($field) {
  const email = $field.val().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showFieldError($field, "Email là bắt buộc");
    return false;
  }

  if (!emailRegex.test(email)) {
    showFieldError($field, "Email không hợp lệ");
    return false;
  }

  hideFieldError($field);
  return true;
}

function validatePassword($field) {
  const password = $field.val();

  if (!password) {
    showFieldError($field, "Mật khẩu là bắt buộc");
    return false;
  }

  if (password.length < 8) {
    showFieldError($field, "Mật khẩu phải có ít nhất 8 ký tự");
    return false;
  }

  hideFieldError($field);
  return true;
}

function validatePasswordMatch() {
  const $password = $("#password");
  const $confirmPassword = $("#confirmPassword");
  const password = $password.val();
  const confirmPassword = $confirmPassword.val();

  if (!confirmPassword) {
    showFieldError($confirmPassword, "Vui lòng xác nhận mật khẩu");
    return false;
  }

  if (password !== confirmPassword) {
    showFieldError($confirmPassword, "Mật khẩu xác nhận không khớp");
    return false;
  }

  hideFieldError($confirmPassword);
  return true;
}

function validateCheckbox($field) {
  if (!$field.is(":checked")) {
    showFieldError($field, "Vui lòng đồng ý với điều khoản");
    return false;
  }

  hideFieldError($field);
  return true;
}

function validateRequired($field) {
  if (!$field.val().trim()) {
    showFieldError($field, "Trường này là bắt buộc");
    return false;
  }

  hideFieldError($field);
  return true;
}

function showFieldError($field, message) {
  $field.addClass("is-invalid");
  $field.closest(".input-group").addClass("is-invalid");
  const $errorIcon = $field.closest(".input-group").find(".error-icon");
  $errorIcon.removeClass("d-none");
}

function hideFieldError($field) {
  $field.removeClass("is-invalid");
  $field.closest(".input-group").removeClass("is-invalid is-valid");
  $field.closest(".input-group").find(".error-icon").addClass("d-none");
}

function validateRegisterForm() {
  const $form = $("#registerForm");
  let isValid = true;

  // Validate all required fields
  $form.find("input[required]").each(function () {
    if (!validateField($(this))) {
      isValid = false;
    }
  });

  // Validate checkboxes
  $form.find('input[type="checkbox"][required]').each(function () {
    if (!validateField($(this))) {
      isValid = false;
    }
  });

  return isValid;
}

/* ===========================================
   SUBMIT REGISTRATION
   =========================================== */

function submitRegistration() {
  const $form = $("#registerForm");
  const $submitBtn = $(".btn-register-submit");
  const $btnText = $submitBtn.find(".btn-text");
  const $btnLoading = $submitBtn.find(".btn-loading");

  // Show loading state
  $submitBtn.prop("disabled", true);
  $btnText.addClass("d-none");
  $btnLoading.removeClass("d-none");

  // Collect form data
  const formData = {
    email: $("#email").val().trim(),
    mat_khau: $("#password").val(),
    ten: $("#fullName").val().trim(),
    sdt: $("#phone").val().trim(),
    dia_chi: $("#address").val().trim(),
    ngay_sinh: $("#birthDate").val(),
    agreeTerms: $("#agreeTerms").is(":checked"),
    newsletter: $("#newsletter").is(":checked"),
  };

  console.log("Submitting registration with:", formData);

  // Call register API
  $.ajax({
    url: "../auth/register.php",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      email: formData.email,
      mat_khau: formData.mat_khau,
      ten: formData.ten,
      sdt: formData.sdt,
      dia_chi: formData.dia_chi,
      ngay_sinh: formData.ngay_sinh,
    }),
    success: function (response) {
      console.log("Register API response:", response);

      if (response.success) {
        // Sử dụng AuthManager để đăng nhập tự động sau khi đăng ký
        window.authManager.login(response.data.token, response.data);

        // Show success modal
        $("#successModal").modal("show");

        // Reset form
        $form[0].reset();
        $(".strength-meter-fill").css("width", "0%");
        $(".strength-text").text("Độ mạnh mật khẩu").css("color", "#666");
        $form
          .find(".form-group")
          .removeClass(
            "strength-weak strength-fair strength-good strength-strong"
          );

        // Auto redirect to home after 2 seconds
        setTimeout(function () {
          window.location.href = "home.html";
        }, 2000);
      } else {
        // Show error message
        alert("Lỗi đăng ký: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Register API error:", { xhr, status, error });

      let errorMessage = "Có lỗi xảy ra khi đăng ký";

      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      } else if (xhr.responseText) {
        errorMessage = "Lỗi server: " + xhr.responseText;
      }

      alert("Lỗi đăng ký: " + errorMessage);
    },
    complete: function () {
      // Reset button state
      $submitBtn.prop("disabled", false);
      $btnText.removeClass("d-none");
      $btnLoading.addClass("d-none");
    },
  });
}

/* ===========================================
   UTILITY FUNCTIONS
   =========================================== */

// Show categories function (from home.js)
function showCategories() {
  showNotification("Tính năng danh sách đang được phát triển", "info");
}

// Auto-focus first input
$(document).ready(function () {
  setTimeout(function () {
    $("#email").focus();
  }, 500);
});

// Handle modal close
$("#successModal").on("hidden.bs.modal", function () {
  // Sử dụng AuthManager để xử lý redirect sau đăng ký
  setTimeout(function () {
    window.authManager.handlePostLoginRedirect();
  }, 1000);
});

// Prevent form submission on Enter in non-submit elements
$(document).on("keypress", 'input:not([type="submit"])', function (e) {
  if (e.which === 13) {
    e.preventDefault();
    const $inputs = $(this).closest("form").find("input");
    const currentIndex = $inputs.index(this);

    if (currentIndex < $inputs.length - 1) {
      $inputs.eq(currentIndex + 1).focus();
    }
  }
});

// Terms and conditions link handler
$(document).on("click", ".terms-link", function (e) {
  e.preventDefault();
  // TODO: Show terms modal or redirect to terms page
  showNotification("Điều khoản và điều kiện đang được cập nhật", "info");
});

/* ===========================================
   UTILITY FUNCTIONS
   =========================================== */

function showNotification(message, type = "info") {
  // Create notification element
  const notificationId = "notification-" + Date.now();
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-danger"
      : type === "warning"
      ? "alert-warning"
      : "alert-info";

  const notification = $(`
    <div id="${notificationId}" class="alert ${alertClass} alert-dismissible fade show notification-popup" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
      <strong>${
        type === "success"
          ? "Thành công!"
          : type === "error"
          ? "Lỗi!"
          : "Thông báo!"
      }</strong> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `);

  // Add to body
  $("body").append(notification);

  // Auto remove after 5 seconds
  setTimeout(function () {
    $("#" + notificationId).fadeOut(function () {
      $(this).remove();
    });
  }, 5000);
}
