import { Toast } from '@dcx/ui/design-system';
import { HttpMethods } from '../../enums/http-methods.enum';

export interface HttpInterceptorToastModel {
  path: string;
  method: HttpMethods;
  container?: string | ((data: any) => string);
  config: Toast;
  configError?: Toast;
}
