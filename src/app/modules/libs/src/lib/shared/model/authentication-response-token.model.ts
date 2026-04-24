import { ApiResponse } from '../api-models/api-response';

export interface AuthenticationResponseToken extends ApiResponse {
  data: string;
}
