const express = require('express');
const router = express.Router();
const { getHomePageData, getChatMessages, createNewChat } = require('./homeController'); // Adjust the path as necessary

// Route to render the home page
router.get('/', async (req, res) => {
    try {
        const userId = req.session.user.id; // Assuming the user ID is stored in the session
        const chats = await getHomePageData(userId);
        res.render('home-page', { chats }); // Pass chats to the view
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Route to fetch messages for a specific chat
router.get('/chat/:chatId/messages', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const messages = await getChatMessages(chatId);
        res.json(messages);
    } catch (error) {
        console.error('Error in fetching messages:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' }); // Send JSON error response
    }
});

// Route to create a new chat
router.post('/chat/new', async (req, res) => {
    try {
        const userId = req.session.user.id; // Assuming the user ID is stored in the session
        const newChat = await createNewChat(userId, req.body.name);
        res.status(201).json(newChat); // Return the newly created chat
    } catch (error) {
        console.error('Error creating new chat:', error);
        res.status(500).json({ error: 'Failed to create new chat' });
    }
});

module.exports = router;
