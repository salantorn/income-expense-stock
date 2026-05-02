# ✅ Deployment Checklist

ใช้ checklist นี้เพื่อให้แน่ใจว่า deploy ถูกต้องครบถ้วน

---

## 📋 ก่อน Deploy

### 1. เตรียม Repository
- [ ] Push โค้ดทั้งหมดขึ้น GitHub
- [ ] ตรวจสอบว่า `.gitignore` ถูกต้อง (ไม่มี `.env`, `node_modules`)
- [ ] ตรวจสอบว่า `README.md` อธิบายโปรเจกต์ชัดเจน

### 2. ตรวจสอบ Environment Variables
- [ ] สร้าง `JWT_SECRET` ใหม่สำหรับ production
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] เตรียม Finnhub API key (ถ้าใช้)
- [ ] เตรียม SMTP credentials (ถ้าใช้)

### 3. ตรวจสอบ Code
- [ ] แก้ไข hardcoded URLs ทั้งหมด
- [ ] ตรวจสอบว่าใช้ environment variables ถูกต้อง
- [ ] ลบ `console.log` ที่ไม่จำเป็น
- [ ] ตรวจสอบ error handling

---

## 🚀 Deploy Backend (Railway/Render)

### Railway:
- [ ] สร้าง project ใหม่
- [ ] เพิ่ม PostgreSQL database
- [ ] เพิ่ม Redis (optional)
- [ ] Deploy backend service
- [ ] ตั้งค่า environment variables:
  - [ ] `DATABASE_URL` (จาก PostgreSQL service)
  - [ ] `REDIS_URL` (จาก Redis service)
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (จะใส่ทีหลังหลังได้ frontend URL)
  - [ ] `FINNHUB_API_KEY` (optional)
  - [ ] `SMTP_*` (optional)
- [ ] ตั้งค่า build/start commands:
  - Root Directory: `backend`
  - Build: `npm install && npm run build`
  - Start: `npm start`
- [ ] Deploy และรอจนเสร็จ
- [ ] คัดลอก backend URL (เช่น `https://xxx.up.railway.app`)
- [ ] รัน migration:
  ```bash
  railway run npm run prisma:migrate:deploy --workspace=backend
  ```

### Render:
- [ ] สร้าง PostgreSQL database
- [ ] คัดลอก Internal Database URL
- [ ] สร้าง Web Service สำหรับ backend
- [ ] ตั้งค่า environment variables (เหมือน Railway)
- [ ] Deploy และรอจนเสร็จ
- [ ] คัดลอก backend URL
- [ ] รัน migration ผ่าน Shell

---

## 🎨 Deploy Frontend (Vercel)

- [ ] Import project จาก GitHub
- [ ] ตั้งค่า:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] เพิ่ม environment variable:
  - [ ] `VITE_API_URL=<backend-url-จากขั้นตอนก่อน>`
- [ ] Deploy และรอจนเสร็จ
- [ ] คัดลอก frontend URL (เช่น `https://xxx.vercel.app`)

---

## 🔄 อัพเดท CORS

- [ ] กลับไปที่ backend service (Railway/Render)
- [ ] แก้ไข `CORS_ORIGIN` ให้เป็น frontend URL ที่ได้
- [ ] Redeploy backend

---

## 🧪 ทดสอบ

### Backend:
- [ ] เปิด `<backend-url>/health` ใน browser
- [ ] ควรเห็น response หรือ status 200
- [ ] ตรวจสอบ logs ว่าไม่มี error

### Frontend:
- [ ] เปิด frontend URL ใน browser
- [ ] ทดสอบ login/register
- [ ] ทดสอบสร้าง transaction
- [ ] ทดสอบดูข้อมูลหุ้น (ถ้ามี Finnhub API key)
- [ ] เปิด DevTools > Network tab ดูว่า API calls ทำงาน
- [ ] ทดสอบบนมือถือ

### Database:
- [ ] ตรวจสอบว่า migration รันสำเร็จ
- [ ] ตรวจสอบว่าสร้าง tables ครบ
- [ ] ทดสอบสร้างข้อมูล

