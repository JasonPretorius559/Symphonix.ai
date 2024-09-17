const express = require('express');
const managementController = require('./managementController'); // Adjust the path to your ManagementController

const router = express.Router();

// Route to render the management console with total sessions
router.get('/', async (req, res) => {
    try {
        const totalSessions = await managementController.getTotalSessions();
        res.render('management-console', { totalSessions });
        console.log(totalSessions)
    } catch (error) {
        console.error("Error rendering management console:", error.message);
        res.status(500).send("An error occurred while fetching session data.");
    }
});

router.get('/refresh-sessions', async (req, res) => {
  try {
      const totalSessions = await managementController.getTotalSessions(); // Corrected variable name
      res.json({ totalSessions });
  } catch (error) {
      console.error("Error fetching updated sessions:", error.message);
      res.status(500).json({ error: 'An error occurred while fetching session data.' });
  }
});


module.exports = router;
