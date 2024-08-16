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

    // sendButton.addEventListener('click', async () => {
    //     const messageText = messageInput.value.trim();
    //     if (messageText) {
    //         // Get the currently selected chat ID or set to null if no chat is selected
    //         const chatId = document.querySelector('.chat-item.active')?.getAttribute('data-chat-id') || null;
    //         console.log('Selected Chat ID:', chatId); // Debugging line
    
    //         try {
    //             // Send message to the backend
    //             const response = await fetch('/home/send-message', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({ chatId, message: messageText })
    //             });
    
    //             const result = await response.json();
    
    //             if (result.success) {
    //                 if (result.chatId) {
    //                     // Update or add the new chat item if a new chat was created
    //                     let chatItem = document.querySelector(`.chat-item[data-chat-id="${result.chatId}"]`);
    
    //                     if (!chatItem) {
    //                         // Create a new chat item if it doesn't exist
    //                         chatItem = document.createElement('div');
    //                         chatItem.classList.add('chat-item');
    //                         chatItem.setAttribute('data-chat-id', result.chatId);
    //                         chatItem.textContent = `Chat ${result.chatId}`; // Customize as needed
    //                         chatList.appendChild(chatItem);
    //                     }
    
    //                     // Activate the new or existing chat
    //                     document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    //                     chatItem.classList.add('active');
    //                     loadMessages(result.chatId); // Load messages for the new or updated chat
    //                 }
    
    //                 messageInput.value = ''; // Clear the input field
                    
    //             } else {
    //                 // Handle errors without alerting the user
    //                 console.error(result.error);
    //             }
    //         } catch (error) {
    //             // Handle unexpected errors without alerting the user
    //             console.error('An unexpected error occurred:', error.message);
    //         }
    //     } else {
    //         // Handle empty message case if needed
    //         console.warn('Message cannot be empty.');
    //     }
    // });

    sendButton.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const chatId = document.querySelector('.chat-item.active')?.getAttribute('data-chat-id') || null;
            console.log('Selected Chat ID:', chatId); // Debugging line
    
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
                            chatItem.textContent = result.chatName || 'Default Chat'; // Use the chat name from the result
                            chatList.appendChild(chatItem);
                        }
    
                        document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
                        chatItem.classList.add('active');
                        loadMessages(result.chatId); // Load messages for the new or updated chat
                    }
    
                    messageInput.value = ''; // Clear the input field
                    
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
