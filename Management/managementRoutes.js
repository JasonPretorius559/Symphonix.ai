const express = require('express');
const managementController = require('./managementController'); // Adjust the path
const { Parser } = require('json2csv');
const axios = require('axios');



const router = express.Router();
//==========================================================================//
//THIS SECTION RENDERS THE TABS ON ADMIN CONSOLE
//
//==========================================================================//

/*=========================================================================================================*/
router.get('/', async (req, res) => {
    try {
        const totalSessions = await managementController.getTotalSessions();
        const sessionData = await managementController.getSessionData();
        res.render('layout', {
            title: 'Management Console',
            activeTab: 'dashboard',
            body: 'dashboard', // Content for the main section
            totalSessions,
            sessionData
        });
    } catch (error) {
        console.error("Error rendering management console:", error.message);
        res.status(500).send("An error occurred while fetching session data.");
    }
});

// Dashboard route (support both GET and POST)
router.get('/dashboard', async (req, res) => {
    try {
        const totalSessions = await managementController.getTotalSessions();
        const sessionData = await managementController.getSessionData();
        res.render('layout', {
            title: 'Dashboard',
            activeTab: 'dashboard',
            body: 'dashboard', // Reference to the partial view for the dashboard
            totalSessions,
            sessionData
        });
    } catch (error) {
        console.error('Error rendering Dashboard:', error.message);
        res.status(500).send('Error loading dashboard.');
    }
});




// Profiles route (support both GET and POST)
router.get('/profiles', async (req, res) => {
    try {
        res.render('layout', {
            title: 'Profiles',
            activeTab: 'profiles', // This will highlight the Profiles tab in the sidebar
            body: 'profiles' // This will include the profiles.ejs partial
        });
    } catch (error) {
        console.error('Error rendering Profiles:', error.message);
        res.status(500).send('Error loading profiles.');
    }
});




router.get('/chats', async (req, res) => {
    try {
        res.render('layout', {
            title: 'Chats',
            activeTab: 'chats', // This will highlight the Chats tab in the sidebar
            body: 'chats' // This will include the chats.ejs partial
        });
    } catch (error) {
        console.error('Error rendering Chats:', error.message);
        res.status(500).send('Error loading chats.');
    }
});


router.get('/users', async (req, res) => {
    try {
        res.render('layout', {
            title: 'User Management',
            activeTab: 'users', // This will highlight the Chats tab in the sidebar
            body: 'users' // This will include the chats.ejs partial
        });
    } catch (error) {
        console.error('Error rendering Chats:', error.message);
        res.status(500).send('Error loading chats.');
    }
});


/*=========================================================================================================*/
//==========================================================================//
//THIS SECTION IS FOR THE DASHBOARD TAB ON ADMIN CONSOLE
//
//==========================================================================//


router.post('/export-chats', managementController.exportChatsToCSV);


router.post('/refresh-sessions', async (req, res) => {
    try {
        const totalSessions = await managementController.getTotalSessions();
        const sessionData = await managementController.getSessionData(); // Fetch session data

        // Log the session data to ensure the 'created_at' field is present
        // console.log('Session Data:', sessionData);

        res.json({ totalSessions, sessionData }); // Send both totalSessions and sessionData
    } catch (error) {
        console.error("Error fetching updated sessions:", error.message);
        res.status(500).json({ error: 'An error occurred while fetching session data.' });
    }
});




router.post('/check-ollama', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:11434/');

        // If Ollama is running, send the response
        res.json({ status: 'ok', message: 'Ollama is running', data: response.data });
    } catch (error) {
        console.error("Full Error Object:", error); // Log the entire error object

        let errorMessage = 'An unknown error occurred while trying to connect to Ollama.';

        // Check for specific error types
        if (error.response) {
            // Server responded with a non-2xx status code
            console.error("Response Error:", error.response); // Log the response error
            errorMessage = `Ollama server returned an error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            // No response received
            console.error("Request Error:", error.request); // Log the request error
            errorMessage = 'No response received from Ollama. Please check if Ollama is running on the specified port.';
        } else {
            // General error
            console.error("General Error:", error.message); // Log the general error message
            errorMessage = `Error while setting up the request: ${error.message}`;
        }

        return res.status(500).json({ status: 'error', message: errorMessage });
    }
});




//==========================================================================//
//THIS SECTION IS FOR THE PROFILES TAB ON ADMIN CONSOLE
//
//==========================================================================//


router.post('/admin-register-user', managementController.adminRegisterUser)


module.exports = router;