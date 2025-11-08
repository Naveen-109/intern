# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- Python 3.9+ (for Vanna AI)
- Groq API key ([Get one free](https://console.groq.com/))

## Step 1: Clone & Install

```bash
# Install root dependencies
npm install

# Install Python dependencies (for Vanna AI)
cd services/vanna
pip install -r requirements.txt
cd ../..
```

## Step 2: Start Database

```bash
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to be ready.

## Step 3: Configure Environment

Create these files with your values:

**`apps/api/.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytics_db"
VANNA_API_BASE_URL="http://localhost:8000"
PORT=3001
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_BASE="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**`services/vanna/.env`:**
```env
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/analytics_db"
GROQ_API_KEY="your-groq-api-key-here"
PORT=8000
```

## Step 4: Initialize Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

## Step 5: Start All Services

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

**Terminal 3 - Vanna AI:**
```bash
cd services/vanna
python -m uvicorn main:app --reload
```

## Step 6: Open Dashboard

Visit http://localhost:3000

You should see:
- ✅ Overview cards with metrics
- ✅ Charts displaying data
- ✅ Invoices table
- ✅ "Chat with Data" tab

## Test Chat Interface

1. Click "Chat with Data" tab
2. Try these queries:
   - "What's the total spend in the last 90 days?"
   - "List top 5 vendors by spend"
   - "Show overdue invoices"

## Troubleshooting

**Database connection error?**
- Check PostgreSQL is running: `docker ps`
- Verify `DATABASE_URL` is correct

**Vanna AI not responding?**
- Check Groq API key is set
- Verify service is running on port 8000
- Check logs in Terminal 3

**Frontend not loading?**
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_BASE` is correct
- Check browser console for errors

## Next Steps

- Add your own data: Place `Analytics_Test_Data.json` in `apps/api/data/`
- Customize dashboard: Edit components in `apps/web/src/components/dashboard/`
- Deploy: Follow `DEPLOYMENT.md`

## Need Help?

- 📖 Full setup: `docs/setup.md`
- 🔌 API docs: `docs/api-documentation.md`
- 💬 Chat workflow: `docs/chat-workflow.md`

