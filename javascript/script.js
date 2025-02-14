const tablebody = document.getElementById("product-table");
const button1 = document.getElementById("btn");
const addProduct = document.querySelector(".add-product");
const inputContainer = document.querySelector(".input-container");
const buttonContainer = document.querySelector(".button-container");
const addButton = document.createElement("button");
const updateButton = document.createElement("button");

const deletePopup = document.getElementById("delete-popup");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

addButton.innerText = "Add Product";
updateButton.innerText = "Update Product";

addButton.classList.add("add-btn");
updateButton.classList.add("update-btn");

addButton.style.display = "none";
updateButton.style.display = "none";

buttonContainer.appendChild(addButton);
buttonContainer.appendChild(updateButton);

let editingProductId = null;

const modal = document.createElement("div");
modal.classList.add("image-modal");
modal.style.display = "none";

const modalImage = document.createElement("img");
modalImage.classList.add("modal-image");

modal.appendChild(modalImage);
document.body.appendChild(modal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

document.querySelector(".close-modal").addEventListener("click", () => {
    addProduct.style.display = "none";
    addButton.style.display = "none";
    updateButton.style.display = "none";
    clearForm();
});

document.getElementById("reset-btn").addEventListener("click",(event)=>{
    event.preventDefault();
    clearForm();
});

// Fetching API
async function fetchData(url, method = "GET", data = null) {
    try {
        const options = { 
            method, 
            headers: { "Content-Type": "application/json" }
        };
        if (data) options.body = JSON.stringify(data);

        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        return await res.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

// Fetch all products
async function fetchAllProducts() {
    const products = await fetchData("https://fakestoreapi.com/products");
    if (products) {
        tablebody.innerHTML = "";
        products.forEach(product => renderProductRow(product));
    }
}

fetchAllProducts();

// Fetch single product
async function fetchSingleProduct(productId) {
    if (!productId) {
        fetchAllProducts();
        return;
    }
    const product = await fetchData(`https://fakestoreapi.com/products/${productId}`);
    
    if (product) {
        tablebody.innerHTML = "";
        renderProductRow(product);
    } else {
        console.warn("Product not found. Showing all products.");
        fetchAllProducts(); 
    }
}

button1.addEventListener("click", () => {
    const productId = document.getElementById("inputs").value.trim();
    fetchSingleProduct(productId);
});

//fetch the categories
function fetchCategories(){
    fetch("https://fakestoreapi.com/products/categories")
    .then(res=> res.json())
    .then(categories =>{
        const categoryDropdown=document.getElementById("category");
        categoryDropdown.innerHTML = `<option value="">Select Category</option>`;
        categories.forEach(category=>{
            categoryDropdown.innerHTML += `<option value="${category}">${category}</option>`;
        });
    })
    .catch(error => console.error("Error fetching categories:", error));
}
fetchCategories();

//renderProductRow
function renderProductRow(product) {
    const row = document.createElement("tr");
    
    const titleDesc = product.title.length > 30 ? product.title.slice(0, 30) + "..." : product.title;
    const shortDescription = product.description.length > 50 
        ? product.description.slice(0, 50) + "..." 
        : product.description;
    
    row.innerHTML = `
        <td>${product.id}</td>
        <td>${titleDesc}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td><img src="${product.image}" class="product-image" width="50"></td>
        <td>${shortDescription}</td>
        <td>
            <button class="add-new-btn">Add Product</button>
            <button class="edit-btn">Update</button>
            <button class="delete-btn">Delete</button>
            
        </td>`;
    
    tablebody.appendChild(row);
    
    row.querySelector(".product-image").addEventListener("click", () => {
        modalImage.src = product.image;
        modal.style.display = "flex"; 
    });

    row.querySelector(".edit-btn").addEventListener("click", () => editProduct(product, row));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id, row));
    row.querySelector(".add-new-btn").addEventListener("click", () => showAddProductForm());
}

// Adding a new product
async function addNewProduct() {
    const newProduct = getProductFromForm();
    if (!newProduct) return;

    const product = await fetchData("https://fakestoreapi.com/products", "POST", newProduct);
    if (product) {
        product.id = Math.floor(Math.random() * 10000); 
        renderProductRow(product);
        clearForm();
        addProduct.style.display = "none";
    }
}
addButton.addEventListener("click", addNewProduct);


// Updating a product
async function updateProduct() {
    if (!editingProductId) {
        alert("No product selected for update");
        return;
    }

    const updatedProduct = getProductFromForm();
    if (!updatedProduct) return;

    const product = await fetchData(`https://fakestoreapi.com/products/${editingProductId}`, "PUT", updatedProduct);
    if (product) {
        updateProductInTable(product);
        clearForm();
        addProduct.style.display = "none";
        addButton.style.display = "none";
        updateButton.style.display = "none";
        editingProductId = null;
    }
}
updateButton.addEventListener("click", updateProduct);


// Deleting a product
let productToDelete = null;
let rowToDelete = null;

function deleteProduct(productId, row) {
    productToDelete = productId;
    rowToDelete = row;
    deletePopup.style.display = "flex"; 
}

confirmDeleteBtn.addEventListener("click", async () => {
    const response = await fetchData(`https://fakestoreapi.com/products/${productToDelete}`, "DELETE");
    
    if (response) {
        rowToDelete.remove(); 
    } else {
        console.warn("Failed to delete from API, removing from UI.");
        rowToDelete.remove(); 
    }

    deletePopup.style.display = "none"; 
    fetchAllProducts(); 
});

cancelDeleteBtn.addEventListener("click", () => {
    deletePopup.style.display = "none"; 
});



function editProduct(product, row) {
    editingProductId = product.id;
    document.getElementById("id").value = product.id;
    document.getElementById("title").value = product.title;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;
    document.getElementById("image").value = product.image;
    document.getElementById("description").value = product.description;

    document.querySelector(".add-product h2").innerText = "Update Product";
    addProduct.style.display = "block";
    addButton.style.display = "none";
    updateButton.style.display = "block";
}

function getProductFromForm() {
    const titleInput = document.getElementById("title").value;
    const priceInput = document.getElementById("price").value;
    const categoryInput = document.getElementById("category").value;
    const imageInput = document.getElementById("image").value;
    const descriptionInput = document.getElementById("description").value;

    if (!titleInput || !priceInput || !categoryInput || !imageInput || !descriptionInput) {
        alert("Please fill all the fields");
        return null;
    }
    return { title: titleInput, price: priceInput, category: categoryInput, image: imageInput, description: descriptionInput };
}

function clearForm() {
    document.querySelectorAll(".add-product input, .add-product textarea").forEach(input => input.value = "");
    document.getElementById("category").value="";
}

// Updates the product in the table
function updateProductInTable(updatedProduct) {
    const rows = tablebody.querySelectorAll("tr");
    rows.forEach(row => {
        if (row.children[0].innerText == updatedProduct.id) {
            row.children[1].innerText = updatedProduct.title;
            row.children[2].innerText = updatedProduct.price;
            row.children[3].innerText = updatedProduct.category;
            row.children[4].querySelector("img").src = updatedProduct.image;
            row.children[5].innerText = updatedProduct.description;
        }
    });
}

// Show add product form
function showAddProductForm() {
    clearForm();
    document.querySelector(".add-product h2").innerText = "Add New Product";
    addProduct.style.display = "block";
    addButton.style.display = "block";
    updateButton.style.display = "none";
}
