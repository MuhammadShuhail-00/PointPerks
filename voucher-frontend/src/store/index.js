import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import voucherReducer from './slices/voucherSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    vouchers: voucherReducer,
  },
});

export default store;
