// GLOBAL VARIABLES
let allProducts = []; // Stores all products from all categories
let filteredProducts = []; // Stores products after applying filters
let allCategories = []; // Stores list of all categories
let currentPage = 1; // Current page number for pagination
const productsPerPage = 9; // Number of products to show per page
let currentSort = "default"; // Current sorting method
let cart = []; // Shopping cart array

// HELPER FUNCTIONS
/**
 * Get URL parameter by name
 * Example: If URL is "page.html?category=Electronics", this gets "Electronics"
 * @param {string} name - The parameter name to retrieve
 * @returns {string|null} The parameter value or null if not found
 */
function getURLParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// LOAD CATEGORIES FROM XML
/**
 * Load all category names from the XML file
 * Returns a Promise so we can wait for the data to load
 * @returns {Promise<Array>} Promise that resolves to array of category names
 */
async function getCategoriesFromXML() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "../jsonFiles/categories.xml",
      dataType: "xml",
      method: "GET",
      success: function (xmlDoc) {
        const categories = [];
        // Loop through all <category> tags in XML
        $(xmlDoc)
          .find("category")
          .each(function () {
            const categoryName = $(this).find("name").text();
            categories.push(categoryName);
          });
        resolve(categories); // Return the array of category names
      },
      error: function (error) {
        console.error("Error loading categories from XML:", error);
        reject(error);
      },
    });
  });
}

// CATEGORY TO FILENAME MAPPING
/**
 * Convert category name to corresponding JSON filename
 * Example: "Electronics" → "Electronics.json"
 * @param {string} categoryName - Name of the category
 * @returns {string|null} JSON filename or null if not found
 */
function getCategoryFilename(categoryName) {
  if (!categoryName) return null;

  // Map each category to its JSON file
  const categoryMap = {
    Electronics: "Electronics.json",
    "Home & Kitchen": "Home & Kitchen.json",
    "Sports & Outdoors": "Sports & Outdoors.json",
    "Beauty & Personal Care": "Beauty & Personal Care.json",
    "Toys & Games": "Toys & Games.json",
    Clothing: "Clothing.json",
    Automotive: "Automotive.json",
    "Office Supplies": "Office Supplies.json",
    "Garden & Outdoors": "Garden & Outdoors.json",
    "Pet Supplies": "Pet Supplies.json",
  };

  return categoryMap[categoryName] || null;
}

// LOAD PRODUCTS FROM ALL CATEGORIES
/**
 * Load products from all category JSON files
 * Combines all products into a single array
 * @returns {Promise<Array>} Promise that resolves to array of all products
 */
async function loadAllCategories() {
  // First, get list of all categories from XML
  const categories = await getCategoriesFromXML();
  let allLoadedProducts = [];

  // Loop through each category and load its products
  for (const category of categories) {
    try {
      const filename = getCategoryFilename(category);
      if (!filename) continue; // Skip if no filename found

      // Load the JSON file for this category
      const response = await $.getJSON(`../jsonFiles/${filename}`);
      const products = Array.isArray(response)
        ? response
        : response.products || [];

      // Add category name to each product if it doesn't have one
      products.forEach((product) => {
        if (!product.category) {
          product.category = category;
        }
      });

      // Add these products to our complete list
      allLoadedProducts = allLoadedProducts.concat(products);
    } catch (error) {
      console.error(`Error loading ${category}:`, error);
    }
  }

  return allLoadedProducts;
}

// LOAD AND FILTER PRODUCTS
/**
 * Main function to load products and apply initial filters
 * Checks URL for category parameter and filters if present
 */
async function loadAllProducts() {
  try {
    // Check if a specific category was requested in URL
    const categoryParam = getURLParameter("category");

    // Always load all products (needed for accurate filter counts)
    allProducts = await loadAllCategories();

    // If a category was selected, show only products from that category
    if (categoryParam) {
      filteredProducts = allProducts.filter(
        (p) => p.category === categoryParam
      );
    } else {
      // Otherwise, show all products
      filteredProducts = [...allProducts];
    }

    // Display category filters in sidebar
    await renderCategoryFilters(categoryParam);
    // Apply any sorting
    applySorting();
    // Show products on page
    updateDisplay();
  } catch (error) {
    console.error("Error loading products:", error);
    // Show error message to user
    $("#products-container").html(`
      <div class="no-products">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error loading products</h3>
        <p>Please make sure the JSON files exist and are valid.</p>
      </div>
    `);
  }
}

