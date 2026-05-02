# 🚀 Deploy แบบละเอียด Step-by-Step

คู่มือนี้จะพาคุณ deploy โปรเจกต์ทีละขั้นตอน ใช้เวลาประมาณ 20-30 นาที

---

## 📋 สิ่งที่ต้องเตรียม

- [x] โค้ดอยู่บน GitHub แล้ว: https://github.com/salantorn/income-expense-stock
- [ ] บัญชี GitHub (มีอยู่แล้ว)
- [ ] อีเมลสำหรับสมัคร Vercel และ Railway
- [ ] Finnhub API Key (สมัครฟรี - optional แต่แนะนำ)

---

## 🎯 ภาพรวม

เราจะ deploy 3 ส่วน:
1. **PostgreSQL Database** บน Railway (ฟรี)
2. **Backend API** บน Railway (ฟรี)
3. **Frontend** บน Vercel (ฟรี)

---

# PART 1: เตรียม Finnhub API Key (5 นาที)

## ทำไมต้องมี?
- สำหรับดึงข้อมูลราคาหุ้นแบบ real-time
- ถ้าไม่มี ฟีเจอร์หุ้นจะไม่ทำงาน (แต่ส่วนอื่นยังใช้ได้)

## ขั้นตอน:

### 1. ไปที่ Finnhub
เปิดเบราว์เซอร์: https://finnhub.io/

### 2. สมัครสมาชิก
- คลิก **"Get free API key"** (มุมขวาบน)
- กรอกข้อมูล:
  - Email: อีเมลของคุณ
  - Password: ตั้งรหัสผ่าน
- คลิก **"Sign up"**

### 3. ยืนยันอีเมล
- เปิดอีเมลที่ใช้สมัคร
- คลิกลิงก์ยืนยัน

### 4. คัดลอก API Key
- Login เข้า Finnhub
- ไปที่ Dashboard
- คัดลอก **API Key** (เช่น `abc123def456...`)
- **เก็บไว้ในที่ปลอดภัย** (จะใช้ในขั้นตอนถัดไป)

✅ **เสร็จแล้ว!** Free tier ให้ 60 API calls/minute (เพียงพอมาก)

---

# PART 2: Deploy Backend + Database บน Railway (10 นาที)

## ขั้นตอน:

### 1. เปิด Railway
เปิดเบราว์เซอร์: https://railway.app/

### 2. Login
- คลิก **"Login"** (มุมขวาบน)
- เลือก **"Login with GitHub"**
- อนุญาตให้ Railway เข้าถึง GitHub
- ✅ Login สำเร็จ!

### 3. สร้าง Project ใหม่
- คลิก **"New Project"** (ปุ่มสีม่วง)
- เลือก **"Deploy from GitHub repo"**
- ค้นหาและเลือก **"salantorn/income-expense-stock"**
- คลิก **"Deploy Now"**

Railway จะเริ่มสร้าง project และ deploy service แรก

### 4. เพิ่ม PostgreSQL Database

**ทำไมต้องมี?** Backend ต้องการ database เพื่อเก็บข้อมูล

- ใน Project ที่สร้าง คลิก **"+ New"** (มุมขวาบน)
- เลือก **"Database"**
- เลือก **"Add PostgreSQL"**
- Railway จะสร้าง PostgreSQL database ให้อัตโนมัติ
- รอสักครู่จนเห็น status เป็น **"Active"** (จุดสีเขียว)

✅ **Database พร้อมแล้ว!**

### 5. เพิ่ม Redis (Optional - แนะนำ)

**ทำไมต้องมี?** สำหรับ caching และ rate limiting (ไม่มีก็รันได้)

- คลิก **"+ New"** อีกครั้ง
- เลือก **"Database"**
- เลือก **"Add Redis"**
- รอจน status เป็น **"Active"**

✅ **Redis พร้อมแล้ว!**

### 6. ตั้งค่า Backend Service

ตอนนี้คุณจะเห็น 3 services:
- `income-expense-stock` (service จาก GitHub)
- `Postgres` (database)
- `Redis` (cache)

**คลิกที่ service `income-expense-stock`** (service แรก)

#### 6.1 ตั้งค่า Root Directory

- ไปที่แท็บ **"Settings"** (ด้านซ้าย)
- หาส่วน **"Root Directory"**
- ใส่: `backend`
- คลิก **"Update"**

**ทำไม?** เพราะโค้ด backend อยู่ในโฟลเดอร์ `backend`

#### 6.2 ตั้งค่า Build & Start Commands

ยังอยู่ในแท็บ **"Settings"**:

