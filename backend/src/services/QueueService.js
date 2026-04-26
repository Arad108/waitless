// src/services/QueueService.js
const Queue = require('../models/queueModel');
const Service = require('../models/serviceModel');
const { broadcastToBusiness } = require('./webSocketService');

const kafkaService = require('./kafkaService');

class QueueService {
    
    // 1. Calculate wait time dynamically based on the DB
    static async calculateWaitTime(businessId, serviceId) {
        const service = await Service.findById(serviceId);
        if (!service) throw new Error('Service not found');

        // Count how many people are currently waiting
        const waitingCount = await Queue.countDocuments({
            business_id: businessId,
            status: 'waiting'
        });

        const baseWaitTime = service.durationMinutes * waitingCount;
        const bufferTime = Math.ceil(baseWaitTime * 0.1); // 10% buffer
        return baseWaitTime + bufferTime;
    }

    // 2. Add to Queue (NOW WITH GUEST SUPPORT & PRIORITY PASS)
    static async addToQueue({ businessId, serviceId, userId, customerDetails, isPriorityPass }) {
        const estimatedWaitTime = await this.calculateWaitTime(businessId, serviceId);

        // Create the new entry, accommodating either a registered user OR a guest
        const newQueueEntry = new Queue({
            business_id: businessId,
            service_id: serviceId,
            user_id: userId || null, 
            customer_details: customerDetails || null, // For walk-ins without accounts
            status: 'waiting',
            estimated_wait_time: estimatedWaitTime,
            priority_pass: isPriorityPass || false,
            created_at: new Date()
        });

        const savedEntry = await newQueueEntry.save();
        
        // Populate references for the frontend
        const populatedEntry = await Queue.findById(savedEntry._id)
            .populate('user_id', 'full_name email')
            .populate('service_id', 'name durationMinutes');

        // 🔥 Broadcast the new entry to the specific business room 🔥
        broadcastToBusiness(businessId, 'QUEUE_JOINED', populatedEntry);

        // Also broadcast the updated queue length so dashboard badges/counters update
        const newLength = await this.getQueueLength(businessId);
        broadcastToBusiness(businessId, 'QUEUE_LENGTH_UPDATED', { queueLength: newLength });

        return populatedEntry;
    }

    // 3. Update status
    static async updateQueueStatus(entryId, newStatus) {
        const updates = { status: newStatus, updated_at: new Date() };
        
        if (newStatus === 'in_progress') updates.start_time = new Date();
        if (newStatus === 'completed') updates.end_time = new Date();

        const updatedEntry = await Queue.findByIdAndUpdate(
            entryId,
            updates,
            { new: true }
        ).populate('user_id', 'full_name email phone').populate('service_id', 'name');

        if (!updatedEntry) throw new Error('Queue entry not found');

        // 1. Broadcast UI Update (Redis/WebSockets)
        broadcastToBusiness(updatedEntry.business_id, 'QUEUE_STATUS_CHANGED', updatedEntry);

        // 2. TRIGGER KAFKA NOTIFICATIONS (Background processing)
        if (updatedEntry.user_id) { // Only send if it's a registered user, not a guest
            
            if (newStatus === 'in_progress') {
                // Tell Kafka to trigger an "It's your turn!" notification
                await kafkaService.publishNotificationEvent('USER_TURN_STARTED', {
                    userId: updatedEntry.user_id._id,
                    email: updatedEntry.user_id.email,
                    phone: updatedEntry.user_id.phone,
                    name: updatedEntry.user_id.full_name,
                    serviceName: updatedEntry.service_id.name
                });
            }

            if (newStatus === 'completed') {
                // Tell Kafka to trigger a "Thank you / Feedback" notification
                await kafkaService.publishNotificationEvent('SERVICE_COMPLETED', {
                    userId: updatedEntry.user_id._id,
                    email: updatedEntry.user_id.email,
                    name: updatedEntry.user_id.full_name
                });
            }
        }

        return updatedEntry;
    }

    // 4. Fetch the active queue
    static async getActiveQueue(businessId) {
        return await Queue.find({
            business_id: businessId,
            status: { $in: ['waiting', 'in_progress'] }
        })
        .sort({ 
            priority_pass: -1, // Priority passes float to the top of the line
            created_at: 1      // Then standard FIFO (First-In-First-Out) for everyone else
        }) 
        .populate('user_id', 'full_name')
        .populate('service_id', 'name durationMinutes');
    }

    // 5. Get Queue Length (Restored from your Firebase code)
    static async getQueueLength(businessId) {
        return await Queue.countDocuments({
            business_id: businessId,
            status: 'waiting'
        });
    }

    // 6. Update Analytics (Restored from your Firebase code)
    static async updateAnalytics(entryId) {
        // In the future, this can write to an 'Analytics' database collection
        // tracking average wait times, peak hours, and staff efficiency.
        console.log(`[Analytics] Queue entry ${entryId} completed. Processing metrics...`);
    }
}

module.exports = QueueService;