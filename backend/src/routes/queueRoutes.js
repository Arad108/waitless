// server/src/routes/queueRoutes.js
const express = require('express');
const {
  addToQueue, // POST handler to add to the queue
  getQueueEntries, // GET handler to fetch all queue entries
  getQueueEntryById, // GET handler to fetch a specific queue entry
  updateQueueStatus, // PUT handler to update queue status
  deleteQueueEntry, // DELETE handler to delete a queue entry
} = require('../controllers/queueController'); // Ensure these functions are correctly imported from queueController
const router = express.Router();

// Route to add user to queue
router.post('/', addToQueue);

// Route to get all queue entries for a business
router.get('/:businessId', getQueueEntries); // This should be calling the getQueueEntries function

// Route to get a specific queue entry by ID
router.get('/entry/:id', getQueueEntryById); // Assuming you want to get a specific queue entry by ID

// Route to update a user's status in the queue
router.put('/:entryId', updateQueueStatus);

// Route to delete a queue entry by ID
router.delete('/:id', deleteQueueEntry);

module.exports = router;