- หาส่วน **"Build Command"**
- ใส่: `npm install && npm run build`
- คลิก **"Update"**

- หาส่วน **"Start Command"**  
- ใส่: `npm start`
- คลิก **"Update"**

#### 6.3 ตั้งค่า Environment Variables (สำคัญมาก!)

- ไปที่แท็บ **"Variables"** (ด้านซ้าย)
- คลิก **"+ New Variable"**

**ใส่ตัวแปรเหล่านี้ทีละตัว:**

```
ชื่อตัวแปร: DATABASE_URL
ค่า: คลิก "Add Reference" > เลือก "Postgres" > เลือก "DATABASE_URL"
```

```
ชื่อตัวแปร: REDIS_URL
ค่า: คลิก "Add Reference" > เลือก "Redis" > เลือก "REDIS_URL"
```

```
ชื่อตัวแปร: JWT_SECRET
ค่า: (สร้างใหม่ - อ่านด้านล่าง)
```

**วิธีสร้าง JWT_SECRET:**
1. เปิด Terminal/PowerShell ในเครื่อง
2. รันคำสั่ง:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. คัดลอกผลลัพธ์ (จะได้ string ยาวๆ เช่น `a1b2c3d4e5f6...`)
4. นำมาใส่ใน JWT_SECRET

```
ชื่อตัวแปร: JWT_EXPIRES_IN
ค่า: 7d
```

```
ชื่อตัวแปร: NODE_ENV
ค่า: production
```

```
ชื่อตัวแปร: PORT
ค่า: 3000
```

```
ชื่อตัวแปร: CORS_ORIGIN
ค่า: * 
(ใส่ * ไว้ก่อน จะมาแก้ทีหลังหลังได้ frontend URL)
```

```
ชื่อตัวแปร: FINNHUB_API_KEY
ค่า: (ใส่ API key ที่ได้จาก Part 1)
```

```
ชื่อตัวแปร: RATE_LIMIT_WINDOW_MS
ค่า: 60000
```

```
ชื่อตัวแปร: RATE_LIMIT_MAX_REQUESTS
ค่า: 100
```

**ตัวแปรที่เป็น Optional (ข้ามได้):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - สำหรับส่ง email

✅ **ตั้งค่า Variables เสร็จแล้ว!**

### 7. Deploy Backend

- Railway จะ deploy อัตโนมัติหลังตั้งค่า variables
- ไปที่แท็บ **"Deployments"**
- รอจนเห็น status เป็น **"Success"** (จุดสีเขียว)
- ถ้า failed ให้ดู logs และแก้ไข

### 8. เปิด Public URL

- ไปที่แท็บ **"Settings"**
- หาส่วน **"Networking"**
- คลิก **"Generate Domain"**
- Railway จะสร้าง URL ให้ (เช่น `https://income-expense-stock-production.up.railway.app`)
- **คัดลอก URL นี้ไว้** (จะใช้ใน Part 3)

### 9. รัน Database Migration

**สำคัญมาก!** ต้องสร้าง tables ใน database

#### วิธีที่ 1: ใช้ Railway CLI (แนะนำ)

เปิด Terminal/PowerShell ในเครื่อง:

```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link กับ project
railway link

# เลือก project ที่สร้าง
# เลือก service "income-expense-stock"

# รัน migration
railway run npm run prisma:migrate:deploy --workspace=backend
```

#### วิธีที่ 2: ใช้ Railway Shell

- ไปที่ backend service บน Railway
- คลิกแท็บ **"Shell"** (ด้านซ้าย)
- รอจน shell พร้อม
- พิมพ์คำสั่ง:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```
- กด Enter
- รอจนเสร็จ

✅ **Backend พร้อมแล้ว!**

### 10. ทดสอบ Backend

เปิดเบราว์เซอร์ไปที่:
```
https://your-backend-url.up.railway.app/health
```

ถ้าเห็น response หรือ status 200 = **สำเร็จ!** ✅

---

# PART 3: Deploy Frontend บน Vercel (5 นาที)

## ขั้นตอน:

### 1. เปิด Vercel
เปิดเบราว์เซอร์: https://vercel.com/

### 2. Login
- คลิก **"Sign Up"** หรือ **"Login"**
- เลือก **"Continue with GitHub"**
- อนุญาตให้ Vercel เข้าถึง GitHub
- ✅ Login สำเร็จ!

### 3. Import Project
- คลิก **"Add New..."** (มุมขวาบน)
- เลือก **"Project"**
- ค้นหา **"income-expense-stock"**
- คลิก **"Import"**

### 4. ตั้งค่า Project

Vercel จะแสดงหน้าตั้งค่า:

#### 4.1 Framework Preset
- เลือก: **"Vite"** (ถ้ายังไม่ได้เลือก)

#### 4.2 Root Directory
- คลิก **"Edit"** ข้าง Root Directory
- เลือก: **"frontend"**
- คลิก **"Continue"**

#### 4.3 Build Settings
ตรวจสอบว่าถูกต้อง:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 4.4 Environment Variables

**สำคัญมาก!** คลิก **"Environment Variables"**

```
ชื่อตัวแปร: VITE_API_URL
ค่า: (ใส่ Backend URL จาก Railway - Part 2 ขั้นตอนที่ 8)
ตัวอย่าง: https://income-expense-stock-production.up.railway.app
```

**ห้ามมี `/` ต่อท้าย!**

### 5. Deploy!

- คลิก **"Deploy"** (ปุ่มสีน้ำเงิน)
- รอสักครู่ (ประมาณ 2-3 นาที)
- Vercel จะ build และ deploy
- เมื่อเสร็จจะเห็น 🎉 **"Congratulations!"**

### 6. คัดลอก Frontend URL

- คลิก **"Continue to Dashboard"**
- คัดลอก URL (เช่น `https://income-expense-stock.vercel.app`)

