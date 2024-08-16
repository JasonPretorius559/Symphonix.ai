document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');

    // Load messages when a chat is clicked
    chatList.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('chat-item')) {
            // Remove 'active' class from all chat items
            document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
            
            // Add 'active' class to the clicked chat item
            event.target.classList.add('active');
    
            // Get the chat ID and load messages
            const chatId = event.target.getAttribute('data-chat-id');
            loadMessages(chatId);
        }
    });

    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const chatId = document.querySelector('.chat-item.active')?.getAttribute('data-chat-id');
            console.log('Selected Chat ID:', chatId); // Debugging line
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

    async function sendMessage(chatId, messageText) {
        try {
            const response = await fetch('/home/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatId: chatId,
                    message: messageText
                })
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            if (result.success) {
                console.log('Message sent successfully');
                // Optionally, reload messages or update the UI as needed
                loadMessages(chatId); // Refresh messages after sending
            } else {
                console.error('Error sending message:', result.error);
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    }
    
    
    

});
