let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;

async function loadAllProducts() {
  try {
    const response = await $.getJSON("../jsonFiles/Clothing.json");

    // Accept both types of JSON structures
    allProducts = Array.isArray(response) ? response : response.products || [];

    filteredProducts = [...allProducts];

    renderCategoryFilters();
    updateDisplay();
  } catch (error) {
    console.error("Error loading products:", error);
    $("#products-container").html(`
      <div class="no-products">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error loading products</h3>
        <p>Please make sure the JSON file exists and is valid.</p>
      </div>
    `);
  }
}

// Render category filter checkboxes
function renderCategoryFilters() {
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();
  const container = $("#category-filters");

  categories.forEach((category) => {
    const option = $(`
          <div class="filter-option">
            <label>
              <input type="checkbox" class="category-filter" value="${category}" checked>
              <span>${category}</span>
            </label>
          </div>
        `);
    container.append(option);
  });
}

// Apply filters
function applyFilters() {
  const selectedCategories = $(".category-filter:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  const minPrice = parseFloat($("#min-price").val()) || 0;
  const maxPrice = parseFloat($("#max-price").val()) || 10000;

  filteredProducts = allProducts.filter((product) => {
    const price = parseFloat(product.price);
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const priceMatch = price >= minPrice && price <= maxPrice;
    return categoryMatch && priceMatch;
  });

  currentPage = 1;
  updateDisplay();
}

// Update display (products + pagination)
function updateDisplay() {
  const startIdx = (currentPage - 1) * productsPerPage;
  const endIdx = startIdx + productsPerPage;
  const pageProducts = filteredProducts.slice(startIdx, endIdx);

  renderProducts(pageProducts);
  renderPagination();
}

// Render products
function renderProducts(products) {
  const container = $("#products-container");

  if (products.length === 0) {
    container.html(`
          <div class="no-products">
            <i class="fas fa-box-open"></i>
            <h3>No products found</h3>
            <p>Try adjusting your filters</p>
          </div>
        `);
    return;
  }

  container.removeClass("loading").html("");
  container.addClass("products-grid");

  products.forEach((product, index) => {
    const badge = index % 3 === 0 ? "NEW" : index % 3 === 1 ? "SALE" : "";

    const card = $(`
          <div class="product-card">
            <div class="product-image-wrapper">
              <div class="product-image">${getCategoryEmoji(
                product.category
              )}</div>
              ${badge ? `<div class="product-badge">${badge}</div>` : ""}
            </div>
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-price">$${parseFloat(product.price).toFixed(
                0
              )}</div>
            </div>
          </div>
        `);

    container.append(card);
  });
}

// Get emoji for category
function getCategoryEmoji(category) {
  const emojis = {
    Electronics: "📱",
    "Home & Kitchen": "🏠",
    "Sports & Outdoors": "⚽",
    "Beauty & Personal Care": "💄",
    "Toys & Games": "🎮",
    Clothing: "👕",
    Automotive: "🚗",
    "Office Supplies": "📎",
    "Garden & Outdoors": "🌱",
    "Pet Supplies": "🐾",
  };
  return emojis[category] || "📦";
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pagination = $("#pagination");

  if (totalPages <= 1) {
    pagination.hide();
    return;
  }

  pagination.show().html("");

  // Page 1
  const page1 = $(
    `<button class="${currentPage === 1 ? "active" : ""}">1</button>`
  );
  page1.on("click", () => {
    currentPage = 1;
    updateDisplay();
    window.scrollTo(0, 0);
  });
  pagination.append(page1);

  // Show page 2 if exists
  if (totalPages >= 2) {
    const page2 = $(
      `<button class="${currentPage === 2 ? "active" : ""}">2</button>`
    );
    page2.on("click", () => {
      currentPage = 2;
      updateDisplay();
      window.scrollTo(0, 0);
    });
    pagination.append(page2);
  }

  // Show current page if it's not 1 or 2
  if (currentPage > 2 && currentPage < totalPages) {
    const pageCurrent = $(`<button class="active">${currentPage}</button>`);
    pagination.append(pageCurrent);
  }

  // Show page 3 or dots
  if (totalPages >= 3) {
    if (currentPage < totalPages - 1) {
      const page3 = $(
        `<button class="${currentPage === 3 ? "active" : ""}">3</button>`
      );
      page3.on("click", () => {
        currentPage = 3;
        updateDisplay();
        window.scrollTo(0, 0);
      });
      pagination.append(page3);
    }
  }

  // Show page 4 if needed
  if (totalPages >= 4 && currentPage >= totalPages - 2) {
    const page4 = $(
      `<button class="${currentPage === 4 ? "active" : ""}">4</button>`
    );
    page4.on("click", () => {
      currentPage = 4;
      updateDisplay();
      window.scrollTo(0, 0);
    });
    pagination.append(page4);
  }

  // Dots
  if (totalPages > 5) {
    pagination.append('<span class="pagination-dots">...</span>');
  }

  // Next button
  const nextBtn = $(
    `<button class="next-btn" ${
      currentPage === totalPages ? "disabled" : ""
    }>Next</button>`
  );
  nextBtn.on("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateDisplay();
      window.scrollTo(0, 0);
    }
  });
  pagination.append(nextBtn);
}

// Event Listeners
$(document).ready(function () {
  loadAllProducts();

  // Category filters
  $(document).on("change", ".category-filter", applyFilters);

  // Price filter apply button
  $("#apply-price").on("click", applyFilters);

  // Enter key on price inputs
  $("#min-price, #max-price").on("keypress", function (e) {
    if (e.which === 13) {
      applyFilters();
    }
  });

  // Filter header toggle
  $(".filter-header").on("click", function () {
    $(this).toggleClass("collapsed");
    $(this).next(".filter-options").slideToggle(200);
  });
});
