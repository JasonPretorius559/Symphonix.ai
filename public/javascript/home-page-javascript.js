document.addEventListener('DOMContentLoaded', () => {
    const chatList = document.getElementById('chatList');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
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
        if (isSending || !currentChatId) return;
    
        isSending = true;
        sendButton.disabled = true;
    
        let messageText = messageInput.value.trim();
        messageText = cleanMessageText(messageText); // Clean the message text before sending
    
        if (messageText) {
            // User message UI
            const userMessageElement = document.createElement('div');
            userMessageElement.classList.add('message', 'user');
            userMessageElement.textContent = messageText;
            messagesContainer.appendChild(userMessageElement);
    
            messageInput.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
            let aiMessageContent = ''; // Variable to hold the AI message content
    
            try {
                // Proceed with fetching the response from the chat API
                const response = await fetch('http://localhost:11434/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3',
                        messages: [{ role: 'user', content: messageText }],
                        stream: true // Enable streaming if supported
                    })
                });
    
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
    
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let inCodeBlock = false; // Track whether we're inside a code block
                let inOrderedList = false; // Track if inside ordered list
                let inUnorderedList = false; // Track if inside unordered list
                let messageElement = document.createElement('div');
                messageElement.classList.add('message', 'bot');
                messagesContainer.appendChild(messageElement);
    
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    const chunk = decoder.decode(value, { stream: true });
    
                    chunk.split('\n').forEach(line => {
                        if (line.startsWith('data: ')) {
                            const jsonData = line.substring(6); // Remove 'data: ' prefix
                            if (jsonData !== '[DONE]') {
                                try {
                                    const data = JSON.parse(jsonData);
                                    let aiContent = data.choices[0].delta.content || '';
                                    aiMessageContent += aiContent; // Accumulate AI message content
    
                                    // Detect code block start or end
                                    if (aiContent.includes('```')) {
                                        inCodeBlock = !inCodeBlock; // Toggle code block state
                                    }
    
                                    if (inCodeBlock) {
                                        // If in a code block, format it accordingly
                                        messageElement.innerHTML += `<pre><code>${aiContent}</code></pre>`;
                                    } else {
                                        // Handle ordered list (1., 2., etc.)
                                        if (/^\d+\.\s/.test(aiContent)) {
                                            if (!inOrderedList) {
                                                messageElement.innerHTML += `<ol>`;
                                                inOrderedList = true;
                                            }
                                            aiContent = aiContent.replace(/^\d+\.\s/, ''); // Remove the number from content
                                            messageElement.innerHTML += `<li>${aiContent}</li>`;
                                        } else if (inOrderedList) {
                                            // Close ordered list if no longer in list
                                            messageElement.innerHTML += `</ol>`;
                                            inOrderedList = false;
                                        }
    
                                        // Handle unordered list (*, -, +)
                                        if (/^[*+-]\s/.test(aiContent)) {
                                            if (!inUnorderedList) {
                                                messageElement.innerHTML += `<ul>`;
                                                inUnorderedList = true;
                                            }
                                            aiContent = aiContent.replace(/^[*+-]\s/, ''); // Remove the bullet from content
                                            messageElement.innerHTML += `<li>${aiContent}</li>`;
                                        } else if (inUnorderedList) {
                                            // Close unordered list if no longer in list
                                            messageElement.innerHTML += `</ul>`;
                                            inUnorderedList = false;
                                        }
    
                                        // Detect bold text (wrapped in **)
                                        aiContent = aiContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
                                        // If not in a list or code block, append regular content
                                        if (!inCodeBlock && !inOrderedList && !inUnorderedList) {
                                            messageElement.innerHTML += aiContent;
                                        }
    
                                        // Scroll to the bottom after each update
                                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                    }
                                } catch (error) {
                                    console.error('Error parsing JSON:', error);
                                }
                            }
                        }
                    });
                }
    
                // Now send both user message and AI message to the server to save them in the database
                await fetch('/home/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatId: currentChatId,
                        userMessage: messageText,
                        aiMessage: aiMessageContent // Make sure this is included
                    })
                });
    
            } catch (error) {
                console.error('An unexpected error occurred:', error.message);
            } finally {
                resetSendButton();
            }
        } else {
            console.warn('Message cannot be empty.');
            resetSendButton();
        }
    });
    
    
    
    
    

// // Function to process the AI response
// function processAIResponse(response) {
//     const lines = response.split('\n');
//     let formattedResponse = '';
//     let inCodeBlock = false;

//     for (let line of lines) {
//         line = line.trim();
        
//         // Detect code blocks
//         if (line.startsWith('```')) {
//             inCodeBlock = !inCodeBlock; // Toggle code block status
//             formattedResponse += inCodeBlock ? '<pre><code>' : '</code></pre>\n'; // Add HTML tags for formatting
//             continue;
//         }

//         // If we are in a code block, just add the line
//         if (inCodeBlock) {
//             formattedResponse += `${line}\n`;
//             continue;
//         }

//         // Detect lists (bulleted or numbered)
//         if (line.startsWith('- ') || /^\d+\./.test(line)) {
//             formattedResponse += `<li>${line.replace(/^- |^\d+\. /, '')}</li>\n`; // Format list items
//         } else if (line) {
//             // Regular text
//             formattedResponse += `<p>${line}</p>\n`;
//         }
//     }

//     // Wrap lists in <ul> or <ol>
//     const listRegex = /<li>.*<\/li>\n/g; // Match all list items
//     formattedResponse = formattedResponse.replace(/(<li>.*<\/li>\n)+/g, (match) => {
//         const isOrdered = /^\d+\./.test(match); // Check if the list is ordered
//         return isOrdered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
//     });

//     return formattedResponse;
// }

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
        showSpinner(true); // Show spinner before starting to load messages
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
    
                // Ensure messagesContainer is defined and not null
                if (messagesContainer) {
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
                    console.error('Messages container element not found');
                }
            } else {
                // Handle the case when success is false and log the error
                console.error('Error loading messages:', result.error);
                if (messagesContainer) {
                    messagesContainer.innerHTML = `<div class="error">Error: ${result.error}</div>`;
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error.message);
            if (messagesContainer) {
                messagesContainer.innerHTML = `<div class="error">Error loading messages: ${error.message}</div>`;
            }
        } finally {
            showSpinner(false); // Hide spinner after loading is complete
        }
    }
    
    function showSpinner(show) {
        const spinnerContainer = document.getElementById('spinnerContainer');
        if (spinnerContainer) {
            spinnerContainer.style.display = show ? 'flex' : 'none';
        } else {
            console.error('Spinner container element not found');
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
