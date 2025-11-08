# Vercel Deployment Fix Summary

## Problem
The original setup had a separate Express.js backend (`apps/api`) which doesn't work well with Vercel. Vercel is optimized for Next.js API routes, not separate Express servers.

## Solution
Converted all Express routes to Next.js API routes, making the application fully compatible with Vercel's serverless architecture.

## Changes Made

### 1. Created Next.js API Routes
All Express routes have been converted to Next.js API routes in `apps/web/src/app/api/`:

- ✅ `/api/stats` → `apps/web/src/app/api/stats/route.ts`
- ✅ `/api/invoice-trends` → `apps/web/src/app/api/invoice-trends/route.ts`
- ✅ `/api/vendors/top10` → `apps/web/src/app/api/vendors/top10/route.ts`
- ✅ `/api/category-spend` → `apps/web/src/app/api/category-spend/route.ts`
- ✅ `/api/cash-outflow` → `apps/web/src/app/api/cash-outflow/route.ts`
- ✅ `/api/invoices` → `apps/web/src/app/api/invoices/route.ts`
- ✅ `/api/chat-with-data` → `apps/web/src/app/api/chat-with-data/route.ts`

### 2. Added Prisma to Web App
- Added `@prisma/client` and `prisma` to `apps/web/package.json`
- Created `apps/web/src/lib/prisma.ts` (Prisma client)
- Copied Prisma schema to `apps/web/prisma/schema.prisma`
- Updated build script to generate Prisma client: `prisma generate && next build`

### 3. Updated API Client
- Changed `apps/web/src/lib/api.ts` to use relative paths (`/api`) instead of absolute URLs
- This works both locally and on Vercel

### 4. Vercel Configuration
- Created `vercel.json` with proper build settings
- Created `apps/web/.vercelignore` to exclude unnecessary files
- Updated `next.config.js` to remove hardcoded API URLs

## Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Project:**
   - Root Directory: `apps/web`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build` (runs `prisma generate && next build`)

3. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   VANNA_API_KEY=your-key-if-needed
   NEXT_PUBLIC_API_BASE=/api
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

5. **Run Migrations:**
   ```bash
   DATABASE_URL="your-production-db-url" npx prisma migrate deploy
   ```

## Benefits

✅ **Single Deployment:** Frontend and backend deploy together  
✅ **Serverless:** API routes run as serverless functions  
✅ **No CORS Issues:** Same-origin requests  
✅ **Better Performance:** Vercel's edge network  
✅ **Simpler Setup:** One project instead of two  

## Local Development

The app still works locally:

```bash
cd apps/web
npm install
npm run dev
```

API routes will be available at:
- `http://localhost:3000/api/stats`
- `http://localhost:3000/api/invoices`
- etc.

## Notes

- The Express backend (`apps/api`) is still available for other deployment options
- For Vercel, we use Next.js API routes
- Prisma client is generated during build
- All environment variables must be set in Vercel dashboard

## Troubleshooting

**Build fails with "Prisma Client not generated":**
- Ensure `prisma generate` runs before `next build`
- Check `package.json` build script includes it

**API routes return 404:**
- Verify routes are in `apps/web/src/app/api/`
- Check file naming: must be `route.ts` or `route.js`

**Database connection errors:**
- Verify `DATABASE_URL` is set in Vercel
- Check database allows connections from Vercel IPs

See `VERCEL_DEPLOYMENT.md` for detailed deployment guide.

