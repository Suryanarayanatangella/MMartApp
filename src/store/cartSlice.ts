import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartState, CartItem, CartResponse } from '../types/index';
import type { RootState } from './store';
import api from '../api/api';

// ── Async Thunks ──────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk<CartResponse, void, { rejectValue: string }>(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get<CartResponse>('/api/cart') as CartResponse;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk<
  { cartItem: CartItem },
  string,
  { rejectValue: string }
>(
  'cart/add',
  async (productId, { rejectWithValue }) => {
    try {
      return await api.post('/api/cart/add', { productId, quantity: 1 }) as { cartItem: CartItem };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk<
  { cartItem: CartItem },
  { itemId: string; quantity: number },
  { rejectValue: string }
>(
  'cart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await api.put(`/api/cart/${itemId}`, { quantity }) as { cartItem: CartItem };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk<string, string, { rejectValue: string }>(
  'cart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cart/${itemId}`);
      return itemId;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to remove item');
    }
  }
);

export const clearCartApi = createAsyncThunk<void, void, { rejectValue: string }>(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/cart');
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to clear cart');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartResponse>) => {
        state.loading = false;
        state.items = action.payload.cartItems;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch cart';
      })
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<{ cartItem: CartItem }>) => {
        const newItem = action.payload.cartItem;
        const existingIndex = state.items.findIndex((i) => i.id === newItem.id);
        if (existingIndex >= 0) {
          state.items[existingIndex] = newItem;
        } else {
          state.items.push(newItem);
          state.itemCount += 1;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to add to cart';
      })
      // updateCartItem
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<{ cartItem: CartItem }>) => {
        const updated = action.payload.cartItem;
        const idx = state.items.findIndex((i) => i.id === updated.id);
        if (idx >= 0) state.items[idx] = updated;
      })
      // removeFromCart
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
        state.itemCount = state.items.length;
      })
      // clearCartApi
      .addCase(clearCartApi.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.itemCount = 0;
      });
  },
});

export const { clearCart } = cartSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────

export const selectCartItems   = (state: RootState): CartItem[] => state.cart.items;
export const selectCartCount   = (state: RootState): number     => state.cart.itemCount;
export const selectCartTotal   = (state: RootState): number     => state.cart.total;
export const selectCartLoading = (state: RootState): boolean    => state.cart.loading;
export const selectCartError   = (state: RootState): string | null => state.cart.error;

export default cartSlice.reducer;
