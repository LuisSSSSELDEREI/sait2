// Навигация по секциям
document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a[href^="#"]');
    const sections = document.querySelectorAll('.admin-section');

    // Обработка клика по ссылкам в меню
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Скрываем все секции и убираем активный класс у ссылок
            sections.forEach(section => section.classList.remove('active'));
            sidebarLinks.forEach(link => link.classList.remove('active'));
            
            // Показываем целевую секцию и добавляем активный класс ссылке
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                this.classList.add('active');
            }
        });
    });
});

// Управление модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Закрытие модального окна при клике вне его области
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Обработка добавления нового блюда
function openAddItemModal() {
    openModal('addItemModal');
}

document.getElementById('addItemForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    fetch('/admin/add_item', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('addItemModal');
            location.reload(); // Перезагружаем страницу для отображения нового блюда
        } else {
            alert('Ошибка при добавлении блюда: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при добавлении блюда');
    });
});

// Управление блюдами
function editItem(itemId) {
    fetch(`/admin/get_item/${itemId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Заполняем форму редактирования данными блюда
                const form = document.getElementById('editItemForm');
                form.elements['name'].value = data.item.name;
                form.elements['description'].value = data.item.description;
                form.elements['category'].value = data.item.category_id;
                form.elements['base_price'].value = data.item.base_price;
                
                openModal('editItemModal');
            }
        });
}

function deleteItem(itemId) {
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
        fetch('/admin/delete_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item_id: itemId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const itemCard = document.querySelector(`.menu-item-card[data-id="${itemId}"]`);
                if (itemCard) {
                    itemCard.remove();
                }
            } else {
                alert('Ошибка при удалении блюда: ' + data.message);
            }
        });
    }
}

// Управление заказами
function updateOrderStatus(orderId, newStatus) {
    fetch('/admin/update_order_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order_id: orderId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const orderCard = document.querySelector(`.order-card[data-id="${orderId}"]`);
            if (orderCard) {
                orderCard.setAttribute('data-status', newStatus);
            }
        } else {
            alert('Ошибка при обновлении статуса заказа: ' + data.message);
        }
    });
}

function assignCourier(orderId) {
    fetch('/admin/get_available_couriers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Создаем и показываем модальное окно с выбором курьера
                const couriersList = data.couriers.map(courier => `
                    <div class="courier-option">
                        <input type="radio" name="courier" value="${courier.id}" id="courier_${courier.id}">
                        <label for="courier_${courier.id}">${courier.name} (${courier.status})</label>
                    </div>
                `).join('');

                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>Выберите курьера</h3>
                        <form id="assignCourierForm">
                            ${couriersList}
                            <button type="submit" class="btn btn-primary">Назначить</button>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);
                modal.style.display = 'block';

                // Обработка назначения курьера
                document.getElementById('assignCourierForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const courierId = this.elements['courier'].value;
                    
                    fetch('/admin/assign_courier', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            order_id: orderId,
                            courier_id: courierId
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            modal.remove();
                            alert('Курьер успешно назначен');
                        } else {
                            alert('Ошибка при назначении курьера: ' + data.message);
                        }
                    });
                });
            }
        });
}

function viewOrderDetails(orderId) {
    fetch(`/admin/get_order/${orderId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>Детали заказа #${orderId}</h3>
                        <div class="order-details">
                            <div class="order-items">
                                ${data.order.items.map(item => `
                                    <div class="order-item">
                                        <span>${item.name}</span>
                                        <span>${item.quantity} x ${item.price} ₽</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-total">
                                <strong>Итого:</strong> ${data.order.total} ₽
                            </div>
                            <div class="customer-info">
                                <p><i class="fas fa-user"></i> ${data.order.customer_name}</p>
                                <p><i class="fas fa-phone"></i> ${data.order.phone}</p>
                                <p><i class="fas fa-map-marker-alt"></i> ${data.order.address}</p>
                                ${data.order.comment ? `<p><i class="fas fa-comment"></i> ${data.order.comment}</p>` : ''}
                            </div>
                            ${data.order.courier ? `
                                <div class="courier-info">
                                    <h4>Информация о доставке</h4>
                                    <p><i class="fas fa-user"></i> Курьер: ${data.order.courier.name}</p>
                                    <p><i class="fas fa-phone"></i> Телефон: ${data.order.courier.phone}</p>
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Закрыть</button>
                    </div>
                `;

                document.body.appendChild(modal);
                modal.style.display = 'block';
            }
        });
}

// Фильтрация заказов
function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const orders = document.querySelectorAll('.order-card');
    
    orders.forEach(order => {
        if (status === 'all' || order.getAttribute('data-status') === status) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
}

// Функции дашборда
function showOrdersDetails() {
    // Переключаемся на секцию заказов
    showSection('orders');
}

function showRevenueDetails() {
    // Переключаемся на секцию финансов
    showSection('finance');
}

function showCouriersDetails() {
    // Переключаемся на секцию курьеров
    showSection('delivery');
}

function showReviewsDetails() {
    // Переключаемся на секцию отзывов
    showSection('reviews');
}

// Обновление графика заказов
function updateOrderChart() {
    const period = document.getElementById('orderChartPeriod').value;
    
    // Получаем данные с сервера
    fetch(`/api/orders/stats?period=${period}`)
        .then(response => response.json())
        .then(data => {
            // Здесь будет код обновления графика
            // Например, используя Chart.js
            updateChart(data);
        })
        .catch(error => {
            console.error('Ошибка при получении статистики:', error);
            showNotification('Ошибка при загрузке статистики', 'error');
        });
}

// Функция обновления графика (предполагается использование Chart.js)
function updateChart(data) {
    const ctx = document.getElementById('ordersChart').getContext('2d');
    
    if (window.ordersChart) {
        window.ordersChart.destroy();
    }

    window.ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Количество заказов',
                data: data.values,
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Динамика заказов'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Автоматическое обновление данных дашборда
function updateDashboardData() {
    fetch('/api/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            // Обновляем показатели
            document.querySelector('.orders-card .dashboard-number').textContent = data.today_orders_count;
            document.querySelector('.revenue-card .dashboard-number').textContent = data.today_revenue + ' ₽';
            document.querySelector('.couriers-card .dashboard-number').textContent = data.active_couriers;
            document.querySelector('.reviews-card .dashboard-number').textContent = data.new_reviews;

            // Обновляем список популярных блюд
            updatePopularItems(data.popular_items);

            // Обновляем список последних действий
            updateRecentActivities(data.recent_activities);
        })
        .catch(error => {
            console.error('Ошибка при обновлении данных дашборда:', error);
        });
}

// Обновление списка популярных блюд
function updatePopularItems(items) {
    const container = document.querySelector('.items-list');
    container.innerHTML = items.map(item => `
        <div class="popular-item">
            <img src="/static/images/${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Заказов: ${item.orders_count}</p>
            </div>
            <div class="item-trend">
                <i class="fas fa-arrow-${item.trend > 0 ? 'up trend-up' : 'down trend-down'}"></i>
            </div>
        </div>
    `).join('');
}

// Обновление списка последних действий
function updateRecentActivities(activities) {
    const container = document.querySelector('.activities-list');
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <p class="activity-text">${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Обновляем данные каждые 30 секунд
setInterval(updateDashboardData, 30000);

// Функция для переключения между секциями
function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Показываем выбранную секцию
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Обновляем активный пункт в меню
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Функции для работы с модальными окнами
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Инициализация обработчиков событий при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для пунктов меню
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Показываем дашборд по умолчанию
    showSection('dashboard');
    
    // Инициализируем данные дашборда
    updateDashboardData();
    updateOrderChart();

    // Обработчики для кнопок меню
    const menuButtons = {
        'dashboard': 'dashboardModal',
        'menu-management': 'menuModal',
        'orders': 'ordersModal',
        'delivery': 'deliveryModal',
        'finance': 'financeModal',
        'marketing': 'marketingModal',
        'reviews': 'reviewsModal',
        'settings': 'settingsModal'
    };

    Object.entries(menuButtons).forEach(([buttonId, modalId]) => {
        const button = document.querySelector(`[data-section="${buttonId}"]`);
        if (button) {
            button.addEventListener('click', () => showModal(modalId));
        }
    });

    // Обработчики для закрытия модальных окон
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });

    // Закрытие модального окна при клике вне его содержимого
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // Закрытие модального окна при нажатии Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const visibleModal = document.querySelector('.modal.show');
            if (visibleModal) {
                hideModal(visibleModal.id);
            }
        }
    });
});
