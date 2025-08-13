$(document).ready(function () {
  const userData = JSON.parse(localStorage.getItem("nhaflower_user") || "null");
  if (userData) {
    $("#profileName").text(
      userData.ten || userData.email || "Người dùng NHAFLOWER"
    );
    $("#profileEmail").text(userData.email || "");
    let avatarUrl = localStorage.getItem(
      "nhaflower_avatar_" + (userData.id_taikhoan || 1)
    );
    if (avatarUrl) {
      $("#profileAvatar").attr("src", avatarUrl);
    }
  }
  // Nếu có đoạn gọi API, hãy sửa lại url về dạng /api/ten_file.php?action=... (nếu cần)
});
