// Хранилище активных чатов
let activeChats = new Map();
let currentChatId = null;

// Функция для добавления нового чата
function addChat(chatId, userName, lastMessage = '') {
    const chatsList = document.getElementById('chatsList');
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item unread';
    chatItem.setAttribute('data-chat-id', chatId);
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    chatItem.innerHTML = `
        <div class="chat-item-header">
            <span class="chat-item-name">${userName}</span>
            <span class="chat-item-time">${time}</span>
        </div>
        <div class="chat-item-preview">${lastMessage || 'Новый чат'}</div>
    `;
    
    chatItem.onclick = () => selectChat(chatId);
    chatsList.prepend(chatItem);
    
    // Добавляем чат в хранилище
    activeChats.set(chatId, {
        userName: userName,
        messages: []
    });
}

// Функция выбора чата
function selectChat(chatId) {
    // Убираем выделение с предыдущего чата
    const previousChat = document.querySelector('.chat-item.active');
    if (previousChat) {
        previousChat.classList.remove('active');
    }
    
    // Выделяем текущий чат
    const currentChat = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (currentChat) {
        currentChat.classList.remove('unread');
        currentChat.classList.add('active');
    }
    
    currentChatId = chatId;
    
    // Показываем чат и скрываем заглушку
    document.getElementById('noChatSelected').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';
    
    // Обновляем имя пользователя в шапке
    const chatData = activeChats.get(chatId);
    if (chatData) {
        document.getElementById('currentUserName').textContent = chatData.userName;
    }
    
    // Загружаем историю сообщений
    loadChatHistory(chatId);
}

// Функция загрузки истории сообщений
function loadChatHistory(chatId) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Очищаем контейнер сообщений
    
    const chatData = activeChats.get(chatId);
    if (chatData && chatData.messages) {
        chatData.messages.forEach(msg => {
            appendMessage(msg.text, msg.isAdmin, msg.time);
        });
    }
    
    // Прокручиваем к последнему сообщению
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция добавления сообщения в чат
function appendMessage(text, isAdmin = true, time = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdmin ? 'admin' : 'user'}`;
    
    const messageTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${text}
        <div class="message-time">${messageTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Сохраняем сообщение в хранилище
    if (currentChatId) {
        const chatData = activeChats.get(currentChatId);
        if (chatData) {
            chatData.messages.push({
                text: text,
                isAdmin: isAdmin,
                time: messageTime
            });
        }
    }
}

// Функция отправки сообщения администратором
function sendAdminMessage() {
    const input = document.getElementById('adminChatInput');
    const message = input.value.trim();
    
    if (message && currentChatId) {
        appendMessage(message, true);
        
        // Обновляем превью в списке чатов
        const chatItem = document.querySelector(`[data-chat-id="${currentChatId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector('.chat-item-preview');
            const time = chatItem.querySelector('.chat-item-time');
            if (preview && time) {
                preview.textContent = message;
                time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }
        
        // В реальном приложении здесь будет отправка сообщения через WebSocket
        
        input.value = '';
    }
}

// Функция отправки быстрого ответа
function sendQuickReply(message) {
    if (currentChatId) {
        document.getElementById('adminChatInput').value = message;
        sendAdminMessage();
    }
}

// Функция завершения чата
function endChat() {
    if (currentChatId && confirm('Вы уверены, что хотите завершить этот чат?')) {
        // Удаляем чат из списка
        const chatItem = document.querySelector(`[data-chat-id="${currentChatId}"]`);
        if (chatItem) {
            chatItem.remove();
        }
        
        // Удаляем из хранилища
        activeChats.delete(currentChatId);
        
        // Показываем заглушку
        document.getElementById('noChatSelected').style.display = 'flex';
        document.getElementById('activeChat').style.display = 'none';
        
        currentChatId = null;
        
        // В реальном приложении здесь будет отправка уведомления пользователю
    }
}

