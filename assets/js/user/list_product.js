// Filter functionality
document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const category = this.getAttribute("data-category");

      // Filter products
      productCards.forEach((card) => {
        if (
          category === "all" ||
          card.getAttribute("data-category") === category
        ) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Add to cart functionality
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productName =
        this.parentElement.querySelector(".product-name").textContent;
      alert(`Đã thêm "${productName}" vào giỏ hàng!`);
    });
  });
});

// Header navigation functions
function showSearchModal() {
  const searchTerm = prompt("Tìm kiếm sản phẩm:");
  if (searchTerm) {
    const productCards = document.querySelectorAll(".product-card");
    const filterBtns = document.querySelectorAll(".filter-btn");

    productCards.forEach((card) => {
      const productName = card
        .querySelector(".product-name")
        .textContent.toLowerCase();
      if (productName.includes(searchTerm.toLowerCase())) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });

    // Update filter buttons
    filterBtns.forEach((b) => b.classList.remove("active"));
  }
}

function showUserProfile() {
  alert("Chuyển đến trang thông tin cá nhân");
  // Sau này có thể redirect đến profile.html
  // window.location.href = "profile.html";
}

function showCart() {
  alert("Chuyển đến giỏ hàng");
  // Sau này có thể redirect đến cart.html
  // window.location.href = "cart.html";
}

function showCategories() {
  alert("Hiển thị danh mục sản phẩm");
}
