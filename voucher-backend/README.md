# Voucher Redemption System — Backend API

A production-ready Node.js + Express + MongoDB REST API for a full-featured voucher redemption system with Google OAuth, JWT auth, QR codes, PDF generation, points system, and analytics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | Passport.js (Google OAuth 2.0) + JWT |
| PDF | PDFKit |
| QR Code | qrcode |
| Validation | Joi |
| Security | Helmet, express-rate-limit, bcryptjs |

---

## Project Structure

```
voucher-backend/
├── server.js                    # Entry point
├── .env.example                 # Environment template
├── config/
│   ├── passport.js              # Google OAuth strategy
│   └── db.js                   # MongoDB connection
├── models/
│   ├── User.model.js            # User + points history schema
│   ├── Voucher.model.js         # Voucher schema with virtuals
│   ├── Redemption.model.js      # Redemption + QR + PDF schema
│   └── Referral.model.js        # Referral tracking schema
├── controllers/
│   ├── auth.controller.js       # Register, login, Google OAuth
│   ├── voucher.controller.js    # CRUD + category summary
│   ├── redemption.controller.js # Redeem, history, PDF, cancel
│   ├── user.controller.js       # Profile, points, admin user mgmt
│   ├── analytics.controller.js  # Dashboard + charts data
│   └── referral.controller.js   # Referral info + validation
├── routes/
│   ├── auth.routes.js
│   ├── voucher.routes.js
│   ├── redemption.routes.js
│   ├── user.routes.js
│   ├── analytics.routes.js
│   └── referral.routes.js
├── middleware/
│   ├── auth.middleware.js       # protect, adminOnly, optionalAuth
│   ├── rateLimit.middleware.js  # Auth, redemption, global limiters
│   └── error.middleware.js      # asyncHandler + AppError
├── services/
│   ├── qrcode.service.js        # QR code generation (base64/SVG)
│   ├── pdf.service.js           # Voucher PDF generation
│   └── points.service.js        # Points award/deduct/refund logic
├── utils/
│   ├── jwt.util.js              # Token generation/verification
│   ├── referral.util.js         # Referral code generator
│   ├── voucherCode.util.js      # Redemption code generator
│   ├── response.util.js         # Standardized API responses
│   └── validate.util.js         # Joi validation schemas
└── seeds/
    └── seedVouchers.js          # 20 vouchers + admin + demo user
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd voucher-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Fill in your values (see Environment Variables section)
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add `http://localhost:5000/api/auth/google/callback` to Authorized redirect URIs
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

### 4. MongoDB Setup
- **Local**: Install MongoDB, use `MONGO_URI=mongodb://localhost:27017/voucher_db`
- **Atlas**: Create cluster → get connection string → replace in `.env`

### 5. Seed Database
```bash
npm run seed
# Creates: 20 vouchers, admin@vouchersystem.com, user@demo.com
```

### 6. Run
```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3000
SIGNUP_BONUS_POINTS=100
REFERRAL_REWARD_POINTS=50
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register (email/password + optional referral) |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/google` | ❌ | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | ❌ | Google OAuth callback |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/auth/logout` | ✅ | Logout |

### Vouchers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vouchers` | Optional | List vouchers (filter/paginate) |
| GET | `/api/vouchers/categories` | ❌ | Category summary counts |
| GET | `/api/vouchers/:id` | Optional | Single voucher detail |
| POST | `/api/vouchers` | Admin | Create voucher |
| PUT | `/api/vouchers/:id` | Admin | Update voucher |
| DELETE | `/api/vouchers/:id` | Admin | Delete/deactivate voucher |
| PATCH | `/api/vouchers/:id/toggle` | Admin | Toggle active status |

### Redemptions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/redemptions` | ✅ | Redeem a voucher |
| GET | `/api/redemptions/my` | ✅ | My redemption history |
| GET | `/api/redemptions/:id` | ✅ | Single redemption detail |
| GET | `/api/redemptions/:id/pdf` | ✅ | Download voucher PDF |
| POST | `/api/redemptions/:id/cancel` | ✅ | Cancel + refund points |
| GET | `/api/redemptions` | Admin | All redemptions |
| PATCH | `/api/redemptions/:id/mark-used` | Admin | Mark as used |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | ✅ | My profile |
| PUT | `/api/users/profile` | ✅ | Update profile |
| GET | `/api/users/points-history` | ✅ | My points history |
| GET | `/api/users` | Admin | All users |
| GET | `/api/users/:id` | Admin | User by ID |
| PATCH | `/api/users/:id/role` | Admin | Change role |
| PATCH | `/api/users/:id/toggle` | Admin | Activate/deactivate |
| PATCH | `/api/users/:id/points` | Admin | Adjust points |

### Analytics (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Overview stats |
| GET | `/api/analytics/top-vouchers` | Most redeemed |
| GET | `/api/analytics/low-vouchers` | Least redeemed + expiring |
| GET | `/api/analytics/redemptions-over-time` | Chart data |
| GET | `/api/analytics/category-breakdown` | By category |
| GET | `/api/analytics/user-activity` | Top users |

### Referrals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/referrals/validate/:code` | ❌ | Validate referral code |
| GET | `/api/referrals/my` | ✅ | My referrals + earnings |
| GET | `/api/referrals` | Admin | All referrals |

---

## Points System

| Event | Points |
|-------|--------|
| Sign up (email/password or Google) | +100 (configurable) |
| Successful referral (referrer gets) | +50 (configurable) |
| Redeem a voucher | -voucher.pointsCost |
| Cancel redemption | +refund |

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vouchersystem.com | Admin@123456 |
| User | user@demo.com | User@123456 |

---

## Deployment

### Render
1. Connect GitHub repo
2. Add all environment variables
3. Set Build: `npm install`, Start: `npm start`

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGO_URI=... JWT_SECRET=... (etc)
git push heroku main
```

---

## Frontend Integration Notes

- Google OAuth flow: redirect to `/api/auth/google`, backend redirects back to `CLIENT_URL/auth/callback?token=JWT`
- Store JWT in localStorage/httpOnly cookie on frontend
- Send `Authorization: Bearer <token>` header on protected requests
- PDF download: GET request with token, browser receives binary PDF
