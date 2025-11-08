# Setup Guide

Complete step-by-step guide to set up and run the Analytics Dashboard application.

## Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **Python** >= 3.9
- **Docker & Docker Compose** (optional, for local development)
- **Groq API Key** ([Get one here](https://console.groq.com/))

## Quick Start with Docker

1. **Clone the repository:**
```bash
git clone <repository-url>
cd analytics-dashboard-monorepo
```

2. **Set up environment variables:**
```bash
# Create .env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
cp services/vanna/.env.example services/vanna/.env
```

3. **Update environment variables:**
   - `apps/api/.env`: Set `DATABASE_URL` and `VANNA_API_BASE_URL`
   - `apps/web/.env.local`: Set `NEXT_PUBLIC_API_BASE`
   - `services/vanna/.env`: Set `DATABASE_URL` and `GROQ_API_KEY`

4. **Start services with Docker Compose:**
```bash
docker-compose up -d postgres
```

5. **Install dependencies:**
```bash
npm install
```

6. **Initialize database:**
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

7. **Start all services:**
```bash
# Terminal 1: Backend API
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev

# Terminal 3: Vanna AI
cd services/vanna
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

8. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Vanna AI: http://localhost:8000

## Manual Setup (Without Docker)

### 1. Database Setup

**Install PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Create database:**
```bash
psql -U postgres
CREATE DATABASE analytics_db;
\q
```

### 2. Backend API Setup

```bash
cd apps/api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API base URL

# Start development server
npm run dev
```

### 4. Vanna AI Service Setup

```bash
cd services/vanna

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and GROQ_API_KEY

# Start service
python -m uvicorn main:app --reload --port 8000
```

## Data Ingestion

### Using Sample Data

If you have `Analytics_Test_Data.json`:

1. Place the file in `apps/api/data/Analytics_Test_Data.json`
2. Run the seed script:
```bash
cd apps/api
npx prisma db seed
```

### Creating Sample Data

If you don't have the JSON file, the seed script will create sample data automatically.

## Environment Variables Reference

### Backend API (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytics_db"
VANNA_API_BASE_URL="http://localhost:8000"
PORT=3001
NODE_ENV=development
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_BASE="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Vanna AI (`services/vanna/.env`)

```env
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db"
GROQ_API_KEY="your-groq-api-key"
VANNA_API_KEY=""
PORT=8000
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

2. **Verify connection string:**
```bash
psql -U postgres -d analytics_db
```

3. **Check Prisma connection:**
```bash
cd apps/api
npx prisma db pull
```

### Vanna AI Service Issues

1. **Check Python dependencies:**
```bash
cd services/vanna
pip list | grep -E "(fastapi|groq|psycopg)"
```

2. **Test database connection:**
```python
python -c "import psycopg2; conn = psycopg2.connect('your-database-url'); print('Connected!')"
```

3. **Check Groq API key:**
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

### Frontend Build Issues

1. **Clear Next.js cache:**
```bash
cd apps/web
rm -rf .next
npm run build
```

2. **Check TypeScript errors:**
```bash
npm run lint
```

## Production Deployment

### Vercel (Frontend + Backend)

1. **Connect GitHub repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Deploy**

### Vanna AI (Self-hosted)

**Option 1: Render**
1. Create new Web Service
2. Connect GitHub repository
3. Set root directory to `services/vanna`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Option 2: Railway**
1. Create new project
2. Add PostgreSQL service
3. Deploy from GitHub
4. Set environment variables

**Option 3: Digital Ocean**
1. Create Droplet
2. Install Docker
3. Deploy using Docker Compose

## Verification

After setup, verify everything works:

1. **Backend API:**
```bash
curl http://localhost:3001/health
```

2. **Vanna AI:**
```bash
curl http://localhost:8000/health
```

3. **Frontend:**
   - Open http://localhost:3000
   - Check dashboard loads
   - Test chat interface

## Next Steps

- Read [API Documentation](./api-documentation.md)
- Review [Database Schema](./database-schema.md)
- Understand [Chat Workflow](./chat-workflow.md)

