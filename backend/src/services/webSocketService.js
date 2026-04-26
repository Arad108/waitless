// src/services/webSocketService.js
const WebSocket = require('ws');
const redis = require('redis');

let wss;
let pubClient; // Publisher: Sends messages to Redis
let subClient; // Subscriber: Listens for messages from Redis

const initializeWebSocketServer = async (server) => {
    // 1. Initialize Redis Clients
    // In production, REDIS_URL will be provided by your cloud host (e.g., AWS ElastiCache)
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    pubClient = redis.createClient({ url: redisUrl });
    subClient = pubClient.duplicate(); // Subscribers must be on a dedicated client

    pubClient.on('error', (err) => console.error('Redis Publisher Error:', err));
    subClient.on('error', (err) => console.error('Redis Subscriber Error:', err));

    await pubClient.connect();
    await subClient.connect();
    console.log('Connected to Redis Pub/Sub successfully');

    // 2. Initialize WebSocket Server
    wss = new WebSocket.Server({ server });

    // 3. Listen to Redis for updates from ANY server instance
    // Whenever ANY server publishes to 'QUEUE_UPDATES', this specific server hears it
    await subClient.subscribe('QUEUE_UPDATES', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            // Now that this server heard the update, it sends it to its own local clients
            broadcastToLocalClients(parsedMessage.businessId, parsedMessage.type, parsedMessage.data);
        } catch (error) {
            console.error('Failed to parse Redis message:', error);
        }
    });

    // 4. Handle incoming browser connections
    wss.on('connection', (ws) => {
        console.log('New browser connection established');
        ws.subscriptions = new Set();

        ws.on('message', (message) => {
            try {
                const parsed = JSON.parse(message);
                if (parsed.type === 'SUBSCRIBE_QUEUE') {
                    ws.subscriptions.add(parsed.businessId.toString());
                }
                if (parsed.type === 'UNSUBSCRIBE_QUEUE') {
                    ws.subscriptions.delete(parsed.businessId.toString());
                }
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        });

        ws.on('close', () => {
            ws.subscriptions.clear();
        });
    });
};

// ==========================================
// BROADCASTING LOGIC
// ==========================================

// This is called by your QueueService when a database change happens
const broadcastToBusiness = async (businessId, type, data) => {
    if (!pubClient) return;

    // We do NOT send directly to the browser here.
    // Instead, we publish the event to the central Redis hub.
    const payload = JSON.stringify({
        businessId: businessId.toString(),
        type,
        data
    });

    await pubClient.publish('QUEUE_UPDATES', payload);
};

// This internal helper is called when Redis notifies the server of an update
const broadcastToLocalClients = (businessId, type, data) => {
    if (!wss) return;

    wss.clients.forEach((client) => {
        // Check if the client is connected AND subscribed to this room
        if (client.readyState === WebSocket.OPEN && client.subscriptions.has(businessId)) {
            client.send(JSON.stringify({
                type,
                businessId,
                data
            }));
        }
    });
};

module.exports = {
    initializeWebSocketServer,
    broadcastToBusiness
};