✅ **Frontend พร้อมแล้ว!**

---

# PART 4: เชื่อมต่อ Frontend กับ Backend (3 นาที)

## ขั้นตอน:

### 1. อัพเดท CORS บน Railway

- กลับไปที่ Railway: https://railway.app/
- เปิด project ของคุณ
- คลิกที่ **backend service** (income-expense-stock)
- ไปที่แท็บ **"Variables"**
- หา `CORS_ORIGIN`
- แก้ไขค่าเป็น: **Frontend URL จาก Vercel**
  ```
  https://income-expense-stock.vercel.app
  ```
  (ห้ามมี `/` ต่อท้าย!)
- คลิก **"Update"**

### 2. Redeploy Backend

- Railway จะ redeploy อัตโนมัติ
- รอจน status เป็น **"Success"**

✅ **เชื่อมต่อสำเร็จ!**

---

# PART 5: ทดสอบ (5 นาที)

## ขั้นตอน:

### 1. เปิด Frontend
เปิดเบราว์เซอร์ไปที่ Frontend URL:
```
https://income-expense-stock.vercel.app
```

### 2. ทดสอบ Register
- คลิก **"Register"** หรือ **"Sign Up"**
- กรอกข้อมูล:
  - Name: ชื่อของคุณ
  - Email: อีเมลของคุณ
  - Password: รหัสผ่าน (อย่างน้อย 6 ตัว)
- คลิก **"Register"**
- ถ้าสำเร็จจะเข้าสู่หน้า Dashboard

### 3. ทดสอบสร้าง Transaction
- ไปที่หน้า **"Transactions"**
- คลิก **"Add Transaction"**
- กรอกข้อมูล:
  - Type: Income หรือ Expense
  - Amount: จำนวนเงิน
  - Category: หมวดหมู่
  - Description: รายละเอียด
- คลิก **"Save"**
- ถ้าสำเร็จจะเห็น transaction ใหม่

### 4. ทดสอบดูข้อมูลหุ้น (ถ้ามี Finnhub API Key)
- ไปที่หน้า **"Portfolio"** หรือ **"Watchlist"**
- ลองค้นหาหุ้น (เช่น AAPL, GOOGL)
- ถ้าเห็นราคา = **สำเร็จ!**

### 5. ตรวจสอบ Console
- กด F12 เปิด DevTools
- ไปที่แท็บ **"Console"**
- ไม่ควรมี error สีแดง
- ไปที่แท็บ **"Network"**
- ดู API calls ว่าเรียก backend สำเร็จ (status 200)

---

# 🎉 สำเร็จแล้ว!

## ✅ สิ่งที่คุณมีตอนนี้:

- ✅ **Frontend**: https://income-expense-stock.vercel.app
- ✅ **Backend**: https://your-backend.up.railway.app
- ✅ **Database**: PostgreSQL บน Railway
- ✅ **Redis**: Cache บน Railway
- ✅ **Auto Deploy**: Push ไปที่ GitHub จะ deploy อัตโนมัติ

---

# 🔄 Auto Deploy

จากนี้ไป เมื่อคุณแก้ไขโค้ดและ push ไปที่ GitHub:

```bash
git add .
git commit -m "Update something"
git push
```

- **Vercel** จะ deploy frontend อัตโนมัติ
- **Railway** จะ deploy backend อัตโนมัติ

ไม่ต้องทำอะไรเพิ่ม!

---

# 🎨 ปรับแต่งเพิ่มเติม (Optional)

