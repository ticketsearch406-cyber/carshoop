const API_BASE = 'https://fastapi-i7hh.onrender.com/api';
let products = [];

// Элементы управления
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');

// Запуск при загрузке
async function initAdmin() {
    await loadStats();
    await initOrdersChart();
    await loadProducts();
    await loadOrders();
    await loadUsers();
}


let ordersChart; // Переменная для хранения объекта графика

async function initOrdersChart() {
    try {
        // 1. Запрашиваем реальные данные из БД
        const res = await fetch(`${API_BASE}/admin/orders-stats`);
        if (!res.ok) throw new Error('Ошибка при загрузке статистики');
        
        const data = await res.json(); // Ожидаем { labels: [...], values: [...] }

        const ctx = document.getElementById('ordersChart').getContext('2d');
        
        if (ordersChart) {
            ordersChart.destroy();
        }

        ordersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels, // Реальные месяцы из БД
                datasets: [{
                    label: 'Заказы',
                    data: data.values, // Реальные цифры из БД
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }, // Чтобы не было дробных заказов (1.5 заказа)
                        grid: { color: '#f0f0f0' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    } catch (err) {
        console.error("График не загружен:", err);
    }
}

// Кнопка выхода (на сайт)
document.getElementById('logoutBtn').addEventListener('click', () => {
    if(confirm('Выйти из админ-панели?')) {
        window.location.href = 'index.html'; // Путь к главной
    }
});

// Открытие модалки для добавления
document.getElementById('addProductBtn').onclick = () => {
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').innerText = 'Добавить деталь';
    productModal.style.display = 'block';
};

// Закрытие модалки
document.getElementById('closeModal').onclick = () => {
    productModal.style.display = 'none';
};

// Сохранение товара
productForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 0, // Убедитесь, что эта строка есть!
        image: document.getElementById('productImage').value,
        featured: false
};

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;

    const res = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (res.ok) {
        productModal.style.display = 'none';
        initAdmin();
    }
};

async function loadStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const data = await res.json();
    const formatter = new Intl.NumberFormat('ru-RU');
    document.getElementById('totalProducts').innerText = data.products;
    document.getElementById('newOrders').innerText = data.orders;
    document.getElementById('totalUsers').innerText = data.users;
    document.getElementById('monthRevenue').innerText = data.revenue + ' руб.';
}

async function loadProducts() {
    const res = await fetch(`${API_BASE}/products`);
    products = await res.json();
    document.getElementById('productsTable').innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price} руб.</td>
            <td>${p.stock} шт</td>
            <td>
                <button class="btn-edit" onclick="editProduct(${p.id})">Изменить</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Удалить</button>
            </td>
        </tr>
    `).join('');
}

window.editProduct = (id) => {
    const p = products.find(x => x.id === id);
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    // Назначение значения stock удалено
    document.getElementById('productDescription').value = p.description;
    document.getElementById('productImage').value = p.image;
    document.getElementById('modalTitle').innerText = 'Редактировать';
    productModal.style.display = 'block';
};

window.deleteProduct = async (id) => {
    if (confirm('Удалить?')) {
        await fetch(`${API_BASE}/admin/products/${id}`, {method: 'DELETE'});
        initAdmin();
    }
};

async function loadOrders() { 
    const res = await fetch(`${API_BASE}/admin/orders`);
    const orders = await res.json();
    const ordersTable = document.getElementById('ordersTable');
    if (ordersTable) {
        ordersTable.innerHTML = orders.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.customer}</td>
                <td>${o.date}</td>
                <td>${o.amount} руб.</td>
                <td>
                    <span class="status-badge status-${o.status}">${o.status}</span>
                </td>
            <td>
                <select onchange="updateOrderStatus(${o.id}, this.value)">
                    <option value="Новый" ${o.status === 'Новый' ? 'selected' : ''}>Ожидает</option>
                    <option value="В работе" ${o.status === 'В работе' ? 'selected' : ''}>В работе</option>
                    <option value="Завершен" ${o.status === 'Завершен' ? 'selected' : ''}>Завершен</option>
                    <option value="Отменен" ${o.status === 'Отменен' ? 'selected' : ''}>Отменен</option>
                </select>
            </td>
            </tr>
        `).join('');
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
            method: 'PATCH', // Или 'PUT', в зависимости от вашего API
            headers: {
                'Content-Type': 'application/json',
                // Если нужна авторизация, добавьте заголовок:
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert('Статус успешно обновлен');
            loadOrders(); // Перезагружаем таблицу для обновления данных
        } else {
            const error = await res.json();
            alert(`Ошибка: ${error.message || 'Не удалось обновить статус'}`);
        }
    } catch (err) {
        console.error("Ошибка при обновлении статуса:", err);
        alert("Произошла ошибка при соединении с сервером");
    }
}


async function loadUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    const users = await res.json();
    const usersTable = document.getElementById('usersTable');
    if (usersTable) {
        usersTable.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.created_date}</td>
                <td>${u.orders}</td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);