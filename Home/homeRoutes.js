const express = require('express');
const router = express.Router();
const { getChats, getMessages, sendMessage, deleteChat } = require('./homeController'); // Adjust the path as necessary

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

        const messages = await getMessages(chatId, userId); // Ensure this function fetches messages for the user
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/send-message', sendMessage);

router.post('/delete-chat', deleteChat);

router.post('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err.message);
                return res.status(500).send('Internal Server Error');
            }

            // Optionally, you can redirect to the home page or login page
            res.redirect('/'); // or '/home' if that's your preferred landing page
        });
    } catch (error) {
        console.error("Error in logout route:", error.message);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
