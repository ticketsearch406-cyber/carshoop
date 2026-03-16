const API_URL = 'https://fastapi-i7hh.onrender.com/api/products';
const ORDERS_URL = 'https://fastapi-i7hh.onrender.com/api/orders';

let products = []; 
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM элементы
const productsGrid = document.getElementById('productsGrid');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

// Авторизация элементы
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeAuth = document.getElementById('closeAuth');
const toggleAuth = document.getElementById('toggleAuth');
const regFields = document.getElementById('regFields');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');

// Checkout элементы
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const summaryItems = document.getElementById('summaryItems');
const summaryTotal = document.getElementById('summaryTotal');
const backToCart = document.getElementById('backToCart');

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCart();
    checkAuthStatus();

    cartBtn.onclick = () => { cartModal.style.display = 'block'; };
    closeCart.onclick = () => { cartModal.style.display = 'none'; };
    checkoutBtn.onclick = startCheckout;

    loginBtn.onclick = handleLoginLogout;
    closeAuth.onclick = () => { authModal.style.display = 'none'; };
    
    toggleAuth.onclick = (e) => {
        e.preventDefault();
        const isLogin = authTitle.innerText === 'Вход';
        authTitle.innerText = isLogin ? 'Регистрация' : 'Вход';
        authSubmit.innerText = isLogin ? 'Создать аккаунт' : 'Войти';
        regFields.style.display = isLogin ? 'block' : 'none';
        toggleAuth.innerText = isLogin ? 'Войти' : 'Зарегистрироваться';
    };

    closeCheckout.onclick = () => { checkoutModal.style.display = 'none'; };
    backToCart.onclick = () => { 
        checkoutModal.style.display = 'none'; 
        cartModal.style.display = 'block'; 
    };
    checkoutForm.onsubmit = confirmOrder;

    categoryFilter.onchange = filterProducts;
    searchInput.oninput = filterProducts;

    window.onclick = (e) => {
        if (e.target === authModal) authModal.style.display = 'none';
        if (e.target === cartModal) cartModal.style.display = 'none';
        if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    };
});

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return; 

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✅ ${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- ЛОГИКА ТОВАРОВ ---

function renderSkeletons() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'product-card skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-img" style="height: 200px; background: #eee; border-radius: 8px; margin-bottom: 10px;"></div>
            <div class="skeleton-text" style="height: 20px; background: #eee; width: 80%; margin-bottom: 10px;"></div>
            <div class="skeleton-text" style="height: 20px; background: #eee; width: 40%; margin-bottom: 20px;"></div>
            <div class="skeleton-btn" style="height: 40px; background: #eee; border-radius: 8px;"></div>
        `;
        productsGrid.appendChild(skeleton);
    }
}

// Хелпер для перевода категорий
function getCategoryName(cat) {
    const names = {
        'engine': 'Двигатель',
        'brakes': 'Тормозная система',
        'suspension': 'Подвеска',
        'electrical': 'Электрика',
        'transmission': 'Трансмиссия',
        'cooling': 'Охлаждение',
        'filters': 'Фильтры'
    };
    return names[cat] || cat;
}

async function fetchProducts() {
    renderSkeletons(); 
    
    try {
        const [response] = await Promise.all([
            fetch(API_URL),
            new Promise(resolve => setTimeout(resolve, 1200)) 
        ]);

        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();
        
        // ОБНОВЛЕННЫЙ МАППИНГ: Добавляем specifications, originalPrice и featured
        products = data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
            image: p.image,
            description: p.description,
            featured: p.featured,
            specifications: p.specifications || []
        }));
        renderProducts(products);
    } catch (error) {
        console.error(error);
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #e74c3c;">Ошибка загрузки товаров. Проверьте подключение к серверу.</p>
                    <button onclick="fetchProducts()" style="margin-top: 15px; padding: 10px 20px; cursor: pointer;">Попробовать снова</button>
                </div>`;
        }
    }
}

function renderProducts(list) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (list.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Товары не найдены</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        // Добавляем класс 'featured' если товар помечен как Хит
        card.className = `product-card loaded ${product.featured ? 'featured' : ''}`; 
        
        card.innerHTML = `
            ${product.featured ? '<div class="product-badge">Хит</div>' : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <h3>${product.name}</h3>
            <div class="product-description">${product.description || ''}</div>
            
            <div class="product-specs">
                <h4>Характеристики:</h4>
                <ul>
                    ${product.specifications && product.specifications.length > 0 
                        ? product.specifications.map(s => `<li>${s}</li>`).join('') 
                        : '<li>Уточняйте у менеджера</li>'}
                </ul>
            </div>

            <div class="product-price">
                ${product.originalPrice ? `<span class="original-price">${product.originalPrice} руб.</span>` : ''}
                <span class="current-price">${product.price} руб.</span>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">В корзину</button>
        `;
        productsGrid.appendChild(card);
    });
}

// --- КОРЗИНА ---

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart(); 
    showToast(`"${product.name}" добавлен в корзину`);
}

window.updateQuantity = function(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
};

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const totalCount = cart.reduce((s, i) => s + i.quantity, 0);
    if (cartCount) cartCount.innerText = totalCount;

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Корзина пуста</p>';
            cartTotal.innerText = '0';
            return;
        }

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${item.image}" height="150" width="150" style="object-fit: contain;">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price} руб. × ${item.quantity} = ${item.price * item.quantity} руб.</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})" style="margin-left: 15px; color: #e74c3c; border: none; background: none; cursor: pointer;">Удалить</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    const totalSum = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if (cartTotal) cartTotal.innerText = totalSum;
}

// --- ОФОРМЛЕНИЕ ЗАКАЗА ---

function startCheckout() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Для оформления заказа необходимо войти в аккаунт');
        authModal.style.display = 'flex';
        return;
    }
    if (cart.length === 0) return alert('Корзина пуста');
    
    const firstNameInput = document.getElementById('firstName');
    const emailInput = document.getElementById('email');

    if (firstNameInput && user.username) firstNameInput.value = user.username;
    if (emailInput && user.email) emailInput.value = user.email;

    cartModal.style.display = 'none';
    checkoutModal.style.display = 'flex';
    
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    summaryItems.innerText = total + ' руб.';
    summaryTotal.innerText = total + ' руб.';
}

async function confirmOrder(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const addressValue = `${document.getElementById('city').value}, ${document.getElementById('address').value}`;

    try {
        for (const item of cart) {
            const orderData = {
                user_id: user.id,
                product_name: item.name,
                quantity: item.quantity,
                total_price: item.price * item.quantity,
                address: addressValue
            };

            const response = await fetch(ORDERS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Ошибка сервера');
        }

        alert('Заказ успешно оформлен!');
        cart = [];
        updateCart();
        checkoutModal.style.display = 'none';
        
    } catch (error) {
        console.error(error);
        alert('Произошла ошибка при сохранении заказа');
    }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ---

function filterProducts() {
    const cat = categoryFilter.value;
    const search = searchInput.value.toLowerCase();
    const filtered = products.filter(p => 
        (cat === 'all' || p.category === cat) && 
        p.name.toLowerCase().includes(search)
    );
    renderProducts(filtered);
}

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const loginBtnText = document.getElementById('loginBtnText');
        if (loginBtnText) loginBtnText.innerText = 'Выход';
    }
}

function handleLoginLogout() {
    const user = localStorage.getItem('user');
    if (user) {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('user');
            location.reload();
        }
    } else {
        authModal.style.display = 'flex';
    }
}