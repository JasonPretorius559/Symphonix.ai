// routes/registerRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser } = require('./registerController');

// Render the registration page
router.get('/', (req, res) => {
  res.render('register-page'); // 'register.ejs' view
});

// Handle form submission
router.post('/register', registerUser);

module.exports = router;
