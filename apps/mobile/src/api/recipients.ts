import { apiClient } from './client';
import {
  ApiSuccessBody,
  CreateRecipientPayload,
  Recipient,
  UpdateRecipientPayload,
} from '../types/models';

// GET /v1/recipients
export const listRecipients = async (): Promise<Recipient[]> => {
  const res = await apiClient.get<ApiSuccessBody<{ items: Recipient[] }>>('/recipients');
  return res.data.data.items;
};

// POST /v1/recipients
export const createRecipient = async (payload: CreateRecipientPayload): Promise<Recipient> => {
  const res = await apiClient.post<ApiSuccessBody<Recipient>>('/recipients', payload);
  return res.data.data;
};

// PATCH /v1/recipients/:id
export const updateRecipient = async (
  id: string,
  payload: UpdateRecipientPayload
): Promise<Recipient> => {
  const res = await apiClient.patch<ApiSuccessBody<Recipient>>(`/recipients/${id}`, payload);
  return res.data.data;
};

// DELETE /v1/recipients/:id
export const deleteRecipient = async (id: string): Promise<{ message: string }> => {
  const res = await apiClient.delete<ApiSuccessBody<{ message: string }>>(`/recipients/${id}`);
  return res.data.data;
};
