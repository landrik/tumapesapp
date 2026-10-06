import { apiClient } from './client';
import { ApiSuccessBody, Country } from '../types/models';

// GET /v1/countries
export const listCountries = async (): Promise<Country[]> => {
  const res = await apiClient.get<ApiSuccessBody<{ items: Country[] }>>('/countries');
  return res.data.data.items;
};