// RENDER CATEGORY FILTER CHECKBOXES
/**
 * Create checkbox filters for each category in the sidebar
 * Shows product count for each category
 * @param {string|null} selectedCategory - Category to pre-select, if any
 */
async function renderCategoryFilters(selectedCategory) {
  const container = $("#category-filters");
  container.empty(); // Clear existing filters

  // Get all categories from XML
  const allCategoriesFromXML = await getCategoriesFromXML();

  // Create checkbox for each category
  allCategoriesFromXML.forEach((category) => {
    // Count how many products are in this category
    const count = allProducts.filter((p) => p.category === category).length;

    // Check the box if this category was selected in URL
    const isChecked = selectedCategory ? category === selectedCategory : true;

    // Create HTML for filter option
    const option = $(`
      <div class="filter-option">
        <label>
          <input type="checkbox" class="category-filter" value="${category}" ${
      isChecked ? "checked" : ""
    }>
          <span>${category} (${count})</span>
        </label>
      </div>
    `);
    container.append(option);
  });
}

// SORTING FUNCTIONS
/**
 * Sort the filtered products based on current sort option
 * Modifies the filteredProducts array directly
 */
function applySorting() {
  switch (currentSort) {
    case "price-low-high":
      // Sort by price ascending
      filteredProducts.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
      break;
    case "price-high-low":
      // Sort by price descending
      filteredProducts.sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price)
      );
      break;
    case "name-az":
      // Sort by name A to Z
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-za":
      // Sort by name Z to A
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      // No sorting, keep default order
      break;
  }
}

// APPLY FILTERS
/**
 * Filter products based on selected categories and price range
 * Then update the display with filtered results
 */
