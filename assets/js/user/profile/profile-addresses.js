// profile-addresses.js
// Quản lý danh sách địa chỉ người dùng
async function loadAddress(id_khachhang) {
  const $container = $("#addressesContainer");
  $container.html('<div class="loading-state">Đang tải địa chỉ...');
  try {
    const res = await fetch(
      `../../api/khach_hang.php?action=get_by_id&id=${id_khachhang}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await res.json();
    if (data && data.data && data.data.dia_chi) {
      $container.html(`
        <div class="address-view">
          <label>Địa chỉ giao hàng hiện tại:</label>
          <div class="address-value">${escapeHTML(data.data.dia_chi)}</div>
          <input type="text" id="addressInput" class="form-control mt-2" value="${escapeHTML(
            data.data.dia_chi
          )}" placeholder="Nhập địa chỉ mới...">
          <button id="btnUpdateAddress" class="btn btn-primary mt-2">Cập nhật địa chỉ</button>
        </div>
      `);
    } else {
      $container.html(`
        <div class="address-view">
          <label>Chưa có địa chỉ giao hàng.</label>
          <input type="text" id="addressInput" class="form-control mt-2" placeholder="Nhập địa chỉ mới...">
          <button id="btnUpdateAddress" class="btn btn-primary mt-2">Lưu địa chỉ</button>
        </div>
      `);
    }
  } catch (err) {
    $container.html('<div class="empty-state">Không thể tải địa chỉ.</div>');
  }
}
async function updateAddress(id_khachhang, dia_chi) {
  const $btn = $("#btnUpdateAddress");
  $btn
    .prop("disabled", true)
    .html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');
  try {
    const res = await fetch(
      `../../api/khach_hang.php?action=update&id=${id_khachhang}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dia_chi }),
      }
    );
    const result = await res.json();
    if (result && result.success) {
      showSuccessMessage("Cập nhật địa chỉ thành công!");
      await loadAddress(id_khachhang);
    } else {
      showErrorMessage(result.message || "Cập nhật thất bại!");
    }
  } catch (err) {
    showErrorMessage("Lỗi kết nối máy chủ!");
  } finally {
    $btn.prop("disabled", false).html("Cập nhật địa chỉ");
  }
}
function showSuccessMessage(msg) {
  alert(msg); // Có thể thay bằng toast hoặc UI đẹp hơn
}
function showErrorMessage(msg) {
  alert(msg); // Có thể thay bằng toast hoặc UI đẹp hơn
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }[c];
  });
}
$(document).ready(function () {
  const userData = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
  const baseManager = new BaseProfileManager();
  baseManager.updateSidebarInfo(userData);
  if (!userData || !userData.id_khachhang) {
    showErrorMessage("Bạn cần đăng nhập để xem địa chỉ.");
    return;
  }
  loadAddress(userData.id_khachhang);
  $(document).on("click", "#btnUpdateAddress", function () {
    const newAddress = $("#addressInput").val().trim();
    if (!newAddress) {
      showErrorMessage("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    updateAddress(userData.id_khachhang, newAddress);
  });
});

function renderAddresses(list) {
  const $list = $("#address-list");

  if (!Array.isArray(list) || list.length === 0) {
    $list.html('<div class="empty-state">Bạn chưa có địa chỉ nào.</div>');
    return;
  }

  $(document).ready(function () {
    const userData = JSON.parse(
      localStorage.getItem("nhaflower_user") || "null"
    );
    const baseManager = new BaseProfileManager();
    baseManager.updateSidebarInfo(userData);

    if (!userData || !userData.id_khachhang) {
      baseManager.showErrorMessage("Bạn cần đăng nhập để xem địa chỉ.");
      return;
    }

    loadAddress(userData.id_khachhang);

    $(document).on("click", "#btnUpdateAddress", function () {
      const newAddress = $("#addressInput").val().trim();
      if (!newAddress) {
        baseManager.showErrorMessage("Vui lòng nhập địa chỉ giao hàng.");
        return;
      }
      updateAddress(userData.id_khachhang, newAddress);
    });
  });
}

// Đảm bảo hàm logout() luôn gọi đúng hàm logout của BaseProfileManager
function logout() {
  new BaseProfileManager().logout();
}
