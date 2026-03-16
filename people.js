const ORDERS_API = 'https://fastapi-i7hh.onrender.com/api/orders';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Если пользователь не залогинен, отправляем на главную
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Отображаем имя
    document.getElementById('userNameDisplay').innerText = user.username;

    // Кнопка выхода
    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    };

    fetchUserOrders(user.id);
});

async function fetchUserOrders(userId) {
    const ordersList = document.getElementById('ordersList');
    
    try {
        const response = await fetch(`${ORDERS_API}/${userId}`);
        const orders = await response.json();

        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="no-orders">У вас пока нет оформленных заказов.</div>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-info">
                    <div class="order-details">Заказ №${order.id} от ${order.date}</div>
                    <h4>${order.product_name}</h4>
                    <div class="order-details">
                        Количество: ${order.quantity} шт.<br>
                        Адрес: ${order.address}
                    </div>
                </div>
                <div class="order-status">
                    <div class="status-badge">${order.status}</div>
                    <div class="order-price">${order.total_price} руб.</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        ordersList.innerHTML = '<div class="no-orders">Не удалось загрузить историю заказов.</div>';
    }
}