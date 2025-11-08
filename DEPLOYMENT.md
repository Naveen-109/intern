# Deployment Guide

## Overview

This guide covers deploying the Analytics Dashboard application to production.

## Architecture

- **Frontend + Backend API**: Vercel
- **Vanna AI Service**: Self-hosted (Render/Railway/Fly.io/Digital Ocean)
- **Database**: PostgreSQL (managed service or self-hosted)

## Prerequisites

- GitHub repository
- Vercel account
- Groq API key
- PostgreSQL database (managed or self-hosted)

## Step 1: Deploy Database

### Option A: Managed PostgreSQL (Recommended)

**Services:**
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Serverless PostgreSQL)
- [Railway](https://railway.app) (PostgreSQL service)
- [Render](https://render.com) (PostgreSQL service)

**Steps:**
1. Create a new PostgreSQL database
2. Note the connection string
3. Update environment variables

### Option B: Self-hosted PostgreSQL

Use Docker Compose or a VPS with PostgreSQL installed.

## Step 2: Deploy Vanna AI Service

### Render Deployment

1. **Create New Web Service:**
   - Connect your GitHub repository
   - Root Directory: `services/vanna`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables:**
   ```
   DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
   GROQ_API_KEY=your-groq-api-key
   PORT=8000
   ```

3. **Deploy**

### Railway Deployment

1. **Create New Project:**
   - Connect GitHub repository
   - Add PostgreSQL service
   - Deploy from `services/vanna` directory

2. **Environment Variables:**
   - Set `DATABASE_URL` (auto-configured if using Railway PostgreSQL)
   - Set `GROQ_API_KEY`
   - Set `PORT` (auto-configured)

### Fly.io Deployment

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Fly App:**
   ```bash
   cd services/vanna
   fly launch
   ```

3. **Set Secrets:**
   ```bash
   fly secrets set DATABASE_URL="postgresql+psycopg://..."
   fly secrets set GROQ_API_KEY="your-key"
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

## Step 3: Deploy Frontend + Backend to Vercel

### Setup

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repository

2. **Configure Project:**
   - Root Directory: Leave as default (monorepo)
   - Framework Preset: Next.js
   - Build Command: `cd apps/web && npm run build`
   - Output Directory: `apps/web/.next`

3. **Environment Variables:**
   ```
   # For Next.js build
   NEXT_PUBLIC_API_BASE=https://your-api.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### Deploy Backend API

**Option A: Separate Vercel Project**

1. Create new Vercel project
2. Root Directory: `apps/api`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Install Command: `npm install`

**Option B: API Routes in Next.js**

Convert Express routes to Next.js API routes (recommended for Vercel).

**Option C: Deploy as Serverless Function**

Use Vercel's serverless functions with Express adapter.

### Environment Variables (Backend)

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
PORT=3001
NODE_ENV=production
```

## Step 4: Configure CORS

Update Vanna AI service CORS settings:

```python
# services/vanna/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 5: Database Migration

Run migrations on production database:

```bash
cd apps/api
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
DATABASE_URL="your-production-db-url" npx prisma db seed
```

## Step 6: Verify Deployment

1. **Check Health Endpoints:**
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-api.vercel.app/health`
   - Vanna AI: `https://your-vanna-service.onrender.com/health`

2. **Test Dashboard:**
   - Open frontend URL
   - Verify charts load
   - Check data displays correctly

3. **Test Chat Interface:**
   - Navigate to "Chat with Data" tab
   - Ask a test query
   - Verify SQL generation and execution

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database allows connections from your service IPs
- Ensure SSL is configured if required

### CORS Errors

- Verify CORS origins include your frontend domain
- Check preflight requests are handled

### Vanna AI Not Responding

- Check Groq API key is valid
- Verify database connection
- Check service logs for errors

### Build Failures

- Ensure all dependencies are in `package.json`
- Check Node.js version matches requirements
- Verify environment variables are set

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in for frontend
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Uptime Robot**: Service monitoring

### Logs

- **Vercel**: View in dashboard
- **Render/Railway**: View in service dashboard
- **Fly.io**: `fly logs`

## Scaling Considerations

1. **Database:**
   - Use connection pooling
   - Add read replicas for heavy queries
   - Implement caching layer

2. **Vanna AI:**
   - Add rate limiting
   - Implement query caching
   - Use queue for heavy queries

3. **Frontend:**
   - Enable CDN caching
   - Optimize bundle size
   - Use ISR for static content

## Security Checklist

- [ ] Environment variables secured
- [ ] Database uses SSL connections
- [ ] CORS configured correctly
- [ ] API keys not exposed in frontend
- [ ] Rate limiting implemented
- [ ] SQL injection prevention verified
- [ ] HTTPS enabled everywhere
- [ ] Database backups configured

## Cost Estimation

### Free Tier Options

- **Vercel**: Free tier for frontend/backend
- **Supabase**: Free tier PostgreSQL
- **Render**: Free tier for Vanna AI (with limitations)
- **Groq**: Free tier API (rate limited)

### Paid Options

- **Vercel Pro**: $20/month
- **Managed PostgreSQL**: $10-50/month
- **Vanna AI Hosting**: $7-25/month
- **Groq API**: Pay-as-you-go

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review logs for errors
3. Open GitHub issue

