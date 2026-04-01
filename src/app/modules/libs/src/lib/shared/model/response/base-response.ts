import { ErrorResponse } from '../../model';

import { ResponseObject } from './response-object';

export interface BaseResponse<T> {
  success: boolean;
  errors?: ErrorResponse;
  result?: ResponseObject<T>;
}
