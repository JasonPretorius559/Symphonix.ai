const express = require('express');
const path = require('path');
const session = require('express-session');
const { sessionMiddleware, Authenticated } = require('./auth'); // Import session middleware and authentication check

const homeRoutes = require('./Home/homeRoutes');
const registerRoutes = require('./Register/registerRoutes');

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse application/x-www-form-urlencoded and application/json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use session middleware
app.use(sessionMiddleware);

// Use routes
app.use('/home', Authenticated, homeRoutes);
app.use('/', registerRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
