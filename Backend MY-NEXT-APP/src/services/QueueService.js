class QueueService {
    constructor(database, websocket) {
        this.database = database;
        this.ws = websocket;
    }

    // Add a user to the queue
    async addToQueue(businessId, userId, serviceId, isPriorityPass) {
        try {
            // Calculate estimated wait time based on current queue and service duration
            const estimatedWaitTime = await this.calculateWaitTime(businessId, serviceId);

            // Add entry to the queue in Firebase Realtime Database
            const queueRef = this.database.ref(`queues/${businessId}`).push();  // Push new entry to the business queue
            const entry = {
                userId,
                serviceId,
                status: 'waiting',
                estimatedWaitTime,
                priorityPass: isPriorityPass,
                checkInTime: Date.now(),  // You can add more fields as needed
            };

            // Set the new queue entry in Firebase
            await queueRef.set(entry);

            // Notify all clients about queue update
            this.ws.broadcast(businessId, 'QUEUE_UPDATED', {
                queueLength: await this.getQueueLength(businessId),
                estimatedWaitTime,
            });

            return { id: queueRef.key, ...entry };  // Return the entry with its Firebase ID
        } catch (error) {
            console.error('Error adding to queue:', error);
            throw error;
        }
    }

    // Calculate the estimated wait time
    async calculateWaitTime(businessId, serviceId) {
        try {
            // Fetch service duration from Firebase
            const serviceSnapshot = await this.database.ref(`services/${serviceId}`).once('value');
            const service = serviceSnapshot.val();

            // Get the queue status (number of waiting entries)
            const queueSnapshot = await this.database.ref(`queues/${businessId}`).orderByChild('status').equalTo('waiting').once('value');
            const queueLength = queueSnapshot.numChildren();

            // Calculate the estimated wait time (this is a simple example, you can adjust it as needed)
            const baseWaitTime = service.durationMinutes * queueLength;
            const bufferTime = Math.ceil(baseWaitTime * 0.1);

            return baseWaitTime + bufferTime;
        } catch (error) {
            console.error('Error calculating wait time:', error);
            throw error;
        }
    }

    // Update the status of a queue entry
    async updateQueueStatus(entryId, newStatus) {
        try {
            const entryRef = this.database.ref(`queues/${entryId}`);

            const updates = { status: newStatus };
            if (newStatus === 'in_progress') {
                updates.startTime = Date.now();
            } else if (newStatus === 'completed') {
                updates.endTime = Date.now();
            }

            // Update the entry in Firebase
            await entryRef.update(updates);

            // If completed, update analytics (you can implement this as needed)
            if (newStatus === 'completed') {
                await this.updateAnalytics(entryId);
            }

            return { entryId, ...updates };
        } catch (error) {
            console.error('Error updating queue status:', error);
            throw error;
        }
    }

    // Get the current queue status for a business
    async getQueueStatus(businessId) {
        try {
            const queueSnapshot = await this.database.ref(`queues/${businessId}`).orderByChild('status').equalTo('waiting').once('value');
            const queueEntries = queueSnapshot.val();

            if (!queueEntries) return [];

            const result = Object.keys(queueEntries).map(key => {
                const entry = queueEntries[key];
                entry.id = key;  // Add Firebase key to entry
                return entry;
            });

            return result;
        } catch (error) {
            console.error('Error fetching queue status:', error);
            throw error;
        }
    }

    // Get the length of the queue for a business
    async getQueueLength(businessId) {
        try {
            const queueSnapshot = await this.database.ref(`queues/${businessId}`).once('value');
            return queueSnapshot.numChildren();
        } catch (error) {
            console.error('Error getting queue length:', error);
            throw error;
        }
    }

    // Example method to update analytics (implement as needed)
    async updateAnalytics(entryId) {
        // Your logic for updating analytics goes here
        console.log(`Updating analytics for entry: ${entryId}`);
    }
}

module.exports = QueueService;
