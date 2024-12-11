// Список доступных промокодов и их скидок
const promoCodes = {
    'PIZZA50': 50,     // 50% скидка на первый заказ
    'HAPPY30': 30,     // 30% праздничная скидка
    'WELCOME25': 25,   // 25% скидка для новых клиентов
    'WEEKEND20': 20,   // 20% скидка на выходные
    'FAMILY15': 15,    // 15% семейная скидка
    'STUDENT10': 10,   // 10% скидка для студентов
    'COMBO35': 35,     // 35% скидка на комбо
    'PARTY40': 40,     // 40% скидка на большой заказ
    'LUNCH25': 25,     // 25% скидка на обед
    'NIGHT15': 15      // 15% ночная скидка
};

let activePromoCode = null;
let promoCodeUsed = false; // Флаг использования промокода

// Функция применения промокода
function applyPromoCode() {
    const promoInput = document.getElementById('promoCodeInput');
    const promoMessage = document.getElementById('promoMessageModal');
    const code = promoInput.value.trim().toUpperCase();

    // Сброс предыдущих классов сообщений
    promoMessage.classList.remove('success', 'error');

    // Проверка на пустой промокод
    if (!code) {
        showPromoMessage('Введите промокод', 'error');
        return;
    }

    // Проверка, был ли уже использован промокод
    if (promoCodeUsed) {
        showPromoMessage('Вы уже активировали 1 промокод. Обновите страницу, чтобы использовать другой промокод.', 'error');
        return;
    }

    // Проверка существования промокода
    if (promoCodes.hasOwnProperty(code)) {
        activePromoCode = code;
        promoCodeUsed = true; // Отмечаем, что промокод использован
        const discount = promoCodes[code];
        applyDiscount(discount);
        showPromoMessage(`Промокод активирован! Ваша скидка: ${discount}%`, 'success');
        
        // Делаем поле ввода и кнопку неактивными
        promoInput.disabled = true;
        document.querySelector('.apply-promo-btn').disabled = true;
        
        // Добавляем сообщение о необходимости обновить страницу
        setTimeout(() => {
            showPromoMessage('Чтобы использовать другой промокод, обновите страницу', 'info');
        }, 2000);

        updateCartDisplay();
        setTimeout(() => {
            closePromoModal();
        }, 1500);
    } else {
        showPromoMessage('Неверный промокод', 'error');
    }
}

// Функция отображения сообщения о промокоде
function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promoMessageModal');
    if (!promoMessage) {
        console.error('promoMessageModal element not found!');
        return;
    }
    promoMessage.textContent = message;
    promoMessage.className = 'promo-message ' + type;
}

// Функция применения скидки
function applyDiscount(discountPercent) {
    const cartItems = document.querySelectorAll('.cart-item');
    const totalElement = document.querySelector('.total-amount');
    
    let total = 0;
    cartItems.forEach(item => {
        const price = parseFloat(item.getAttribute('data-price'));
        const quantity = parseInt(item.getAttribute('data-quantity'));
        total += price * quantity;
    });

    if (total > 0) {
        const discountAmount = (total * discountPercent) / 100;
        const finalTotal = total - discountAmount;

        if (totalElement) {
            totalElement.innerHTML = `
                <div class="price-breakdown">
                    <span class="original-price">${total.toFixed(0)} ₽</span>
                    <span class="discount-amount">-${discountAmount.toFixed(0)} ₽</span>
                    <span class="final-price">${finalTotal.toFixed(0)} ₽</span>
                </div>
            `;
        }
    }
}

// Функции для модального окна промокодов
function openPromoModal() {
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.style.display = 'block';
        // Фокус на поле ввода
        const promoInput = document.getElementById('promoCodeInput');
        if (promoInput) {
            promoInput.focus();
            
            // Если промокод уже был использован, делаем поле ввода неактивным
            if (promoCodeUsed) {
                promoInput.disabled = true;
                document.querySelector('.apply-promo-btn').disabled = true;
                showPromoMessage('Чтобы использовать другой промокод, обновите страницу', 'info');
            }
        }
    }
}

function closePromoModal() {
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик кнопки промокодов
    const promoButton = document.getElementById('promoButton');
    if (promoButton) {
        promoButton.addEventListener('click', function(e) {
            e.preventDefault();
            openPromoModal();
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('promoModal');
        if (event.target === modal) {
            closePromoModal();
        }
    });

    // Закрытие модального окна при нажатии Esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePromoModal();
        }
    });

    // Обработка нажатия Enter в поле ввода
    const promoInput = document.getElementById('promoCodeInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyPromoCode();
            }
        });
    }
});

// Обновление отображения корзины при изменениях
function updateCartDisplay() {
    if (activePromoCode) {
        const discount = promoCodes[activePromoCode];
        applyDiscount(discount);
    }
}
