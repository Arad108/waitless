# WaitLess

**WaitLess** helps users escape physical queues and book services online.  
It enables virtual queue management for businesses like salons, gyms, gaming zones, etc.

## Stack
- **Frontend:** Next.js (React)
- **Backend:** Node.js (Express)
- **Database:** MongoDB (with plans for advanced indexing, sharding, replication)
- **Other planned tech:** Redis, Kafka, Nginx/Load Balancer, Rate limiting, Captcha/DDoS defense

## Structure
- `frontend/` — Next.js app
- `backend/` — Node.js API server

## Goals
- Real-time queue management (polling, WebSocket, or SSE)
- Scalable microservice-ready architecture
- Caching and pub/sub with Redis
- Asynchronous processing and event-driven design using Kafka
- Rate limiting, Captcha integration, DDoS protection
- Load balancing (Nginx / cloud-managed)
- Horizontal and vertical scaling strategies
- Clean API design following common Node.js design patterns

## Future Enhancements
- WebRTC-based real-time communication
- gRPC microservices
- CI/CD and testing automation
