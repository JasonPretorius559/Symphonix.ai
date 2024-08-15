const bcrypt = require('bcrypt');
const connection = require('../db'); // Ensure this path is correct


// Handle user registration
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';

  try {
    // Check if the username already exists
    const [existingUserResults] = await connection.query(checkUserQuery, [username]);

    if (existingUserResults.length > 0) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await connection.query(insertUserQuery, [username, hashedPassword]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during user registration:', err); // Log the error
    return res.status(500).json({ error: 'Error registering user' });
  }
};

// Export the function
module.exports = { registerUser };
