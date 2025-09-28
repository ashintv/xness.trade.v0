# XNESS Trading Platform

A full-stack cryptocurrency trading platform built with microservices architecture, featuring real-time market data, WebSocket connections, and a modern React-based frontend.

![Architecture Diagram](./images/architecture-diagram.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

XNESS is a comprehensive trading platform that provides real-time cryptocurrency market data, order management, and trading capabilities. The platform is built with a microservices architecture to ensure scalability, maintainability, and high availability.

## 🏗️ Architecture

The platform consists of several microservices:

### Backend Services

- **API Service** (`app-api`): Main REST API handling user authentication, orders, and trades
- **WebSocket Service** (`wss`): Real-time communication for live market data and order updates
- **Stream Service** (`get_stream`): Data streaming and market data processing
- **HTTP Service** (`http`): Additional HTTP endpoints and middleware
- **Email Worker** (`email-worker`): Asynchronous email processing service

### Frontend

- **Next.js Application** (`fe`): Modern React-based trading interface

### Infrastructure

- **TimescaleDB**: Time-series database for market data and trading history
- **Redis**: Caching and message queuing
- **Docker**: Containerization and orchestration

## ✨ Features

- 🔐 **User Authentication & Authorization**
- 📊 **Real-time Market Data & Charts**
- 📈 **Advanced Trading Interface**
- 🔄 **Order Management (Buy/Sell)**
- 💰 **Balance Management**
- 📱 **Responsive Design**
- ⚡ **WebSocket Real-time Updates**
- 📧 **Email Notifications**
- 🎯 **Multiple Asset Support**

## 🛠️ Tech Stack

### Backend

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **TimescaleDB** - Time-series database
- **Redis** - Cache and message broker
- **Docker** - Containerization

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ApexCharts** - Data visualization
- **Lightweight Charts** - Trading charts
- **Zustand** - State management
- **Axios** - HTTP client

## ⚙️ Prerequisites

Before running the application, make sure you have the following installed:

- **Docker** (version 20.0 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - for local development
- **npm** or **yarn** - for package management

## 🚀 Installation

### Method 1: Docker Deployment (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd xness.trade.v0
   ```

2. **Start the services**

   ```bash
   docker-compose up -d
   ```

3. **Wait for services to initialize**

   ```bash
   # Check if all services are running
   docker-compose ps
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - WebSocket: http://localhost:8080

### Method 2: Local Development

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd xness.trade.v0
   ```

2. **Start infrastructure services**

   ```bash
   docker-compose -f docker-compose.db.yml up -d
   ```

3. **Install and run backend services**

   ```bash
   # API Service
   cd be/app-api
   npm install
   npm run dev

   # WebSocket Service (in new terminal)
   cd be/wss
   npm install
   npm run dev

   # Stream Service (in new terminal)
   cd be/get_stream
   npm install
   npm run dev

   # Email Worker (in new terminal)
   cd be/email-worker
   npm install
   npm run dev
   ```

4. **Install and run frontend**
   ```bash
   cd fe
   npm install
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in the respective service directories with the following variables:

#### Backend Services

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=pass
POSTGRES_DB=xnessdbdev
POSTGRES_HOST=localhost  # or timescaledb for Docker
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:pass@localhost:5432/xnessdbdev

# Redis Configuration
REDIS_HOST=localhost  # or redis for Docker
REDIS_PORT=6379

# Application Configuration
PRECISION=8
PORT=3000  # or respective service port
```

#### Frontend

```bash
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## 🎮 Usage

### Accessing the Platform

1. **Open your browser** and navigate to `http://localhost:3001`
2. **Sign up** for a new account or **sign in** with existing credentials
3. **Explore the trading interface**:
   - View real-time market data
   - Place buy/sell orders
   - Monitor your portfolio
   - Check order history

### API Endpoints

The main API endpoints are available at `http://localhost:3000`:

- `POST /auth/signin` - User authentication
- `POST /auth/signup` - User registration
- `GET /user/balance` - Get user balance
- `GET /assets` - Get available trading assets
- `GET /trades` - Get trade history
- `POST /trade` - Place new trade order
- `GET /candle` - Get candlestick data

### WebSocket Connection

Connect to `ws://localhost:8080` for real-time updates:

- Market data updates
- Order status changes
- Balance updates

## 🧑‍💻 Development

### Project Structure

```
xness.trade.v0/
├── be/                     # Backend services
│   ├── app-api/           # Main API service
│   ├── wss/               # WebSocket service
│   ├── get_stream/        # Data streaming service
│   ├── http/              # HTTP middleware service
│   ├── email-worker/      # Email processing service
│   └── db/                # Database initialization
├── fe/                    # Frontend Next.js application
├── init/                  # Database schema
├── images/                # Architecture diagrams and assets
├── docker-compose.yml     # Production Docker setup
└── docker-compose.db.yml  # Database-only Docker setup
```

### Development Commands

#### Backend Services

```bash
# Build TypeScript
npm run build

# Development mode with hot reload
npm run dev

# Production mode
npm start
```

#### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Adding New Features

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** in the appropriate service directory

3. **Test your changes** locally

4. **Update documentation** if needed

5. **Submit pull request**

## 🐳 Docker Deployment

### Production Deployment

1. **Build and push images** (if using custom builds)

   ```bash
   # Build all services
   docker-compose build

   # Push to registry (optional)
   docker-compose push
   ```

2. **Deploy with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Monitor services**

   ```bash
   # View logs
   docker-compose logs -f

   # Check service status
   docker-compose ps

   # Scale services if needed
   docker-compose up -d --scale app_api=2
   ```

### Health Checks

The application includes health check endpoints:

- API: `GET /health`
- WebSocket: Connection status
- Database: Automatic connection validation

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**

   ```bash
   # Check logs
   docker-compose logs service_name

   # Restart specific service
   docker-compose restart service_name
   ```

2. **Database connection issues**

   ```bash
   # Check database status
   docker-compose exec timescaledb pg_isready

   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

3. **Port conflicts**

   ```bash
   # Check what's using the port
   lsof -i :3000

   # Kill process if needed
   kill -9 <PID>
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---
