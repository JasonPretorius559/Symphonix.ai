const connection = require('../db'); // Adjust the path to your db.js file

// Fetch total number of sessions
const getTotalSessions = async () => {
    let conn;
    try {
        conn = await connection.getConnection(); // Get a connection from the pool
        const [rows] = await conn.execute('SELECT COUNT(*) AS total FROM sessions');
        return rows[0].total;
    } catch (error) {
        console.error("Error fetching total sessions:", error.message);
        throw error;
    } finally {
        
        if (conn) conn.release(); // Release the connection back to the pool
    }
};


module.exports = {
    getTotalSessions
};
