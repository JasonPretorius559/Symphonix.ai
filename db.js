const mysql = require('mysql2/promise'); // Import promise-based MySQL library

// Create a connection pool to the database
// const connection = mysql.createPool({
//   host: 'localhost', // Replace with your database host
//   user: 'root', // Replace with your database username
//   password: 'root', // Replace with your database password
//   database: 'symphonix_ai', // Replace with your database name
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
const connection = mysql.createPool({
  host: '192.168.3.73', // Replace with your database host
  user: 'jason', // Replace with your database username
  password: 'jason', // Replace with your database password
  database: 'symphonix_ai', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Log the connection status
connection.getConnection()
  .then(() => console.log('Connected to the MySQL database.'))
  .catch(err => console.error('Error connecting to the MySQL database:', err));

module.exports = connection;
