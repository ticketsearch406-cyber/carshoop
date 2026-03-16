// Данные товаров
const products = [
    {
        id: 1,
        name: "Масляный фильтр Bosch",
        category: "filters",
        price: 850,
        originalPrice: 1050,
        image: "https://cdn1.ozone.ru/s3/multimedia-p/6019611925.jpg",
        description: "Высококачественный масляный фильтр для эффективной очистки моторного масла.",
        specifications: ["Резьба: 3/4-16 UNF", "Высота: 110 мм", "Диаметр: 80 мм", "Клапан противодренажный: есть"],
        featured: false
    },
    {
        id: 2,
        name: "Тормозные колодки Brembo",
        category: "brakes",
        price: 4200,
        originalPrice: 5200,
        image: "https://www.access-honda.com/sitefiles/rawm/1000/Items/perednie-tormoznye-kolodki-brembo-22-eede4s.jpg",
        description: "Передние тормозные колодки с повышенной износостойкостью и отличными тормозными характеристиками.",
        specifications: ["Материал: керамический композит", "Толщина: 18 мм", "Совместимость: VW, Audi, Skoda", "Индикатор износа: есть"],
        featured: true
    },
    {
        id: 3,
        name: "Амортизатор KYB",
        category: "suspension",
        price: 3200,
        image: "https://kyb.ru/gi/573c9c90f94a7c983f13160a.jpg",
        description: "Газонаполненный амортизатор для комфортной езды и улучшенной управляемости.",
        specifications: ["Тип: газовый", "Ход штока: 210 мм", "Резьба: M10x1.25", "Производитель: Япония"],
        featured: false
    },
    {
        id: 4,
        name: "Свечи зажигания NGK",
        category: "engine",
        price: 1800,
        originalPrice: 2200,
        image: "https://main-cdn.sbermegamarket.ru/big1/hlr-system/-55/704/227/319/182/1/100022898180b0.jpg",
        description: "Иридиевые свечи зажигания для оптимального сгорания топлива и снижения расхода.",
        specifications: ["Калильное число: 7", "Зазор: 0.8 мм", "Резьба: M14x1.25", "Длина резьбы: 19 мм"],
        featured: true
    },
    {
        id: 5,
        name: "Аккумулятор Varta",
        category: "electrical",
        price: 8900,
        image: "https://katod-tula.ru/upload/iblock/8ad/hkisjfmuay51u98gp5xx3ri58feijzq3.webp",
        description: "Необслуживаемый аккумулятор с технологией AGM для современных автомобилей.",
        specifications: ["Емкость: 70 Ач", "Пусковой ток: 680 А", "Полярность: обратная", "Габариты: 278x175x190 мм"],
        featured: false
    },
    {
        id: 6,
        name: "Ремень ГРМ Gates",
        category: "engine",
        price: 2500,
        originalPrice: 3100,
        image: "https://sv-parts.ru/upload/iblock/996/vwbyi5dzbzn4ub8ren2u1etku004om4l/remen_grm_gates_vaz_2110_3.jpg",
        description: "Зубчатый ремень газораспределительного механизма с увеличенным сроком службы.",
        specifications: ["Количество зубьев: 147", "Ширина: 25 мм", "Материал: неопрен с кордом", "Срок службы: 120000 км"],
        featured: false
    }
];

// Состояние корзины
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

// Элементы авторизации
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const userMenu = document.getElementById('userMenu');
const menuUserName = document.getElementById('menuUserName');
const adminMenuLink = document.getElementById('adminMenuLink');
const logoutBtn = document.getElementById('logoutBtn');
const closeAuth = document.getElementById('closeAuth');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const regFields = document.getElementById('regFields');
const toggleAuth = document.getElementById('toggleAuth');
const toggleText = document.getElementById('toggleText');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCart();
    updateUserInterface();

    // Обработчики магазина
    if (cartBtn) cartBtn.onclick = openCart;
    if (closeCart) closeCart.onclick = closeCartModal;
    if (checkoutBtn) checkoutBtn.onclick = checkout;
    if (categoryFilter) categoryFilter.onchange = filterProducts;
    if (searchInput) searchInput.oninput = filterProducts;

    // Логика кнопки входа / профиля
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.stopPropagation();
            const savedUser = localStorage.getItem('user');
            
            if (savedUser) {
                // Если залогинен — показываем меню
                userMenu.style.display = (userMenu.style.display === 'none') ? 'block' : 'none';
            } else {
                // Если нет — открываем окно входа
                openAuth('login');
            }
        };
    }

    // Выход из аккаунта
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('user');
            window.location.reload();
        };
    }

    // Закрытие окон при клике вне их области
    window.onclick = (e) => {
        if (e.target === cartModal) closeCartModal();
        if (e.target === authModal) authModal.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
    };

    if (userMenu) userMenu.onclick = (e) => e.stopPropagation();
    if (closeAuth) closeAuth.onclick = () => authModal.style.display = 'none';

    // Переключение Вход / Регистрация
    if (toggleAuth) {
        toggleAuth.onclick = (e) => {
            e.preventDefault();
            const isLogin = authTitle.innerText === 'Вход';
            openAuth(isLogin ? 'reg' : 'login');
        };
    }

    // Имитация отправки формы (здесь будет ваш fetch на бэкенд)
    document.getElementById('authForm').onsubmit = (e) => {
        e.preventDefault();
        alert('Система авторизации будет подключена позже!');
        authModal.style.display = 'none';
    };
});

