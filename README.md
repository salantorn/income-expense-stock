# 💰 Income-Expense-Stock Dashboard

ระบบจัดการรายรับ-รายจ่าย และติดตามหุ้น แบบ Full-Stack

## 🎯 Features

- 📊 **Dashboard** - ภาพรวมการเงินและหุ้น
- 💵 **Income/Expense** - บันทึกรายรับ-รายจ่าย พร้อม categories
- 📈 **Stock Portfolio** - ติดตามหุ้นที่ถืออยู่
- 📉 **Stock Watchlist** - เฝ้าดูหุ้นที่สนใจ
- 🔔 **Price Alerts** - แจ้งเตือนเมื่อราคาหุ้นถึงเป้าหมาย
- 👤 **User Management** - ระบบ Authentication และ Profile
- 🔐 **Security** - JWT, Rate Limiting, Input Validation

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Redis** (caching & rate limiting)
- **JWT** (authentication)
- **Finnhub API** (stock data)

### Frontend
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** (styling)
- **React Router** (routing)
- **Recharts** (charts)
- **React Query** (data fetching)

## 🚀 Quick Start

อ่านคู่มือฉบับเต็มที่ [QUICK_START.md](./QUICK_START.md)

### ติดตั้งและรัน
```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า database ใน backend/.env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/income_expense_db?schema=public"

# 3. รัน migration
npm run prisma:migrate --workspace=backend

# 4. รันโปรเจกต์
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:5173

## 📚 เอกสารเพิ่มเติม

- [QUICK_START.md](./QUICK_START.md) - คู่มือเริ่มต้นใช้งาน
- [GETTING-STARTED.md](./GETTING-STARTED.md) - คู่มือโครงสร้างโปรเจกต์
- [CHEAT-SHEET.md](./CHEAT-SHEET.md) - คำสั่งที่ใช้บ่อย

## 📦 Project Structure

```
income-expense-stock/
├── backend/              # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   └── prisma/           # Database schema & migrations
│
├── frontend/             # React App
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── services/     # API calls
│       └── types/        # TypeScript types
│
└── package.json          # Workspace root
```

## 🔑 Environment Variables

สร้างไฟล์ `backend/.env` จาก `backend/.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/income_expense_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
FINNHUB_API_KEY="your-api-key"
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific workspace
npm run test --workspace=backend
npm run test --workspace=frontend
```

## 🏗️ Build

```bash
# Build all
npm run build

# Build specific workspace
npm run build --workspace=backend
npm run build --workspace=frontend
```

## 📝 License

MIT

## 👨‍💻 Author

Your Name
