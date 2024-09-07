const express = require('express');
const { loginUser } = require('./loginController');

const router = express.Router();

// Render the login page
router.get('/', (req, res) => {
  res.render('login-page');
});

// Handle login form submission with delay
router.post('/login', (req, res, next) => {
  const delay = 5000; // Delay in milliseconds (e.g., 5 seconds)
  
  console.log(`Simulating a ${delay / 1000} second delay before login is processed...`);

  // Introduce a delay before calling the loginUser function
  setTimeout(() => {
    loginUser(req, res, next);
  }, delay);
});

module.exports = router;
