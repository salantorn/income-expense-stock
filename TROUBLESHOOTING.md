# 🔧 แก้ปัญหา Database Connection

## ❌ Error: P1000 - Cannot connect to database

### วิธีแก้ไข

#### 1. ตรวจสอบ PostgreSQL กำลังรันอยู่
```bash
# Windows - ตรวจสอบ service
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# หรือตรวจสอบ port
netstat -ano | findstr :5432
```

#### 2. หา PostgreSQL password ที่ถูกต้อง

**วิธีที่ 1: ใช้ pgAdmin**
- เปิด pgAdmin
- เชื่อมต่อกับ server (จะขอ password)
- Password ที่ใช้ได้คือ password ที่ถูกต้อง

**วิธีที่ 2: ตรวจสอบไฟล์ config**
- หาไฟล์ `pg_hba.conf` (มักอยู่ใน `C:\Program Files\PostgreSQL\[version]\data\`)
- ดูว่าใช้ authentication method อะไร

**วิธีที่ 3: Reset password**
```sql
-- เปิด psql หรือ pgAdmin แล้วรัน:
ALTER USER postgres WITH PASSWORD 'newpassword';
```

#### 3. แก้ไข `backend/.env`

หลังจากรู้ password แล้ว แก้ไข `DATABASE_URL`:

```env
# ตัวอย่าง
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/income_expense_db?schema=public"
```

#### 4. สร้าง Database

```sql
-- เปิด pgAdmin หรือ psql แล้วรัน:
CREATE DATABASE income_expense_db;
```

หรือใช้ pgAdmin:
1. คลิกขวาที่ "Databases"
2. เลือก "Create" > "Database..."
3. ตั้งชื่อ: `income_expense_db`
4. กด Save

#### 5. รัน Migration

```bash
npm run prisma:migrate --workspace=backend
```

## 🔄 วิธีแก้แบบง่าย: ใช้ Trust Authentication (Development Only)

**⚠️ ใช้สำหรับ development เท่านั้น! ไม่ปลอดภัยสำหรับ production**

1. หาไฟล์ `pg_hba.conf`
2. แก้ไขบรรทัดที่มี `127.0.0.1/32` เป็น:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```
3. Restart PostgreSQL service
4. ใช้ `DATABASE_URL` โดยไม่ต้องใส่ password:
   ```env
   DATABASE_URL="postgresql://postgres@localhost:5432/income_expense_db?schema=public"
   ```

## 🆘 ยังแก้ไม่ได้?

### ทดสอบการเชื่อมต่อ
```bash
node test-db.js
```

### ตรวจสอบ PostgreSQL logs
- Windows: `C:\Program Files\PostgreSQL\[version]\data\log\`
- ดู error message ล่าสุด

### ติดต่อขอความช่วยเหลือ
แนบข้อมูลเหล่านี้:
1. PostgreSQL version
2. Error message จาก backend
3. เนื้อหาใน `pg_hba.conf` (บรรทัดที่เกี่ยวข้อง)
4. ผลลัพธ์จาก `node test-db.js`

## ✅ หลังจากแก้ไขเสร็จ

1. ลบไฟล์ทดสอบ: `rm test-db.js`
2. รันโปรเจกต์: `npm run dev`
3. เปิด http://localhost:5173
