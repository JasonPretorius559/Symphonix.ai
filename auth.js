const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Use express-mysql-session for session storage
const connection = require('./db'); // Import the connection pool from db.js

// Configure MySQL session store using the connection pool from db.js
const sessionStore = new MySQLStore({
  expiration: 24 * 60 * 60 * 1000, // Session expiration time (1 day)
  endConnectionOnClose: false,     // Keep the connection alive
}, connection); // Use the MySQL connection pool directly

// Middleware configuration for sessions with MySQL store
const sessionMiddleware = session({
  secret: '777777777', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Use MySQL session store
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (1 day)
  }
});


// Middleware to check authentication
const Authenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // User is authenticated
  } else {
    res.redirect('/'); // Redirect if not authenticated
  }
};

const admin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 1) {
    return next(); // User is admin
  } else {
    res.redirect('/home'); // Redirect if not admin
  }
};


module.exports = { sessionMiddleware, Authenticated, admin };
