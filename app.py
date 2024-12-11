# Константы для админа
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
import json
from datetime import datetime
import os
from functools import wraps
import random

app = Flask(__name__)
app.secret_key = 'my-secret-key-for-sessions-and-flash'  # Добавляем секретный ключ для сессий и flash

# Данные для входа в админ-панель
# ADMIN_USERNAME = 'admin'
# ADMIN_PASSWORD = 'admin123'

# Декоратор для проверки авторизации
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Данные для пицц
pizzas = [
    {
        'id': 1,
        'name': 'Пепперони',
        'description': 'Классическая пицца с пепперони и сыром моцарелла',
        'base_price': 599,
        'image': 'pepperoni.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Бекон", "price": 89}
        ]
    },
    {
        'id': 2,
        'name': 'Маргарита',
        'description': 'Традиционная пицца с томатным соусом и сыром моцарелла',
        'base_price': 499,
        'image': 'margherita.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Бекон", "price": 89}
        ]
    },
    {
        'id': 3,
        'name': '4 сыра',
        'description': 'Изысканная пицца с четырьмя видами сыра',
        'base_price': 649,
        'image': '4sir.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Бекон", "price": 89}
        ]
    },
    {
        'id': 4,
        'name': 'Мясная',
        'description': 'Сытная пицца с разными видами мяса',
        'base_price': 699,
        'image': 'myasnaya.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Бекон", "price": 89}
        ]
    },
    {
        'id': 5,
        'name': 'Вегетарианская',
        'description': 'Легкая пицца с овощами',
        'base_price': 549,
        'image': 'veget.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Оливки", "price": 69}
        ]
    },
    {
        'id': 6,
        'name': 'Гавайская',
        'description': 'Пицца с ананасами, ветчиной и сыром моцарелла',
        'base_price': 649,
        'image': 'hawaiian.jpg',
        'sizes': {
            "small": {"name": "Маленькая (25 см)", "multiplier": 1},
            "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
            "large": {"name": "Большая (35 см)", "multiplier": 1.4}
        },
        'ingredients': [
            {"name": "Дополнительный сыр", "price": 79},
            {"name": "Грибы", "price": 59},
            {"name": "Халапеньо", "price": 59},
            {"name": "Бекон", "price": 89}
        ]
    }
]

# Данные для комбо-наборов
combos = [
    {
        'id': 1,
        'name': 'Комбо Пепперони',
        'description': 'Пепперони 30см + напиток 0.5л',
        'price': 699,
        'image': 'combo1.png'
    },
    {
        'id': 2,
        'name': 'Комбо Дуэт',
        'description': 'Две пиццы 25см на выбор',
        'price': 999,
        'image': '2pizz.jpg'
    },
    {
        'id': 3,
        'name': 'Комбо корпоратив',
        'description': 'Комбо для корпоратива: 3 пиццы + 2 напитка',
        'price': 1999,
        'image': 'kombo3.jpg'
    }
]

