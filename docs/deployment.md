# Deployment Guide

Learn how to deploy your CurisJS application to various platforms.

## Overview

CurisJS applications can be deployed to any platform that supports Node.js, Bun, Deno, or edge runtimes. This guide covers the most popular deployment options.

## Build for Production

Before deploying, build your application:

```bash
# Using the CLI
curis build

# Or manually with your package manager
pnpm run build
```

This creates an optimized production build in the `dist/` directory.

## Node.js Deployment

### Traditional Server

Deploy to any VPS or cloud server with Node.js:

**1. Prepare your server:**

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install process manager
npm install -g pm2
```

**2. Deploy your application:**

```bash
# Upload your files
scp -r dist package.json your-server:/app/

# Install dependencies on server
ssh your-server "cd /app && npm install --production"

# Start with PM2
ssh your-server "cd /app && pm2 start dist/index.js --name curis-app"
```

**3. Configure PM2 ecosystem:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'curis-app',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

### Docker

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --production

# Builder
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 curisjs

COPY --from=deps --chown=curisjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=curisjs:nodejs /app/dist ./dist
COPY --from=builder --chown=curisjs:nodejs /app/package.json ./

USER curisjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
    restart: unless-stopped
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy:**

```bash
docker-compose up -d
```

## Platform-Specific Guides

### Vercel

**1. Install Vercel CLI:**

```bash
npm install -g vercel
```

**2. Create `vercel.json`:**

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/api" }
  ]
}
```

**3. Deploy:**

```bash
vercel --prod
```

### Railway

**1. Create `railway.json`:**

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "on-failure",
    "restartPolicyMaxRetries": 10
  }
}
```

**2. Deploy:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render

**1. Create `render.yaml`:**

```yaml
services:
  - type: web
    name: curis-app
    env: node
    buildCommand: pnpm install && pnpm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
```

**2. Connect your repository to Render:**
- Go to [Render Dashboard](https://dashboard.render.com)
- Create new Web Service
- Connect your Git repository
- Render will auto-deploy on push

### Fly.io

**1. Install Fly CLI:**

```bash
curl -L https://fly.io/install.sh | sh
```

**2. Create `fly.toml`:**

```toml
app = "curis-app"
primary_region = "sjc"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

**3. Deploy:**

```bash
fly launch
fly deploy
```

### AWS (Elastic Beanstalk)

**1. Install EB CLI:**

```bash
pip install awsebcli
```

**2. Initialize:**

```bash
eb init -p node.js-18 curis-app
```

**3. Create `.ebextensions/nodecommand.config`:**

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node dist/index.js"
```

**4. Deploy:**

```bash
eb create production
eb deploy
```

### Google Cloud Run

**1. Build container:**

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/curis-app
```

**2. Deploy:**

```bash
gcloud run deploy curis-app \
  --image gcr.io/PROJECT_ID/curis-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Apps

**1. Build and push:**

```bash
az acr build --registry myregistry --image curis-app:latest .
```

**2. Deploy:**

```bash
az containerapp create \
  --name curis-app \
  --resource-group myResourceGroup \
  --image myregistry.azurecr.io/curis-app:latest \
  --target-port 3000 \
  --ingress external
```

## Edge Runtime Deployment

### Cloudflare Workers

**wrangler.toml:**

```toml
name = "curis-app"
main = "src/index.ts"
compatibility_date = "2024-11-17"

[build]
command = "pnpm run build"
```

**Deploy:**

```bash
npx wrangler deploy
```

### Deno Deploy

**deno.json:**

```json
{
  "tasks": {
    "start": "deno run --allow-net --allow-env src/index.ts"
  },
  "imports": {
    "@curisjs/core": "npm:@curisjs/core"
  }
}
```

**Deploy:**

```bash
deployctl deploy --project=curis-app src/index.ts
```

## Environment Variables

Set environment variables on your platform:

```bash
# Railway
railway variables set DATABASE_URL=postgres://...

# Vercel
vercel env add DATABASE_URL

# Render (in dashboard)
# Fly.io
fly secrets set DATABASE_URL=postgres://...

# AWS EB
eb setenv DATABASE_URL=postgres://...
```

## Database Setup

### PostgreSQL on Render

```bash
# Create database
render databases create my-postgres

# Get connection string
render databases url my-postgres
```

### PostgreSQL on Railway

```bash
# Add PostgreSQL plugin
railway add postgres

# Connection string is auto-injected as DATABASE_URL
```

## Health Checks

Add a health check endpoint:

```typescript
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: Date.now() });
});
```

Configure on your platform:

```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 3s
  retries: 3
```

## Monitoring

### Logging

Use structured logging:

```typescript
import { Logger } from '@curisjs/core';

const logger = new Logger();
logger.info('Server started', { port: 3000 });
```

### Error Tracking

Integrate error tracking:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});
```

## Performance Tips

1. **Enable compression:**

```typescript
import { compression } from '@curisjs/core/middleware';
app.use(compression());
```

2. **Set production environment:**

```bash
export NODE_ENV=production
```

3. **Use process clustering:**

```javascript
// ecosystem.config.js
{
  instances: 'max',
  exec_mode: 'cluster'
}
```

4. **Configure caching:**

```typescript
ctx.setHeader('Cache-Control', 'public, max-age=3600');
```

5. **Enable HTTP/2:**

```typescript
import { createSecureServer } from 'node:http2';
import { nodeAdapter } from '@curisjs/core/adapters';

const server = createSecureServer({
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem'),
}, nodeAdapter(app));
```

## Troubleshooting

### Port Issues

Make sure to use the PORT environment variable:

```typescript
const port = parseInt(process.env.PORT || '3000');
app.listen({ port });
```

### Build Failures

Check build logs:

```bash
# Railway
railway logs

# Vercel
vercel logs

# Render (in dashboard)
```

### Database Connections

Test database connectivity:

```bash
# PostgreSQL
psql $DATABASE_URL -c "SELECT 1"

# MySQL
mysql -h host -u user -p
```

## Next Steps

- [Environment Configuration](/core/application)
- [Performance Optimization](/core/application)
- [Security Best Practices](/core/middleware)
