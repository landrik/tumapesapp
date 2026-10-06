import { apiClient } from './client';
import { ApiSuccessBody, NotificationPrefs, UserProfile } from '../types/models';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  currency?: string;
}

// GET /v1/users/me
export const getMe = async (): Promise<UserProfile> => {
  const res = await apiClient.get<ApiSuccessBody<UserProfile>>('/users/me');
  return res.data.data;
};

// PATCH /v1/users/me
export const updateMe = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  const res = await apiClient.patch<ApiSuccessBody<UserProfile>>('/users/me', payload);
  return res.data.data;
};

// POST /v1/users/push-token
export const savePushToken = async (token: string): Promise<{ message: string }> => {
  const res = await apiClient.post<ApiSuccessBody<{ message: string }>>('/users/push-token', { token });
  return res.data.data;
};

// GET /v1/users/notification-prefs
export const getNotificationPrefs = async (): Promise<NotificationPrefs> => {
  const res = await apiClient.get<ApiSuccessBody<NotificationPrefs>>('/users/notification-prefs');
  return res.data.data;
};

// PATCH /v1/users/notification-prefs
export const updateNotificationPrefs = async (
  payload: Partial<NotificationPrefs>
): Promise<NotificationPrefs> => {
  const res = await apiClient.patch<ApiSuccessBody<NotificationPrefs>>('/users/notification-prefs', payload);
  return res.data.data;
};
