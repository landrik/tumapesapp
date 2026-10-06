import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as ratesApi from '../../api/rates';
import { getApiErrorMessage } from '../../api/client';
import { Corridor, RateQuote } from '../../types/models';

const CACHE_TTL_MS = 30 * 1000;

interface RatesState {
  quote: RateQuote | null;
  quoteFetchedAt: number | null;
  corridors: Corridor[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RatesState = {
  quote: null,
  quoteFetchedAt: null,
  corridors: [],
  status: 'idle',
  error: null,
};

export const fetchRate = createAsyncThunk(
  'rates/fetchQuote',
  async ({ from, to }: { from: string; to: string }, { getState, rejectWithValue }) => {
    const state = getState() as { rates: RatesState };
    const { quote, quoteFetchedAt } = state.rates;

    const isFresh =
      quote &&
      quoteFetchedAt &&
      Date.now() - quoteFetchedAt < CACHE_TTL_MS &&
      quote.from === from.toUpperCase() &&
      quote.to === to.toUpperCase();

    if (isFresh) return quote;

    try {
      return await ratesApi.getRate(from, to);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const fetchCorridors = createAsyncThunk(
  'rates/fetchCorridors',
  async (_: void, { rejectWithValue }) => {
    try {
      return await ratesApi.listCorridors();
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRate.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quote = action.payload;
        state.quoteFetchedAt = Date.now();
      })
      .addCase(fetchRate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchCorridors.fulfilled, (state, action) => {
        state.corridors = action.payload;
      });
  },
});

export default ratesSlice.reducer;

// Selector helper: is the currently cached quote stale?
export const isQuoteStale = (fetchedAt: number | null): boolean => {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt >= CACHE_TTL_MS;
};
