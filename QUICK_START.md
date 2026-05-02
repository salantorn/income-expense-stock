# 🚀 Quick Start Guide

## ข้อกำหนดเบื้องต้น

ต้องมีโปรแกรมเหล่านี้ติดตั้งในเครื่องแล้ว:
- ✅ Node.js (v18 หรือสูงกว่า)
- ✅ PostgreSQL (รันอยู่ที่ port 5432)
- ✅ Redis (รันอยู่ที่ port 6379) - ถ้าไม่มีก็ยังรันได้ แต่บางฟีเจอร์อาจไม่ทำงาน

## 📋 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Database
**อ่านคู่มือฉบับเต็มที่ [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)**

แก้ไขไฟล์ `backend/.env`:

**ขั้นต่ำที่ต้องตั้งค่า:**
1. `DATABASE_URL` - แก้ username/password ให้ถูกต้อง
2. `JWT_SECRET` - สร้างใหม่ด้วย: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**แนะนำให้ตั้งค่า:**
3. `FINNHUB_API_KEY` - สมัครฟรีที่ https://finnhub.io/ (สำหรับดึงข้อมูลหุ้น)

ตัวอย่าง:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/income_expense_db?schema=public"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
FINNHUB_API_KEY="abc123def456"
```

### 3. สร้าง Database และรัน Migration
```bash
# สร้าง database (ถ้ายังไม่มี)
# เปิด psql หรือ pgAdmin แล้วรันคำสั่ง:
# CREATE DATABASE income_expense_db;

# รัน migration
npm run prisma:migrate --workspace=backend
```

### 4. (Optional) ใส่ข้อมูลตัวอย่าง
```bash
npm run prisma:seed --workspace=backend
```

## 🏃 วิธีรันโปรเจกต์

### รันทั้ง Backend และ Frontend พร้อมกัน
```bash
npm run dev
```

หรือ

### รันแยกกัน (แนะนำสำหรับ debugging)
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 🌐 เปิดใช้งาน

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prisma Studio**: `npm run prisma:studio --workspace=backend`

## 🔧 คำสั่งที่มีประโยชน์

```bash
# Build ทั้งหมด
npm run build

# Run tests
npm run test

# Type check
npm run type-check --workspace=backend
npm run type-check --workspace=frontend

# Prisma Studio (ดู database แบบ GUI)
npm run prisma:studio --workspace=backend

# Generate Prisma Client ใหม่
npm run prisma:generate --workspace=backend
```

## ❗ แก้ปัญหาที่พบบ่อย

### Database connection error (P1000)
**อ่านคู่มือแก้ปัญหาฉบับเต็มที่ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

วิธีแก้ไขด่วน:
1. ตรวจสอบว่า PostgreSQL รันอยู่
2. ทดสอบการเชื่อมต่อ: `node test-db.js`
3. แก้ไข username/password ใน `backend/.env`
4. สร้าง database: `CREATE DATABASE income_expense_db;`
5. รัน migration: `npm run prisma:migrate --workspace=backend`

### Port already in use
- Backend (3000): หยุดโปรแกรมที่ใช้ port 3000
- Frontend (5173): หยุดโปรแกรมที่ใช้ port 5173

### Prisma errors
```bash
# ลบและสร้าง database ใหม่
npm run prisma:reset --workspace=backend

# Generate client ใหม่
npm run prisma:generate --workspace=backend
```

## ✨ พร้อมใช้งานแล้ว!

ตอนนี้โปรเจกต์พร้อมใช้งานแล้ว เปิด http://localhost:5173 เพื่อเริ่มต้น