function applyFilters() {
  // Get all checked category checkboxes
  const selectedCategories = $(".category-filter:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  // Get price range values (with defaults)
  const minPrice = parseFloat($("#min-price").val()) || 0;
  const maxPrice = parseFloat($("#max-price").val()) || 10000;

  // Filter products based on category and price
  filteredProducts = allProducts.filter((product) => {
    const price = parseFloat(product.price);

    // Check if product matches selected categories
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    // Check if product price is within range
    const priceMatch = price >= minPrice && price <= maxPrice;

    // Product must match both category and price filters
    return categoryMatch && priceMatch;
  });

  // Apply sorting to filtered results
  applySorting();
  // Reset to page 1 when filters change
  currentPage = 1;
  // Update the display
  updateDisplay();
}

// UPDATE DISPLAY
/**
 * Update the page to show current products
 * Handles pagination - shows only products for current page
 */
function updateDisplay() {
  // Calculate which products to show based on current page
  const startIdx = (currentPage - 1) * productsPerPage;
  const endIdx = startIdx + productsPerPage;
  const pageProducts = filteredProducts.slice(startIdx, endIdx);

  // Update results count text
  updateResultsCount();
  // Display the products
  renderProducts(pageProducts);
  // Show pagination controls
  renderPagination();
}

// UPDATE RESULTS COUNT
/**
 * Show how many products are currently being displayed
 * Also creates the sort dropdown if it doesn't exist
 */
function updateResultsCount() {
  const count = filteredProducts.length;
  let countText = `Showing ${count} product${count !== 1 ? "s" : ""}`;

  // Create results header if it doesn't exist
  if ($("#results-count").length === 0) {
    $(".products-section").prepend(`
      <div class="results-header">
        <div id="results-count">${countText}</div>
        <div class="sort-controls">
          <label for="sort-select">Sort by:</label>
          <select id="sort-select">
            <option value="default">Default</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-az">Name: A-Z</option>
            <option value="name-za">Name: Z-A</option>
          </select>
        </div>
      </div>
    `);
  } else {
    // Just update the text if header already exists
    $("#results-count").text(countText);
  }
}

// RENDER PRODUCT CARDS
/**
 * Display product cards in the grid
 * @param {Array} products - Array of products to display
 */
function renderProducts(products) {
  const container = $("#products-container");

  // Show message if no products found
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

  // Clear container and prepare for products
  container.removeClass("loading").html("");
  container.addClass("products-grid");

  // Create a card for each product and add to container
  // Each card has click handler to go to product detail page
  // with product ID and category in URL
  // Example: ProductDetail.html?id=123&category=Electronics
  products.forEach((product) => {
    const card = $(`
      <div class="product-card" data-product-id="${
        product.id
      }" data-category="${product.category}">
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${
      product.name
    }" class="product-image"/>
        </div>

        <div class="product-info">
          <div class="product-category">${product.category || ""}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-price">$${parseFloat(product.price).toFixed(
            2
          )}</div>
        </div>
      </div>
    `);

    // Add click handler to navigate to product detail page
    card.on("click", function () {
      const productId = $(this).data("product-id");
      const category = $(this).data("category");
      // Go to product detail page with ID and category in URL
      window.location.href = `ProductDetail.html?id=${productId}&category=${encodeURIComponent(
        category
      )}`;
    });

    container.append(card);
  });
}

// RENDER PAGINATION
/**
 * Create pagination controls at bottom of page
 * Shows page numbers and Previous/Next buttons
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pagination = $("#pagination");

  // Hide pagination if only 1 page or less
  if (totalPages <= 1) {
    pagination.hide();
    return;
  }

  pagination.show().html("");

  // Previous button
  const prevBtn = $(
    `<button class="prev-btn" ${
      currentPage === 1 ? "disabled" : ""
    }>Previous</button>`
  );
  prevBtn.on("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateDisplay();
      window.scrollTo(0, 0); // Scroll to top of page
    }
  });
  pagination.append(prevBtn);

  // Calculate which page numbers to show
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Show first page if not in visible range
  if (startPage > 1) {
    const page1 = $(`<button>1</button>`);
    page1.on("click", () => {
      currentPage = 1;
      updateDisplay();
      window.scrollTo(0, 0);
    });
    pagination.append(page1);

    // Show dots if there's a gap
    if (startPage > 2) {
      pagination.append('<span class="pagination-dots">...</span>');
    }
  }

  // Show page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = $(
      `<button class="${i === currentPage ? "active" : ""}">${i}</button>`
    );
    pageBtn.on("click", function () {
      const page = parseInt($(this).text());
      currentPage = page;
      updateDisplay();
      window.scrollTo(0, 0);
    });
    pagination.append(pageBtn);
  }

  // Show last page if not in visible range
  if (endPage < totalPages) {
    // Show dots if there's a gap
    if (endPage < totalPages - 1) {
      pagination.append('<span class="pagination-dots">...</span>');
    }

    const lastPage = $(`<button>${totalPages}</button>`);
    lastPage.on("click", () => {
      currentPage = totalPages;
      updateDisplay();
      window.scrollTo(0, 0);
    });
    pagination.append(lastPage);
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

// CART MANAGEMENT
/**
 * Load shopping cart from localStorage
 * Runs when page loads to restore cart
 */
function loadCart() {
  try {
    const savedCart = localStorage.getItem("lumina_cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartCount();
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = [];
  }
}

/**
 * Update cart count badge in header
 * Shows total number of items in cart
 */
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = $(".cart-count");

  if (cartCountElement.length) {
    cartCountElement.text(totalItems);
  }
}

// EVENT LISTENERS
/**
 * Set up all event listeners when page loads
 */
$(document).ready(function () {
  // Load products on page load
  loadAllProducts();
  // Load cart from localStorage
  loadCart();

  // When category filter checkboxes change
  $(document).on("change", ".category-filter", applyFilters);

  // When sort dropdown changes
  $(document).on("change", "#sort-select", function () {
    currentSort = $(this).val();
    applyFilters();
  });

  // When "Apply" button clicked for price filter
  $("#apply-price").on("click", applyFilters);

  // When Enter key pressed in price inputs
  $("#min-price, #max-price").on("keypress", function (e) {
    if (e.which === 13) {
      // 13 is Enter key
      applyFilters();
    }
  });

  // Toggle filter sections open/closed
  $(".filter-header").on("click", function () {
    $(this).toggleClass("collapsed");
    $(this).next(".filter-options").slideToggle(200);
  });
});
