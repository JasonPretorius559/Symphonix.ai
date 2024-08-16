document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');

    // Load messages when a chat is clicked
    chatList.addEventListener('click', async (event) => {
        if (event.target && event.target.classList.contains('chat-item')) {
            const chatId = event.target.getAttribute('data-chat-id');
            loadMessages(chatId);
        }
    });

    // Send a message
    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const chatId = document.querySelector('.chat-item.active')?.getAttribute('data-chat-id');
            if (chatId) {
                await sendMessage(chatId, messageText);
                messageInput.value = '';
            } else {
                alert('Please select a chat.');
            }
        }
    });

    async function loadMessages(chatId) {
        try {
            const response = await fetch(`/home/messages/${chatId}`);
            const messages = await response.json();
            console.log('Fetched messages:', messages); // Debugging line
    
            messagesContainer.innerHTML = '';
    
            messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
    
                if (message.userid === 9 && message.user_message) { // User message
                    messageElement.classList.add('user');
                    messageElement.textContent = message.user_message;
                } else if (message.ai_message) { // AI message
                    messageElement.classList.add('bot');
                    messageElement.textContent = message.ai_message;
                }
    
                messagesContainer.appendChild(messageElement);
            });
        } catch (error) {
            console.error('Error loading messages:', error.message);
        }
    }
    
    
    

});
