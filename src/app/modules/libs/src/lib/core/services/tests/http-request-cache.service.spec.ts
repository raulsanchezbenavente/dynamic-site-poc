import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { HttpRequestCacheService } from '../http-request-cache.service';

describe('HttpRequestCacheService', () => {
  let service: HttpRequestCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpRequestCacheService],
    });
    service = TestBed.inject(HttpRequestCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get inflight request', () => {
    const req = new HttpRequest('GET', '/api/test');
    const obs = of(new HttpResponse({ status: 200 }));
    service.setInflightRequest(req, obs);
    expect(service.getInflightRequest(req)).toBe(obs);
  });

  it('should remove inflight request', () => {
    const req = new HttpRequest('GET', '/api/test');
    const obs = of(new HttpResponse({ status: 200 }));
    service.setInflightRequest(req, obs);
    service.removeInflightRequest(req);
    expect(service.getInflightRequest(req)).toBeUndefined();
  });

  it('should set and get cached response', () => {
    const req = new HttpRequest('GET', '/api/test');
    const response = new HttpResponse({ status: 200 });
    service.setCachedResponse(req, response);
    expect(service.getCachedResponse(req)).toBe(response);
  });

  it('should return undefined for expired cached response', () => {
    const req = new HttpRequest('GET', '/api/test');
    const response = new HttpResponse({ status: 200 });
    service.setCachedResponse(req, response);
    // Simulate expiration
    (service as any).responseCache.get((service as any).generateCacheKey(req)).expires = Date.now() - 1000;
    expect(service.getCachedResponse(req)).toBeUndefined();
  });

  it('should use different cache entries for same url with different responseType', () => {
    const reqJson = new HttpRequest('GET', '/api/test', null, { responseType: 'json' });
    const reqBlob = new HttpRequest('GET', '/api/test', null, { responseType: 'blob' });

    const jsonResponse = new HttpResponse({ status: 200, body: { ok: true } });
    const blobResponse = new HttpResponse({ status: 200, body: new Blob(['ok']) });

    service.setCachedResponse(reqJson, jsonResponse);
    service.setCachedResponse(reqBlob, blobResponse);

    expect(service.getCachedResponse(reqJson)).toBe(jsonResponse);
    expect(service.getCachedResponse(reqBlob)).toBe(blobResponse);
  });

  it('should keep inflight requests separated by responseType', () => {
    const reqJson = new HttpRequest('GET', '/api/test', null, { responseType: 'json' });
    const reqBlob = new HttpRequest('GET', '/api/test', null, { responseType: 'blob' });

    const jsonObs = of(new HttpResponse({ status: 200, body: { ok: true } }));
    const blobObs = of(new HttpResponse({ status: 200, body: new Blob(['ok']) }));

    service.setInflightRequest(reqJson, jsonObs);
    service.setInflightRequest(reqBlob, blobObs);

    expect(service.getInflightRequest(reqJson)).toBe(jsonObs);
    expect(service.getInflightRequest(reqBlob)).toBe(blobObs);
  });
});
