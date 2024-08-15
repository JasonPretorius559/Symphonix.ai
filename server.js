const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { sessionMiddleware, Authenticated } = require('./auth'); // Import session middleware and authentication check

const homeRoutes = require('./Home/homeRoutes');
const registerRoutes = require('./Register/registerRoutes');
const loginRoutes = require('./Login/loginRoutes');



const app = express();
// Use session middleware
app.use(sessionMiddleware);
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



// Use routes
app.use('/home', Authenticated, homeRoutes);
app.use('/register', registerRoutes);
app.use('/', loginRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).render('404'); // Render a 404 page if it exists
});

// Handle 500 errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500'); // Render a 500 page if it exists
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
