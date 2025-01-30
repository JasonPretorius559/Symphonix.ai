const connection = require('../db'); // Import the database connection
const axios = require('axios');

// Fetch all chats for a given user
const getChats = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is not defined");
        }
        // Updated SQL query to include delete_status = 0
        const [chats] = await connection.execute('SELECT * FROM chats WHERE userid = ? AND delete_status = 0', [userId]);
        return chats;
    } catch (error) {
        console.error("Error fetching chats:", error.message);
        throw error;
    }
};

const getMessages = async (chatId) => {
    try {
        const [messages] = await connection.execute(
            'SELECT * FROM messages WHERE chat_id = ? AND `deleted` = 0',
            [chatId]
        );
        console.log('Fetched messages:', messages); // Debugging line
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        throw error;
    }
};

const InsertMessage = async (req, res) => {
    const { chatId, userMessage, aiMessage } = req.body; // Receive user message and AI message from the request
    const userId = req.session.user?.id;

    if (!userMessage) {
        return res.status(400).json({ success: false, error: 'User message is required' });
    }

    if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    try {
        let newChatId = chatId;
        let chatName = generateChatName(userMessage, aiMessage); // Generate a meaningful chat name

        if (!chatId) {
            // Create a new chat
            const [result] = await connection.execute(
                'INSERT INTO chats (userid, name, created_at) VALUES (?, ?, NOW())',
                [userId, chatName]
            );
            newChatId = result.insertId;
        }

        // Insert user message into the database
        await connection.execute(
            'INSERT INTO messages (chat_id, userid, user_message, name, timestamp) VALUES (?, ?, ?, ?, NOW())',
            [newChatId, userId, userMessage, chatName]
        );

        if (aiMessage) {
            // Insert AI response into the database
            await connection.execute(
                'INSERT INTO messages (chat_id, userid, ai_message, name, timestamp) VALUES (?, ?, ?, ?, NOW())',
                [newChatId, null, aiMessage, chatName]
            );
        }

        // Send the new chatId back if a new chat was created
        if (!chatId) {
            return res.status(201).json({ success: true, chatId: newChatId, chatName });
        } else {
            res.status(204).send(); // No content for existing chats
        }

    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Helper function to generate a meaningful chat name
const generateChatName = (userMessage, aiMessage) => {
    const maxLength = 50; // Maximum length for chat names
    let name = 'New Chat'; // Fallback name

    // Use the first sentence of the user's message if available
    if (userMessage) {
        const firstSentence = userMessage.split('. ')[0]; // Get the first sentence
        if (firstSentence) {
            name = firstSentence.substring(0, maxLength); // Truncate if necessary
            return name;
        }
    }

    // Use the first sentence of the AI's message if user message is not suitable
    if (aiMessage) {
        const firstSentence = aiMessage.split('. ')[0]; // Get the first sentence
        if (firstSentence) {
            name = firstSentence.substring(0, maxLength); // Truncate if necessary
            return name;
        }
    }

    // Append a timestamp to the fallback name to avoid duplicates
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    name = `${name} - ${timestamp}`;

    return name;
};



const deleteChat = async (req, res) => {
    const { chatId } = req.body;
    const userId = req.session.user?.id;

    if (!chatId) {
        return res.status(400).json({ success: false, error: 'Chat ID is required' });
    }

    if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();

        // Mark related messages as deleted
        await conn.query('UPDATE messages SET deleted = 1 WHERE chat_id = ?', [chatId]);

        // Mark the chat as deleted
        const [result] = await conn.query('UPDATE chats SET delete_status = 1 WHERE chat_id = ? AND userid = ?', [chatId, userId]);

        if (result.affectedRows === 0) {
            // If no rows were affected, the chat might not exist or the user might not own it
            await conn.rollback();
            return res.status(404).json({ success: false, error: 'Chat not found or not authorized to delete' });
        }

        // Commit the transaction
        await conn.commit();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error.message);
        // Rollback the transaction in case of error
        try {
            await conn.rollback();
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError.message);
        }
        res.status(500).json({ success: false, error: error.message });
    } finally {
        conn.release();
    }
};

module.exports = { getChats, getMessages, InsertMessage, deleteChat };
