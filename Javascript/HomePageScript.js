// CART MANAGEMENT
// Initialize empty cart array to store products
let cart = [];

// CATEGORY STYLES CONFIGURATION
// Define visual styles (emoji and gradient colors) for each product category
const categoryStyles = {
  Electronics: {
    emoji: "📱",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  "Home & Kitchen": {
    emoji: "🏠",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  "Sports & Outdoors": {
    emoji: "⚽",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  "Beauty & Personal Care": {
    emoji: "💄",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  "Toys & Games": {
    emoji: "🎮",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  Clothing: {
    emoji: "👕",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  },
  Automotive: {
    emoji: "🚗",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  "Office Supplies": {
    emoji: "📎",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  "Garden & Outdoors": {
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  "Pet Supplies": {
    emoji: "🐾",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
};

// SEARCH FUNCTIONALITY
/**
 * Handle search input and redirect to product list page with search query
 */
function handleSearch() {
  const searchInput = $("#search-input");
  const searchQuery = searchInput.val().trim(); // Get trimmed search query

  // Only proceed if search query is not empty
  if (searchQuery) {
    // Redirect to ListProduct page with search query parameter
    window.location.href = `ListProduct.html?search=${encodeURIComponent(
      searchQuery
    )}`;
  }
}

/**
 * Set up search bar event listeners
 */
function initializeSearch() {
  const searchInput = $("#search-input");

  // Handle Enter key press in search input
  searchInput.on("keypress", function (e) {
    // Check if Enter key (key code 13) is pressed
    if (e.which === 13) {
      // Enter key
      e.preventDefault();
      handleSearch();
    }
  });
}

// LOAD CATEGORIES FROM XML FILE
/**
 * Fetch categories from XML file using jQuery AJAX
 * This function loads the categories.xml file and processes it
 * on success or logs errors on failure
 */
function getCategoriesJQuery() {
  const filePath = "../jsonFiles/categories.xml";

  // Make AJAX request to fetch XML file
  $.ajax({
    url: filePath,
    dataType: "xml", // Specify that we're expecting XML data
    method: "GET",

    // Success callback - runs when XML is loaded successfully
    success: function (xmlDoc) {
      displayCategoryJQuery(xmlDoc);
    },

    // Error callback - runs if there's a problem loading the XML
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(
        "Error loading navigation or processing XML:",
        textStatus,
        errorThrown
      );
      console.error("Details:", jqXHR.responseText);
    },
  });
}

// POPULATE FOOTER WITH CATEGORIES
/**
 * Add category links to the footer section
 * Shows only the first 5 categories
 * @param {XMLDocument} xmlDoc - The loaded XML document containing categories
 */
function populateFooterCategories(xmlDoc) {
  const $footerCategories = $("#footer-categories");
  const $categories = $(xmlDoc).find("category");

  // Loop through first 5 categories only
  $categories.slice(0, 5).each(function () {
    const $category = $(this);
    const categoryName = $category.find("name").text();

    // Create clickable link for each category
    const $link = $("<a>")
      .attr("href", "#")
      .text(categoryName)
      .on("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        navigateToCategory(categoryName);
      });

    $footerCategories.append($link);
  });
}

// NAVIGATION TO PRODUCT LIST PAGE
/**
 * Navigate to the product list page with selected category
 * @param {string} categoryName - The name of the category to filter by
 */
function navigateToCategory(categoryName) {
  // Redirect to ListProduct.html with category as URL parameter
  window.location.href = `ListProduct.html?category=${encodeURIComponent(
    categoryName
  )}`;
}

// DISPLAY CATEGORY CARDS ON HOME PAGE
/**
 * Create and display category cards on the home page
 * Each card shows an emoji icon and gradient background
 * @param {XMLDocument} xmlDoc - The loaded XML document containing categories
 */
function displayCategoryJQuery(xmlDoc) {
  const $categoryNav = $(".categories-grid");
  const $categories = $(xmlDoc).find("category");

  // Loop through each category from XML
  $categories.each(function () {
    const $category = $(this);
    const categoryName = $category.find("name").text();

    // Get style for this category, or use default if not found
    const style = categoryStyles[categoryName] || {
      emoji: "📦",
      gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    };

    // Create HTML for category card with gradient background and emoji
    const card = `
      <a href="#" class="category-card-link" data-category="${categoryName}">
        <div class="category-card" style="background: ${style.gradient}">
          <div class="category-icon">${style.emoji}</div>
          <h3 class="category-name">${categoryName}</h3>
        </div>
      </a>
    `;

    $categoryNav.append(card);
  });

  // Add click event handler to all category cards
  $(".category-card-link").on("click", function (e) {
    e.preventDefault();
    const categoryName = $(this).data("category");
    navigateToCategory(categoryName);
  });

  // Also add categories to footer
  populateFooterCategories(xmlDoc);
}

// LOAD SHOPPING CART FROM BROWSER STORAGE
/**
 * Load shopping cart data from localStorage
 * This runs when the page loads to restore
 * the user's cart state
 */
function loadCart() {
  try {
    // Try to get cart data from localStorage
    const savedCart = localStorage.getItem("lumina_cart");

    if (savedCart) {
      // Parse JSON string back into array
      cart = JSON.parse(savedCart);
      // Update the cart count badge in header
      updateCartCount();
    }
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = []; // Reset to empty cart if there's an error
  }
}

// UPDATE CART COUNT BADGE
/**
 * Update the cart count badge in the header
 * Shows total number of items in cart
 */
function updateCartCount() {
  // Calculate total items by summing up all product quantities
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = $(".cart-count");

  // Update the badge text if element exists
  if (cartCountElement.length) {
    cartCountElement.text(totalItems);
  }
}

// CHECK USER LOGIN STATUS
/**
 * Check if a user is logged in by looking for user data in localStorage
 * If logged in, update the header to show user's name
 */
function checkUserLogin() {
  try {
    const userDataString = localStorage.getItem("lumina_user");
    if (userDataString) {
      const user = JSON.parse(userDataString);
      // Get user name from the user object
      const userName = user.name || user.email.split("@")[0];

      // Update the account link to point to UserPage
      $(".account a").attr("href", "UserPage.html");

      // Update the text to show user name instead of "Sign In"
      $(".account span").text(userName);

      console.log("Updated header for user:", userName); // Debug log
    } else {
      console.log("No user logged in"); // Debug log
    }
  } catch (error) {
    console.error("Error checking user login:", error);
  }
}

// INITIALIZE PAGE WHEN DOM IS READY
/**
 * Run when the page has finished loading
 * Initializes categories, cart, and search functionality
 */
$(document).ready(function () {
  getCategoriesJQuery(); // Load and display categories
  loadCart(); // Load cart from localStorage
  initializeSearch(); // Initialize search functionality
  checkUserLogin(); // Check if user is logged in
});
