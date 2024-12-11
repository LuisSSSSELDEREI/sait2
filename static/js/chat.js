document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chatWidget');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const minimizeButton = document.getElementById('minimizeChat');
    const openChatButton = document.getElementById('openChat');

    // Функция открытия чата
    function openChat() {
        chatWidget.classList.add('active');
        openChatButton.classList.add('hidden');
        loadMessages();
    }

    // Функция закрытия чата
    function closeChat() {
        chatWidget.classList.remove('active');
        openChatButton.classList.remove('hidden');
    }

    // Загрузка сообщений при открытии чата
    function loadMessages() {
        fetch('/api/chat/messages')
            .then(response => response.json())
            .then(messages => {
                chatMessages.innerHTML = '';
                messages.forEach(message => {
                    addMessageToChat(message.text, message.sender === 'admin');
                });
                scrollToBottom();
            })
            .catch(error => {
                console.error('Error loading messages:', error);
            });
    }

    // Добавление сообщения в чат
    function addMessageToChat(text, isAdmin = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isAdmin ? 'admin-message' : 'user-message'}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Прокрутка чата вниз
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Отправка сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        fetch('/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addMessageToChat(text, false);
                messageInput.value = '';
            } else {
                console.error('Error sending message:', data.error);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
    }

    // Обработчики событий
    openChatButton.addEventListener('click', openChat);
    minimizeButton.addEventListener('click', closeChat);
    sendButton.addEventListener('click', sendMessage);

    // Отправка сообщения по Enter (Shift+Enter для новой строки)
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Периодическая проверка новых сообщений
    function checkNewMessages() {
        if (chatWidget.classList.contains('active')) {
            loadMessages();
        }
    }

    // Проверка новых сообщений каждые 5 секунд
    setInterval(checkNewMessages, 5000);
});
