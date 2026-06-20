# Voucher System - Frontend

React + PrimeReact frontend for the Voucher Redemption System.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_REDIRECT=http://localhost:5000/api/auth/google
```

```bash
npm start
```

## Structure

```
src/
├── pages/
│   ├── auth/        # LandingPage, LoginPage, RegisterPage, AuthCallback
│   ├── user/        # Dashboard, VoucherList, VoucherDetail, MyRedemptions, PointsHistory, ReferralPage, PDFVoucherPage
│   └── admin/       # AdminDashboard, ManageVouchers, AddEditVoucher, ManageUsers, RedemptionAnalytics
├── components/
│   ├── common/      # Navbar, Loader, ProtectedRoute
│   ├── voucher/     # VoucherCard, VoucherBadge
│   └── layout/      # UserLayout, AdminLayout
├── services/
│   └── api.js       # ALL backend API calls - import from here
├── store/
│   └── slices/      # authSlice, voucherSlice (Redux)
├── hooks/
│   └── useAuth.js   # useAuth() hook
└── utils/
    └── helpers.js   # formatDate, formatDiscount, downloadPDF etc
```

## API Usage (for pages)

```jsx
import { voucherAPI, redemptionAPI } from '../services/api';

// Get all vouchers
const res = await voucherAPI.getAll({ category: 'food', page: 1 });

// Redeem a voucher
const res = await redemptionAPI.redeem(voucherId);

// Download PDF
const res = await redemptionAPI.downloadPDF(redemptionId);
downloadPDF(res.data, 'voucher.pdf');
```

## Auth Usage

```jsx
import useAuth from '../hooks/useAuth';
const { user, isAuthenticated, isAdmin, logout } = useAuth();
```

## Demo Accounts (after backend seed)
- Admin: admin@vouchersystem.com / Admin@123456
- User: user@demo.com / User@123456
