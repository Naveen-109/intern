# Vercel Deployment Guide

## Quick Setup for Vercel

The application has been configured to work with Vercel by converting Express routes to Next.js API routes.

## Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

## Step 2: Configure Project Settings

In Vercel project settings:

**Root Directory:** `apps/web`

**Build Command:** `npm run build` (or `cd apps/web && npm run build`)

**Output Directory:** `.next`

**Install Command:** `npm install`

## Step 3: Set Environment Variables

Add these environment variables in Vercel dashboard:

### Required Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
VANNA_API_KEY=your-vanna-api-key-if-needed
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional Variables

```
NODE_ENV=production
```

## Step 4: Build Settings

Vercel should auto-detect:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

If not, manually set:
- Framework Preset: Next.js
- Root Directory: `apps/web`

## Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

## Step 6: Run Database Migrations

After first deployment, run migrations:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
cd apps/web
npx prisma migrate deploy

# Option 2: Direct connection
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

## Step 7: Seed Database (Optional)

```bash
DATABASE_URL="your-production-db-url" npx prisma db seed
```

## Troubleshooting

### Build Fails: Prisma Client Not Generated

**Solution:** Add to `package.json` build script:
```json
"build": "prisma generate && next build"
```

### Build Fails: Cannot Find Module

**Solution:** 
1. Ensure `apps/web/package.json` includes all dependencies
2. Check `node_modules` are installed in root

### API Routes Return 404

**Solution:**
1. Verify routes are in `apps/web/src/app/api/`
2. Check file names match route paths
3. Ensure `route.ts` or `route.js` naming

### Database Connection Errors

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Check database allows connections from Vercel IPs
3. Ensure SSL is enabled if required

### CORS Errors

**Solution:**
- API routes are same-origin, no CORS needed
- If calling external services, configure CORS on those services

## Monorepo Configuration

If using Turborepo, you may need to configure:

**`vercel.json`** (optional, Vercel usually auto-detects):
```json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm install"
}
```

## Environment Variables per Environment

Vercel supports different env vars per environment:
- Production
- Preview
- Development

Set them in: Project Settings → Environment Variables

## Post-Deployment Checklist

- [ ] Database migrations run
- [ ] Environment variables set
- [ ] API routes working (`/api/stats`)
- [ ] Frontend loads correctly
- [ ] Charts display data
- [ ] Chat interface connects to Vanna AI

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitoring

- Check Vercel dashboard for build logs
- Monitor function logs for API routes
- Set up error tracking (Sentry, etc.)

## Next Steps

- Deploy Vanna AI service separately (Render/Railway)
- Set up database backups
- Configure monitoring and alerts

