const express = require('express');
const { loginUser } = require('./loginController');

const router = express.Router();

// Render the login page
router.get('/', (req, res) => {
  res.render('login-page');
});

// Handle login form submission
router.post('/login', loginUser);

module.exports = router;
