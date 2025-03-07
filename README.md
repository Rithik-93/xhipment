# Xhipment E-Commerce Microservices

A robust e-commerce backend system built with a microservice architecture that demonstrates modern backend development practices and AWS integration.

## 🚀 Features

* **Authentication System** : Secure JWT-based authentication and authorization
* **Asynchronous Processing** : Queue-based order processing with AWS SQS
* **Caching Strategy** : Redis-based caching for optimized performance
* **Email Notifications** : AWS SES integration for transaction emails
* **Inventory Management** : Stock validation and automated updates
* **High Resilience** : Error handling, retry mechanisms, and failover strategies

## 🏗️ Architecture

The application is built with a microservice architecture consisting of:

* **Backend API Service** : Handles HTTP requests, authentication, and business logic
* **Worker Service** : Processes queued jobs asynchronously (orders, inventory updates)
* **Database Layer** : MongoDB storage
* **Caching Layer** : Redis for performance optimization
* **Message Queue** : AWS SQS for asynchronous communication

## 🛠️ Tech Stack

* **Node.js & Express** : Core backend framework
* **Prisma ORM** : Database access and management
* **TypeScript** : Type-safe development
* **AWS SDK** : Cloud service integration (SQS, SES)
* **Redis (ioredis)** : Caching and rate limiting
* **Docker & Docker Compose** : Containerization
* **JWT** : Authentication
* **Zod** : Runtime validation

## 🔧 Setup Instructions

### Prerequisites

* Node.js (v16+)
* pnpm
* Docker and Docker Compose
* MongoDB instance (local or cloud)
* AWS account with SQS and SES access

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Rithik-93/xhipment.git
cd xhipment/app
```

2. Set up environment files:

```bash
cp packages/database/.env.example packages/database/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/backend/.env.example apps/backend/.env
```

3. Configure your MongoDB connection string in `packages/database/.env`
4. Start Redis:

```bash
docker run -d --name myredis -p 6379:6379 redis
```

5. Add Redis connection string to both services:

```
# In apps/worker/.env and apps/backend/.env
REDIS_URI=redis://localhost:6379
```

6. Install dependencies and set up the database:

```bash
pnpm install
pnpm db:setup
```

7. Start the services:

```bash
pnpm start:backend
pnpm start:worker
```

### Key Endpoints

### API Schemas

##### Register (POST /api/v1/auth/register)

```json
{
    "email": "example@gmail.com",
    "password": "secret"
}
```

##### Login (POST /api/v1/auth/login)

```json
{
    "email": "example@gmail.com",
    "password": "secret"
}
```

#### Orders

##### Create Order (POST /api/v1/orders)

```json
{
    "location": "bangalore",
    "totalAmount": 4324,
    "items": [
        {
            "productId": "67c8830b7ef1b848ac52ebec",
            "quantity": 1
        },
        {
            "productId": "67c8830b7ef1b848ac52ebee",
            "quantity": 2
        } 
    ]
}
```

##### Get Order Status (GET /api/v1/orders/:orderId)

```json
/api/v1/orders/:orderId
```

## 🚀 Deployment

The application can be deployed on any container orchestration platform (Kubernetes, ECS, etc.) or directly on EC2 instances using the provided Docker Compose configuration.

## ⚠️ Error Handling

The system implements comprehensive error handling:

* Validation errors for input data
* Business logic errors with appropriate HTTP status codes
* Asynchronous job failures with retry mechanisms
* Graceful degradation when dependent services are unavailable

## 🔄 Caching Strategy

* Product catalog caching
* User session caching
* Order status caching with TTL
* Cache invalidation on data updates

## 👨‍💻 Development

### Project Structure

```
app/
├── apps/
│   ├── backend/          # Main API service
│   └── worker/           # Async job processor
├── packages/
│   └── database/         # Shared database layer
├── docker-compose.yaml   # Container orchestration
└── package.json          # Root package file
```
