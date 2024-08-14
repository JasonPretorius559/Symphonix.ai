const express = require('express');
const router = express.Router();



// Route to render the chat page
router.get('/', (req, res) => {
  res.render('home-page');
});

module.exports = router;
