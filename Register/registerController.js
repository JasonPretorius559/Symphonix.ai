const bcrypt = require('bcrypt');
const connection = require('../db'); // Import the database connection

// Handle user registration
const registerUser = (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Check if the username already exists
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking username' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Error hashing password' });
      }

      // Insert user into the database
      const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
      connection.query(insertUserQuery, [username, hashedPassword], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Error registering user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
};

module.exports = { registerUser };
