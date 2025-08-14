// profile-addresses.js
// Quản lý danh sách địa chỉ người dùng

$(document).ready(function () {
  const userData = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
  const baseManager = new BaseProfileManager();

  baseManager.updateSidebarInfo(userData);

  if (!userData || !userData.id_taikhoan) {
    baseManager.showErrorMessage("Bạn cần đăng nhập để xem địa chỉ.");
    return;
  }

  loadAddresses(userData.id_taikhoan);
});

/**
 * Gọi API lấy danh sách địa chỉ
 * @param {number} userId
 */
function loadAddresses(userId) {
  const $list = $("#address-list");
  $list.html('<div class="loading-state">Đang tải địa chỉ...</div>');

  $.ajax({
    url: `/api/dia_chi.php?action=get_by_user&id_taikhoan=${userId}`,
    method: "GET",
    dataType: "json",
    timeout: 8000,
    success: function (res) {
      if (res && (res.data || res).length) {
        renderAddresses(res.data || res);
      } else {
        $list.html('<div class="empty-state">Bạn chưa có địa chỉ nào.</div>');
      }
    },
    error: function () {
      $list.html(
        '<div class="empty-state">Không thể tải danh sách địa chỉ.</div>'
      );
    },
  });
}

/**
 * Render danh sách địa chỉ
 * @param {Array} list
 */
function renderAddresses(list) {
  const $list = $("#address-list");

  if (!Array.isArray(list) || list.length === 0) {
    $list.html('<div class="empty-state">Bạn chưa có địa chỉ nào.</div>');
    return;
  }

  const html = list
    .map((item) => {
      const fullAddress = `${escapeHTML(item.dia_chi || "")}, ${escapeHTML(
        item.phuong_xa || ""
      )}, ${escapeHTML(item.quan_huyen || "")}, ${escapeHTML(
        item.tinh_thanh || ""
      )}`;
      return `
        <div class="address-item ${item.mac_dinh ? "default" : ""}">
          <div class="address-info">
            <div class="address-name">${escapeHTML(item.ho_ten || "")}</div>
            <div class="address-phone">${escapeHTML(
              item.so_dien_thoai || ""
            )}</div>
            <div class="address-full">${fullAddress}</div>
          </div>
          <div class="address-actions">
            ${
              item.mac_dinh
                ? '<span class="badge badge-success">Mặc định</span>'
                : ""
            }
            <button class="btn btn-sm btn-outline-primary" onclick="editAddress(${
              item.id
            })">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${
              item.id
            })">Xóa</button>
          </div>
        </div>
      `;
    })
    .join("");

  $list.html(html);
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const escapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escapes[match];
  });
}

/**
 * Xử lý sửa địa chỉ
 */
function editAddress(id) {
  // Điều hướng sang trang chỉnh sửa
  window.location.href = `edit-address.html?id=${id}`;
}

/**
 * Xử lý xóa địa chỉ
 */
function deleteAddress(id) {
  if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

  $.ajax({
    url: `/api/dia_chi.php?action=delete&id=${id}`,
    method: "POST",
    dataType: "json",
    success: function (res) {
      if (res.success) {
        loadAddresses(
          JSON.parse(localStorage.getItem("nhaflower_user")).id_taikhoan
        );
      } else {
        alert("Không thể xóa địa chỉ. Vui lòng thử lại.");
      }
    },
    error: function () {
      alert("Có lỗi khi xóa địa chỉ.");
    },
  });
}
