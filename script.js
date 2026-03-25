const API_URL = '/api/products';
const AUTH_URL = '/api/auth';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterCategory = document.getElementById('filterCategory');
const filterSort = document.getElementById('filterSort');

const sellBtn = document.getElementById('sellBtn');
const sellHeroBtn = document.querySelector('.btn-sell-hero');
const sellModal = document.getElementById('sellModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const sellForm = document.getElementById('sellForm');

const searchInput = document.getElementById('searchInput');

// Auth DOM
const loginBtn = document.getElementById('loginBtn');
const profileBtn = document.getElementById('profileBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleLink = document.getElementById('authToggleLink');
const authToggleText = document.getElementById('authToggleText');

// State
let products = []; // will be loaded from backend
let currentUser = null;
let isLoginMode = true;

// On load, check LocalStorage for user session
if (localStorage.getItem('retech_user')) {
    currentUser = JSON.parse(localStorage.getItem('retech_user'));
    updateNavForUser();
}

function updateNavForUser() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        profileBtn.style.display = 'none';
    }
}

// Fetch from backend
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            products = await response.json();
            applyFilters();
        } else {
            productGrid.innerHTML = '<p class="error-msg">Failed to load products from server.</p>';
        }
    } catch (error) {
        productGrid.innerHTML = '<p class="error-msg">Cannot connect to the backend server. Make sure it is running on port 3000!</p>';
        products = []; // Fallback to empty if it fails
    }
}

// Functions
function renderProducts(productsToRender) {
    productGrid.innerHTML = '';

    if (productsToRender.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-card';
        // Open details on click
        productEl.addEventListener('click', (e) => {
            if (!e.target.closest('.product-like-btn')) {
                openProductDetails(product);
            }
        });
        
        productEl.innerHTML = `
            <div class="product-image-container">
                <div class="product-badge">${product.condition}</div>
                <img src="${product.imagePath}" alt="${product.title}" class="product-image">
                <button class="product-like-btn" aria-label="Like">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <div class="product-meta">
                    <span class="product-location">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${product.location}
                    </span>
                    <span class="product-time">${product.postedAt}</span>
                </div>
                <div class="product-footer">
                    <span class="seller-info">By ${product.seller}</span>
                    <button class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.85rem;">View</button>
                </div>
            </div>
        `;
        productGrid.appendChild(productEl);
    });
}

function applyFilters() {
    let filtered = [...products];

    // Search Query
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(query));
    }

    // Category Filter
    const category = filterCategory.value;
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    // Sort Filter
    const sort = filterSort.value;
    if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } // 'newest' relies on default mockup order in this simple implementation

    renderProducts(filtered);
}

// Event Listeners for Filters
filterCategory.addEventListener('change', applyFilters);
filterSort.addEventListener('change', applyFilters);

// Category Cards in Hero section
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        filterCategory.value = category;
        applyFilters();

        // Scroll to marketplace
        document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' });
    });
});

