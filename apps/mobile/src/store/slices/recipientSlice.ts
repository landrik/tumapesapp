import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as recipientsApi from '../../api/recipients';
import { getApiErrorMessage } from '../../api/client';
import { CreateRecipientPayload, Recipient, UpdateRecipientPayload } from '../../types/models';

interface RecipientState {
  items: Recipient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RecipientState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchRecipients = createAsyncThunk(
  'recipients/fetch',
  async (_: void, { rejectWithValue }) => {
    try {
      return await recipientsApi.listRecipients();
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const addRecipient = createAsyncThunk(
  'recipients/add',
  async (payload: CreateRecipientPayload, { rejectWithValue }) => {
    try {
      return await recipientsApi.createRecipient(payload);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const editRecipient = createAsyncThunk(
  'recipients/edit',
  async ({ id, payload }: { id: string; payload: UpdateRecipientPayload }, { rejectWithValue }) => {
    try {
      return await recipientsApi.updateRecipient(id, payload);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const removeRecipient = createAsyncThunk(
  'recipients/remove',
  async (id: string, { rejectWithValue }) => {
    try {
      await recipientsApi.deleteRecipient(id);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const recipientSlice = createSlice({
  name: 'recipients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecipients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRecipients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addRecipient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editRecipient.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeRecipient.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r._id !== action.payload);
      });
  },
});

export default recipientSlice.reducer;
