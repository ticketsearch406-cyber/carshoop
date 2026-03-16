document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeAuth = document.getElementById('closeAuth');
    const toggleAuth = document.getElementById('toggleAuth');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmit = document.getElementById('authSubmit');
    const regFields = document.getElementById('regFields');
    const userNameInput = document.getElementById('userName');
    
    // Элементы выпадающего меню профиля
    const userMenu = document.getElementById('userMenu');
    const menuUserName = document.getElementById('menuUserName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Функция обновления интерфейса в зависимости от авторизации
    function updateAuthInterface() {
        const savedUserJson = localStorage.getItem('user');
        if (savedUserJson && loginBtn) {
            const user = JSON.parse(savedUserJson);
            const loginBtnText = document.getElementById('loginBtnText');
            
            // Отображаем имя пользователя на кнопке
            if (loginBtnText) {
                loginBtnText.innerText = `👤 ${user.username}`;
            } else {
                loginBtn.innerHTML = `👤 ${user.username}`;
            }
            loginBtn.classList.add('user-logged-in');

            // Если в HTML есть ссылка на админку в меню, показываем её только админу
            const adminMenuLink = document.getElementById('adminMenuLink');
            if (adminMenuLink) {
                adminMenuLink.style.display = user.role === 'admin' ? 'block' : 'none';
            }
        }
    }

    updateAuthInterface();

    // Логика кнопки входа/профиля
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.stopPropagation(); 
            const savedUser = localStorage.getItem('user');
            
            if (savedUser) {
                // Если залогинен — показываем выпадающее меню
                const user = JSON.parse(savedUser);
                if (menuUserName) menuUserName.innerText = user.username;
                if (userMenu) {
                    userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
                }
            } else {
                // Если не залогинен — открываем окно входа
                if (authModal) authModal.style.display = 'flex';
            }
        };
    }

    // Кнопка выхода
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html'; 
        };
    }

    // Закрытие меню при клике вне его
    window.addEventListener('click', () => {
        if (userMenu) userMenu.style.display = 'none';
    });

    if (userMenu) {
        userMenu.onclick = (e) => e.stopPropagation();
    }

    if (closeAuth) closeAuth.onclick = () => { authModal.style.display = 'none'; };

    // Переключение Вход / Регистрация
    if (toggleAuth) {
        toggleAuth.onclick = (e) => {
            e.preventDefault();
            const isLogin = authTitle.innerText === 'Вход';
            authTitle.innerText = isLogin ? 'Регистрация' : 'Вход';
            authSubmit.innerText = isLogin ? 'Создать аккаунт' : 'Войти';
            regFields.style.display = isLogin ? 'block' : 'none';
            toggleAuth.innerText = isLogin ? 'Войти' : 'Зарегистрироваться';
        };
    }

    // ОТПРАВКА ФОРМЫ (Вход или Регистрация)
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const isLogin = authTitle.innerText === 'Вход';
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const username = userNameInput ? userNameInput.value : "";

            const endpoint = isLogin ? '/api/login' : '/api/register';
            const bodyData = isLogin ? { email, password } : { username, email, password };

            try {
                const response = await fetch(`https://fastapi-i7hh.onrender.com${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });

                const data = await response.json();

                if (response.ok) {
                    if (isLogin) {
                        // СОХРАНЯЕМ ДАННЫЕ (включая роль из ответа сервера)
                        const userToSave = { 
                            id: data.id, 
                            username: data.username,
                            email: data.email,
                            role: data.role // <-- ВАЖНО: сохраняем роль
                        };
                        localStorage.setItem('user', JSON.stringify(userToSave));
                        
                        // ЛОГИКА ПЕРЕНАПРАВЛЕНИЯ
                        if (data.role === 'admin') {
                            alert(`Добро пожаловать, администратор ${data.username}!`);
                            window.location.href = 'admin.html'; // Путь к вашей админке
                        } else {
                            window.location.href = 'index.html';
                        }
                    } else {
                        alert('Регистрация завершена! Теперь войдите в аккаунт.');
                        toggleAuth.click(); 
                    }
                } else {
                    alert(data.detail || 'Произошла ошибка');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Сервер не отвечает. Проверьте, запущен ли Python бэкенд.');
            }
        };
    }
});