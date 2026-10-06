import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';
import { setAuthToken, clearAuthToken, getAuthToken, getApiErrorMessage } from '../../api/client';
import { AuthUser } from '../../types/models';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  bootstrapped: boolean;
  error: string | null;
  // True immediately after a successful registration, so RootNavigator can
  // show the KYC prompt once before switching over to the Main tabs (which
  // otherwise happens automatically the instant `token` is set).
  kycPromptPending: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  bootstrapped: false,
  error: null,
  kycPromptPending: false,
};

// On app launch: check for a previously-stored token. This doesn't
// re-validate it against the backend (there's no GET /v1/auth/me), so a
// stale/expired token will surface as a 401 on the first authenticated
// request instead, which the client's response interceptor handles.
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await getAuthToken();
  return token;
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: authApi.LoginPayload, { rejectWithValue }) => {
    try {
      const result = await authApi.login(payload);
      await setAuthToken(result.token);
      return result;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: authApi.RegisterPayload, { rejectWithValue }) => {
    try {
      const result = await authApi.register(payload);
      await setAuthToken(result.token);
      return result;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    await clearAuthToken();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dispatched by the api client's 401 interceptor via store/index.ts,
    // to clear local auth state without waiting on a round-trip logout call.
    forceLogout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
    },
    updateAuthUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    dismissKycPrompt(state) {
      state.kycPromptPending = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload;
        state.bootstrapped = true;
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.kycPromptPending = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Registration failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      });
  },
});

export const { forceLogout, updateAuthUser, dismissKycPrompt } = authSlice.actions;
export default authSlice.reducer;
