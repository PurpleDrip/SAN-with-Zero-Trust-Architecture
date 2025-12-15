# 🚀 Deployment Guide

## Production Deployment Checklist

### ⚠️ IMPORTANT: Security Hardening

Before deploying to production, complete these critical security steps:

---

## 1. 🔐 Authentication & Secrets

### Change JWT Secret Key
**File**: `backend/services/Impl/authImpl.ts`

```typescript
// BEFORE (Demo):
private readonly SECRET_KEY = 'zero-trust-san-secret-key-change-in-production';

// AFTER (Production):
private readonly SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-here';
```

**Generate a strong secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Use Environment Variables
Create `.env` file:
```env
JWT_SECRET=your-generated-secret-here
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/zerotrust
```

Install dotenv:
```bash
npm install dotenv
```

Load in `index.ts`:
```typescript
import 'dotenv/config';
```

---

## 2. 🗄️ Database Setup

### Replace In-Memory Database

**Current**: `DbImpl` uses in-memory array
**Production**: Use PostgreSQL or MongoDB

#### Option A: PostgreSQL

Install dependencies:
```bash
npm install pg
npm install --save-dev @types/pg
```

Create database:
```sql
CREATE DATABASE zerotrust_san;

CREATE TABLE nodes (
    id UUID PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    trust_score INTEGER,
    status VARCHAR(20),
    stage VARCHAR(50),
    device_fingerprint JSONB,
    health_metrics JSONB,
    behavior_metrics JSONB,
    network_info JSONB,
    trust_breakdown JSONB,
    session JSONB,
    logs JSONB[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

Update `dbImpl.ts`:
```typescript
import { Pool } from 'pg';

export class DbImpl implements IDbService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async getAllNodes(): Promise<Node[]> {
        const result = await this.pool.query('SELECT * FROM nodes');
        return result.rows;
    }
    
    // ... implement other methods
}
```

#### Option B: MongoDB

Install dependencies:
```bash
npm install mongodb
npm install --save-dev @types/mongodb
```

Update `dbImpl.ts`:
```typescript
import { MongoClient, Db } from 'mongodb';

export class DbImpl implements IDbService {
    private db: Db;

    async connect() {
        const client = await MongoClient.connect(process.env.MONGODB_URL!);
        this.db = client.db('zerotrust_san');
    }

    async getAllNodes(): Promise<Node[]> {
        return await this.db.collection('nodes').find().toArray();
    }
    
    // ... implement other methods
}
```

---

## 3. 🔥 Firewall Permissions

### Linux Setup

Grant sudo permissions for iptables:
```bash
# Create sudoers file for the app user
sudo visudo -f /etc/sudoers.d/zerotrust

# Add these lines:
zerotrust ALL=(ALL) NOPASSWD: /sbin/iptables
zerotrust ALL=(ALL) NOPASSWD: /sbin/ip6tables
```

### Windows Setup

Run the application as Administrator or grant specific permissions:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned

# Grant firewall permissions to the app
New-NetFirewallRule -DisplayName "ZeroTrust SAN" -Direction Inbound -Program "C:\path\to\node.exe" -Action Allow
```

---

## 4. 🌐 HTTPS/TLS Setup

### Generate SSL Certificate

#### Option A: Let's Encrypt (Free)
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

#### Option B: Self-Signed (Testing)
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Update Server for HTTPS

Install https module:
```bash
npm install https
```

Update `index.ts`:
```typescript
import https from 'https';
import fs from 'fs';

const options = {
    key: fs.readFileSync('path/to/key.pem'),
    cert: fs.readFileSync('path/to/cert.pem')
};

const PORT = 3000;
https.createServer(options, app).listen(PORT, () => {
    console.log(`🛡️ Zero Trust SAN running on https://localhost:${PORT}`);
});
```

---

## 5. 🛡️ Additional Security Measures

### Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `index.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Helmet (Security Headers)

Install helmet:
```bash
npm install helmet
```

Add to `index.ts`:
```typescript
import helmet from 'helmet';

app.use(helmet());
```

### Input Validation

Install express-validator:
```bash
npm install express-validator
```

