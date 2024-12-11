# API Пиццерии "Счастливый кусочек"

API для управления меню пиццерии, включая пиццы, комбо-наборы и напитки.

## Установка и запуск

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Запустите сервер:
```bash
python app.py
```

## API Endpoints

### Получение данных (GET)

- `/api/menu` - Получить все меню целиком
- `/api/pizzas` - Получить список всех пицц
- `/api/pizza/<id>` - Получить информацию о конкретной пицце
- `/api/combos` - Получить список всех комбо-наборов
- `/api/combo/<id>` - Получить информацию о конкретном комбо
- `/api/drinks` - Получить список всех напитков
- `/api/drink/<id>` - Получить информацию о конкретном напитке
- `/api/contacts` - Получить контактную информацию

### Добавление данных (POST)

- `/api/pizzas` - Добавить новую пиццу
- `/api/combos` - Добавить новый комбо-набор
- `/api/drinks` - Добавить новый напиток

### Обновление данных (PUT)

- `/api/pizza/<id>` - Обновить информацию о пицце
- `/api/combo/<id>` - Обновить информацию о комбо
- `/api/drink/<id>` - Обновить информацию о напитке
- `/api/contacts` - Обновить контактную информацию

### Удаление данных (DELETE)

- `/api/pizza/<id>` - Удалить пиццу
- `/api/combo/<id>` - Удалить комбо
- `/api/drink/<id>` - Удалить напиток

## Примеры использования

### Получение списка всех пицц

```bash
curl http://localhost:5000/api/pizzas
```

### Добавление новой пиццы

```bash
curl -X POST http://localhost:5000/api/pizzas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новая пицца",
    "description": "Описание новой пиццы",
    "base_price": 599,
    "image": "new_pizza.jpg",
    "sizes": {
      "small": {"name": "Маленькая (25 см)", "multiplier": 1},
      "medium": {"name": "Средняя (30 см)", "multiplier": 1.2},
      "large": {"name": "Большая (35 см)", "multiplier": 1.4}
    },
    "ingredients": [
      {"name": "Дополнительный сыр", "price": 79},
      {"name": "Грибы", "price": 59}
    ]
  }'
```

### Обновление пиццы

```bash
curl -X PUT http://localhost:5000/api/pizza/1 \
  -H "Content-Type: application/json" \
  -d '{
    "base_price": 649
  }'
```

### Удаление пиццы

```bash
curl -X DELETE http://localhost:5000/api/pizza/1
```