## 1. เพิ่ม Custom Domain

### Vercel (Frontend):
- ไปที่ Project Settings
- คลิก **"Domains"**
- เพิ่ม domain ของคุณ
- ตั้งค่า DNS ตามที่ Vercel บอก

### Railway (Backend):
- ไปที่ Service Settings
- คลิก **"Networking"**
- เพิ่ม custom domain

## 2. ตั้งค่า Email (SMTP)

ถ้าต้องการฟีเจอร์ส่ง email (reset password):

- ไปที่ Railway > Backend Service > Variables
- เพิ่ม:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  EMAIL_FROM=noreply@yourdomain.com
  ```

วิธีสร้าง Gmail App Password:
1. ไปที่ https://myaccount.google.com/security
2. เปิด 2-Step Verification
3. ไปที่ App passwords
4. สร้าง password สำหรับ "Mail"
5. คัดลอกมาใส่ใน SMTP_PASS

---

# 🆘 แก้ปัญหา

## Frontend ไม่แสดงข้อมูล

**ตรวจสอบ:**
1. เปิด DevTools (F12) > Console
2. ดู error messages
3. ไปที่ Network tab
4. ดูว่า API calls ไปที่ backend URL ที่ถูกต้องหรือไม่
5. ตรวจสอบ `VITE_API_URL` ใน Vercel

**แก้ไข:**
- ไปที่ Vercel > Project Settings > Environment Variables
- แก้ไข `VITE_API_URL`
- Redeploy

## Backend Error 500

**ตรวจสอบ:**
1. ไปที่ Railway > Backend Service > Logs
2. ดู error messages

**สาเหตุที่พบบ่อย:**
- ไม่ได้รัน migration → รันใหม่
- DATABASE_URL ผิด → ตรวจสอบ variables
- JWT_SECRET ไม่มี → เพิ่ม variable

## CORS Error

**อาการ:**
- Console แสดง "CORS policy blocked"

**แก้ไข:**
1. ไปที่ Railway > Backend Service > Variables
2. แก้ไข `CORS_ORIGIN` ให้เป็น frontend URL ที่ถูกต้อง
3. ห้ามมี `/` ต่อท้าย
4. Redeploy

## Database Connection Error

**แก้ไข:**
1. ตรวจสอบว่า PostgreSQL service รันอยู่
2. ตรวจสอบ `DATABASE_URL` variable
3. ลองรัน migration ใหม่

---

# 📊 Monitoring

## ดู Logs

### Railway (Backend):
- ไปที่ Service > แท็บ **"Logs"**
- ดู real-time logs

### Vercel (Frontend):
- ไปที่ Project > แท็บ **"Logs"**
- ดู deployment logs

## ดู Usage

### Railway:
- ไปที่ Project > แท็บ **"Usage"**
- ดู CPU, Memory, Network usage
- Free tier: $5 credit/เดือน

### Vercel:
- ไปที่ Dashboard > Usage
- ดู bandwidth, build time
- Free tier: 100GB bandwidth/เดือน

---

# 💰 ค่าใช้จ่าย

## Free Tier (ที่คุณใช้อยู่):

**Railway:**
- $5 credit ฟรี/เดือน
- พอสำหรับ hobby project
- ถ้าเกินจะหยุดทำงาน (ไม่มีค่าใช้จ่าย)

**Vercel:**
- 100GB bandwidth/เดือน ฟรี
- Unlimited deployments
- พอสำหรับ hobby project

**รวม: ฟรี!** 🎉

---

# 🎓 สิ่งที่เรียนรู้

คุณได้เรียนรู้:
- ✅ Deploy Full-stack application
- ✅ ตั้งค่า Environment Variables
- ✅ เชื่อมต่อ Frontend-Backend-Database
- ✅ ใช้ Railway และ Vercel
- ✅ CI/CD (Auto Deploy)
- ✅ Monitoring และ Debugging

---

# 🚀 ขั้นตอนถัดไป

1. แชร์โปรเจกต์กับเพื่อนๆ
2. เพิ่มลง Portfolio
3. เพิ่มฟีเจอร์ใหม่ๆ
4. ปรับปรุง UI/UX
5. เพิ่ม Tests
6. Scale up เมื่อมีผู้ใช้เยอะขึ้น

---

# 📚 Resources

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Finnhub API Docs](https://finnhub.io/docs/api)

---

**ยินดีด้วยครับ! คุณ deploy สำเร็จแล้ว! 🎊**

ถ้ามีปัญหาหรือคำถาม ดูที่ส่วน "แก้ปัญหา" หรือถามได้เลยครับ!