Add validation to controllers:
```typescript
import { body, validationResult } from 'express-validator';

router.post('/nodes',
    body('ip').isIP(),
    body('deviceInfo.osType').isString(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ... proceed
    }
);
```

### CORS Configuration

Update CORS in `index.ts`:
```typescript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:8501',
    credentials: true
}));
```

---

## 6. 📝 Logging

### Install Winston

```bash
npm install winston
```

Create `utils/logger.ts`:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
```

Replace `console.log` with `logger.info()`:
```typescript
logger.info('Server started');
logger.error('Error occurred', { error });
```

---

## 7. 🐳 Docker Deployment

### Create Dockerfile

**backend/Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=postgresql://postgres:password@db:5432/zerotrust
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=zerotrust_san
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "8501:8501"
    environment:
      - API_URL=http://backend:3000/api
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
docker-compose up -d
```

---

## 8. ☁️ Cloud Deployment

### AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security Group: Allow ports 22, 3000, 8501

2. **Install Dependencies**
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql
```

3. **Clone and Setup**
```bash
git clone your-repo
cd backend
npm install
npm run build
```

4. **Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start dist/index.js --name zerotrust-san
pm2 startup
pm2 save
```

### Azure

Use Azure App Service:
```bash
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name zerotrust-san --runtime "NODE|18-lts"
az webapp deployment source config-zip --resource-group myResourceGroup --name zerotrust-san --src backend.zip
```

### Google Cloud

Use Cloud Run:
```bash
gcloud run deploy zerotrust-san --source . --platform managed --region us-central1 --allow-unauthenticated
```

---

## 9. 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Build
      run: |
        cd backend
        npm run build
    
    - name: Deploy to server
      run: |
        # Your deployment script here
```

---

## 10. 📊 Monitoring

### Health Checks

Add to `index.ts`:
```typescript
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});
```

### Metrics

Install prometheus client:
```bash
npm install prom-client
```

Add metrics endpoint:
```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
```

---

## 11. 🔧 Production Mode Configuration

### Enable Production Mode

Update `systemConfig.ts`:
```typescript
// Set default to production
let activeConfig: SystemConfig = PRODUCTION_CONFIG;
```

Or use environment variable:
```typescript
let activeConfig: SystemConfig = 
    process.env.NODE_ENV === 'production' 
        ? PRODUCTION_CONFIG 
        : DEMO_CONFIG;
```

---

## 12. ✅ Pre-Deployment Checklist

- [ ] JWT secret changed
- [ ] Environment variables configured
- [ ] Database setup complete
- [ ] HTTPS/TLS enabled
- [ ] Firewall permissions granted
- [ ] Rate limiting enabled
- [ ] Security headers added (Helmet)
- [ ] Input validation implemented
- [ ] Logging configured (Winston)
- [ ] CORS properly configured
- [ ] Docker images built
- [ ] CI/CD pipeline setup
- [ ] Monitoring enabled
- [ ] Backup strategy defined
- [ ] Documentation updated
- [ ] Load testing completed

---

## 13. 🚦 Deployment Steps

1. **Test Locally**
```bash
npm run dev
# Test all endpoints
```

2. **Build for Production**
```bash
npm run build
```

3. **Test Production Build**
```bash
NODE_ENV=production node dist/index.js
```

4. **Deploy to Server**
```bash
# Copy files
scp -r dist/ user@server:/app/

# SSH to server
ssh user@server

# Start with PM2
pm2 start /app/dist/index.js --name zerotrust-san
```

5. **Verify Deployment**
```bash
curl https://your-domain.com/api/health
```

---

## 14. 🔄 Rollback Plan

If deployment fails:

1. **Stop new version**
```bash
pm2 stop zerotrust-san
```

2. **Restore previous version**
```bash
pm2 start zerotrust-san-backup
```

3. **Check logs**
```bash
pm2 logs zerotrust-san
```

---

## 📞 Support

For production issues:
1. Check logs: `pm2 logs`
2. Check system health: `curl /api/health`
3. Review audit logs in database
4. Check firewall rules: `sudo iptables -L`

---

**Production deployment is serious business. Test thoroughly! 🚀**
