// Глобальные переменные
let currentPizza = null;
let cart = [];

// Получаем элементы модальных окон
const orderModal = document.getElementById('orderModal');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');

// Функция для отображения формы заказа
function showOrderForm(pizza) {
    try {
        currentPizza = pizza;
        orderModal.style.display = 'block';
        
        // Обновляем информацию о пицце
        document.getElementById('pizzaId').value = pizza.id;
        document.getElementById('selectedPizza').textContent = pizza.name;
        document.getElementById('selectedDescription').textContent = pizza.description;
        document.getElementById('selectedPizzaImage').src = '/static/images/' + pizza.image;
        
        // Создаем опции размеров
        const sizeOptions = document.getElementById('sizeOptions');
        sizeOptions.innerHTML = '';
        Object.entries(pizza.sizes).forEach(([size, data]) => {
            const div = document.createElement('div');
            div.className = 'size-option';
            div.dataset.size = size;
            const price = Math.round(pizza.base_price * data.multiplier);
            div.innerHTML = `
                ${data.name}<br>
                ${price} ₽
                <input type="radio" name="size" value="${size}" style="display: none;">
            `;
            div.onclick = () => selectSize(div);
            sizeOptions.appendChild(div);
        });
        
        // Создаем опции ингредиентов
        const ingredientsOptions = document.getElementById('ingredientsOptions');
        ingredientsOptions.innerHTML = '';
        pizza.ingredients.forEach(ing => {
            const div = document.createElement('div');
            div.className = 'ingredient-option';
            div.innerHTML = `
                <input type="checkbox" name="ingredients[]" value="${ing.name}">
                ${ing.name} (+${ing.price} ₽)
            `;
            div.querySelector('input').onchange = updateTotalPrice;
            ingredientsOptions.appendChild(div);
        });
        
        // Выбираем маленький размер по умолчанию
        const defaultSize = sizeOptions.querySelector('.size-option');
        if (defaultSize) {
            selectSize(defaultSize);
        }
        
        updateTotalPrice();
    } catch (error) {
        console.error('Ошибка при открытии формы заказа:', error);
    }
}

// Функция выбора размера
function selectSize(element) {
    try {
        // Убираем выделение у всех размеров
        document.querySelectorAll('.size-option').forEach(el => {
            el.classList.remove('selected');
            el.querySelector('input').checked = false;
        });
        
        // Выделяем выбранный размер
        element.classList.add('selected');
        element.querySelector('input').checked = true;
        
        updateTotalPrice();
    } catch (error) {
        console.error('Ошибка при выборе размера:', error);
    }
}

// Функция обновления общей стоимости
function updateTotalPrice() {
    try {
        if (!currentPizza) return;
        
        // Получаем базовую цену в зависимости от размера
        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        const basePrice = currentPizza.base_price * currentPizza.sizes[selectedSize].multiplier;
        
        // Считаем стоимость дополнительных ингредиентов
        const ingredientsPrice = Array.from(document.querySelectorAll('input[name="ingredients[]"]:checked'))
            .reduce((sum, input) => {
                const ingredient = currentPizza.ingredients.find(ing => ing.name === input.value);
                return sum + (ingredient ? ingredient.price : 0);
            }, 0);
        
        // Обновляем отображение общей стоимости
        const totalPrice = Math.round(basePrice + ingredientsPrice);
        document.getElementById('totalPrice').textContent = totalPrice;
    } catch (error) {
        console.error('Ошибка при обновлении цены:', error);
    }
}

// Функция добавления в корзину
function addToCart() {
    try {
        const selectedSize = document.querySelector('input[name="size"]:checked');
        if (!selectedSize) {
            alert('Пожалуйста, выберите размер пиццы');
            return;
        }

        const selectedIngredients = Array.from(document.querySelectorAll('input[name="ingredients[]"]:checked'))
            .map(input => input.value);

        const totalPrice = parseInt(document.getElementById('totalPrice').textContent);

        const cartItem = {
            id: Date.now(),
            pizza: currentPizza,
            size: selectedSize.value,
            size_name: currentPizza.sizes[selectedSize.value].name,
            ingredients: selectedIngredients,
            price: totalPrice
        };

        cart.push(cartItem);
        updateCartCount();
        orderModal.style.display = 'none';
        showCart();
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
    }
}

// Функция обновления счетчика корзины
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
    document.getElementById('checkoutButton').disabled = cart.length === 0;
}

// Функция показа корзины
function showCart() {
    try {
        cartModal.style.display = 'block';
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';
        
        let total = 0;
        
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <h3>${item.pizza.name}</h3>
                <p>Размер: ${item.size_name}</p>
                ${item.ingredients.length ? `<p>Дополнительно: ${item.ingredients.join(', ')}</p>` : ''}
                <p>Цена: ${item.price} ₽</p>
                <button onclick="removeFromCart(${item.id})">Удалить</button>
            `;
            cartItems.appendChild(div);
            total += item.price;
        });
        
        document.getElementById('cartTotal').textContent = total;
    } catch (error) {
        console.error('Ошибка при показе корзины:', error);
    }
}

// Функция удаления из корзины
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartCount();
    showCart();
}

// Функция закрытия корзины
function closeCart() {
    cartModal.style.display = 'none';
}

// Функция показа оформления заказа
function showCheckout() {
    try {
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
        
        // Подготавливаем данные корзины для отправки
        document.getElementById('cartData').value = JSON.stringify(cart);
    } catch (error) {
        console.error('Ошибка при показе оформления заказа:', error);
    }
}

// Функция закрытия оформления заказа
function closeCheckout() {
    checkoutModal.style.display = 'none';
}

// Добавляем обработчики событий после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для кнопок заказа
    document.querySelectorAll('.order-button').forEach(button => {
        button.addEventListener('click', function() {
            const pizzaData = JSON.parse(this.closest('.pizza-card').dataset.pizza);
            showOrderForm(pizzaData);
        });
    });

    // Обработчик для иконки корзины
    document.getElementById('cartIcon').addEventListener('click', showCart);

    // Обработчик для кнопки "Добавить в корзину"
    document.getElementById('addToCartButton').addEventListener('click', addToCart);

    // Обработчик для кнопки "Оформить заказ"
    document.getElementById('checkoutButton').addEventListener('click', showCheckout);

    // Обработчики для кнопок закрытия модальных окон
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Валидация формы оформления заказа
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        try {
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            if (!phone || !address) {
                e.preventDefault();
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            if (!phone.match(/^\+?[0-9]{10,12}$/)) {
                e.preventDefault();
                alert('Пожалуйста, введите корректный номер телефона');
                return;
            }
            
            if (cart.length === 0) {
                e.preventDefault();
                alert('Ваша корзина пуста');
                return;
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            e.preventDefault();
        }
    });
});