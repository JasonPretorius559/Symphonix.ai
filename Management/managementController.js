const connection = require('../db'); // Adjust the path to your db.js file
const { Parser } = require('json2csv'); 
const bcrypt = require('bcrypt');

// Fetch total number of active sessions
const getTotalSessions = async () => {
    let conn;
    try {
        conn = await connection.getConnection(); // Get a connection from the pool
        
        // Get the current timestamp in seconds
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        // Log the current timestamp for debugging purposes
        console.log("Current Timestamp (in seconds):", currentTimestamp);
        
        // Define the expiration period in seconds (e.g., 24 hours)
        const expirationPeriod = 24 * 60 * 60; // 24 hours
        
        // Log the calculated expiration timestamp
        const expirationTimestamp = currentTimestamp - expirationPeriod;
        console.log("Expiration Timestamp:", expirationTimestamp);
        
        // Query to fetch active sessions
        const [rows] = await conn.execute(
            'SELECT COUNT(*) AS active_count FROM sessions WHERE expires >= ?',
            [expirationTimestamp]
        );
        
        return rows[0].active_count;
    } catch (error) {
        console.error("Error fetching active sessions:", error.message);
        throw error;
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
};


const getSessionData = async () => {
    let conn;
    try {
        conn = await connection.getConnection(); // Get a connection from the pool
        const [rows] = await conn.execute(`
            SELECT 
                users.username AS UserName, 
                sessions.userid AS UserID,
                (SELECT COUNT(*) FROM chats WHERE chats.userid = sessions.userid AND delete_status = 0) AS OpenChats,
                sessions.last_interaction AS LastSession,
                FROM_UNIXTIME(sessions.expires) AS ExpiryTime,
                sessions.user_ip_address AS IPAddress
            FROM sessions
            JOIN users ON sessions.userid = users.userid
            WHERE sessions.expires > UNIX_TIMESTAMP()  -- Only include active sessions
            AND sessions.created_at <= NOW()           -- Ensure sessions have been created
            ORDER BY LastSession DESC;

        `);
        return rows; // Return the array of session data
    } catch (error) {
        console.error("Error fetching session data:", error.message);
        throw error;
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
};

async function exportChatsToCSV(req, res) {
    let conn;
    try {
        conn = await connection.getConnection(); // Get a connection from the pool

        const [rows] = await conn.query(`
            SELECT 
                users.username AS UserName, 
                sessions.userid AS UserID,
                (SELECT COUNT(*) FROM chats WHERE chats.userid = sessions.userid) AS OpenChats,
                sessions.last_interaction AS LastSession,
                FROM_UNIXTIME(sessions.expires) AS ExpiryTime,
                sessions.user_ip_address AS IPAddress
            FROM sessions
            JOIN users ON sessions.userid = users.userid
            WHERE sessions.expires > UNIX_TIMESTAMP()  -- Only include active sessions
              AND sessions.created_at <= NOW()           -- Ensure sessions have been created
            ORDER BY LastSession DESC
        `);

        // No need to release the connection manually if using mysql2/promise
        // conn.release(); // Remove this line

        if (rows.length === 0) {
            return res.status(404).send('No data available to export.');
        }

        const parser = new Parser(); // Create a new parser instance
        const csv = parser.parse(rows); // Convert JSON data to CSV
        res.header('Content-Type', 'text/csv');
        res.attachment('sessions.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting chats to CSV:', error.message);
        res.status(500).send('An error occurred while exporting the chats.');
    } finally {
        if (conn) {
            try {
                await conn.release(); // Close the connection if needed
            } catch (error) {
                console.error('Error closing the connection:', error.message);
            }
        }
    }
}
//==========================================================================//
//THIS SECTION IS FOR THE PROFILES TAB ON ADMIN CONSOLE
//
//==========================================================================//
const adminRegisterUser = async (req, res) => {
    const { username, password, status, permissions } = req.body;

    // Convert status and permissions to the corresponding database values
    const disabledStatus = status === 'active' ? 0 : 1;
    const accessRole = permissions === 'admin' ? 1 : 0;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Backend password complexity validation
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexityRegex.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    const insertUserQuery = 'INSERT INTO users (username, password, disabled_status, access_role) VALUES (?, ?, ?, ?)';

    try {
        // Check if the username already exists
        const [existingUserResults] = await connection.query(checkUserQuery, [username]);

        if (existingUserResults.length > 0) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await connection.query(insertUserQuery, [username, hashedPassword, disabledStatus, accessRole]);

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during user registration:', err);
        return res.status(500).json({ error: 'Error registering user' });
    }
};



module.exports = {
    getTotalSessions,
    getSessionData,
    exportChatsToCSV,
    adminRegisterUser,
};
