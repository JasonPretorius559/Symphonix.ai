const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Use express-mysql-session for session storage
const connection = require('./db'); // Import the connection pool from db.js

// Configure MySQL session store using the connection pool from db.js
const sessionStore = new MySQLStore({
  expiration: 24 * 60 * 60 * 1000, // Session expiration time (1 day in milliseconds)
  endConnectionOnClose: false,     // Keep the connection alive
  createDatabaseTable: true        // Automatically create the sessions table if it doesn't exist
}, connection); // Use the MySQL connection pool directly

// Middleware configuration for sessions with MySQL store
const sessionMiddleware = session({
  secret: '777777777', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Use MySQL session store
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (1 day in milliseconds)
  }
});

const captureIpMiddleware = async (req, res, next) => {
  let userIp = req.ip || req.connection.remoteAddress;

  // Remove "::ffff:" if it's an IPv4-mapped IPv6 address
  if (userIp.startsWith('::ffff:')) {
    userIp = userIp.split('::ffff:')[1];
  }

  console.log('Captured IP:', userIp); // Debug IP capture

  if (req.sessionID && req.session.user && req.session.user.id) { // Assuming req.session.user.id holds the user ID
    const userId = req.session.user.id; // Get the user ID from the session
    console.log('Session ID:', req.sessionID); // Debug session ID
    console.log('User ID:', userId); // Debug user ID

    // Get the current time + 24 hours in UNIX timestamp (seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = currentTime + (24 * 60 * 60); // 24 hours in seconds

    try {
      const conn = await connection.getConnection();
      await conn.execute(
        'UPDATE sessions SET user_ip_address = ?, userid = ?, expires = ? WHERE session_id = ?',
        [userIp, userId, expirationTime, req.sessionID]
      );
      conn.release();
    } catch (error) {
      console.error('Error updating session with IP address, user ID, and expiration time:', error);
    }
  }

  next();
};


// Middleware to check authentication
const Authenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // User is authenticated
  } else {
    res.redirect('/'); // Redirect if not authenticated
  }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 1) {
    return next(); // User is admin
  } else {
    res.redirect('/home'); // Redirect if not admin
  }
};

// Get the user's IP address from the session (or database)
const getUserIp = async (req) => {
  try {
    const conn = await connection.getConnection();
    const [rows] = await conn.execute(
      'SELECT ip_address FROM sessions WHERE session_id = ?',
      [req.sessionID]
    );
    conn.release();
    return rows.length ? rows[0].ip_address : null;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
};


// Middleware to update last interaction timestamp
const updateLastInteractionMiddleware = async (req, res, next) => {
  if (req.sessionID) {
      try {
          const conn = await connection.getConnection();
          await conn.execute(
              'UPDATE sessions SET last_interaction = NOW() WHERE session_id = ?',
              [req.sessionID]
          );
          conn.release();
      } catch (error) {
          console.error('Error updating last interaction:', error);
      }
  }
  next();
};


module.exports = {
  sessionMiddleware,
  captureIpMiddleware,
  Authenticated,
  admin,
  getUserIp,
  updateLastInteractionMiddleware,
};
