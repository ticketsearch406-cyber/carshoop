// Инициализация карты после загрузки API
ymaps.ready(init);

function init() {
    // 1. Создание карты - центрируем на Азове
    const myMap = new ymaps.Map('map', {
        center: [47.1121, 39.4235], 
        zoom: 13, // Оптимальный масштаб для города
        controls: ['zoomControl', 'fullscreenControl']
    }, {
        // Автоматически подгонять карту под размер контейнера при загрузке
        autoFitToViewport: 'always'
    });

    // 2. Список точек в городе Азов
    const locations = [
        {
            coords: [47.098991, 39.411948],
            title: 'Главный офис',
            address: 'г. Азов, ул. Промышленная, д. 1',
            type: 'office'
        },
        {
            coords: [47.1125, 39.4050],
            title: 'Склад',
            address: 'г. Азов, ул. Победы, д. 24',
            type: 'warehouse'
        },
        {
            coords: [47.1118, 39.4230],
            title: 'Магазин',
            address: 'г. Азов, ул. Московская, д. 7',
            type: 'store'
        }
    ];

    // 3. Добавление меток
    locations.forEach(loc => {
        const placemark = new ymaps.Placemark(loc.coords, {
            balloonContent: `
                <div style="padding: 5px; font-family: sans-serif;">
                    <strong style="color: #d35400;">${loc.title}</strong><br>
                    <small>${loc.address}</small>
                </div>
            `
        }, {
            preset: getIcon(loc.type)
        });
        myMap.geoObjects.add(placemark);
    });

    // 4. Логика кнопок переключения (Главный офис, Склад, Магазин)
    const buttons = document.querySelectorAll('.address-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Визуальное переключение активного состояния кнопок
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Получаем координаты из data-атрибута кнопки
            const coords = this.getAttribute('data-coords').split(',').map(Number);
            
            // Исправляем размер вьюпорта перед перемещением
            myMap.container.fitToViewport();

            // Перемещаем карту точно в центр выбранной точки
            myMap.setCenter(coords, 16, {
                checkZoomRange: true,
                duration: 800,
                timingFunction: 'ease-in-out'
            });
        });
    });

    // Исправление бага при изменении размеров окна браузера
    window.addEventListener('resize', () => {
        myMap.container.fitToViewport();
    });

    function getIcon(type) {
        if (type === 'office') return 'islands#blueOfficeIcon';
        if (type === 'warehouse') return 'islands#grayStorageIcon';
        return 'islands#blueShoppingIcon';
    }
}

// 5. Обработка формы обратной связи
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Спасибо! Ваше сообщение отправлено.');
        this.reset();
    });
}