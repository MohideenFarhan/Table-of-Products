const tablebody = document.getElementById("product-table");
const button1 = document.getElementById("btn");
const addProduct = document.querySelector(".add-product");
const inputContainer = document.querySelector(".input-container");
const addButton = document.querySelector("#add-btn");
const updateButton = document.createElement("button");

updateButton.innerText = "Update Product";
updateButton.classList.add("update-btn");
updateButton.style.display = "none";
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
        .then(product => {
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
                <td><img src="${product.image}"class="product-image" width="50"></td>
                <td>${shortDescription}</td>
                <td>
                    <button class="add-New">Add Product</button>
                    <button class="edit-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </td>`;

            tablebody.appendChild(row);

            
            row.querySelector(".product-image").addEventListener("click", () => {
                modalImage.src = product.image;
                modal.style.display = "flex"; 
            });


            row.querySelector(".add-New").addEventListener("click", () => {
                tablebody.innerHTML = ""; 
                addProduct.style.display = "block";
                inputContainer.style.display = "none";
            });

            row.querySelector(".edit-btn").addEventListener("click", () => {
                editingProductId = product.id;
                document.getElementById("id").value = product.id;
                document.getElementById("title").value = product.title;
                document.getElementById("price").value = product.price;
                document.getElementById("category").value = product.category;
                document.getElementById("image").value = product.image;
                document.getElementById("description").value = product.description;

                addProduct.style.display = "block";
                addButton.style.display = "none";
                updateButton.style.display = "block";

            });

            
            row.querySelector(".delete-btn").addEventListener("click", () => {
                deleteProduct(product.id, row);
            });

        })
        .catch(error => console.error("Error fetching product:", error));
});

// Adding a new product
addButton.addEventListener("click", () => {
    const titleInput = document.getElementById("title").value;
    const priceInput = document.getElementById("price").value;
    const categoryInput = document.getElementById("category").value;
    const imageInput = document.getElementById("image").value;
    const descriptionInput = document.getElementById("description").value;

    if (!titleInput || !priceInput || !categoryInput || !imageInput || !descriptionInput) {
        alert("Please fill all the fields");
        return;
    }

    const newProduct = {
        title: titleInput,
        price: priceInput,
        category: categoryInput,
        image: imageInput,
        description: descriptionInput
    };

    fetch("https://fakestoreapi.com/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then((product) => {

        const row = document.createElement("tr");

        const titleDesc = newProduct.title.length > 30 ? newProduct.title.slice(0, 30) + "..." : newProduct.title;
        const shortDescription = newProduct.description.length > 50 
            ? newProduct.description.slice(0, 50) + "..." 
            : newProduct.description;

        row.innerHTML = `
            <td>NEW</td>  
            <td>${titleDesc}</td>
            <td>${newProduct.price}</td>
            <td>${newProduct.category}</td>
            <td><img src="${newProduct.image}" width="50"></td>
            <td>${shortDescription}</td>
            <td>
                <button class="edit-btn">Update</button>
                <button class="delete-btn">Delete</button>
            </td>`;

        tablebody.appendChild(row);

        row.querySelector(".edit-btn").addEventListener("click", () => {
            editingProductId = product.id;
            document.getElementById("id").value = product.id;
            document.getElementById("title").value = product.title;
            document.getElementById("price").value = product.price;
            document.getElementById("category").value = product.category;
            document.getElementById("image").value = product.image;
            document.getElementById("description").value = product.description;

            addProduct.style.display = "block";
            addButton.style.display = "none";
            updateButton.style.display = "block";
        });

        row.querySelector(".delete-btn").addEventListener("click", () => {
            deleteProduct(product.id, row);
        });

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

    const updatedProduct = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        category: document.getElementById("category").value,
        image: document.getElementById("image").value,
        description: document.getElementById("description").value
    };

    fetch(`https://fakestoreapi.com/products/${editingProductId}`, {
        method: "PUT",
        body: JSON.stringify(updatedProduct),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then((updatedProduct) => {

        const rows = tablebody.getElementsByTagName("tr");
        for (let row of rows) {
            if (row.cells[0].innerText == editingProductId) {
                row.cells[1].innerText = updatedProduct.title;
                row.cells[2].innerText = updatedProduct.price;
                row.cells[3].innerText = updatedProduct.category;
                row.cells[4].innerHTML = `<img src="${updatedProduct.image}" width="50">`;
                row.cells[5].innerText = updatedProduct.description;
                break;
            }
        }

        clearForm();
        addProduct.style.display = "none";
        addButton.style.display = "block";
        updateButton.style.display = "none";
        editingProductId = null;
    })
    .catch(error => console.error("Error updating product:", error));
});

// Deleting a product
function deleteProduct(productId, row) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    fetch(`https://fakestoreapi.com/products/${productId}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(() => {
        row.remove(); 
    })
    .catch(error => console.error("Error deleting product:", error));
}

function clearForm() {
    document.getElementById("id").value = "";
    document.getElementById("title").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";
}
