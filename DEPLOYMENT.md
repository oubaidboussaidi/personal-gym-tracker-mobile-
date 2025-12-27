# FitTrack Pro - Deployment Guide

## 🚀 Quick Start

Your app is now running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.138:3000 (accessible from your phone on the same Wi-Fi)

---

## 📱 Testing on Your Phone (Same Network)

### Step 1: Find Your Computer's IP
The server output shows your network IP: `192.168.1.138`

### Step 2: Access from Phone
1. Connect your phone to the **same Wi-Fi network**
2. Open your phone's browser
3. Navigate to: `http://192.168.1.138:3000`
4. The app should load!

### Step 3: Install PWA
- **Android**: Tap menu → "Add to Home screen"
- **iOS**: Tap Share → "Add to Home Screen"

---

## 🌐 Production Deployment Options

### Option 1: Vercel (Recommended - Free)

**Why Vercel?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration for Next.js
- ✅ Automatic deployments from Git

**Steps:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Click "Deploy"
6. Done! Your app is live

**Your URL will be**: `https://your-app-name.vercel.app`

---

### Option 2: Netlify (Free)

**Steps:**
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod
```

**Or use Netlify Dashboard:**
1. Go to https://netlify.com
2. Drag and drop your `.next` folder
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Deploy!

---

### Option 3: Railway (Easy, Free Tier)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js
6. Click "Deploy"
7. Get your URL!

---

### Option 4: Self-Hosted (VPS/Server)

**Requirements:**
- Ubuntu/Debian server
- Node.js 18+
- PM2 (process manager)

**Steps:**
```bash
# 1. On your server, clone the repo
git clone your-repo-url
cd your-app

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Install PM2
npm install -g pm2

# 5. Start with PM2
pm2 start npm --name "fittrack" -- start

# 6. Save PM2 config
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy (optional)
sudo apt install nginx
```

**Nginx config** (`/etc/nginx/sites-available/fittrack`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable HTTPS with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 5: Docker (Advanced)

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t fittrack-pro .
docker run -p 3000:3000 fittrack-pro
```

---

## 🔒 Important: HTTPS Required for PWA

**PWA features require HTTPS in production** (except localhost)

All the deployment options above provide HTTPS automatically:
- ✅ Vercel: Automatic HTTPS
- ✅ Netlify: Automatic HTTPS
- ✅ Railway: Automatic HTTPS
- ⚠️ Self-hosted: Use Let's Encrypt (see above)

---

## 🌍 Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for DNS propagation (5-30 minutes)

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records
4. Enable HTTPS

---

## 📊 Post-Deployment Checklist

After deploying, verify:

- [ ] App loads at production URL
- [ ] HTTPS is working (🔒 in address bar)
- [ ] PWA install prompt appears
- [ ] Service worker registers successfully
- [ ] All pages load correctly
- [ ] Offline mode works
- [ ] Icons display correctly
- [ ] Theme switching works
- [ ] Data persists across sessions
- [ ] No console errors

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

## 📱 Mobile Testing URLs

Once deployed, test on your phone:

1. **Development** (local network):
   ```
   http://192.168.1.138:3000
   ```

2. **Production** (after deployment):
   ```
   https://your-app.vercel.app
   ```

3. **Custom domain** (if configured):
   ```
   https://fittrack.yourdomain.com
   ```

---

## 🐛 Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### PWA Not Working in Production
- Verify HTTPS is enabled
- Check service worker in DevTools
- Clear cache and hard reload
- Verify manifest.json is accessible

### Icons Not Showing
- Check icon files are in `public/` folder
- Verify manifest.json paths are correct
- Clear browser cache
- Reinstall PWA

### Offline Mode Not Working
- Service worker must register first (visit site while online)
- Check cache storage in DevTools
- Verify runtime caching is configured

---

## 📈 Monitoring & Analytics (Optional)

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔐 Environment Variables

If you add backend features later:

**Create `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
DATABASE_URL=your-database-url
```

**In Vercel:**
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy

---

## 📝 Deployment Summary

**Recommended for beginners**: Vercel
- Easiest setup
- Free tier
- Automatic HTTPS
- Great performance

**Current Status**:
- ✅ Production build ready
- ✅ PWA configured
- ✅ Icons ready
- ✅ Offline support enabled
- ✅ Service worker configured
- ✅ Ready to deploy!

---

## 🎉 Next Steps

1. Choose a deployment platform (Vercel recommended)
2. Deploy your app
3. Test on your phone
4. Install as PWA
5. Share with friends!

---

**Need help?** Check the troubleshooting section or the PWA_INSTALLATION.md guide.

**Ready to deploy?** Run `vercel` in your terminal!
