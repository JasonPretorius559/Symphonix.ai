document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');
    const logoutOption = document.getElementById('logoutOption');
    const newChatButton = document.getElementById('newChatButton');
    const spinnerContainer = document.getElementById('spinnerContainer');

    // State Variables
    let currentChatId = null;
    let isSending = false;
    let isCooldownActive = false;
    

    // Utility Functions
    function cleanMessageText(text) {
        const words = text.split(' ');
        const cleanedWords = words.filter((value, index, self) => self.indexOf(value) === index);
        return cleanedWords.join(' ');
    }

    function adjustHeight() {
        messageInput.style.height = 'auto';
        const newHeight = Math.min(messageInput.scrollHeight, 200); // 200px is the max-height
        messageInput.style.height = `${newHeight}px`;
        messageInput.style.overflowY = messageInput.scrollHeight > 200 ? 'auto' : 'hidden';
    }

    function resetSendButton() {
        isSending = false;
        sendButton.disabled = false;
    }

    function showSpinner(show) {
        if (spinnerContainer) {
            spinnerContainer.style.display = show ? 'flex' : 'none';
        } else {
            console.error('Spinner container element not found');
        }
    }

        // Refresh the sidebar with the latest chat list
        async function refreshSidebar() {
            try {
                const response = await fetch('/home/chats');
                if (!response.ok) throw new Error(`Failed to fetch chats: ${response.status}`);
    
                const result = await response.json();
                if (result.success) {
                    const chats = result.chats;
                    const fragment = document.createDocumentFragment();
    
                    // Clear the existing chat list
                    chatList.innerHTML = '';
    
                    // Add each chat to the fragment
                    chats.forEach((chat) => {
                        const chatItem = document.createElement('li');
                        chatItem.classList.add('chat-item');
                        chatItem.setAttribute('data-chat-id', chat.chat_id);
                        chatItem.innerHTML = `
                            <span>${chat.name}</span>
                            <button class="delete-chat" data-chat-id="${chat.chat_id}"></button>
                        `;
                        fragment.appendChild(chatItem);
                    });
    
                    // Append the fragment to the chat list
                    chatList.appendChild(fragment);
    
                    // Highlight the active chat
                    if (currentChatId) {
                        const activeChat = chatList.querySelector(`[data-chat-id="${currentChatId}"]`);
                        if (activeChat) activeChat.classList.add('active');
                    }
                } else {
                    console.error('Error fetching chats:', result.error);
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        }

    function handleNewChat() {
        const activeChat = document.querySelector('.chat-item.active');
        if (activeChat) activeChat.classList.remove('active');
        messagesContainer.innerHTML = '';
        messageInput.value = '';
        adjustHeight();
        currentChatId = null;
    }
    

    // Event Handlers
    async function handleChatItemClick(chatItem) {
        const activeChat = document.querySelector('.chat-item.active');
        if (activeChat) activeChat.classList.remove('active');
        chatItem.classList.add('active');

        currentChatId = chatItem.getAttribute('data-chat-id');
        if (currentChatId) {
            await loadMessages(currentChatId);
        } else {
            console.error('Chat ID not found.');
        }
    }

    async function handleChatDelete(chatItem) {
        const chatId = chatItem.getAttribute('data-chat-id');
        try {
            const response = await fetch('/home/delete-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId }),
            });

            const result = await response.json();
            if (result.success) {
                chatItem.remove();
                messagesContainer.innerHTML = '';
                if (currentChatId === chatId) currentChatId = null;
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }

    async function loadMessages(chatId) {
        showSpinner(true);
        try {
            const response = await fetch(`/home/messages/${chatId}`);
            if (!response.ok) throw new Error(`Failed to load messages: ${response.status}`);

            const result = await response.json();
            if (result.success) {
                const messages = result.messages;
                messagesContainer.innerHTML = '';

                messages.forEach((message) => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message');
                    if (message.userid && message.user_message) {
                        messageElement.classList.add('user');
                        messageElement.textContent = cleanMessageText(message.user_message);
                    } else if (message.ai_message) {
                        messageElement.classList.add('bot');
                        messageElement.textContent = cleanMessageText(message.ai_message);
                    }
                    messagesContainer.appendChild(messageElement);
                });
            } else {
                console.error('Error loading messages:', result.error);
                messagesContainer.innerHTML = `<div class="error">Error: ${result.error}</div>`;
            }
        } catch (error) {
            console.error('Error loading messages:', error.message);
            messagesContainer.innerHTML = `<div class="error">Error loading messages: ${error.message}</div>`;
        } finally {
            showSpinner(false);
        }
    }

    async function sendMessage() {
        if (isSending) return;
        isSending = true;
        sendButton.disabled = true;

        let messageText = messageInput.value.trim();
        messageText = cleanMessageText(messageText);

        if (!messageText) {
            console.warn('Message cannot be empty.');
            resetSendButton();
            return;
        }

        // Add user message to the UI
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('message', 'user');
        userMessageElement.textContent = messageText;
        messagesContainer.appendChild(userMessageElement);

        messageInput.value = '';
        adjustHeight();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // Send message to the AI API
            const response = await fetch('http://AITEST:11434/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'riot',
                    messages: [{ role: 'user', content: messageText }],
                    stream: true,
                }),
            });

            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'bot');
            messagesContainer.appendChild(messageElement);

            let aiMessageContent = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                chunk.split('\n').forEach((line) => {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6);
                        if (jsonData !== '[DONE]') {
                            try {
                                const data = JSON.parse(jsonData);
                                const aiContent = data.choices[0].delta.content || '';
                                aiMessageContent += aiContent;
                                messageElement.innerHTML += aiContent;
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            } catch (error) {
                                console.error('Error parsing JSON:', error);
                            }
                        }
                    }
                });
            }

            // Save the conversation to the database
            await fetch('/home/insert-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: currentChatId,
                    userMessage: messageText,
                    aiMessage: aiMessageContent,
                }),
            });
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        } finally {
            resetSendButton();
        }
    }

    // Event Listeners
    sendButton.addEventListener('click', sendMessage);

    newChatButton.addEventListener('click', () => {
        if (isCooldownActive) return;
        isCooldownActive = true;
        handleNewChat();
        setTimeout(() => {
            isCooldownActive = false;
        }, 1000);
    });

    if (logoutOption) {
        logoutOption.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    console.error('Logout failed:', await response.text());
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            }
        });
    }

    chatList.addEventListener('click', (event) => {
        const chatItem = event.target.closest('.chat-item');
        if (chatItem) {
            if (event.target.classList.contains('delete-chat')) {
                handleChatDelete(chatItem);
            } else {
                handleChatItemClick(chatItem);
            }
        }
    });

    messageInput.addEventListener('input', adjustHeight);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });
});