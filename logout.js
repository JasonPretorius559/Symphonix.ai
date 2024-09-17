const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
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