import { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
}

/**
 * Send a standardized success response.
 */
export const success = <T>(res: Response, data: T, statusCode = 200): Response => {
  const body: SuccessResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error response.
 */
export const error = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'ERROR'
): Response => {
  const body: ErrorResponse = {
    success: false,
    message,
    code,
  };
  return res.status(statusCode).json(body);
};
