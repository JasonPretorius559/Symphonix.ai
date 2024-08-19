document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');
    const logoutOption = document.getElementById('logoutOption');
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownButton = document.querySelector('.dropdown .dropbtn');
    const newChatButton = document.getElementById('newChatButton'); // New Chat button

    let currentChatId = null; // Variable to keep track of the current chat ID
    let isSending = false; // Flag to prevent multiple sends
    let isCooldownActive = false; // Flag to prevent multiple new chat requests

    chatList.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('chat-item')) {
            const activeChat = document.querySelector('.chat-item.active');
            if (activeChat) {
                activeChat.classList.remove('active');
            }
            event.target.classList.add('active');
            currentChatId = event.target.getAttribute('data-chat-id');
            loadMessages(currentChatId);
        } else if (event.target && event.target.classList.contains('delete-chat')) {
            const chatItem = event.target.closest('.chat-item');
            const chatId = chatItem.getAttribute('data-chat-id');
            deleteChat(chatId, chatItem);
        }
    });

    sendButton.addEventListener('click', async () => {
        if (isSending) return; // Prevent multiple sends

        isSending = true; // Set flag to true
        const messageText = messageInput.value.trim();
        if (messageText) {
            try {
                const response = await fetch('/home/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ chatId: currentChatId, message: messageText })
                });

                const result = await response.json();

                if (result.success) {
                    if (result.chatId) {
                        let chatItem = document.querySelector(`.chat-item[data-chat-id="${result.chatId}"]`);

                        if (!chatItem) {
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

                        chatItem.classList.add('active');
                        currentChatId = result.chatId;
                        loadMessages(currentChatId);
                    }

                    messageInput.value = ''; // Clear the input field

                } else {
                    console.error(result.error);
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            } finally {
                isSending = false; // Reset flag after handling the request
            }
        } else {
            console.warn('Message cannot be empty.');
            isSending = false; // Reset flag if no message to send
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

                if (message.userid && message.user_message) {
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
                const activeChat = document.querySelector('.chat-item.active');
                if (activeChat && activeChat.getAttribute('data-chat-id') === chatId) {
                    currentChatId = null; // Clear current chat ID if it's the one being deleted
                }
                if (activeChat) {
                    activeChat.classList.remove('active');
                }
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }

    // Handle New Chat Button Click
    newChatButton.addEventListener('click', () => {
        if (isCooldownActive) return; // Prevent multiple new chat requests

        isCooldownActive = true; // Set cooldown flag
        console.log('New Chat button clicked');
        // Clear active chat
        const activeChat = document.querySelector('.chat-item.active');
        if (activeChat) {
            activeChat.classList.remove('active');
        }
        messagesContainer.innerHTML = ''; // Clear messages
        messageInput.value = ''; // Clear input
        currentChatId = null; // Set chat ID to null
        console.log('Current chat ID cleared:', currentChatId);

        // Reset cooldown after 1 second
        setTimeout(() => {
            isCooldownActive = false;
        }, 1000);
    });

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', () => {
        const isVisible = dropdownContent.classList.contains('show');
        dropdownContent.classList.toggle('show', !isVisible);
    });

    // Click outside to close dropdown
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });

    if (logoutOption) {
        logoutOption.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch('/home/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Redirect to login page or home page
                    window.location.href = '/'; // Adjust the URL as needed
                } else {
                    console.error('Logout failed:', await response.text());
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        });
    }
});
