import { apiClient } from './client';
import { ApiSuccessBody, Corridor, RateQuote } from '../types/models';

// GET /v1/rates?from=GBP&to=KES
export const getRate = async (from: string, to: string): Promise<RateQuote> => {
  const res = await apiClient.get<ApiSuccessBody<RateQuote>>('/rates', { params: { from, to } });
  return res.data.data;
};

// GET /v1/rates/corridors
export const listCorridors = async (): Promise<Corridor[]> => {
  const res = await apiClient.get<ApiSuccessBody<{ items: Corridor[] }>>('/rates/corridors');
  return res.data.data.items;
};
