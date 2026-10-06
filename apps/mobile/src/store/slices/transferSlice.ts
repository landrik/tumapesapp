import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as transferApi from '../../api/transfer';
import { getApiErrorMessage } from '../../api/client';
import { CreateTransferPayload, Transfer } from '../../types/models';

// Local, in-progress state for the multi-screen send-money flow, before a
// transfer actually exists on the backend. Cleared once the transfer is
// created (draft.transfer takes over from here).
export interface TransferDraft {
  recipientId: string | null;
  sendAmount: number | null;
  sendCurrency: string | null;
  receiveCurrency: string | null;
  deliveryMethod: string | null;
}

const emptyDraft: TransferDraft = {
  recipientId: null,
  sendAmount: null,
  sendCurrency: null,
  receiveCurrency: null,
  deliveryMethod: null,
};

interface TransferState {
  draft: TransferDraft;
  current: Transfer | null; // the transfer being created/confirmed in the active flow
  list: Transfer[];
  listTotal: number;
  listPage: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransferState = {
  draft: emptyDraft,
  current: null,
  list: [],
  listTotal: 0,
  listPage: 1,
  status: 'idle',
  error: null,
};

export const submitTransfer = createAsyncThunk(
  'transfers/create',
  async (payload: CreateTransferPayload, { rejectWithValue }) => {
    try {
      return await transferApi.createTransfer(payload);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const confirmTransferThunk = createAsyncThunk(
  'transfers/confirm',
  async (id: string, { rejectWithValue }) => {
    try {
      return await transferApi.confirmTransfer(id);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const fetchTransfer = createAsyncThunk(
  'transfers/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await transferApi.getTransfer(id);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const fetchTransfers = createAsyncThunk(
  'transfers/fetchList',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      return await transferApi.listTransfers(page, limit);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const cancelTransferThunk = createAsyncThunk(
  'transfers/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await transferApi.cancelTransfer(id);
      return result.transfer;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const transferSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    updateDraft(state, action: PayloadAction<Partial<TransferDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetDraft(state) {
      state.draft = emptyDraft;
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTransfer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitTransfer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(submitTransfer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(confirmTransferThunk.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchTransfer.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchTransfers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.items;
        state.listTotal = action.payload.total;
        state.listPage = action.payload.page;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(cancelTransferThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      });
  },
});

export const { updateDraft, resetDraft } = transferSlice.actions;
export default transferSlice.reducer;
