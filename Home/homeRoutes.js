const express = require('express');
const router = express.Router();
const { getChats, getMessages } = require('./homeController'); // Adjust the path as necessary

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

router.get('/messages/:chatId', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(400).send("User ID not found in session");
        }

        const messages = await getMessages(chatId, userId); // Ensure this function only fetches messages belonging to the user
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
