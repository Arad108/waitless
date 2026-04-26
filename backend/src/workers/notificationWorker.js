// src/workers/notificationWorker.js
const { Kafka } = require('kafkajs');

// 1. Initialize Kafka Client
const kafka = new Kafka({
    clientId: 'waitless-notification-consumer',
    // Must match the broker URL used in your producer
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] 
});

// 2. Create the Consumer
// The groupId ensures that if you run 5 copies of this worker, 
// they share the load and don't send duplicate emails.
const consumer = kafka.consumer({ groupId: 'notification-group' });

// 3. Mock Email/SMS Services (Replace with SendGrid/Twilio later)
const sendEmail = async (email, subject, body) => {
    console.log(`\n[EMAIL SENDER] Sending to: ${email}`);
    console.log(`[EMAIL SENDER] Subject: ${subject}`);
    console.log(`[EMAIL SENDER] Body: ${body}\n`);
    // await sendgrid.send({...})
};

const sendSMS = async (phone, message) => {
    console.log(`\n[SMS SENDER] Sending to: ${phone}`);
    console.log(`[SMS SENDER] Message: ${message}\n`);
    // await twilio.messages.create({...})
};

// 4. The Main Worker Loop
const runWorker = async () => {
    try {
        await consumer.connect();
        console.log('✅ Notification Worker connected to Kafka');

        // Subscribe to the exact topic your QueueService publishes to
        await consumer.subscribe({ topic: 'notification-events', fromBeginning: false });

        // Listen for messages
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const event = JSON.parse(message.value.toString());
                const { type, data } = event;

                console.log(`📥 Received Event: ${type} for User: ${data.name}`);

                // 5. Handle different event types
                switch (type) {
                    case 'USER_TURN_STARTED':
                        // If they have a phone number, text them. Otherwise, email.
                        if (data.phone) {
                            await sendSMS(data.phone, `Hi ${data.name}, it's your turn for ${data.serviceName}! Please head to the front desk.`);
                        } else if (data.email) {
                            await sendEmail(data.email, "It's your turn!", `Please head to the front desk for your ${data.serviceName}.`);
                        }
                        break;

                    case 'SERVICE_COMPLETED':
                        if (data.email) {
                            await sendEmail(
                                data.email, 
                                "Thank you for using WaitLess!", 
                                `Hi ${data.name}, your service is complete. Please leave us a review!`
                            );
                        }
                        break;

                    default:
                        console.log(`⚠️ Unknown event type received: ${type}`);
                }
            },
        });
    } catch (error) {
        console.error('❌ Error in Notification Worker:', error);
    }
};

// 5. Start the worker and handle graceful shutdowns
runWorker().catch(console.error);

// Graceful disconnect on Ctrl+C
process.on('SIGINT', async () => {
    console.log('Disconnecting worker...');
    await consumer.disconnect();
    process.exit(0);
});