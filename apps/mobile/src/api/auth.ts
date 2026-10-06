import { apiClient } from './client';
import { ApiSuccessBody, AuthResponse, UserDeliveryMethod } from '../types/models';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  country: string;
  currency: string;
  phone: string;
  deliveryMethod: UserDeliveryMethod;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// POST /v1/auth/login
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await apiClient.post<ApiSuccessBody<AuthResponse>>('/auth/login', payload);
  return res.data.data;
};

// POST /v1/auth/register
export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await apiClient.post<ApiSuccessBody<AuthResponse>>('/auth/register', payload);
  return res.data.data;
};

// POST /v1/auth/logout
export const logout = async (): Promise<{ message: string }> => {
  const res = await apiClient.post<ApiSuccessBody<{ message: string }>>('/auth/logout');
  return res.data.data;
};

// POST /v1/auth/refresh
export const refreshToken = async (token: string): Promise<{ token: string }> => {
  const res = await apiClient.post<ApiSuccessBody<{ token: string }>>('/auth/refresh', { token });
  return res.data.data;
};

// POST /v1/auth/reset-password
export const resetPassword = async (email: string): Promise<{ message: string }> => {
  const res = await apiClient.post<ApiSuccessBody<{ message: string }>>('/auth/reset-password', { email });
  return res.data.data;
};
