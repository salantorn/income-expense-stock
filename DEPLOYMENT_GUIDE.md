# 🚀 คู่มือ Deploy โปรเจกต์

มีหลายวิธีในการ deploy โปรเจกต์นี้ แต่ละวิธีมีข้อดีข้อเสียต่างกัน

---

## 📊 เปรียบเทียบวิธี Deploy

| วิธี | ความยาก | ราคา | แนะนำสำหรับ |
|------|---------|------|-------------|
| **Vercel + Railway** | ⭐ ง่าย | ฟรี | ✅ แนะนำที่สุด! |
| **Render** | ⭐ ง่าย | ฟรี | ✅ All-in-one |
| **Railway** | ⭐⭐ ปานกลาง | ฟรี | Backend + DB |
| **Heroku** | ⭐⭐ ปานกลาง | มีค่าใช้จ่าย | Production |
| **VPS (DigitalOcean)** | ⭐⭐⭐ ยาก | $5-10/เดือน | Full control |
| **Docker + Cloud** | ⭐⭐⭐ ยาก | แล้วแต่ | Scalable |

---

## 🎯 วิธีที่ 1: Vercel (Frontend) + Railway (Backend + DB) - แนะนำ!

### ข้อดี:
- ✅ ฟรี
- ✅ ง่ายที่สุด
- ✅ Auto deploy จาก GitHub
- ✅ SSL/HTTPS ฟรี
- ✅ CDN ทั่วโลก

### ขั้นตอน:

#### A. Deploy Database + Backend บน Railway

1. **สมัคร Railway**
   - ไปที่: https://railway.app/
   - Login ด้วย GitHub

2. **สร้าง Project ใหม่**
   - คลิก "New Project"
   - เลือก "Deploy from GitHub repo"
   - เลือก repository `income-expense-stock`

3. **เพิ่ม PostgreSQL**
   - คลิก "+ New"
   - เลือก "Database" > "PostgreSQL"
   - Railway จะสร้าง database ให้อัตโนมัติ

4. **เพิ่ม Redis (Optional)**
   - คลิก "+ New"
   - เลือก "Database" > "Redis"

5. **ตั้งค่า Backend Service**
   - คลิกที่ service ที่สร้างจาก GitHub
   - ไปที่ "Settings"
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

6. **ตั้งค่า Environment Variables**
   
   ไปที่ "Variables" แล้วเพิ่ม:
   
   ```env
   # Database (คัดลอกจาก PostgreSQL service)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Redis (คัดลอกจาก Redis service)
   REDIS_URL=${{Redis.REDIS_URL}}
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Server
   PORT=3000
   NODE_ENV=production
   
   # CORS (จะใส่ Vercel URL ทีหลัง)
   CORS_ORIGIN=https://your-app.vercel.app
   
   # Finnhub API
   FINNHUB_API_KEY=your-finnhub-api-key
   
   # Email (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

7. **Deploy!**
   - คลิก "Deploy"
   - รอสักครู่ Railway จะ build และ deploy
   - คัดลอก URL ที่ได้ (เช่น `https://your-app.up.railway.app`)

#### B. Deploy Frontend บน Vercel

1. **สมัคร Vercel**
   - ไปที่: https://vercel.com/
   - Login ด้วย GitHub

2. **Import Project**
   - คลิก "Add New..." > "Project"
   - เลือก repository `income-expense-stock`
   - คลิก "Import"

3. **ตั้งค่า Build**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **ตั้งค่า Environment Variables**
   
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```
   
   (แทน URL ด้วย Railway backend URL ที่ได้จากขั้นตอน A)

5. **Deploy!**
   - คลิก "Deploy"
   - รอสักครู่ Vercel จะ build และ deploy
   - คัดลอก URL ที่ได้ (เช่น `https://your-app.vercel.app`)

6. **อัพเดท CORS_ORIGIN บน Railway**
   - กลับไปที่ Railway
   - แก้ไข `CORS_ORIGIN` ให้เป็น Vercel URL
   - Redeploy backend

#### C. รัน Database Migration

```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# รัน migration
railway run npm run prisma:migrate --workspace=backend
```

---

## 🎯 วิธีที่ 2: Render (All-in-One) - ง่ายที่สุด

### ข้อดี:
- ✅ ฟรี
- ✅ All-in-one (Frontend + Backend + DB)
- ✅ ไม่ต้องตั้งค่าหลายที่

### ขั้นตอน:

1. **สมัคร Render**
   - ไปที่: https://render.com/
   - Login ด้วย GitHub

2. **สร้าง PostgreSQL Database**
   - คลิก "New +" > "PostgreSQL"
   - ตั้งชื่อ: `income-expense-db`
   - เลือก Free plan
   - คลิก "Create Database"
   - คัดลอก "Internal Database URL"

