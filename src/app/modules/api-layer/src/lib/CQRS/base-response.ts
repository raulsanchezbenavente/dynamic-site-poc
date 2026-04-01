export interface BaseResponse<T> {
  result: { data: T };
  success: boolean;
  error?: BaseErrorResponse;
}

export interface BaseErrorResponse {
  code: string;
  error?: {
    code: string;
    description: string;
    trace: string;
  };
}
