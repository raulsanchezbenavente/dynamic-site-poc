import { HttpCacheInterceptor } from './http-cache.interceptor';
import { HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let cacheService: any;
  let next: HttpHandler;

  beforeEach(() => {
    cacheService = {
      getCachedResponse: jasmine.createSpy('getCachedResponse'),
      getInflightRequest: jasmine.createSpy('getInflightRequest'),
      setCachedResponse: jasmine.createSpy('setCachedResponse'),
      setInflightRequest: jasmine.createSpy('setInflightRequest'),
      removeInflightRequest: jasmine.createSpy('removeInflightRequest'),
    };
    next = { handle: jasmine.createSpy('handle') };
    interceptor = new HttpCacheInterceptor(cacheService);
  });

  it('should return cached response if available', (done) => {
    const req = new HttpRequest('GET', '/api');
    const cached = new HttpResponse({ body: 'cached' });
    cacheService.getCachedResponse.and.returnValue(cached);
    const obs = interceptor.intercept(req, next);
    obs.subscribe((res) => {
      expect(res).toBe(cached);
      expect(next.handle).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return inflight request if available', (done) => {
    const req = new HttpRequest('GET', '/api');
    const inflight$ = of(new HttpResponse({ body: 'inflight' }));
    cacheService.getCachedResponse.and.returnValue(undefined);
    cacheService.getInflightRequest.and.returnValue(inflight$);
    next.handle = jasmine.createSpy('handle');
    const obs = interceptor.intercept(req, next);
    obs.subscribe((res) => {
      const response = res as HttpResponse<any>;
      expect(response.body).toBe('inflight');
      expect(next.handle).not.toHaveBeenCalled();
      done();
    });
  });

  it('should handle new request, cache response, and remove inflight', (done) => {
    const req = new HttpRequest('GET', '/api');
    cacheService.getCachedResponse.and.returnValue(undefined);
    cacheService.getInflightRequest.and.returnValue(undefined);
    const response = new HttpResponse({ body: 'fresh' });
    const subject = new Subject<HttpResponse<any>>();
    next.handle = jasmine.createSpy('handle').and.returnValue(subject.asObservable());
    const obs = interceptor.intercept(req, next);
    obs.subscribe((res) => {
      expect(res).toBe(response);
      expect(cacheService.setCachedResponse).toHaveBeenCalledWith(req, response);
      expect(cacheService.setInflightRequest).toHaveBeenCalled();
      done();
    });
    subject.next(response);
    subject.complete();
  });
});
