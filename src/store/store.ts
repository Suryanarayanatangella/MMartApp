import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import cartReducer from '../store/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

// RootState — the full shape of your Redux state
// ReturnType<typeof store.getState> automatically infers this from your reducers
// You never need to write it manually — it updates as you add reducers
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch — the type of store.dispatch, including thunk support
// Using this type instead of plain Dispatch ensures async thunks are correctly typed
export type AppDispatch = typeof store.dispatch;

export default store;
