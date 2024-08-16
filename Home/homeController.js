const connection = require('../db'); // Import the database connection
const axios = require('axios');

// Fetch all chats for a given user
const getChats = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is not defined");
        }
        const [chats] = await connection.execute('SELECT * FROM chats WHERE userid = ?', [userId]);
        return chats;
    } catch (error) {
        console.error("Error fetching chats:", error.message);
        throw error;
    }
};

const getMessages = async (chatId) => {
    try {
        const [messages] = await connection.execute('SELECT * FROM messages WHERE chat_id = ?', [chatId]);
        console.log('Fetched messages:', messages); // Debugging line
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        throw error;
    }
};

const sendMessage = async (req, res) => {
    const { chatId, message } = req.body;
    const userId = req.session.user?.id;
    const defaultName = 'Default Chat';

    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    try {
        let newChatId = chatId;

        if (!chatId) {
            // Create a new chat
            const [result] = await connection.execute(
                'INSERT INTO chats (userid, name, created_at) VALUES (?, ?, NOW())',
                [userId, defaultName]
            );
            newChatId = result.insertId;
        }

        // Insert user message into the database
        await connection.execute(
            'INSERT INTO messages (chat_id, userid, user_message, name, timestamp) VALUES (?, ?, ?, ?, NOW())',
            [newChatId, userId, message, defaultName]
        );

        // Send the message to the AI and get the response
        const aiResponse = await axios.post('http://localhost:5000/chat', { message: message });

        const aiMessage = aiResponse.data.reply || null;

        if (!aiMessage) {
            console.error('AI Response is empty');
        }

        // Insert AI response into the database
        await connection.execute(
            'INSERT INTO messages (chat_id, userid, ai_message, name, timestamp) VALUES (?, ?, ?, ?, NOW())',
            [newChatId, null, aiMessage, defaultName]
        );

        res.json({ success: true, aiMessage: aiMessage, chatId: newChatId });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};





module.exports = { getChats, getMessages, sendMessage};
