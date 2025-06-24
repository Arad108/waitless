// controllers/queueController.js
const { broadcastToClients } = require('../services/webSocketService');
const Queue = require('../models/queueModel');

// Fetch all queue entries for a business
exports.getQueueEntries = async (req, res) => {
    const { businessId } = req.params;
    try {
        const queueEntries = await Queue.find({ business_id: businessId })
            .sort({ created_at: 1 })
            .populate('user_id', 'name email') // Optional: populate user details
            .populate('service_id', 'name duration'); // Optional: populate service details

        if (!queueEntries.length) {
            return res.status(404).json({ message: 'No queue entries found' });
        }

        res.status(200).json(queueEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch queue entries' });
    }
};

// Fetch a specific queue entry by ID
exports.getQueueEntryById = async (req, res) => {
    const { id } = req.params;
    try {
        const queueEntry = await Queue.findById(id)
            .populate('user_id', 'name email')
            .populate('service_id', 'name duration');

        if (!queueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        res.status(200).json(queueEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch queue entry' });
    }
};

// Create a new queue entry
exports.addToQueue = async (req, res) => {
    const { business_id, service_id, user_id, status, estimated_wait_time } = req.body;
    try {
        const newQueueEntry = new Queue({
            business_id,
            service_id,
            user_id,
            status,
            estimated_wait_time,
            created_at: new Date()
        });

        const savedEntry = await newQueueEntry.save();
        
        // Populate the saved entry with related data
        const populatedEntry = await Queue.findById(savedEntry._id)
            .populate('user_id', 'name email')
            .populate('service_id', 'name duration');

        // Send the new queue entry to all connected WebSocket clients
        broadcastToClients({
            type: 'queue_update',
            data: populatedEntry
        });

        res.status(201).json(populatedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create queue entry' });
    }
};

// Update a queue entry status
exports.updateQueueStatus = async (req, res) => {
    const { id } = req.params;
    const { status, actual_wait_time, start_time, end_time } = req.body;
    try {
        const updatedQueueEntry = await Queue.findByIdAndUpdate(
            id,
            {
                status,
                actual_wait_time,
                start_time,
                end_time,
                updated_at: new Date()
            },
            { new: true } // Return updated document
        ).populate('user_id', 'name email')
         .populate('service_id', 'name duration');

        if (!updatedQueueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        // Send the updated queue entry to all connected WebSocket clients
        broadcastToClients({
            type: 'queue_update',
            data: updatedQueueEntry
        });

        res.status(200).json(updatedQueueEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update queue status' });
    }
};

// Delete a queue entry by ID
exports.deleteQueueEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEntry = await Queue.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        // Notify all clients about the deleted queue entry
        broadcastToClients({
            type: 'queue_delete',
            data: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete queue entry' });
    }
};