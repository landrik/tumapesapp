import { apiClient } from './client';
import {
  ApiSuccessBody,
  CreateTransferPayload,
  Transfer,
  TransferListResponse,
} from '../types/models';

// POST /v1/transfers
export const createTransfer = async (payload: CreateTransferPayload): Promise<Transfer> => {
  const res = await apiClient.post<ApiSuccessBody<Transfer>>('/transfers', payload);
  return res.data.data;
};

// POST /v1/transfers/:id/confirm
export const confirmTransfer = async (id: string): Promise<Transfer> => {
  const res = await apiClient.post<ApiSuccessBody<Transfer>>(`/transfers/${id}/confirm`);
  return res.data.data;
};

// GET /v1/transfers/:id
export const getTransfer = async (id: string): Promise<Transfer> => {
  const res = await apiClient.get<ApiSuccessBody<Transfer>>(`/transfers/${id}`);
  return res.data.data;
};

// GET /v1/transfers?page=1&limit=20
export const listTransfers = async (page = 1, limit = 20): Promise<TransferListResponse> => {
  const res = await apiClient.get<ApiSuccessBody<TransferListResponse>>('/transfers', {
    params: { page, limit },
  });
  return res.data.data;
};

// DELETE /v1/transfers/:id (cancel if pending)
export const cancelTransfer = async (id: string): Promise<{ message: string; transfer: Transfer }> => {
  const res = await apiClient.delete<ApiSuccessBody<{ message: string; transfer: Transfer }>>(
    `/transfers/${id}`
  );
  return res.data.data;
};
