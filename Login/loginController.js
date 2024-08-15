const bcrypt = require('bcrypt');
const connection = require('../db'); // Import the database connection

// Handle user login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const query = 'SELECT userid, username, password FROM users WHERE username = ?';

  try {
    // Execute the query using promise-based connection
    const [results] = await connection.query(query, [username]);

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Create a session and include the user ID
      req.session.user = { id: user.userid, username: user.username };
      console.log('Session after login:', req.session); // Debug session
      return res.json({ success: true }); // Return JSON on success
    } else {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error processing request:', err); // Log the error
    return res.status(500).json({ error: 'Error processing request' });
  }
};

// Export the function
module.exports = { loginUser };
