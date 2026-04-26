// src/services/kafkaService.js
const { Kafka } = require('kafkajs');

class KafkaService {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'waitless-api-producer',
            // In production, this would be your AWS MSK or Confluent Cloud broker URLs
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] 
        });
        
        this.producer = this.kafka.producer();
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) return;
        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log('Successfully connected to Kafka Producer');
        } catch (error) {
            console.error('Failed to connect to Kafka:', error);
        }
    }

    // This is the method our QueueService will call
    async publishNotificationEvent(eventType, payload) {
        if (!this.isConnected) await this.connect();

        try {
            await this.producer.send({
                topic: 'notification-events', // The Kafka Topic
                messages: [
                    {
                        key: payload.userId ? payload.userId.toString() : 'guest',
                        value: JSON.stringify({
                            type: eventType,
                            timestamp: new Date().toISOString(),
                            data: payload
                        })
                    }
                ]
            });
            console.log(`[Kafka] Published event: ${eventType}`);
        } catch (error) {
            console.error(`[Kafka] Failed to publish ${eventType}:`, error);
            // We don't throw the error because we don't want a failed notification 
            // to crash the entire queue updating process.
        }
    }
}

// Export as a Singleton so we share one connection pool across the app
module.exports = new KafkaService();