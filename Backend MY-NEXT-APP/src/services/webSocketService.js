const WebSocket = require('ws');

let wss; // WebSocket Server

// Initialize WebSocket Server
const initializeWebSocketServer = (server) => {
  // Create WebSocket server instance using HTTP server
  wss = new WebSocket.Server({ server });

  // When a new client connects to the WebSocket server
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    // Send a welcome message to the new client
    ws.send(
      JSON.stringify({
        type: 'WELCOME',
        message: 'Welcome to the WebSocket server!',
      })
    );

    // Listen for incoming messages from clients
    ws.on('message', (message) => {
      console.log('Received message:', message);
      // Process the message and update the queue data
      // ...
      broadcastQueueUpdate();
    });

    // Handle disconnections
    ws.on('close', () => {
      console.log('Client disconnected');
      // Update the queue data and broadcast the changes
      // ...
      broadcastQueueUpdate();
    });
  });
};

// Store the queue data
let queue = [];
let queueLength = 0;
let estimatedWaitTime = 0;

// Broadcast queue update to all connected clients
const broadcastQueueUpdate = () => {
  broadcastToClients({
    type: 'QUEUE_UPDATED',
    queue,
    queueLength,
    estimatedWaitTime,
  });
};

// Broadcast message to all connected clients
const broadcastToClients = (data) => {
  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
};

// Function to calculate estimated wait time
const calculateEstimatedWaitTime = (queue) => {
  // Implement your logic to calculate the estimated wait time
  // based on the current queue data
  // ...
  return 10; // Example, replace with your actual calculation
};

module.exports = {
  initializeWebSocketServer,
  broadcastToClients,
};