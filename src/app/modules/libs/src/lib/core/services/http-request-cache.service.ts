/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { canonicalStringify } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

/**
 * Http Request Cache Service - This service allows to store and handle inflight http requests
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class HttpRequestCacheService {
  private readonly inflightRequests: Map<string, Observable<HttpResponse<any>>> = new Map();
  private readonly responseCache: Map<string, { expires: number; response: HttpResponse<any> }> = new Map();
  private readonly ttlMs = 100;

  /**
   * Get inflight request observable if exists
   */
  public getInflightRequest(req: HttpRequest<any>): Observable<HttpResponse<any>> | undefined {
    return this.inflightRequests.get(this.generateCacheKey(req));
  }

  /**
   * Set inflight request observable
   */
  public setInflightRequest(req: HttpRequest<any>, observable: Observable<HttpResponse<any>>): void {
    this.inflightRequests.set(this.generateCacheKey(req), observable);
  }

  /**
   * Remove inflight request when completed
   */
  public removeInflightRequest(req: HttpRequest<any>): void {
    this.inflightRequests.delete(this.generateCacheKey(req));
  }

  /**
   * Get cached response if exists
   * @param req HttpRequest
   * @returns HttpResponse or undefined
   */
  public getCachedResponse(req: HttpRequest<any>): HttpResponse<any> | undefined {
    const cached = this.responseCache.get(this.generateCacheKey(req));
    if (cached && cached.expires > Date.now()) {
      return cached.response;
    } else if (cached) {
      this.responseCache.delete(this.generateCacheKey(req));
    }
    return undefined;
  }

  /**
   * Set cached response
   * @param req HttpRequest
   * @param response HttpResponse
   */
  public setCachedResponse(req: HttpRequest<any>, response: HttpResponse<any>): void {
    this.responseCache.set(this.generateCacheKey(req), {
      expires: Date.now() + this.ttlMs,
      response,
    });
  }

  private generateCacheKey(req: HttpRequest<any>): string {
    const method = req.method;
    const url = req.urlWithParams;
    const body = req.body ? canonicalStringify(req.body) : '';
    const responseType = req.responseType;
    return `${method}|${url}|${body}|${responseType}`;
  }
}
