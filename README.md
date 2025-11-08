# Analytics Dashboard - Full Stack Application

A production-grade full-stack web application with an Interactive Analytics Dashboard and "Chat with Data" interface powered by Vanna AI.

## 🏗️ Architecture

This is a monorepo containing:

- **apps/web** - Next.js frontend (App Router, TypeScript, shadcn/ui, TailwindCSS)
- **apps/api** - Express.js backend API (TypeScript, Prisma, PostgreSQL)
- **services/vanna** - Self-hosted Vanna AI service (Python FastAPI, Groq)

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Python >= 3.9
- Docker & Docker Compose (optional, for local development)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Or use your own PostgreSQL instance
# Update DATABASE_URL in apps/api/.env
```

### 3. Configure Environment Variables

Create `.env` files in each app:

**apps/api/.env:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytics_db"
VANNA_API_BASE_URL="http://localhost:8000"
PORT=3001
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_API_BASE="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**services/vanna/.env:**
```env
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db"
GROQ_API_KEY="your-groq-api-key"
PORT=8000
```

### 4. Initialize Database

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Services

```bash
# Start all services
npm run dev

# Or start individually:
# Terminal 1: Backend API
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Vanna AI
cd services/vanna && python -m uvicorn main:app --reload
```

## 📊 Database Schema

See [Database Schema Documentation](./docs/database-schema.md)

## 🔌 API Endpoints

See [API Documentation](./docs/api-documentation.md)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific app
cd apps/api && npm test
```

## 📦 Deployment

### Frontend & Backend (Vercel)

1. Connect your GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Vanna AI (Self-hosted)

Deploy to Render, Railway, Fly.io, or Digital Ocean:

```bash
cd services/vanna
# Follow platform-specific deployment instructions
```

## 📚 Documentation

- [Setup Guide](./docs/setup.md)
- [API Documentation](./docs/api-documentation.md)
- [Database Schema](./docs/database-schema.md)
- [Chat with Data Workflow](./docs/chat-workflow.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend**: Express.js, TypeScript, Prisma, PostgreSQL
- **AI**: Vanna AI, Groq LLM, FastAPI
- **Monorepo**: Turborepo

## 📝 License

MIT

