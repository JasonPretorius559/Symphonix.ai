document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messagesContainer = document.querySelector('.messages');
    const newChatButton = document.getElementById('newChatButton');

    // Event listener to handle chat selection
    chatList.addEventListener('click', async (event) => {
        const chatItem = event.target.closest('.chat-item');
        if (chatItem) {
            const chatId = chatItem.getAttribute('data-chat-id');
            try {
                const response = await fetch(`/home/chat/${chatId}/messages`);
                const messages = await response.json();
                renderMessages(messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    });

    // Event listener to handle the creation of a new chat
    newChatButton.addEventListener('click', async () => {
        try {
            // Clear the chat pane
            messagesContainer.innerHTML = '';

            const response = await fetch('/home/chat/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: 'New Chat' }) // Customize the chat name as needed
            });

            if (response.ok) {
                const newChat = await response.json();
                addChatToList(newChat);
            } else {
                console.error('Failed to create new chat');
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    });

    // Function to render messages in the chat pane
    function renderMessages(messages) {
        messagesContainer.innerHTML = ''; // Clear previous messages
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');

            // Apply the correct class based on whether the message is from the user or AI
            if (msg.user_message) {
                messageElement.classList.add('user');
                messageElement.textContent = msg.user_message;
            } else if (msg.ai_message) {
                messageElement.classList.add('bot');
                messageElement.textContent = msg.ai_message;
            }

            messagesContainer.appendChild(messageElement);
        });
    }

    // Function to add a new chat to the chat list
    function addChatToList(chat) {
        const chatItem = document.createElement('li');
        chatItem.classList.add('chat-item');
        chatItem.setAttribute('data-chat-id', chat.id);
        chatItem.textContent = chat.name;
        chatList.appendChild(chatItem);
    }
});