// Обработчик нажатия Enter в поле ввода
document.getElementById('adminChatInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendAdminMessage();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    let currentUserId = null;
    let activeChats = {};
    let quickReplies = null;

    // Загрузка быстрых ответов
    async function loadQuickReplies() {
        try {
            const response = await fetch('/api/admin/quick-replies');
            quickReplies = await response.json();
            updateQuickReplyButtons();
        } catch (error) {
            console.error('Ошибка при загрузке быстрых ответов:', error);
        }
    }

    // Обновление кнопок быстрых ответов
    function updateQuickReplyButtons() {
        const container = document.querySelector('.quick-replies');
        if (!container || !quickReplies) return;

        container.innerHTML = `
            <div class="quick-reply-group">
                <button class="quick-reply" onclick="insertQuickReply('greeting')">
                    👋 Приветствие
                </button>
                <div class="quick-reply-dropdown">
                    ${quickReplies.greetings.map(text => 
                        `<div class="quick-reply-item" onclick="insertQuickReply('${text}')">${text}</div>`
                    ).join('')}
                </div>
            </div>
            <div class="quick-reply-group">
                <button class="quick-reply" onclick="insertQuickReply('goodbye')">
                    ✨ Прощание
                </button>
                <div class="quick-reply-dropdown">
                    ${quickReplies.goodbyes.map(text => 
                        `<div class="quick-reply-item" onclick="insertQuickReply('${text}')">${text}</div>`
                    ).join('')}
                </div>
            </div>
            <div class="quick-reply-group">
                <button class="quick-reply" onclick="insertQuickReply('common')">
                    💬 Общие ответы
                </button>
                <div class="quick-reply-dropdown">
                    ${quickReplies.common_replies.map(text => 
                        `<div class="quick-reply-item" onclick="insertQuickReply('${text}')">${text}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    // Функция для вставки быстрого ответа
    window.insertQuickReply = function(text) {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        if (text === 'greeting' && quickReplies?.greetings) {
            text = quickReplies.greetings[Math.floor(Math.random() * quickReplies.greetings.length)];
        } else if (text === 'goodbye' && quickReplies?.goodbyes) {
            text = quickReplies.goodbyes[Math.floor(Math.random() * quickReplies.goodbyes.length)];
        } else if (text === 'common' && quickReplies?.common_replies) {
            text = quickReplies.common_replies[Math.floor(Math.random() * quickReplies.common_replies.length)];
        }

        messageInput.value = text;
        messageInput.focus();
    };

    // Загрузка списка чатов
    async function loadChats() {
        try {
            const response = await fetch('/api/admin/chats');
            const chats = await response.json();
            const chatList = document.getElementById('chatList');
            const currentActive = chatList.querySelector('.chat-item.active');
            const currentActiveUserId = currentActive?.dataset.userId;
            
            chatList.innerHTML = '';
            activeChats = chats;

            if (Object.keys(chats).length === 0) {
                chatList.innerHTML = '<div class="no-chats">Нет активных чатов</div>';
                return;
            }

            for (const [userId, messages] of Object.entries(chats)) {
                const lastMessage = messages[messages.length - 1];
                const chatDiv = document.createElement('div');
                chatDiv.className = `chat-item ${userId === currentActiveUserId ? 'active' : ''}`;
                chatDiv.dataset.userId = userId;
                
                const unreadCount = messages.filter(m => m.sender === 'user' && !m.read).length;
                
                chatDiv.innerHTML = `
                    <div class="chat-item-header">
                        <span class="chat-user">Пользователь ${userId}</span>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </div>
                    <div class="chat-preview">${lastMessage.text}</div>
                    <div class="chat-time">${new Date(lastMessage.timestamp).toLocaleTimeString()}</div>
                `;

                chatDiv.onclick = () => selectChat(userId);
                chatList.appendChild(chatDiv);
            }

            // Если есть активный чат, обновляем его сообщения
            if (currentUserId) {
                updateMessages(currentUserId);
            }
        } catch (error) {
            console.error('Ошибка при загрузке чатов:', error);
        }
    }

    // Выбор чата
    function selectChat(userId) {
        currentUserId = userId;
        
        // Обновляем активный класс
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-user-id="${userId}"]`)?.classList.add('active');

        // Показываем сообщения
        updateMessages(userId);
        
        // Скрываем заглушку и показываем чат
        document.getElementById('noChatSelected').style.display = 'none';
        document.querySelector('.chat-main').style.display = 'block';
    }

    // Обновление сообщений выбранного чата
    function updateMessages(userId) {
        const messages = activeChats[userId] || [];
        const container = document.getElementById('messagesList');
        
        container.innerHTML = messages.map(msg => `
            <div class="message ${msg.sender === 'admin' ? 'admin' : 'user'}">
                <div class="message-content">${msg.text}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    // Отправка сообщения
    async function sendMessage() {
        const messageInput = document.getElementById('adminChatInput');
        const text = messageInput.value.trim();
        
        if (!text || !currentUserId) return;

        try {
            const response = await fetch('/api/admin/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUserId,
                    text: text,
                    sender: 'admin'
                })
            });

            if (response.ok) {
                messageInput.value = '';
                await loadChats(); // Перезагружаем чаты для обновления
            } else {
                console.error('Ошибка при отправке сообщения');
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    }

    // Инициализация обработчиков событий
    document.getElementById('sendButton').onclick = sendMessage;
    document.getElementById('messageInput').onkeypress = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Загрузка данных при старте
    loadQuickReplies();
    loadChats();
    
    // Обновление чатов каждые 5 секунд
    setInterval(loadChats, 5000);
});
