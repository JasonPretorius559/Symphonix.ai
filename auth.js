// auth.js
const session = require('express-session');

// Middleware configuration for sessions with in-memory store
const sessionMiddleware = session({
  secret: '7777777777777777777777777777777777777', // Replace with your own secret key
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time
  }
});

// Middleware to check authentication
const Authenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // User is authenticated, proceed to the route
  } else {
    res.redirect('/') // User is not authenticated
  }
};

module.exports = { sessionMiddleware, Authenticated };
