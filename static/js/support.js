// Функции для модального окна поддержки
function openSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Очищаем форму при закрытии
        document.getElementById('supportForm').reset();
        // Удаляем сообщение об успехе, если оно есть
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.remove();
        }
    }
}

// Обработка отправки формы
function submitSupportForm(event) {
    event.preventDefault();

    // Получаем данные формы
    const name = document.getElementById('supportName').value;
    const email = document.getElementById('supportEmail').value;
    const topic = document.getElementById('supportTopic').value;
    const message = document.getElementById('supportMessage').value;

    // В реальном приложении здесь был бы код отправки данных на сервер
    console.log('Отправка данных формы:', { name, email, topic, message });

    // Создаем сообщение об успешной отправке
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.';

    // Добавляем сообщение после формы
    const form = document.getElementById('supportForm');
    form.after(successMessage);

    // Очищаем форму
    form.reset();

    // Закрываем модальное окно через 3 секунды
    setTimeout(closeSupportModal, 3000);
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик кнопки поддержки
    const supportButton = document.getElementById('supportButton');
    if (supportButton) {
        supportButton.addEventListener('click', function(e) {
            e.preventDefault();
            openSupportModal();
        });
    }

    // Закрытие модального окна при клике вне его
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeSupportModal();
            }
        });
    }

    // Закрытие модального окна при нажатии Esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeSupportModal();
        }
    });
});

// Глобальные переменные
let chatId = null;
let userName = null;

// Функция инициализации чата
function initChat() {
    // Генерируем уникальный ID для чата
    chatId = 'chat_' + Date.now();
    
    // Запрашиваем имя пользователя
    userName = prompt('Пожалуйста, представьтесь:', '');
    if (!userName) {
        userName = 'Гость ' + Math.floor(Math.random() * 1000);
    }
    
    // В реальном приложении здесь будет установка WebSocket соединения
    
    // Добавляем приветственное сообщение
    appendMessage('Здравствуйте! Чем могу помочь?', true);
    
    // Показываем статус "онлайн"
    document.querySelector('.status-text').textContent = 'Онлайн';
    document.querySelector('.status-dot').style.background = '#4CAF50';
}

// Функция добавления сообщения в чат
function appendMessage(text, isAdmin = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdmin ? 'admin' : 'user'}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${text}
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция отправки сообщения
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        appendMessage(message, false);
        
        // В реальном приложении здесь будет отправка сообщения через WebSocket
        
        // Симулируем ответ администратора
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                appendMessage('Спасибо за ваше сообщение! Мы обрабатываем его...', true);
            }, 2000);
        }, 1000);
        
        input.value = '';
    }
}

// Функция показа индикатора набора текста
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция скрытия индикатора набора текста
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Обработчик нажатия Enter в поле ввода
document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// Инициализация чата при открытии модального окна
document.querySelector('.support-button')?.addEventListener('click', function() {
    if (!chatId) {
        initChat();
    }
});
