import { configureStore } from '@reduxjs/toolkit';
import authReducer, { forceLogout } from './slices/authSlice';
import transferReducer from './slices/transferSlice';
import recipientReducer from './slices/recipientSlice';
import ratesReducer from './slices/ratesSlice';
import { setUnauthorizedHandler } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transfers: transferReducer,
    recipients: recipientReducer,
    rates: ratesReducer,
  },
});

// Wired here (rather than inside api/client.ts) to avoid a circular import
// between the client and the store.
setUnauthorizedHandler(() => {
  store.dispatch(forceLogout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
