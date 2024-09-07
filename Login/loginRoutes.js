const express = require('express');
const { loginUser } = require('./loginController');

const router = express.Router();

// Render the login page
router.get('/', (req, res) => {
  res.render('login-page');
});

router.post('/login', (req, res, next) => {
  // Call the loginUser function immediately
  loginUser(req, res, next);
});

module.exports = router;
