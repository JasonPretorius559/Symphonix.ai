const connection= require('../db'); // Adjust the path as necessary

// Function to fetch chats for a specific user
async function getHomePageData(userId) {
    try {
        const [rows] = await connection.query(
            'SELECT id, name FROM Chats WHERE userid = ?',
            [userId]
        );
        return rows; // Return the list of chats
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
}

// Function to fetch messages for a specific chat
async function getChatMessages(chatId) {
    try {
        const [rows] = await connection.query(
            'SELECT message_id, user_message, ai_message, timestamp FROM Messages WHERE chat_id = ? ORDER BY timestamp ASC',
            [chatId]
        );
        return rows; // Return the list of messages
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

// Function to create a new chat
async function createNewChat(userId, chatName) {
    try {
        const [result] = await connection.query(
            'INSERT INTO Chats (userid, name) VALUES (?, ?)',
            [userId, chatName]
        );

        const newChatId = result.insertId;

        const [newChat] = await connection.query(
            'SELECT id, name FROM Chats WHERE id = ?',
            [newChatId]
        );

        return newChat[0]; // Return the new chat details
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
}

module.exports = {
    getHomePageData,
    getChatMessages,
    createNewChat
};
