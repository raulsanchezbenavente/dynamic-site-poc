import { HttpResponse } from '@angular/common/http';

export interface HttpCacheRecord {
  response: HttpResponse<any>;
  ttl: number;
  cleanOnSubmit: boolean;
}
