import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRate, isQuoteStale } from '../store/slices/ratesSlice';

const POLL_INTERVAL_MS = 30 * 1000;

export const useExchangeRate = (from: string | null, to: string | null) => {
  const dispatch = useAppDispatch();
  const { quote, quoteFetchedAt, status, error } = useAppSelector(state => state.rates);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!from || !to) return;

    dispatch(fetchRate({ from, to }));

    intervalRef.current = setInterval(() => {
      dispatch(fetchRate({ from, to }));
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [dispatch, from, to]);

  return {
    quote,
    isStale: isQuoteStale(quoteFetchedAt),
    isLoading: status === 'loading',
    error,
  };
};
