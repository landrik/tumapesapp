import { apiClient, BASE_URL } from './client';
import { ApiSuccessBody, KycDocumentType, KycStatusResponse, KycSubmitResponse } from '../types/models';

export interface KycImageAsset {
  uri: string;
  name: string;
  type: string; // MIME type, e.g. 'image/jpeg'
}

export interface SubmitKycPayload {
  documentType: KycDocumentType;
  frontImage: KycImageAsset;
  backImage?: KycImageAsset;
  selfie?: KycImageAsset;
}

// POST /v1/kyc/submit (multipart/form-data)
export const submitKyc = async (payload: SubmitKycPayload): Promise<KycSubmitResponse> => {
  const formData = new FormData();
  formData.append('documentType', payload.documentType);

  // React Native's fetch/FormData accepts { uri, name, type } objects for
  // file fields — this is the standard shape from expo-image-picker and
  // expo-camera results, not a browser File/Blob.
  formData.append('frontImage', {
    uri: payload.frontImage.uri,
    name: payload.frontImage.name,
    type: payload.frontImage.type,
  } as unknown as Blob);

  if (payload.backImage) {
    formData.append('backImage', {
      uri: payload.backImage.uri,
      name: payload.backImage.name,
      type: payload.backImage.type,
    } as unknown as Blob);
  }

  if (payload.selfie) {
    formData.append('selfie', {
      uri: payload.selfie.uri,
      name: payload.selfie.name,
      type: payload.selfie.type,
    } as unknown as Blob);
  }

  const res = await apiClient.post<ApiSuccessBody<KycSubmitResponse>>('/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// GET /v1/kyc/status
export const getKycStatus = async (): Promise<KycStatusResponse> => {
  const res = await apiClient.get<ApiSuccessBody<KycStatusResponse>>('/kyc/status');
  return res.data.data;
};

/**
 * Builds the URL for a previously-uploaded KYC document. Note this is a
 * plain URL, not an API call — the backend streams the file directly
 * (GET /v1/kyc/document/:fileId), and the Authorization header still needs
 * attaching by whatever consumes this (e.g. Image's headers prop, or a
 * manual fetch + blob URI) since <Image source={{uri}}> alone won't attach it.
 */
export const getKycDocumentUrl = (fileId: string): string => {
  return `${BASE_URL}/kyc/document/${fileId}`;
};
