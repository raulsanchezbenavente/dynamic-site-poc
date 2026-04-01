import { ErrorHttpInterceptor } from './error-http-interceptor';
import { HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { EnumHttpErrorCode } from '../../../public-api';

describe('ErrorHttpInterceptor', () => {
  let interceptor: ErrorHttpInterceptor;
  let cookiesStore: any;
  let logger: any;
  let authenticationStorageService: any;
  let eventBusService: any;
  let configService: any;
  let next: HttpHandler;

  beforeEach(() => {
    cookiesStore = { cleanCookies: jasmine.createSpy('cleanCookies') };
    logger = { info: jasmine.createSpy('info') };
    authenticationStorageService = {};
    eventBusService = { notifyEvent: jasmine.createSpy('notifyEvent') };
    configService = {
      getEndpointsConfig: jasmine.createSpy('getEndpointsConfig').and.returnValue({
        apiURLAuthorization: '/authz',
        apiURLAuthentication: '/auth',
      })
    };
    next = { handle: jasmine.createSpy('handle').and.callFake(() => of('ok')) };
    interceptor = new ErrorHttpInterceptor(
      cookiesStore,
      logger,
      authenticationStorageService,
      eventBusService,
      configService
    );
  });

  it('should pass through non-error responses', (done) => {
    const req = new HttpRequest('GET', '/api');
    interceptor.intercept(req, next).subscribe((res: unknown) => {
      expect(res).toBe('ok');
      done();
    });
  });

  it('should handle forbidden error (403)', (done) => {
    const req = new HttpRequest('GET', '/api');
    const error = new HttpErrorResponse({ status: EnumHttpErrorCode.FORBIDDEN });
    next.handle = jasmine.createSpy('handle').and.returnValue(throwError(() => error));
    interceptor.intercept(req, next).subscribe({
      next: () => {},
      error: () => {
        expect(cookiesStore.cleanCookies).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith('ErrorHttpInterceptor', jasmine.any(String));
        done();
      }
    });
  });

  it('should handle unauthorized error (401) and redirect if not auth endpoints', (done) => {
    const req = new HttpRequest('GET', '/api');
    const error = new HttpErrorResponse({ status: EnumHttpErrorCode.UNAUTHORIZED, url: '/api' });
    next.handle = jasmine.createSpy('handle').and.returnValue(throwError(() => error));
    interceptor.intercept(req, next).subscribe({
      next: () => {},
      error: () => {
        expect(eventBusService.notifyEvent).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should not redirect for auth endpoints on unauthorized error', (done) => {
    const req = new HttpRequest('GET', '/auth');
    const error = new HttpErrorResponse({ status: EnumHttpErrorCode.UNAUTHORIZED, url: '/auth' });
    next.handle = jasmine.createSpy('handle').and.returnValue(throwError(() => error));
    interceptor.intercept(req, next).subscribe({
      next: () => {},
      error: () => {
        expect(eventBusService.notifyEvent).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should not redirect if config is missing', (done) => {
    configService.getEndpointsConfig.and.returnValue(undefined);
    const req = new HttpRequest('GET', '/api');
    const error = new HttpErrorResponse({ status: EnumHttpErrorCode.UNAUTHORIZED, url: '/api' });
    next.handle = jasmine.createSpy('handle').and.returnValue(throwError(() => error));
    interceptor.intercept(req, next).subscribe({
      next: () => {},
      error: () => {
        expect(eventBusService.notifyEvent).not.toHaveBeenCalled();
        done();
      }
    });
  });
});
