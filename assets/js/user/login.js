/* JAVASCRIPT CHO TRANG ĐĂNG NHẬP - NHAFLOWER */

$(document).ready(function () {
  initializeLoginForm();
  initializeFormValidation();
  initializeTogglePassword();
});

/* ===========================================
   KHỞI TẠO FORM ĐĂNG NHẬP
   =========================================== */

function initializeLoginForm() {
  const $form = $("#loginForm");

  $form.on("submit", function (e) {
    e.preventDefault();

    if (validateLoginForm()) {
      submitLogin();
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
    const $errorIcon = $(this).closest(".input-group").find(".error-icon");
    if ($errorIcon.length) {
      $errorIcon.addClass("d-none");
    }
  });
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
  // Email validation
  $("#email").on("blur", function () {
    validateEmail($(this));
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
  if ($errorIcon.length) {
    $errorIcon.removeClass("d-none");
  }
}

function hideFieldError($field) {
  $field.removeClass("is-invalid");
  $field.closest(".input-group").removeClass("is-invalid is-valid");
  const $errorIcon = $field.closest(".input-group").find(".error-icon");
  if ($errorIcon.length) {
    $errorIcon.addClass("d-none");
  }
}

function validateLoginForm() {
  const $form = $("#loginForm");
  let isValid = true;

  // Validate all required fields
  $form.find("input[required]").each(function () {
    if (!validateField($(this))) {
      isValid = false;
    }
  });

  return isValid;
}

/* ===========================================
   SUBMIT LOGIN
   =========================================== */

function submitLogin() {
  const $form = $("#loginForm");
  const $submitBtn = $(".btn-login-submit");
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
    rememberMe: $("#rememberMe").is(":checked"),
  };

  console.log("Submitting login with:", formData);

  // Call login API
  $.ajax({
    url: "../auth/login.php",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      email: formData.email,
      mat_khau: formData.mat_khau,
    }),
    success: function (response) {
      console.log("Login API response:", response);

      if (response.success) {
        // Sử dụng AuthManager để đăng nhập
        // Đảm bảo truyền đầy đủ vai_tro vào nhaflower_user
        const userData = Object.assign({}, response.data); // clone object
        if (response.data.vai_tro) {
          userData.vai_tro = response.data.vai_tro;
        }
        window.authManager.login(response.data.token, userData);

        // Gọi API lấy thông tin khách hàng theo id_taikhoan
        $.ajax({
          url: "/NHAFLOWER/api/khach_hang.php?action=get",
          method: "GET",
          dataType: "json",
          success: function (res) {
            let khach = null;
            if (res.success && Array.isArray(res.data)) {
              khach = res.data.find(
                (k) => k.id_taikhoan == response.data.id_taikhoan
              );
            }
            // Lấy object nhaflower_user đã chuẩn hóa từ localStorage
            let nhaflowerUser = JSON.parse(
              localStorage.getItem("nhaflower_user") || "null"
            );
            // Nếu tìm thấy id_khachhang thì cập nhật vào object
            if (khach && khach.id_khachhang) {
              nhaflowerUser = {
                ...userData, // luôn lấy lại từ userData (có vai_tro)
                id_khachhang: khach.id_khachhang,
              };
              localStorage.setItem(
                "nhaflower_user",
                JSON.stringify(nhaflowerUser)
              );
            }
            showNotification("Đăng nhập thành công!", "success");
            setTimeout(function () {
              window.authManager.handlePostLoginRedirect();
            }, 1500);
          },
          error: function () {
            // Nếu lỗi vẫn giữ object nhaflower_user đã chuẩn hóa
            showNotification("Đăng nhập thành công!", "success");
            setTimeout(function () {
              window.authManager.handlePostLoginRedirect();
            }, 1500);
          },
        });
      } else {
        showNotification("Đăng nhập thất bại: " + response.message, "error");
      }
    },
    error: function (xhr, status, error) {
      console.error("Login API error:", { xhr, status, error });

      let errorMessage = "Có lỗi xảy ra khi đăng nhập";

      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      } else if (xhr.responseText) {
        errorMessage = "Lỗi server: " + xhr.responseText;
      }

      showNotification("Đăng nhập thất bại: " + errorMessage, "error");
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

// Forgot password link handler
$(document).on("click", ".forgot-password-link", function (e) {
  e.preventDefault();
  showNotification("Tính năng quên mật khẩu đang được phát triển", "info");
});

// Remember me functionality
$(document).ready(function () {
  // Load saved email if remember me was checked
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    $("#email").val(savedEmail);
    $("#rememberMe").prop("checked", true);
  }

  // Save email when remember me is checked
  $("#loginForm").on("submit", function () {
    if ($("#rememberMe").is(":checked")) {
      localStorage.setItem("rememberedEmail", $("#email").val());
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  });
});

// Keyboard shortcuts
$(document).ready(function () {
  $(document).on("keydown", function (e) {
    // Enter key to submit form
    if (e.which === 13 && !e.shiftKey) {
      const $form = $("#loginForm");
      if ($form.length && $form.find("input:focus").length) {
        e.preventDefault();
        $form.trigger("submit");
      }
    }
  });
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
