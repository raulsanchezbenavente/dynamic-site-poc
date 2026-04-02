import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardingPassProxyService {
  private readonly httpClient = inject(HttpClient);

  public getBlobPartFile(url: string, httpOptions: object): Observable<Blob> {
    return this.httpClient.get(url, httpOptions) as Observable<Blob>;
  }
}