---

## 🔒 Security

- [ ] ตรวจสอบว่าใช้ HTTPS (ทั้ง frontend และ backend)
- [ ] ตรวจสอบ CORS settings
- [ ] ตรวจสอบว่าไม่มี sensitive data ใน logs
- [ ] ตรวจสอบว่า rate limiting ทำงาน
- [ ] เปลี่ยน default passwords ทั้งหมด
- [ ] ตรวจสอบว่า `.env` ไม่ได้ถูก commit

---

## 📊 Monitoring

- [ ] ตั้งค่า error tracking (Sentry, LogRocket)
- [ ] ตั้งค่า uptime monitoring (UptimeRobot, Pingdom)
- [ ] ตั้งค่า analytics (Google Analytics, Plausible)
- [ ] ตั้งค่า database backup
- [ ] ตั้งค่า alerts สำหรับ errors

---

## 📝 Documentation

- [ ] อัพเดท README.md ให้มี production URL
- [ ] เพิ่ม API documentation (ถ้ามี)
- [ ] เขียน user guide (ถ้าจำเป็น)
- [ ] บันทึก deployment process

---

## 🎉 Post-Deployment

- [ ] แจ้งทีมหรือผู้ใช้ว่า deploy แล้ว
- [ ] เพิ่ม custom domain (optional)
- [ ] ตั้งค่า SSL certificate (ถ้าใช้ custom domain)
- [ ] เพิ่ม SEO meta tags
- [ ] Submit sitemap ไปที่ Google Search Console
- [ ] แชร์โปรเจกต์บน social media

---

## 🔄 Auto Deploy Setup

### Vercel:
- ✅ Auto deploy เมื่อ push ไปที่ `main` branch (default)

### Railway:
- ✅ Auto deploy เมื่อ push ไปที่ `main` branch (default)

### Render:
- ✅ Auto deploy เมื่อ push ไปที่ `main` branch (default)

ไม่ต้องตั้งค่าเพิ่ม!

---

## 🆘 Troubleshooting

### Backend ไม่ทำงาน:
- [ ] ตรวจสอบ logs
- [ ] ตรวจสอบ environment variables
- [ ] ตรวจสอบ database connection
- [ ] ตรวจสอบว่ารัน migration แล้ว

### Frontend ไม่เชื่อมต่อ Backend:
- [ ] ตรวจสอบ `VITE_API_URL`
- [ ] ตรวจสอบ CORS settings
- [ ] ตรวจสอบ Network tab ใน DevTools
- [ ] ตรวจสอบว่า backend รันอยู่

### Database Error:
- [ ] ตรวจสอบ `DATABASE_URL` format
- [ ] ตรวจสอบว่า database service รันอยู่
- [ ] ตรวจสอบว่ารัน migration แล้ว
- [ ] ตรวจสอบ connection limits

---

## 📈 Performance Optimization

- [ ] เปิด gzip compression
- [ ] ใช้ CDN สำหรับ static assets
- [ ] Optimize images
- [ ] Enable caching
- [ ] Minify CSS/JS
- [ ] Use lazy loading
- [ ] Monitor performance metrics

---

## 💰 Cost Monitoring

- [ ] ตรวจสอบ usage ของแต่ละ service
- [ ] ตั้งค่า billing alerts
- [ ] Review costs รายเดือน
- [ ] Optimize resources ถ้าจำเป็น

---

## ✅ Final Check

- [ ] Frontend accessible และทำงานถูกต้อง
- [ ] Backend API ตอบกลับถูกต้อง
- [ ] Database มีข้อมูลและ migrations ครบ
- [ ] Authentication ทำงาน
- [ ] All features ทำงานตามที่คาดหวัง
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast loading time
- [ ] SEO friendly

---

## 🎊 Congratulations!

โปรเจกต์ของคุณ deploy สำเร็จแล้ว! 🚀

**URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.up.railway.app`

แชร์โปรเจกต์ของคุณกับเพื่อนๆ และเพิ่มลง portfolio!
