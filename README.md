# Payout Manager MVP

A full-stack payout management system with role-based access control, built with Next.js 14 + MongoDB.

## Demo Credentials
| **Role** | **Email**                                   | **Password** |
| -------- | ------------------------------------------- | ------------ |
| OPS      | [ops@demo.com](mailto:ops@demo.com)         | ops123       |
| FINANCE  | [finance@demo.com](mailto:finance@demo.com) | fin123       |

## Tech Stack
- **Frontend**: Next.js 14 (App Router), vanilla CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Auth**: JWT via httpOnly cookies

## Run Locally in Under 5 Minutes

### 1. Clone & Install
```bash
git clone https://github.com/JptmJ/cord4.git
cd cord4
npm install
npm run seed (Database data config)
npm run dev
```

### 2. Environment Setup
Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://vivokbhoi00_db_user:admin123@cord4.1v5fmeb.mongodb.net/payout_mvp
JWT_SECRET=super_secret_jwt_key_payout_mvp_2024
SEED_SECRET=seed_payout_mvp
```

### 4. Open the app
```
http://localhost:3000
```

## Status Flow
```
Draft → Submitted (OPS only)
Submitted → Approved (FINANCE only)
Submitted → Rejected (FINANCE only, reason mandatory)
Reject → Resubmit (OPS only)
```
