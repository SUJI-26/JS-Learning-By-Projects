// Cake Data
const cakes = [
    {
        id: 1,
        name: "Chocolate Fudge",
        price: 500,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "Strawberry Delight",
        price: 300,
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "Vanilla Cake",
        price: 200,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        name: "Red Velvet",
        price: 350,
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        name: "Lemon Zest",
        price: 150,
        image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        name: "Carrot Cake",
        price: 200,
         image: "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=400&h=400&fit=crop"
    },
    {
        id: 7,
        name: "Black Forest",
        price: 800,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        name: "Coffee Cake",
        price: 300,
        image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=400&fit=crop"
    },
    {
        id: 9,
        name: "Blueberry Bliss",
        price: 600,
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop"
    }
];

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderMenu();
    renderCart();
    updateCartBadge();
    
    // Cart button click handler
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            cartModal.show();
        });
    }
    
    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Checkout button handler
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Thank you for your order! Your total is ₹' + calculateTotal().toFixed(2));
            cart = [];
            saveCart();
            renderCart();
            updateCartBadge();
            const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            cartModal.hide();
        });
    }
});

// Render Menu Section
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = cakes.map(cake => `
        <div class="col-md-4 col-sm-6">
            <div class="cake-card animate-slide-up">
                <img src="${cake.image}" alt="${cake.name}" class="cake-card-image">
                <div class="cake-card-body">
                    <h3 class="cake-card-title">${cake.name}</h3>
                    <p class="cake-card-price">₹${cake.price.toFixed(2)}</p>
                    <div class="cake-card-actions">
                        <button class="btn btn-buy-now" onclick="buyNow(${cake.id})">
                            <i class="fas fa-shopping-bag"></i> Buy Now
                        </button>
                        <button class="btn btn-add-cart" onclick="addToCart(${cake.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to Cart Function
function addToCart(cakeId) {
    const cake = cakes.find(c => c.id === cakeId);
    if (!cake) return;
    
    const existingItem = cart.find(item => item.id === cakeId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: cake.id,
            name: cake.name,
            price: cake.price,
            image: cake.image,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
    updateCartBadge();
    
    // Show animation feedback
    showNotification(`${cake.name} added to cart!`);
}

// Buy Now Function
function buyNow(cakeId) {
    const cake = cakes.find(c => c.id === cakeId);
    if (!cake) return;
    
    // Add to cart first
    addToCart(cakeId);
    
    // Open cart modal
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

// Remove from Cart
function removeFromCart(cakeId) {
    cart = cart.filter(item => item.id !== cakeId);
    saveCart();
    renderCart();
    updateCartBadge();
}

// Update Quantity
function updateQuantity(cakeId, change) {
    const item = cart.find(item => item.id === cakeId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(cakeId);
    } else {
        saveCart();
        renderCart();
        updateCartBadge();
    }
}

// Calculate Total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render Cart
function renderCart() {
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartBody || !cartTotal) return;
    
    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h5>Your cart is empty</h5>
                <p>Add some delicious cakes to your cart!</p>
            </div>
        `;
        cartTotal.textContent = '₹0.00';
        return;
    }
    
    cartBody.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    cartTotal.textContent = '₹' + calculateTotal().toFixed(2);
}

// Update Cart Badge
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (!cartBadge) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    if (totalItems > 0) {
        cartBadge.style.display = 'inline-block';
    } else {
        cartBadge.style.display = 'none';
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ff91a4, #ffb6c1);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        ">
            <i class="fas fa-check-circle"></i> ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// Add notification animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
