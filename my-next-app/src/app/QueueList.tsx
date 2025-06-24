"use client"
import { useEffect, useState } from 'react';

interface QueueEntry {
  id: number;
  customer_name: string;
  service_name: string;
  status: string;
}

interface QueueMessage {
  type: string;
  queue: QueueEntry[];
  queueLength: number;
  estimatedWaitTime: number;
}

const QueueList = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:5000');  // Replace with your WebSocket URL

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message: QueueMessage = JSON.parse(event.data);
      
      if (message.type === 'QUEUE_UPDATED') {
        setQueue(message.queue);
        setQueueLength(message.queueLength);
        setEstimatedWaitTime(message.estimatedWaitTime);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h2>Queue List</h2>
      <p>Queue Length: {queueLength}</p>
      <p>Estimated Wait Time: {estimatedWaitTime} minutes</p>

      <ul>
        {queue.map((entry) => (
          <li key={entry.id}>
            <p>{entry.customer_name} - {entry.service_name}</p>
            <p>Status: {entry.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueList;
