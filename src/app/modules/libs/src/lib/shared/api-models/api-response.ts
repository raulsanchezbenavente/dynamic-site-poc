import { BaseResponse } from '..';

export interface ApiResponse<T = undefined> extends BaseResponse<T> {}

export interface ApiErrorResponse {
  error: ApiError;
  success: boolean;
}
export interface ApiError {
  code: string;
  description: string;
  trace: string;
}
