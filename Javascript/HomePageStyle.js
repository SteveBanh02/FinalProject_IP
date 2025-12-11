
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


//using jquery to simplify AJAX and XML parsing
// Function to fetch and process categories using jQuery
function getCategoriesJQuery() {
    const filePath = "/jsonFiles/categories.xml"; // **Ensure this path is correct!**

    // Use $.ajax for a robust request, or $.get for a simple GET request
    $.ajax({
        url: filePath,
        dataType: 'xml', // jQuery automatically handles the XML response type
        method: 'GET',
        
        success: function(xmlDoc) {
            // Success handler runs if the HTTP status is 200 (OK)
            // xmlDoc is already a parsed XML document object (jQuery wrapped)
            displayCategoryJQuery(xmlDoc);
        },
        
        error: function(jqXHR, textStatus, errorThrown) {
            // Error handler runs if the HTTP status is 4xx, 5xx, or network issues
            console.error("Error loading navigation or processing XML:", textStatus, errorThrown);
            console.error("Details:", jqXHR.responseText);
        }
    });
}

// Function to display categories using jQuery
function displayCategoryJQuery(xmlDoc) {
    // jQuery method to get the element by ID
    const $categoryNav = $('#category-nav');
    
    // jQuery's find() method to get all <category> tags from the parsed XML
    // The 'xmlDoc' here is a DOM object, so we use $(xmlDoc).find()
    const $categories = $(xmlDoc).find("category");

    // Use jQuery's .each() function to iterate through the found elements
    $categories.each(function() {
        const $category = $(this); // Wrap the current element in a jQuery object
        
        // Use .find() and .text() to easily get the content of the <name> tag
        const name = $category.find("name").text();

        // Create the nav link using a string and append it, or use jQuery chaining
        const $navLink = $('<a>')
            .attr('href', 'ListProduct.html')
            .text(name);

        // Append the new link to the category navigation container
        $categoryNav.append($navLink);
    });
}

const currentSlideIndex=0;
function changeSlider(changeSlides){
    
}

// Call the new function
$(document).ready(function() {
    getCategoriesJQuery();
});