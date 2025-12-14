// ========================================
// CART MANAGEMENT
// ========================================

// Initialize empty cart array to store products
let cart = [];

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

/**
 * Handle search input from the search bar
 */
function handleSearch() {
  const searchInput = $(".search-bar");

  // Check if search input exists
  if (searchInput.length === 0) {
    console.log("Search input not found");
    return;
  }

  const searchQuery = searchInput.val().trim();

  if (searchQuery) {
    // Redirect to ListProduct page with search query parameter
    window.location.href = `ListProduct.html?search=${encodeURIComponent(
      searchQuery
    )}`;
  }
}

/**
 * Initialize search bar functionality
 */
function initializeSearch() {
  const searchInput = $(".search-bar");

  if (searchInput.length === 0) {
    console.warn("Search input element not found in DOM");
    return;
  }

  console.log("Search input found, initializing...");

  // Handle Enter key press in search input
  searchInput.on("keypress", function (e) {
    if (e.which === 13) {
      // Enter key
      e.preventDefault();
      console.log("Enter key pressed");
      handleSearch();
    }
  });

  // Optional: Handle click on search icon
  $(".search-icon").on("click", function () {
    handleSearch();
  });

  console.log("Search functionality initialized successfully");
}

// ========================================
// LOAD SHOPPING CART FROM BROWSER STORAGE
// ========================================

/**
 * Load shopping cart data from localStorage
 * This runs when the page loads to restore the user's cart
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

// ========================================
// UPDATE CART COUNT BADGE
// ========================================

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

// ========================================
// TEAM MEMBER MODAL FUNCTIONALITY
// ========================================

/**
 * Show detailed information about team members
 * This creates a modal popup with more details
 */
function showTeamMemberDetails(memberName) {
  // Team member details data
  const teamDetails = {
    "Steve Banh": {
      name: "Steve Banh",
      position: "CEO & Founder",
      bio: "Steve founded LUMINA with a vision to revolutionize online shopping. With over 15 years of experience in e-commerce, he leads the company with passion and innovation.",
      email: "steve.banh@lumina.com",
    },
    "Luca Rag": {
      name: "Luca Rag",
      position: "Lead Designer",
      bio: "Luca brings creativity and elegance to every aspect of LUMINA's design. With a background in user experience and visual design, he ensures our platform is both beautiful and intuitive.",
      email: "luca.rag@lumina.com",
    },
    "Emily Davis": {
      name: "Emily Davis",
      position: "Head of Marketing",
      bio: "Emily drives LUMINA's marketing strategy with innovative campaigns and customer engagement initiatives. Her expertise in digital marketing has helped grow our brand significantly.",
      email: "emily.davis@lumina.com",
    },
  };

  const member = teamDetails[memberName];

  if (!member) {
    console.error("Team member not found:", memberName);
    return;
  }

  // Create modal HTML
  const modalHTML = `
    <div class="team-modal-overlay">
      <div class="team-modal">
        <button class="modal-close">&times;</button>
        <h2>${member.name}</h2>
        <h3>${member.position}</h3>
        <p class="bio">${member.bio}</p>
        <p class="email"><strong>Contact:</strong> ${member.email}</p>
      </div>
    </div>
  `;

  // Add modal to page
  $("body").append(modalHTML);

  // Add CSS for modal if not already added
  if (!$("#team-modal-style").length) {
    $("head").append(`
      <style id="team-modal-style">
        .team-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .team-modal {
          background: white;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #666;
          transition: color 0.3s;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #000;
        }

        .team-modal h2 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #333;
        }

        .team-modal h3 {
          font-size: 18px;
          color: #666;
          margin-bottom: 25px;
          font-weight: 400;
        }

        .team-modal .bio {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin-bottom: 20px;
        }

        .team-modal .email {
          font-size: 14px;
          color: #666;
        }

        .team-modal .email strong {
          color: #333;
        }
      </style>
    `);
  }

  // Close modal when clicking close button or overlay
  $(".modal-close, .team-modal-overlay").on("click", function (e) {
    if (
      e.target === this ||
      $(e.target).hasClass("modal-close") ||
      $(e.target).parent().hasClass("modal-close")
    ) {
      $(".team-modal-overlay").fadeOut(300, function () {
        $(this).remove();
      });
    }
  });

  // Close modal on Escape key
  $(document).on("keydown.modal", function (e) {
    if (e.key === "Escape") {
      $(".team-modal-overlay").fadeOut(300, function () {
        $(this).remove();
      });
      $(document).off("keydown.modal");
    }
  });
}

// ========================================
// INITIALIZE PAGE WHEN DOM IS READY
// ========================================

/**
 * Run when the page has finished loading
 * Initializes search, cart, and team member interactions
 */
$(document).ready(function () {
  console.log("About page loaded");

  // Initialize search functionality
  initializeSearch();

  // Load cart from localStorage
  loadCart();

  // Add click handlers to "Learn More" buttons
  $(".learn-more").on("click", function () {
    // Get the team member name from the card
    const memberName = $(this).siblings("h3").text();
    showTeamMemberDetails(memberName);
  });

  // Add smooth scroll to top when clicking logo
  $(".logo a").on("click", function (e) {
    if ($(this).attr("href") === "HomePage.html") {
      // Let it navigate normally
      return true;
    }
  });

  console.log("About page initialization complete");
});
