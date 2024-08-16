document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');

    chatList.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('chat-item')) {
            document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
            event.target.classList.add('active');
            const chatId = event.target.getAttribute('data-chat-id');
            loadMessages(chatId);
        } else if (event.target && event.target.classList.contains('delete-chat')) {
            const chatItem = event.target.closest('.chat-item');
            const chatId = chatItem.getAttribute('data-chat-id');
            deleteChat(chatId, chatItem);
        }
    });

    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const chatId = document.querySelector('.chat-item.active')?.getAttribute('data-chat-id') || null;
            try {
                const response = await fetch('/home/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ chatId, message: messageText })
                });

                const result = await response.json();

                if (result.success) {
                    if (result.chatId) {
                        let chatItem = document.querySelector(`.chat-item[data-chat-id="${result.chatId}"]`);

                        if (!chatItem) {
                            const chatList = document.getElementById('chatList');
                            chatItem = document.createElement('div');
                            chatItem.classList.add('chat-item');
                            chatItem.setAttribute('data-chat-id', result.chatId);

                            const chatName = document.createElement('span');
                            chatName.textContent = result.chatName || 'Default Chat';
                            chatItem.appendChild(chatName);

                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('delete-chat');
                            deleteButton.textContent = 'Delete';
                            chatItem.appendChild(deleteButton);

                            chatList.appendChild(chatItem);
                        }

                        document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
                        chatItem.classList.add('active');
                        loadMessages(result.chatId);
                    }

                    messageInput.value = '';
                    
                } else {
                    console.error(result.error);
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        } else {
            console.warn('Message cannot be empty.');
        }
    });

    async function loadMessages(chatId) {
        try {
            const response = await fetch(`/home/messages/${chatId}`);
            const messages = await response.json();
            messagesContainer.innerHTML = '';

            messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');

                if (message.userid === 9 && message.user_message) {
                    messageElement.classList.add('user');
                    messageElement.textContent = message.user_message;
                } else if (message.ai_message) {
                    messageElement.classList.add('bot');
                    messageElement.textContent = message.ai_message;
                }

                messagesContainer.appendChild(messageElement);
            });
        } catch (error) {
            console.error('Error loading messages:', error.message);
        }
    }

    async function deleteChat(chatId, chatItem) {
        try {
            const response = await fetch('/home/delete-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chatId })
            });

            const result = await response.json();

            if (result.success) {
                chatItem.remove();
                messagesContainer.innerHTML = '';
                document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }
});
