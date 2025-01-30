const express = require('express');
const router = express.Router();
const { getChats, getMessages, InsertMessage, deleteChat } = require('./homeController'); // Adjust the path as necessary

// Get chats
router.get('/', async (req, res) => {
    try {
        console.log("Session data:", req.session);

        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(400).send("User ID not found in session");
        }

        const chats = await getChats(userId);
        res.render('home-page', { chats });
    } catch (error) {
        console.error("Error in route handler:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/messages/:chatId?', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.session.user?.id;

        // Validate chatId and userId
        if (!chatId) {
            return res.status(400).json({ success: false, error: "Chat ID is required" });
        }
        if (!userId) {
            return res.status(401).json({ success: false, error: "User ID not found in session" });
        }

        // Fetch messages for the user and the chat
        const messages = await getMessages(chatId, userId); // Ensure this function handles permissions properly

        // Send JSON response with messages
        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        // Send JSON response with error information
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// Fetch user chats dynamically
router.get('/api/chats', async (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const chats = await getChats(userId);
        res.json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chats:", error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch chats' });
    }
});




router.post('/insert-message', InsertMessage);

router.post('/delete-chat', deleteChat);


router.get('/user-info', (req, res) => {
    try {
        const user = req.session.user;
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        res.json({ success: true, user: { username: user.username, id: user.id, role: user.role } });
    } catch (error) {
        console.error('Error in user-info route:', error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


module.exports = router;
