const tablebody = document.getElementById("product-table");
const button1 = document.getElementById("btn");
const addProduct = document.querySelector(".add-product");
const inputContainer = document.querySelector(".input-container");
const addButton = document.createElement("button");
const updateButton = document.createElement("button");

addButton.innerText = "Add Product";
updateButton.innerText = "Update Product";

addButton.classList.add("add-btn");
updateButton.classList.add("update-btn");

addButton.style.display = "none";
updateButton.style.display = "none";

addProduct.appendChild(addButton);
addProduct.appendChild(updateButton);

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

// Fetch all products
fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(products => {
        tablebody.innerHTML = "";
        products.forEach(product => renderProductRow(product));
    })
    .catch(error => console.error("Error fetching all products:", error));

// Fetch single product
button1.addEventListener("click", () => {
    const inputs = document.getElementById("inputs").value;
    tablebody.innerHTML = "";

    if (inputs === "") {
        alert("Enter the Product ID");
        return;
    }

    fetch(`https://fakestoreapi.com/products/${inputs}`)
        .then(res => res.json())
        .then(product => renderProductRow(product))
        .catch(error => console.error("Error fetching product:", error));
});

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
addButton.addEventListener("click", () => {
    const newProduct = getProductFromForm();
    if (!newProduct) return;

    fetch("https://fakestoreapi.com/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(product => {
        renderProductRow(product);
        clearForm();
        addProduct.style.display = "none";
    })

    
    .catch(error => console.error("Error adding product:", error));
});

// Updating a product
updateButton.addEventListener("click", () => {
    if (!editingProductId) {
        alert("No product selected for update");
        return;
    }

    const updatedProduct = getProductFromForm();
    if (!updatedProduct) return;

    fetch(`https://fakestoreapi.com/products/${editingProductId}`, {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(updatedProduct => {
        updateProductInTable(updatedProduct);
        clearForm();
        addProduct.style.display = "none";
        addButton.style.display = "none";
        updateButton.style.display = "none";
        editingProductId = null;
    })
    .catch(error => console.error("Error updating product:", error));
});

// Deleting a product
function deleteProduct(productId, row) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(() => row.remove())
    .catch(error => console.error("Error deleting product:", error));
}

function editProduct(product, row) {
    editingProductId = product.id;
    document.getElementById("title").value = product.title;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;
    document.getElementById("image").value = product.image;
    document.getElementById("description").value = product.description;

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
    document.querySelectorAll(".add-product input").forEach(input => input.value = "");
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
    addProduct.style.display = "block";
    addButton.style.display = "block";
    updateButton.style.display = "none";
}