3. **Deploy Backend**
   - คลิก "New +" > "Web Service"
   - เลือก repository `income-expense-stock`
   - ตั้งค่า:
     - **Name**: `income-expense-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Environment Variables:
     ```env
     DATABASE_URL=<คัดลอกจาก PostgreSQL>
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend.onrender.com
     ```
   - คลิก "Create Web Service"

4. **Deploy Frontend**
   - คลิก "New +" > "Static Site"
   - เลือก repository `income-expense-stock`
   - ตั้งค่า:
     - **Name**: `income-expense-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
   - Environment Variables:
     ```env
     VITE_API_URL=https://income-expense-backend.onrender.com
     ```
   - คลิก "Create Static Site"

5. **รัน Migration**
   ```bash
   # ใช้ Render Shell
   # ไปที่ Backend service > Shell
   npm run prisma:migrate deploy
   ```

---

## 🎯 วิธีที่ 3: Railway (All-in-One)

### ขั้นตอน:

1. **สร้าง Project บน Railway**
   - Deploy from GitHub repo

2. **เพิ่ม Services:**
   - PostgreSQL Database
   - Redis (Optional)
   - Backend (root: `backend`)
   - Frontend (root: `frontend`)

3. **ตั้งค่า Environment Variables** (เหมือนวิธีที่ 1)

4. **Deploy!**

---

## 🎯 วิธีที่ 4: Docker + Cloud (Advanced)

### สร้าง Dockerfile

#### Backend Dockerfile:
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Frontend Dockerfile:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml (สำหรับ production):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: income_expense_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/income_expense_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Deploy บน:
- **DigitalOcean App Platform**
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Instances**

---

## 📋 Checklist ก่อน Deploy

- [ ] แก้ไข `CORS_ORIGIN` ให้ถูกต้อง
- [ ] สร้าง `JWT_SECRET` ใหม่ (ใช้ `openssl rand -hex 32`)
- [ ] ตั้งค่า `NODE_ENV=production`
- [ ] เพิ่ม Finnhub API key (ถ้าใช้ฟีเจอร์หุ้น)
- [ ] ตั้งค่า SMTP (ถ้าใช้ฟีเจอร์ email)
- [ ] รัน database migration
- [ ] ทดสอบการเชื่อมต่อ API
- [ ] ตั้งค่า custom domain (Optional)

---

## 🔒 Security Checklist

- [ ] ใช้ HTTPS (SSL/TLS)
- [ ] เปลี่ยน JWT_SECRET เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] ใช้ environment variables สำหรับ secrets
- [ ] เปิด rate limiting
- [ ] อัพเดท dependencies ให้เป็นเวอร์ชันล่าสุด
- [ ] ตั้งค่า database backup

---

## 🧪 ทดสอบหลัง Deploy

```bash
# ทดสอบ Backend API
curl https://your-backend-url.com/health

# ทดสอบ Frontend
curl https://your-frontend-url.com

# ทดสอบ Database connection
# ดูใน logs ของ backend service
```

---

## 🔄 Auto Deploy (CI/CD)

หลังจาก deploy แล้ว ทุกครั้งที่ push ไปที่ GitHub:
- Vercel จะ auto deploy frontend
- Railway/Render จะ auto deploy backend

ไม่ต้องทำอะไรเพิ่ม!

---

## 💰 ค่าใช้จ่าย (ประมาณการ)

### Free Tier:
- **Vercel**: Frontend ฟรี (100GB bandwidth/เดือน)
- **Railway**: $5 credit ฟรี/เดือน (พอสำหรับ hobby project)
- **Render**: Free tier (มีข้อจำกัด: sleep หลัง 15 นาทีไม่ใช้งาน)

### Paid:
- **Railway**: $5-20/เดือน (ขึ้นกับ usage)
- **Render**: $7/เดือน (Web Service) + $7/เดือน (PostgreSQL)
- **Heroku**: $7/เดือน (Dyno) + $9/เดือน (PostgreSQL)
- **DigitalOcean**: $5-10/เดือน (Droplet)

---

## 🆘 แก้ปัญหา

### Backend ไม่ทำงาน:
- ตรวจสอบ logs
- ตรวจสอบ DATABASE_URL
- ตรวจสอบว่ารัน migration แล้ว

### Frontend ไม่เชื่อมต่อ Backend:
- ตรวจสอบ `VITE_API_URL`
- ตรวจสอบ CORS settings
- ดู Network tab ใน browser DevTools

### Database connection error:
- ตรวจสอบ DATABASE_URL format
- ตรวจสอบว่า database service รันอยู่
- ตรวจสอบ firewall/network settings

---

## 📚 เอกสารเพิ่มเติม

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## ✅ สรุป: แนะนำวิธีไหน?

**สำหรับ Hobby/Portfolio:**
→ **Vercel + Railway** (ฟรี, ง่าย, เร็ว)

**สำหรับ Production:**
→ **Render** (มี free tier, reliable) หรือ **Railway** (flexible)

**สำหรับ Enterprise:**
→ **Docker + Cloud** (AWS/GCP/Azure) หรือ **Kubernetes**

เริ่มจาก Vercel + Railway ก่อน แล้วค่อย scale up ตามความต้องการ!
