# CryptoMonitor.app

A SaaS crypto portfolio tracker with real-time Telegram alerts.

## Project Structure

- `apps/web`: Next.js Frontend
- `apps/api`: NestJS Backend
- `apps/bot`: Telegram Bot (Logic currently within API/Worker)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+

### Running Locally

1. Start the services:
   ```bash
   docker-compose up --build
   ```

2. Access the applications:
   - Web: [http://web:3000](http://web:3000)
   - API: [http://localhost:3000](http://localhost:3000)

## Development

- **Frontend**: `cd apps/web && npm run dev`
- **Backend**: `cd apps/api && npm run start:dev`
