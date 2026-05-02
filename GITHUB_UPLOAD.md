# 📤 วิธีอัพโหลดโปรเจกต์ขึ้น GitHub

โปรเจกต์ของคุณพร้อมอัพโหลดแล้ว! มี 2 วิธี:

---

## 🚀 วิธีที่ 1: ใช้ GitHub Web (แนะนำ - ง่ายที่สุด)

### ขั้นตอน:

1. **สร้าง Repository ใหม่บน GitHub**
   - ไปที่: https://github.com/new
   - Repository name: `income-expense-stock`
   - Description: `Full-stack Income-Expense and Stock Portfolio Dashboard`
   - เลือก: **Public** หรือ **Private** (ตามต้องการ)
   - **ไม่ต้องเลือก** "Add a README file" (เพราะเรามีแล้ว)
   - **ไม่ต้องเลือก** "Add .gitignore" (เพราะเรามีแล้ว)
   - คลิก **"Create repository"**

2. **เชื่อมต่อและ Push**
   
   GitHub จะแสดงคำสั่งให้ คัดลอกและรันใน terminal:
   
   ```bash
   cd C:\Portfolio\income-expense-stock
   
   # เพิ่ม remote repository
   git remote add origin https://github.com/YOUR_USERNAME/income-expense-stock.git
   
   # เปลี่ยน branch เป็น main (ถ้าต้องการ)
   git branch -M main
   
   # Push ขึ้น GitHub
   git push -u origin main
   ```
   
   **แทน `YOUR_USERNAME` ด้วย username GitHub ของคุณ**

3. **เสร็จแล้ว!**
   - รีเฟรชหน้า GitHub
   - โปรเจกต์ของคุณจะปรากฏบน GitHub แล้ว

---

## 🔧 วิธีที่ 2: ใช้ GitHub CLI (ถ้าติดตั้งแล้ว)

### ติดตั้ง GitHub CLI:
```bash
# Windows (ใช้ winget)
winget install --id GitHub.cli

# หรือดาวน์โหลดจาก: https://cli.github.com/
```

### Login และสร้าง Repository:
```bash
cd C:\Portfolio\income-expense-stock

# Login (ครั้งแรก)
gh auth login

# สร้าง repository และ push
gh repo create income-expense-stock --public --source=. --push

# หรือถ้าต้องการ private
gh repo create income-expense-stock --private --source=. --push
```

---

## 📋 ข้อมูลที่จะแสดงบน GitHub

เมื่ออัพโหลดเสร็จ GitHub จะแสดง:

- ✅ **README.md** - ภาพรวมโปรเจกต์
- ✅ **QUICK_START.md** - คู่มือเริ่มต้นใช้งาน
- ✅ **ENV_SETUP_GUIDE.md** - คู่มือตั้งค่า environment variables
- ✅ **TROUBLESHOOTING.md** - คู่มือแก้ปัญหา
- ✅ **Source code** - ทั้ง frontend และ backend
- ✅ **.gitignore** - ไฟล์ที่ไม่ควร commit (node_modules, .env, etc.)

---

## 🔐 ไฟล์ที่ไม่ได้อัพโหลด (ตาม .gitignore)

ไฟล์เหล่านี้จะ**ไม่ถูกอัพโหลด**ขึ้น GitHub (ถูกต้องแล้ว):

- ❌ `node_modules/` - dependencies (ใหญ่เกินไป)
- ❌ `.env` - environment variables (มี password)
- ❌ `dist/`, `build/` - compiled files
- ❌ `.next/` - Next.js cache
- ❌ `test-db.js` - temporary test file

---

## ✅ Checklist หลัง Push

- [ ] เปิด GitHub repository ของคุณ
- [ ] ตรวจสอบว่า README.md แสดงผลถูกต้อง
- [ ] ตรวจสอบว่าไม่มีไฟล์ `.env` (ต้องไม่มี!)
- [ ] เพิ่ม Topics: `react`, `typescript`, `express`, `prisma`, `postgresql`, `stock-portfolio`
- [ ] (Optional) เพิ่ม Description และ Website URL
- [ ] (Optional) เปิด GitHub Pages ถ้าต้องการ

---

## 🎨 ปรับแต่ง Repository (Optional)

### เพิ่ม Topics:
1. ไปที่ repository บน GitHub
2. คลิก ⚙️ (Settings) ด้านขวาบน
3. เพิ่ม Topics: `react`, `typescript`, `express`, `prisma`, `postgresql`, `stock-portfolio`, `dashboard`

### เพิ่ม Description:
```
Full-stack Income-Expense and Stock Portfolio Dashboard with React, TypeScript, Express, and PostgreSQL
```

### เพิ่ม License (แนะนำ):
1. ไปที่ repository
2. คลิก "Add file" > "Create new file"
3. ตั้งชื่อ: `LICENSE`
4. เลือก template: `MIT License`
5. Commit

---

## 🔄 การอัพเดทในอนาคต

เมื่อแก้ไขโค้ดแล้วต้องการอัพเดทบน GitHub:

```bash
# 1. ดูไฟล์ที่เปลี่ยนแปลง
git status

# 2. เพิ่มไฟล์ที่ต้องการ commit
git add .

# 3. Commit พร้อมข้อความ
git commit -m "Update: คำอธิบายการเปลี่ยนแปลง"

# 4. Push ขึ้น GitHub
git push
```

---

## 🆘 แก้ปัญหา

### ถ้า push ไม่ได้ (authentication error):

**ใช้ Personal Access Token:**

1. ไปที่: https://github.com/settings/tokens
2. คลิก "Generate new token (classic)"
3. เลือก scopes: `repo` (ทั้งหมด)
4. คัดลอก token
5. เมื่อ push จะถาม password ให้ใส่ **token** แทน password

**หรือใช้ SSH:**

```bash
# สร้าง SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# คัดลอก public key
cat ~/.ssh/id_ed25519.pub

# เพิ่มใน GitHub: Settings > SSH and GPG keys > New SSH key

# เปลี่ยน remote URL เป็น SSH
git remote set-url origin git@github.com:YOUR_USERNAME/income-expense-stock.git
```

---

## 📱 Clone โปรเจกต์ในเครื่องอื่น

หลังจากอัพโหลดแล้ว คนอื่นสามารถ clone ได้:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/income-expense-stock.git

# เข้าไปในโฟลเดอร์
cd income-expense-stock

# ติดตั้ง dependencies
npm install

# ตั้งค่า .env (ต้องทำเอง)
cp backend/.env.example backend/.env
# แก้ไข backend/.env

# รัน migration
npm run prisma:migrate --workspace=backend

# รันโปรเจกต์
npm run dev
```

---

## 🎉 เสร็จแล้ว!

โปรเจกต์ของคุณพร้อมแชร์บน GitHub แล้ว!

URL จะเป็น: `https://github.com/YOUR_USERNAME/income-expense-stock`