# Данные для меню
menu = {
    'drinks': [
        {
            'id': 1,
            'name': 'Кока-кола',
            'description': 'Газированный напиток',
            'variants': [
                {'size': '0.5л', 'price': 99},
                {'size': '1.0л', 'price': 169},
                {'size': '1.5л', 'price': 229}
            ],
            'image': 'kola.jpg'
        },
        {
            'id': 2,
            'name': 'Спрайт',
            'description': 'Газированный напиток',
            'variants': [
                {'size': '0.5л', 'price': 99},
                {'size': '1.0л', 'price': 169},
                {'size': '1.5л', 'price': 229}
            ],
            'image': 'sprait.jpg'
        },
        {
            'id': 3,
            'name': 'Фанта',
            'description': 'Газированный напиток',
            'variants': [
                {'size': '0.5л', 'price': 99},
                {'size': '1.0л', 'price': 169},
                {'size': '1.5л', 'price': 229}
            ],
            'image': 'fanta.jpg'
        },
        {
            'id': 4,
            'name': 'Сок',
            'description': 'Натуральный сок в ассортименте',
            'variants': [
                {'size': '0.3л', 'price': 89},
                {'size': '1.0л', 'price': 199}
            ],
            'image': 'sok.jpg'
        },
        {
            'id': 5,
            'name': 'Вода газированная',
            'description': 'Минеральная вода с газом',
            'variants': [
                {'size': '0.5л', 'price': 69},
                {'size': '1.0л', 'price': 119}
            ],
            'image': 'voda.jpg'
        },
        {
            'id': 6,
            'name': 'Вода негазированная',
            'description': 'Минеральная вода без газа',
            'variants': [
                {'size': '0.5л', 'price': 69},
                {'size': '1.0л', 'price': 119}
            ],
            'image': 'voda.jpg'
        }
    ],
    'snacks': [
        {
            'id': 1,
            'name': 'Картофель фри',
            'description': 'Хрустящий картофель фри с солью',
            'price': 199,
            'image': 'fries.jpg'
        },
        {
            'id': 2,
            'name': 'Куриные крылышки',
            'description': '8 шт, в соусе BBQ',
            'price': 399,
            'image': 'wings.jpg'
        },
        {
            'id': 3,
            'name': 'Луковые кольца',
            'description': 'Хрустящие луковые кольца в панировке',
            'price': 249,
            'image': 'onion_rings.jpg'
        }
    ],
    'desserts': [
        {
            'id': 1,
            'name': 'Чизкейк',
            'description': 'Нью-Йорк чизкейк',
            'price': 299,
            'image': 'cheesecake.jpg'
        },
        {
            'id': 2,
            'name': 'Тирамису',
            'description': 'Классический итальянский десерт',
            'price': 349,
            'image': 'tiramisu.jpg'
        },
        {
            'id': 3,
            'name': 'Брауни',
            'description': 'Шоколадный брауни с грецкими орехами',
            'price': 249,
            'image': 'brownie.jpg'
        }
    ]
}

