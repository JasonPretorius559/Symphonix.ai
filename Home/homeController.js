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



module.exports = { getChats, getMessages};
