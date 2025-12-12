// function getCategories() {
//     try {

//         //fetch categories from XML file and process them as needed
//         fetch("/jsonFiles/categories.xml").then((response) => {
//             return response.text();//interpret response as text
//         }).then((xmlData) => {
//             //create DOM parser object
//             const parser = new DOMParser();

//             //convert text to document object
//             const xmlDoc = parser.parseFromString(xmlData, "text/xml");

//             //display categories in navigation
//             displayCategory(xmlDoc);

//         });
//     } catch (error) {
//         console.error("Error loading navigation:", error);
//     }
// }

// function displayCategory(xmlDoc) {
//     //get element in html
//     const categoryNav = document.getElementById('category-nav');
//     const getCategoryXML = xmlDoc.querySelectorAll("category");//get all category tag from XML

//     for (let i = 0; i < getCategoryXML.length; i++) {
//         const category = getCategoryXML[i];
//         const name = category.querySelector("name").textContent;//get the name tag from XML

//         //create nav link for each category
//         const navLink = document.createElement('a');
//         navLink.href = "ListProduct.html";
//         navLink.textContent = name;

//         categoryNav.appendChild(navLink);
//     }
// }
// getCategories();

// Define styles for each category
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

// Function to fetch and process categories using jQuery
function getCategoriesJQuery() {
  const filePath = "../jsonFiles/categories.xml";

  $.ajax({
    url: filePath,
    dataType: "xml",
    method: "GET",

    success: function (xmlDoc) {
      displayCategoryJQuery(xmlDoc);
    },

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

// Function to populate footer categories
function populateFooterCategories(xmlDoc) {
  const $footerCategories = $("#footer-categories");
  const $categories = $(xmlDoc).find("category");

  // Limit to first 5 categories for the footer
  $categories.slice(0, 5).each(function () {
    const $category = $(this);
    const categoryName = $category.find("name").text();

    const $link = $("<a>").attr("href", "ListProduct.html").text(categoryName);

    $footerCategories.append($link);
  });
}

// Function to display categories using jQuery
function displayCategoryJQuery(xmlDoc) {
  const $categoryNav = $(".categories-grid");
  const $categories = $(xmlDoc).find("category");

  $categories.each(function () {
    const $category = $(this);
    const categoryName = $category.find("name").text();

    const style = categoryStyles[categoryName] || {
      emoji: "📦",
      gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    };

    const card = `
      <a href="ListProduct.html" class="category-card-link">
        <div class="category-card" style="background: ${style.gradient}">
          <div class="category-icon">${style.emoji}</div>
          <h3 class="category-name">${categoryName}</h3>
        </div>
      </a>
    `;

    $categoryNav.append(card);
  });

  // Also populate footer categories
  populateFooterCategories(xmlDoc);
}

$(document).ready(function () {
  getCategoriesJQuery();
});