# Загрузка заказов
def load_orders():
    try:
        with open('orders.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Сохранение заказов
def save_orders(orders):
    with open('orders.json', 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

# Инициализация корзины в сессии
def init_cart():
    if 'cart' not in session:
        session['cart'] = []

# Функции для работы с JSON
def read_json():
    try:
        with open('products.json', 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        return {"pizzas": [], "combos": [], "drinks": [], "contacts": {}}

def write_json(data):
    with open('products.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

# API endpoints для получения данных
@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Получить все меню целиком"""
    data = read_json()
    return jsonify(data)

@app.route('/api/pizzas', methods=['GET'])
def get_pizzas():
    """Получить список всех пицц"""
    data = read_json()
    return jsonify(data.get('pizzas', []))

@app.route('/api/pizza/<int:pizza_id>', methods=['GET'])
def get_pizza(pizza_id):
    """Получить информацию о конкретной пицце"""
    data = read_json()
    pizza = next((p for p in data.get('pizzas', []) if p['id'] == pizza_id), None)
    if pizza:
        return jsonify(pizza)
    return jsonify({'error': 'Пицца не найдена'}), 404

@app.route('/api/combos', methods=['GET'])
def get_combos():
    """Получить список всех комбо-наборов"""
    data = read_json()
    return jsonify(data.get('combos', []))

@app.route('/api/combo/<int:combo_id>', methods=['GET'])
def get_combo(combo_id):
    """Получить информацию о конкретном комбо"""
    data = read_json()
    combo = next((c for c in data.get('combos', []) if c['id'] == combo_id), None)
    if combo:
        return jsonify(combo)
    return jsonify({'error': 'Комбо не найдено'}), 404

@app.route('/api/drinks', methods=['GET'])
def get_drinks():
    """Получить список всех напитков"""
    data = read_json()
    return jsonify(data.get('drinks', []))

@app.route('/api/drink/<int:drink_id>', methods=['GET'])
def get_drink(drink_id):
    """Получить информацию о конкретном напитке"""
    data = read_json()
    drink = next((d for d in data.get('drinks', []) if d['id'] == drink_id), None)
    if drink:
        return jsonify(drink)
    return jsonify({'error': 'Напиток не найден'}), 404

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    """Получить контактную информацию"""
    data = read_json()
    return jsonify(data.get('contacts', {}))

# API endpoints для добавления данных
@app.route('/api/pizzas', methods=['POST'])
def add_pizza():
    """Добавить новую пиццу"""
    data = read_json()
    new_pizza = request.json
    
    # Генерация нового ID
    if data['pizzas']:
        new_id = max(p['id'] for p in data['pizzas']) + 1
    else:
        new_id = 1
    
    new_pizza['id'] = new_id
    data['pizzas'].append(new_pizza)
    write_json(data)
    
    return jsonify({'message': 'Пицца добавлена', 'pizza': new_pizza}), 201

@app.route('/api/combos', methods=['POST'])
def add_combo():
    """Добавить новый комбо-набор"""
    data = read_json()
    new_combo = request.json
    
    if data['combos']:
        new_id = max(c['id'] for c in data['combos']) + 1
    else:
        new_id = 1
    
    new_combo['id'] = new_id
    data['combos'].append(new_combo)
    write_json(data)
    
    return jsonify({'message': 'Комбо добавлено', 'combo': new_combo}), 201

@app.route('/api/drinks', methods=['POST'])
def add_drink():
    """Добавить новый напиток"""
    data = read_json()
    new_drink = request.json
    
    if data['drinks']:
        new_id = max(d['id'] for d in data['drinks']) + 1
    else:
        new_id = 1
    
    new_drink['id'] = new_id
    data['drinks'].append(new_drink)
    write_json(data)
    
    return jsonify({'message': 'Напиток добавлен', 'drink': new_drink}), 201

# API endpoints для обновления данных
@app.route('/api/pizza/<int:pizza_id>', methods=['PUT'])
def update_pizza(pizza_id):
    """Обновить информацию о пицце"""
    data = read_json()
    pizza_update = request.json
    
    for pizza in data['pizzas']:
        if pizza['id'] == pizza_id:
            pizza.update(pizza_update)
            write_json(data)
            return jsonify({'message': 'Пицца обновлена', 'pizza': pizza})
    
    return jsonify({'error': 'Пицца не найдена'}), 404

@app.route('/api/combo/<int:combo_id>', methods=['PUT'])
def update_combo(combo_id):
    """Обновить информацию о комбо"""
    data = read_json()
    combo_update = request.json
    
    for combo in data['combos']:
        if combo['id'] == combo_id:
            combo.update(combo_update)
            write_json(data)
            return jsonify({'message': 'Комбо обновлено', 'combo': combo})
    
    return jsonify({'error': 'Комбо не найдено'}), 404

@app.route('/api/drink/<int:drink_id>', methods=['PUT'])
def update_drink(drink_id):
    """Обновить информацию о напитке"""
    data = read_json()
    drink_update = request.json
    
    for drink in data['drinks']:
        if drink['id'] == drink_id:
            drink.update(drink_update)
            write_json(data)
            return jsonify({'message': 'Напиток обновлен', 'drink': drink})
    
    return jsonify({'error': 'Напиток не найден'}), 404

@app.route('/api/contacts', methods=['PUT'])
def update_contacts():
    """Обновить контактную информацию"""
    data = read_json()
    contacts_update = request.json
    
    data['contacts'].update(contacts_update)
    write_json(data)
    return jsonify({'message': 'Контакты обновлены', 'contacts': data['contacts']})

# API endpoints для удаления данных
@app.route('/api/pizza/<int:pizza_id>', methods=['DELETE'])
def delete_pizza(pizza_id):
    """Удалить пиццу"""
    data = read_json()
    pizzas = data['pizzas']
    
    for i, pizza in enumerate(pizzas):
        if pizza['id'] == pizza_id:
            deleted_pizza = pizzas.pop(i)
            write_json(data)
            return jsonify({'message': 'Пицца удалена', 'pizza': deleted_pizza})
    
    return jsonify({'error': 'Пицца не найдена'}), 404

@app.route('/api/combo/<int:combo_id>', methods=['DELETE'])
def delete_combo(combo_id):
    """Удалить комбо"""
    data = read_json()
    combos = data['combos']
    
    for i, combo in enumerate(combos):
        if combo['id'] == combo_id:
            deleted_combo = combos.pop(i)
            write_json(data)
            return jsonify({'message': 'Комбо удалено', 'combo': deleted_combo})
    
    return jsonify({'error': 'Комбо не найдено'}), 404

@app.route('/api/drink/<int:drink_id>', methods=['DELETE'])
def delete_drink(drink_id):
    """Удалить напиток"""
    data = read_json()
    drinks = data['drinks']
    
    for i, drink in enumerate(drinks):
        if drink['id'] == drink_id:
            deleted_drink = drinks.pop(i)
            write_json(data)
            return jsonify({'message': 'Напиток удален', 'drink': deleted_drink})
    
    return jsonify({'error': 'Напиток не найден'}), 404

@app.route('/')
def index():
    init_cart()
    orders = load_orders()
    return render_template('index.html', 
                         pizzas=pizzas,
                         combos=combos,
                         menu=menu,
                         orders=orders)

@app.route('/order/<int:pizza_id>')
def order(pizza_id):
    pizza = next((p for p in pizzas if p['id'] == pizza_id), None)
    if pizza:
        return render_template('order.html', pizza=pizza)
    return redirect(url_for('index'))

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    init_cart()
    
    data = request.get_json()
    pizza_id = data.get('pizza_id')
    size = str(data.get('size'))
    dough = data.get('dough')
    sauce = data.get('sauce')
    ingredients = data.get('ingredients', [])
    price = data.get('price', 0)
    
    pizza = next((p for p in pizzas if p['id'] == pizza_id), None)
    
    if not pizza:
        return jsonify({'success': False, 'error': 'Pizza not found'}), 404
    
    # Создаем элемент корзины
    cart_item = {
        'id': len(session['cart']) + 1,
        'pizza_id': pizza_id,
        'pizza_name': pizza['name'],
        'size': size,
        'dough': dough,
        'sauce': sauce,
        'ingredients': ingredients,
        'price': price,
        'quantity': 1
    }
    
    # Добавляем в корзину
    if 'cart' not in session:
        session['cart'] = []
    
    session['cart'].append(cart_item)
    session.modified = True
    
    return jsonify({
        'success': True,
        'cart_count': len(session['cart']),
        'cart_item': cart_item
    })

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    data = request.get_json()
    item_id = data.get('item_id')
    
    if 'cart' not in session:
        session['cart'] = []
    
    # Находим и удаляем элемент с указанным item_id
    cart = session['cart']
    for i in range(len(cart) - 1, -1, -1):
        if cart[i].get('id') == item_id:
            cart.pop(i)
            session['cart'] = cart
            session.modified = True
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Item not found'})

@app.route('/cart')
def cart():
    if 'cart' not in session:
        session['cart'] = []
    cart_items = session['cart']
    total = sum(item['price'] * item.get('quantity', 1) for item in cart_items)
    return render_template('cart.html', cart_items=cart_items, total=total)

@app.route('/update_cart_item', methods=['POST'])
def update_cart_item():
    data = request.get_json()
    index = data.get('index')
    quantity = data.get('quantity')
    
    if 'cart' not in session:
        session['cart'] = []
    
    if 0 <= index < len(session['cart']):
        if quantity > 0:
            session['cart'][index]['quantity'] = quantity
        else:
            session['cart'].pop(index)
        session.modified = True
        
        total = sum(item['price'] * item.get('quantity', 1) for item in session['cart'])
        return jsonify({
            'success': True,
            'cart_count': len(session['cart']),
            'total': total
        })
    return jsonify({'success': False})

@app.route('/clear_cart', methods=['POST'])
def clear_cart():
    session['cart'] = []
    session.modified = True
    return jsonify({
        'success': True,
        'cart_count': 0,
        'total': 0
    })

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    init_cart()
    
    if request.method == 'POST':
        try:
            order_data = request.json
            # Получаем текущую корзину
            cart = session.get('cart', [])
            
            if not cart:
                return jsonify({'success': False, 'error': 'Корзина пуста'})
                
            # Здесь можно добавить сохранение заказа в базу данных
            # и отправку уведомлений
            
            # Очищаем корзину после успешного оформления
            session['cart'] = []
            
            return jsonify({
                'success': True,
                'message': 'Заказ успешно оформлен'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': str(e)
            })
    
    return render_template('checkout.html', cart=session['cart'])

@app.route('/add_order', methods=['POST'])
def add_order():
    try:
        # Получаем данные из формы
        cart_data = json.loads(request.form['cart_data'])
        address = request.form['address']
        phone = request.form['phone']
        comment = request.form.get('comment', '')

        # Загружаем текущие заказы
        orders = load_orders()
        
        # Создаем новый заказ
        order_id = len(orders) + 1
        order_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Создаем список пицц в заказе
        order_items = []
        total_price = 0
        
        for item in cart_data:
            order_items.append({
                "pizza_name": item['pizza']['name'],
                "size_name": item['size_name'],
                "ingredients": item['ingredients'],
                "price": item['price']
            })
            total_price += item['price']
        
        # Формируем заказ
        new_order = {
            "id": order_id,
            "date": order_date,
            "status": "new",
            "address": address,
            "phone": phone,
            "comment": comment,
            "items": order_items,
            "total_price": total_price
        }
        
        # Добавляем заказ в список и сохраняем
        orders.append(new_order)
        save_orders(orders)
        
        return redirect(url_for('index'))
    except Exception as e:
        print(f"Ошибка при создании заказа: {e}")
        return "Произошла ошибка при оформлении заказа", 500

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            return render_template('admin_login.html', error='Неверный логин или пароль')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/admin')
@admin_required
def admin():
    # Загружаем заказы и группируем их по статусу
    orders = load_orders()
    orders_by_status = {
        'new': [],
        'processing': [],
        'completed': [],
        'cancelled': []
    }
    
    for order in orders:
        status = order.get('status', 'new')
        orders_by_status[status].append(order)
    
    # Загружаем сообщения чата и пользователей
    messages = load_chat_messages()
    users = load_users()
    users_dict = {user['id']: user for user in users['users']}
    
    # Группируем сообщения по пользователям
    chats = {}
    for msg in messages:
        if isinstance(msg, dict):
            user_id = msg.get('user_id')
            if user_id:
                if user_id not in chats:
                    chats[user_id] = {
                        'user': users_dict.get(user_id, {'phone': 'Неизвестный пользователь'}),
                        'messages': []
                    }
                chats[user_id]['messages'].append(msg)

    # Сортируем сообщения в каждом чате по времени
    for user_id in chats:
        chats[user_id]['messages'].sort(key=lambda x: x.get('timestamp', ''))

    return render_template('admin.html', 
        orders_by_status=orders_by_status,
        chats=chats,
        current_page='admin'
    )

@app.route('/admin/update_status', methods=['POST'])
@admin_required
def update_status():
    data = request.json
    if not data or 'order_id' not in data or 'status' not in data:
        return jsonify({'error': 'Неверный запрос'}), 400
    
    orders = load_orders()
    order_id = data['order_id']
    new_status = data['status']
    
    # Проверяем, что статус допустим
    valid_statuses = load_quick_replies()['order_status'].keys()
    if new_status not in valid_statuses:
        return jsonify({'error': 'Недопустимый статус'}), 400
    
    for order in orders:
        if order['id'] == order_id:
            order['status'] = new_status
            save_orders(orders)
            return jsonify({'success': True})
    
    return jsonify({'error': 'Заказ не найден'}), 404

@app.route('/admin/delete_order', methods=['POST'])
@admin_required
def delete_order():
    try:
        data = request.get_json()
        order_id = data['order_id']
        
        orders = load_orders()
        orders = [order for order in orders if order['id'] != order_id]
        
        save_orders(orders)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/set_city', methods=['POST'])
def set_city():
    try:
        data = request.get_json()
        city = data.get('city')
        if city:
            session['selected_city'] = city
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'City not provided'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/add_combo_to_cart', methods=['POST'])
def add_combo_to_cart():
    try:
        data = request.get_json()
        combo_id = data.get('combo_id')
        
        if not combo_id:
            return jsonify({'success': False, 'error': 'Combo ID not provided'})
            
        combo = next((c for c in combos if c['id'] == combo_id), None)
        if not combo:
            return jsonify({'success': False, 'error': 'Combo not found'})
            
        if 'cart' not in session:
            session['cart'] = []
            
        session['cart'].append({
            'type': 'combo',
            'id': combo_id,
            'name': combo['name'],
            'price': combo['price']
        })
        session.modified = True
        
        return jsonify({
            'success': True,
            'cart_count': len(session['cart'])
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/add_to_cart_1', methods=['POST'])
def add_to_cart_1():
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        item_type = data.get('item_type')
        
        if not item_id or not item_type:
            return jsonify({'success': False, 'error': 'Item details not provided'})
            
        # Находим товар в соответствующей категории меню
        if item_type == 'snack':
            items = menu['snacks']
        elif item_type == 'drink':
            items = menu['drinks']
        elif item_type == 'dessert':
            items = menu['desserts']
        else:
            return jsonify({'success': False, 'error': 'Invalid item type'})
            
        item = next((i for i in items if i['id'] == item_id), None)
        if not item:
            return jsonify({'success': False, 'error': 'Item not found'})
            
        if 'cart' not in session:
            session['cart'] = []
            
        session['cart'].append({
            'type': item_type,
            'id': item_id,
            'name': item['name'],
            'price': item['price'] if item_type != 'drink' else item['variants'][0]['price']
        })
        session.modified = True
        
        return jsonify({
            'success': True,
            'cart_count': len(session['cart'])
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/add_drink_to_cart', methods=['POST'])
def add_drink_to_cart():
    if 'cart' not in session:
        session['cart'] = []
    
    data = request.get_json()
    drink_item = {
        'type': 'drink',
        'name': data['drink_name'],
        'size': data['size'],
        'price': data['price']
    }
    
    session['cart'].append(drink_item)
    session.modified = True
    
    return jsonify({
        'success': True,
        'cart_count': len(session['cart'])
    })

@app.route('/get_cart')
def get_cart():
    if 'cart' not in session:
        session['cart'] = []
    
    cart = session['cart']
    total = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart)
    
    return jsonify({
        'items': cart,
        'total': total
    })

@app.route('/update_quantity', methods=['POST'])
def update_quantity():
    data = request.get_json()
    item_id = data.get('item_id')
    new_quantity = data.get('quantity')
    
    if 'cart' not in session:
        return jsonify({'success': False, 'error': 'Cart not found'})
    
    cart = session['cart']
    for item in cart:
        if item.get('id') == item_id:
            item['quantity'] = new_quantity
            session['cart'] = cart
            session.modified = True
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Item not found'})

# Функции для работы с пользователями
def load_users():
    try:
        with open('users.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
    except FileNotFoundError:
        return {"users": []}
    except json.JSONDecodeError:
        return {"users": []}

def save_users(users):
    with open('users.json', 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def find_user_by_phone(phone):
    users = load_users()
    for user in users['users']:
        if user['phone'] == phone:
            return user
    return None

def generate_verification_code():
    return ''.join(random.choices('0123456789', k=4))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        phone = request.form.get('phone')
        
        # Проверяем, существует ли пользователь
        user = find_user_by_phone(phone)
        
        if not user:
            flash('Пользователь с таким номером телефона не найден', 'error')
            return redirect(url_for('login'))
        
        # Генерируем код подтверждения
        verification_code = generate_verification_code()
        
        # Сохраняем данные во временной сессии
        session['login_data'] = {
            'phone': phone,
            'verification_code': verification_code,
            'user_id': user['id']
        }
        
        # В реальном приложении здесь был бы код отправки SMS
        flash(f'Ваш код подтверждения: {verification_code}', 'info')
        return redirect(url_for('verify_login'))
    
    return render_template('login.html')

@app.route('/verify-login', methods=['GET', 'POST'])
def verify_login():
    if 'login_data' not in session:
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        code = request.form.get('code')
        
        if code == session['login_data']['verification_code']:
            # Авторизуем пользователя
            session['user_id'] = session['login_data']['user_id']
            session['phone'] = session['login_data']['phone']
            
            # Очищаем временные данные
            session.pop('login_data', None)
            
            flash('Вы успешно вошли в систему!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Неверный код подтверждения', 'error')
    
    return render_template('verify_login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('phone', None)
    flash('Вы вышли из системы', 'info')
    return redirect(url_for('index'))

# Функция для загрузки сообщений чата
def load_chat_messages():
    try:
        with open('chat_messages.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('messages', [])
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

# Функция для сохранения сообщений чата
def save_chat_messages(messages):
    with open('chat_messages.json', 'w', encoding='utf-8') as f:
        json.dump({'messages': messages}, f, ensure_ascii=False, indent=2)

# Маршрут для получения сообщений конкретного чата
@app.route('/get_chat_messages/<user_id>')
@admin_required
def get_user_chat_messages(user_id):
    try:
        with open('chat_messages.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            messages = data.get('messages', [])
            # Фильтруем сообщения для конкретного пользователя
            user_messages = [
                {
                    'message': msg['text'],  # Используем 'text' вместо 'message'
                    'sender': msg['sender'],
                    'timestamp': msg['timestamp'],
                    'user_id': msg['user_id']
                }
                for msg in messages
                if str(msg.get('user_id')) == str(user_id)
            ]
            return jsonify(user_messages)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Маршрут для отправки сообщения
@app.route('/send_message', methods=['POST'])
@admin_required
def send_admin_message():
    try:
        data = request.json
        user_id = data.get('user_id')
        message = data.get('message')
        
        if not user_id or not message:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
            
        # Загружаем существующие сообщения
        try:
            with open('chat_messages.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                messages = data.get('messages', [])
        except FileNotFoundError:
            messages = []
            
        # Создаем новое сообщение
        new_message = {
            'id': len(messages) + 1,
            'user_id': user_id,
            'text': message,  # Используем 'text' вместо 'message'
            'sender': 'admin',
            'timestamp': datetime.now().isoformat()
        }
        
        messages.append(new_message)

        # Сохраняем обновленные сообщения
        with open('chat_messages.json', 'w', encoding='utf-8') as f:
            json.dump({'messages': messages}, f, ensure_ascii=False, indent=2)
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# API для получения всех чатов (для админов)
@app.route('/api/admin/chats')
@admin_required
def get_all_chats():
    messages = load_chat_messages()
    users = load_users()
    
    # Создаем словарь с информацией о пользователях
    users_dict = {user['id']: user for user in users['users']}
    
    # Группируем сообщения по user_id и добавляем информацию о пользователе
    chats = {}
    for msg in messages:
        user_id = msg.get('user_id')
        if user_id:
            if user_id not in chats:
                chats[user_id] = {
                    'messages': [],
                    'user': users_dict.get(user_id, {'phone': 'Неизвестный пользователь'})
                }
            chats[user_id]['messages'].append(msg)

    return jsonify(chats)

# API для получения сообщений конкретного чата
@app.route('/api/admin/chats/<user_id>')
@admin_required
def get_user_chat(user_id):
    messages = load_chat_messages()
    user_messages = [msg for msg in messages if msg.get('user_id') == user_id]
    return jsonify({'messages': user_messages})

# API для ответа админа
@app.route('/api/admin/reply', methods=['POST'])
@admin_required
def admin_reply():
    data = request.get_json()
    if not data or 'text' not in data or 'user_id' not in data:
        return jsonify({'success': False, 'error': 'Invalid request data'}), 400

    messages = load_chat_messages()
    new_message = {
        'id': len(messages) + 1,
        'user_id': data['user_id'],
        'text': data['text'],
        'sender': 'admin',
        'timestamp': datetime.now().isoformat()
    }
    messages.append(new_message)
    save_chat_messages(messages)
    return jsonify({'success': True, 'message': new_message})

# Функция для загрузки быстрых ответов
def load_quick_replies():
    try:
        with open('quick_replies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['replies']
    except (FileNotFoundError, json.JSONDecodeError):
        return []

@app.route('/api/quick-replies')
@admin_required
def get_quick_replies():
    replies = load_quick_replies()
    return jsonify(replies)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        phone = request.form.get('phone')
        
        # Проверяем, существует ли пользователь
        if find_user_by_phone(phone):
            flash('Этот номер телефона уже зарегистрирован', 'error')
            return redirect(url_for('register'))
        
        # Генерируем код подтверждения
        verification_code = generate_verification_code()
        
        # Сохраняем данные во временной сессии
        session['registration_data'] = {
            'phone': phone,
            'verification_code': verification_code,
            'user_id': str(datetime.now().timestamp())  # Используем timestamp как ID
        }
        
        # В реальном приложении здесь был бы код отправки SMS
        flash(f'Ваш код подтверждения: {verification_code}', 'info')
        return redirect(url_for('verify'))
    
    return render_template('register.html')

@app.route('/verify', methods=['GET', 'POST'])
def verify():
    if 'registration_data' not in session:
        return redirect(url_for('register'))
        
    if request.method == 'POST':
        code = request.form.get('code')
        
        if code == session['registration_data']['verification_code']:
            # Создаем нового пользователя
            users = load_users()
            new_user = {
                'id': session['registration_data']['user_id'],
                'phone': session['registration_data']['phone'],
                'registered_at': datetime.now().isoformat()
            }
            users['users'].append(new_user)
            save_users(users)
            
            # Очищаем временные данные и авторизуем пользователя
            user_id = session['registration_data']['user_id']
            phone = session['registration_data']['phone']
            session.pop('registration_data', None)
            
            session['user_id'] = user_id
            session['phone'] = phone
            
            flash('Регистрация успешно завершена!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Неверный код подтверждения', 'error')
    
    return render_template('verify.html')

# Маршрут для получения сообщений пользователя
@app.route('/api/chat/messages')
def get_user_messages():
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима авторизация'}), 401
        
    try:
        with open('chat_messages.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            messages = data.get('messages', [])
            # Фильтруем сообщения для текущего пользователя
            user_messages = [
                {
                    'message': msg['text'],
                    'sender': msg['sender'],
                    'timestamp': msg['timestamp']
                }
                for msg in messages
                if str(msg.get('user_id')) == str(session['user_id'])
            ]
            return jsonify(user_messages)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Маршрут для отправки сообщения от пользователя
@app.route('/api/chat/send', methods=['POST'])
def send_user_message():
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима авторизация'}), 401

    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Отсутствует сообщение'}), 400

        # Загружаем существующие сообщения
        try:
            with open('chat_messages.json', 'r', encoding='utf-8') as f:
                file_data = json.load(f)
                messages = file_data.get('messages', [])
        except FileNotFoundError:
            messages = []

        # Создаем новое сообщение
        new_message = {
            'id': len(messages) + 1,
            'user_id': session['user_id'],
            'text': data['message'],
            'sender': 'user',
            'timestamp': datetime.now().isoformat()
        }
        
        messages.append(new_message)

        # Сохраняем обновленные сообщения
        with open('chat_messages.json', 'w', encoding='utf-8') as f:
            json.dump({'messages': messages}, f, ensure_ascii=False, indent=2)

        return jsonify({
            'success': True,
            'message': {
                'message': new_message['text'],
                'sender': new_message['sender'],
                'timestamp': new_message['timestamp']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