// --- ФУНКЦИИ ИНТЕРФЕЙСА ПОЛЬЗОВАТЕЛЯ ---

function updateUserInterface() {
    const savedUserJson = localStorage.getItem('user');
    if (savedUserJson) {
        const user = JSON.parse(savedUserJson);
        if (menuUserName) menuUserName.innerText = user.username;
        if (loginBtnText) loginBtnText.innerText = `👤 ${user.username}`;
        
        // Показываем админку только админу
        if (adminMenuLink) {
            adminMenuLink.style.display = (user.role === 'admin') ? 'block' : 'none';
        }
    }
}

function openAuth(mode) {
    authModal.style.display = 'flex';
    if (mode === 'reg') {
        authTitle.innerText = 'Регистрация';
        authSubmit.innerText = 'Создать аккаунт';
        regFields.style.display = 'block';
        toggleText.innerText = 'Уже есть аккаунт?';
        toggleAuth.innerText = 'Войти';
    } else {
        authTitle.innerText = 'Вход';
        authSubmit.innerText = 'Войти';
        regFields.style.display = 'none';
        toggleText.innerText = 'Нет аккаунта?';
        toggleAuth.innerText = 'Зарегистрироваться';
    }
}

// --- ФУНКЦИИ МАГАЗИНА ---

function renderProducts(productsToRender) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = `product-card ${product.featured ? 'featured' : ''}`;
        productCard.innerHTML = `
            ${product.featured ? '<div class="product-badge">Хит</div>' : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <div class="product-category">${getCategoryName(product.category)}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-specs">
                <h4>Характеристики:</h4>
                <ul>${product.specifications.map(spec => `<li>${spec}</li>`).join('')}</ul>
            </div>
            <div class="product-price">
                ${product.originalPrice ? `<span class="original-price">${product.originalPrice} руб.</span>` : ''}
                ${product.price} руб.
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

function getCategoryName(category) {
    const categories = {
        'engine': 'Двигатель', 'brakes': 'Тормозная система', 'suspension': 'Подвеска',
        'electrical': 'Электрика', 'transmission': 'Трансмиссия', 'cooling': 'Система охлаждения', 'filters': 'Фильтры'
    };
    return categories[category] || category;
}

function filterProducts() {
    const category = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = products.filter(p => {
        const catMatch = category === 'all' || p.category === category;
        const searchMatch = p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
        return catMatch && searchMatch;
    });
    renderProducts(filtered);
}

// --- КОРЗИНА ---

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const item = cart.find(i => i.id === productId);
    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCart();
    showNotification(`"${product.name}" в корзине`);
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        updateCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cartCount) cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    if (!cartItems) return;
    
    cartItems.innerHTML = cart.length === 0 ? '<p style="text-align: center;">Пусто</p>' : '';
    let total = 0;
    cart.forEach(item => {
        const sum = item.price * item.quantity;
        total += sum;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price} руб. x ${item.quantity}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">❌</button>
                </div>
            </div>`;
        cartItems.appendChild(div);
    });
    if (cartTotal) cartTotal.textContent = total;
}

function openCart() { cartModal.style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeCartModal() { cartModal.style.display = 'none'; document.body.style.overflow = 'auto'; }

function checkout() {
    if (cart.length === 0) return alert('Корзина пуста!');
    alert(`Заказ на сумму ${cartTotal.textContent} руб. оформлен!`);
    cart = [];
    updateCart();
    closeCartModal();
}

// --- УВЕДОМЛЕНИЯ ---

function showNotification(msg) {
    const n = document.createElement('div');
    n.className = 'notification-toast';
    n.textContent = msg;
    n.style.cssText = `position:fixed; top:100px; right:20px; background:#27ae60; color:white; padding:15px; border-radius:5px; z-index:9999; animation: slideIn 0.3s ease;`;
    document.body.appendChild(n);
    setTimeout(() => { n.remove(); }, 3000);
}

// Анимации
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
    .product-badge { position: absolute; background: red; color: white; padding: 5px; border-radius: 3px; }
`;
document.head.appendChild(animStyle);