/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';

import { HttpRequestCacheService } from '../services/http-request-cache.service';

/**
 * Http Cache Interceptor - This service handles the caching strategy for http requests.
 * By default all request that used "GET" method are processed by this interceptor.
 * Cache strategies like exclude urls, custom TTLs or any other refresh/clear approach should be defined in the Http Request CacheService
 * IBE+
 */
@Injectable({ providedIn: 'root' })
export class HttpCacheInterceptor implements HttpInterceptor {
  constructor(private readonly _httpRequestCacheService: HttpRequestCacheService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Check cached response
    const cachedResponse = this._httpRequestCacheService.getCachedResponse(req);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // 2. Check inflight
    const inflightRequest = this._httpRequestCacheService.getInflightRequest(req);
    if (inflightRequest) {
      return inflightRequest as Observable<HttpEvent<any>>;
    }

    // 3. Create the request, store inflight, and cache the response in the tap
    const request$ = next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this._httpRequestCacheService.setCachedResponse(req, event);
        }
      }),
      finalize(() => {
        this._httpRequestCacheService.removeInflightRequest(req);
      }),
      shareReplay(1)
    );

    this._httpRequestCacheService.setInflightRequest(req, request$ as Observable<HttpResponse<any>>);

    return request$;
  }
}
