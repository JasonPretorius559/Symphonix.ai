document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const spinner = document.createElement('div'); // Create spinner element
    spinner.classList.add('spinner'); // Add spinner class
    const messagesContainer = document.querySelector('.messages');
    const logoutOption = document.getElementById('logoutOption');
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownButton = document.querySelector('.dropdown .dropbtn');
    const newChatButton = document.getElementById('newChatButton');

    let currentChatId = null; 
    let isSending = false; 
    let isCooldownActive = false; 

    function cleanMessageText(text) {
        const words = text.split(' ');
        const cleanedWords = words.filter((value, index, self) => self.indexOf(value) === index);
        return cleanedWords.join(' ');
    }

    chatList.addEventListener('click', (event) => {
        if (event.target.classList.contains('chat-item')) {
            handleChatItemClick(event.target);
        } else if (event.target.classList.contains('delete-chat')) {
            handleChatDelete(event.target.closest('.chat-item'));
        }
    });

    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Stop form from submitting
            sendButton.click(); // Trigger send button click
        }
    });


    sendButton.addEventListener('click', async () => {
        if (isSending) return;

        isSending = true;
        sendButton.disabled = true;
        sendButton.innerHTML = spinner.outerHTML;

        let messageText = messageInput.value.trim();
        messageText = cleanMessageText(messageText); // Clean the message text before sending
        if (messageText) {
            const userMessageElement = document.createElement('div');
            userMessageElement.classList.add('message', 'user');
            userMessageElement.textContent = messageText;
            messagesContainer.appendChild(userMessageElement);

            messageInput.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            const aiMessagePlaceholder = document.createElement('div');
            aiMessagePlaceholder.classList.add('message', 'bot');
            aiMessagePlaceholder.innerHTML = '<div class="spinner"></div>';
            messagesContainer.appendChild(aiMessagePlaceholder);

            try {
                const response = await sendMessage(messageText);

                if (response.success && response.chatId) {
                    aiMessagePlaceholder.textContent = cleanMessageText(response.aiMessage) || 'AI Response';
                    handleChatResponse(response);
                } else {
                    console.error(response.error);
                    aiMessagePlaceholder.textContent = 'Error: Could not retrieve AI response.';
                }
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
                aiMessagePlaceholder.textContent = 'Error: Could not retrieve AI response.';
            } finally {
                resetSendButton();
            }
        } else {
            console.warn('Message cannot be empty.');
            resetSendButton();
        }
    });

    newChatButton.addEventListener('click', () => {
        if (isCooldownActive) return;

        isCooldownActive = true;
        handleNewChat();
        setTimeout(() => {
            isCooldownActive = false;
        }, 1000);
    });

    dropdownButton.addEventListener('click', () => {
        toggleDropdown();
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            closeDropdown();
        }
    });

    if (logoutOption) {
        logoutOption.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
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

    async function handleChatItemClick(chatItem) {
        const activeChat = document.querySelector('.chat-item.active');
        if (activeChat) {
            activeChat.classList.remove('active');
        }
        chatItem.classList.add('active');
        
        // Debugging lines to ensure chatItem has the correct ID
        console.log('Chat item clicked:', chatItem);
        console.log('Chat ID:', chatItem.getAttribute('data-chat-id'));
        
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
                body: JSON.stringify({ chatId })
            });

            const result = await response.json();
            if (result.success) {
                chatItem.remove();
                messagesContainer.innerHTML = '';
                if (currentChatId === chatId) {
                    currentChatId = null;
                }
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error.message);
        }
    }

    async function sendMessage(messageText) {
        const response = await fetch('/home/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId: currentChatId, message: messageText })
        });
        return await response.json();
    }

    function handleChatResponse(response) {
        let chatItem = document.querySelector(`.chat-item[data-chat-id="${response.chatId}"]`);

        if (!chatItem) {
            chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.setAttribute('data-chat-id', response.chatId);

            const chatName = document.createElement('span');
            chatName.textContent = response.chatName || 'Default Chat';
            chatItem.appendChild(chatName);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-chat');
            deleteButton.textContent = 'Delete';
            chatItem.appendChild(deleteButton);

            chatList.appendChild(chatItem);
        }

        chatItem.classList.add('active');
        currentChatId = response.chatId;
        loadMessages(currentChatId);
    }

    async function loadMessages(chatId) {
        console.log('Loading messages for chat ID:', chatId); // Debugging line
        try {
            const response = await fetch(`/home/messages/${chatId}`);
            
            if (!response.ok) {
                // If the response is not ok, handle it here
                throw new Error(`Failed to load messages: ${response.status}`);
            }
    
            const result = await response.json();
    
            // Check if the response indicates success
            if (result.success) {
                const messages = result.messages;
                messagesContainer.innerHTML = '';
    
                messages.forEach(message => {
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
                // Handle the case when success is false and log the error
                console.error('Error loading messages:', result.error);
                messagesContainer.innerHTML = `<div class="error">Error: ${result.error}</div>`;
            }
        } catch (error) {
            console.error('Error loading messages:', error.message);
            messagesContainer.innerHTML = `<div class="error">Error loading messages: ${error.message}</div>`;
        }
    }
    

    function resetSendButton() {
        isSending = false;
        sendButton.disabled = false;
        sendButton.innerHTML = 'Send';
    }

    function handleNewChat() {
        const activeChat = document.querySelector('.chat-item.active');
        if (activeChat) {
            activeChat.classList.remove('active');
        }
        messagesContainer.innerHTML = '';
        messageInput.value = '';
        currentChatId = null;
    }

    function toggleDropdown() {
        dropdownContent.classList.toggle('show');
    }

    function closeDropdown() {
        dropdownContent.classList.remove('show');
    }
});
