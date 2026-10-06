import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ApiErrorBody } from '../types/models';

const TOKEN_KEY = 'tumapesa_auth_token';

// The backend listens on http://localhost:3000/v1 by default (see its
// README). On a physical device 'localhost' resolves to the device itself,
// not your computer, so it must be replaced with your machine's LAN IP
// (e.g. 192.168.1.x) — same note the backend's own README makes. Android
// emulators use the special alias 10.0.2.2 to reach the host machine.
const LOCAL_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' });
export const BASE_URL = `http://${LOCAL_HOST}:3000/v1`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A callback the store wires up so the interceptor can dispatch a logout
// without this file needing to import the Redux store directly (which
// would create a circular import between api/client.ts and store/index.ts).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearAuthToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const getAuthToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

/**
 * Extracts a readable message from a failed API call, whether it's our
 * backend's { success: false, message, code } shape, a network error, or
 * something unexpected.
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Could not reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
};
