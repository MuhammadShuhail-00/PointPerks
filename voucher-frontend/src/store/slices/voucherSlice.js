import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { voucherAPI } from '../../services/api';

export const fetchVouchers = createAsyncThunk('vouchers/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await voucherAPI.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch vouchers');
  }
});

export const fetchVoucher = createAsyncThunk('vouchers/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await voucherAPI.getOne(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch voucher');
  }
});

export const fetchCategories = createAsyncThunk('vouchers/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await voucherAPI.getCategories();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

const voucherSlice = createSlice({
  name: 'vouchers',
  initialState: {
    list: [],
    selected: null,
    categories: [],
    pagination: null,
    loading: false,
    error: null,
    filters: {
      category: '',
      search: '',
      page: 1,
      limit: 12,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected: (state) => { state.selected = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVouchers.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchVouchers.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchVouchers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchVoucher.pending, (state) => { state.loading = true; });
    builder.addCase(fetchVoucher.fulfilled, (state, action) => {
      state.loading = false;
      state.selected = action.payload.voucher;
    });
    builder.addCase(fetchVoucher.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload.summary;
    });
  },
});

export const { setFilters, clearSelected, clearError } = voucherSlice.actions;
export default voucherSlice.reducer;