// Modal Logic - Sell
function openSellModal() {
    if (!currentUser) {
        openLoginModal();
        showToast("Please login first to list an item.", "info");
        return;
    }
    sellModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSellModal() {
    sellModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Modal Logic - Login
function openLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    isLoginMode = true;
    updateAuthUI();
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateAuthUI() {
    authTitle.textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
    authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
    authToggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    authToggleLink.textContent = isLoginMode ? "Sign Up" : "Login";
}

// Modal Logic - Details
function openProductDetails(product) {
    document.getElementById('detailImg').src = product.imagePath;
    document.getElementById('detailTitle').textContent = product.title;
    document.getElementById('detailPrice').textContent = "$" + product.price;
    document.getElementById('detailDesc').textContent = product.description || "No description provided.";
    document.getElementById('detailCondition').textContent = product.condition;
    document.getElementById('detailLocation').textContent = product.location;
    document.getElementById('detailSeller').textContent = product.seller;
    
    productDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductDetails() {
    productDetailModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Modal Logic - Profile
function openProfileModal() {
    profileModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderProfileListings();
}

function closeProfileModal() {
    profileModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderProfileListings() {
    const container = document.getElementById('profileListings');
    const myProducts = products.filter(p => p.seller === currentUser.username);
    
    if (myProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem 0;">You have no active listings.</p>';
        return;
    }
    
    container.innerHTML = myProducts.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--light-muted); border-radius: var(--radius-sm); margin-bottom: 1rem;">
            <div>
                <h4 style="margin-bottom: 0.25rem;">${p.title}</h4>
                <div style="color: var(--primary); font-weight: bold;">$${p.price}</div>
            </div>
            <button class="btn btn-outline" style="border-color: var(--error); color: var(--error); padding: 0.25rem 0.75rem;" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
    `).join('');
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
        const res = await fetch(API_URL + '/' + id, { method: 'DELETE' });
        if (res.ok) {
            products = products.filter(p => p.id !== id);
            renderProfileListings();
            applyFilters();
            showToast("Listing deleted cleanly.", "success");
        }
    } catch (e) {
        showToast("Error deleting item.", "info");
    }
}

// Event Listeners for Filters
searchInput.addEventListener('input', applyFilters);
filterCategory.addEventListener('change', applyFilters);
filterSort.addEventListener('change', applyFilters);

sellBtn.addEventListener('click', openSellModal);
sellHeroBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSellModal();
});
closeModalBtn.addEventListener('click', closeSellModal);
closeLoginModalBtn.addEventListener('click', closeLoginModal);
closeDetailModalBtn.addEventListener('click', closeProductDetails);
profileBtn.addEventListener('click', openProfileModal);
closeProfileModalBtn.addEventListener('click', closeProfileModal);

logoutProfileBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('retech_user');
    updateNavForUser();
    closeProfileModal();
    showToast("Logged out successfully");
});

// Close modals when clicking completely outside content
window.addEventListener('click', (e) => {
    if (e.target === sellModal) closeSellModal();
    if (e.target === loginModal) closeLoginModal();
});

// Toggle Auth Mode
authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    updateAuthUI();
});

// Handle Login Button
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/login' : '/register';
    const payload = {
        username: document.getElementById('authUsername').value.trim(),
        password: document.getElementById('authPassword').value.trim()
    };

    if (!payload.username || !payload.password) {
        showToast("Please fill in both fields.", "info");
        return;
    }

    try {
        const res = await fetch(AUTH_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = data; // Set state
            localStorage.setItem('retech_user', JSON.stringify(data)); // Save to storage
            updateNavForUser();
            closeLoginModal();
            authForm.reset();
            showToast(isLoginMode ? `Welcome back, ${data.username}!` : "Account created successfully! You are now logged in.");
        } else {
            showToast(data.error || "Authentication failed.", "info");
        }
    } catch (err) {
        showToast("Network error. Is the backend running?", "info");
    }
});

// Toast Notification System
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Choose icon based on type
    const iconPath = type === 'success'
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';

    toast.innerHTML = `
        <span class="toast-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>
        </span>
        <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 3500);
}

// Form Submission (Backend Connected)
sellForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate inputs for user friendliness
    const titleVal = document.getElementById('itemTitle').value;
    const priceVal = document.getElementById('itemPrice').value;

    if (!titleVal || !priceVal) {
        showToast("Please fill in all required fields.", "info");
        return;
    }

    // Build the payload
    const newItem = {
        title: titleVal,
        price: parseInt(priceVal),
        description: document.getElementById('itemDescription').value,
        category: document.getElementById('itemCategory').value,
        condition: document.getElementById('itemCondition').value,
        location: document.getElementById('itemLocation').value,
        seller: currentUser.username // User actual logged in username
    };

    // Send POST request to backend
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            const savedItem = await response.json();
            
            // Add new item to state on frontend so we don't have to fully reload
            products.unshift(savedItem); 
            
            // Reset form and UI
            sellForm.reset();
            closeSellModal();
            filterCategory.value = 'all'; // Reset filter to show all
            applyFilters();

            // Small user-friendly toast instead of blocking alert
            showToast("Your item was listed successfully! 🚀");

            // Scroll to top of marketplace to see item
            setTimeout(() => {
                document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        } else {
            showToast("Failed to list item. Server error.", "info");
        }
    } catch (err) {
        showToast("Failed to list item. Make sure the backend server is running.", "info");
    }
});


// Init by fetching data
fetchProducts();
