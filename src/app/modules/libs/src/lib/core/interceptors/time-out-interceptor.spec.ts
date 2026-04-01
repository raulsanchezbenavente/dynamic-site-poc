import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { TimeOutInterceptor } from './time-out-interceptor';
import { IdleTimeoutService } from '../services';
import { of } from 'rxjs';

describe('TimeOutInterceptor', () => {
  let interceptor: TimeOutInterceptor;
  let idleTimeoutServiceSpy: jasmine.SpyObj<IdleTimeoutService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('IdleTimeoutService', ['resetTimer']);

    TestBed.configureTestingModule({
      providers: [
        TimeOutInterceptor,
        { provide: IdleTimeoutService, useValue: spy }
      ]
    });
    interceptor = TestBed.inject(TimeOutInterceptor);
    idleTimeoutServiceSpy = TestBed.inject(IdleTimeoutService) as jasmine.SpyObj<IdleTimeoutService>;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should reset timer on intercept', () => {
    const request = new HttpRequest('GET', '/test');
    const next: HttpHandler = {
      handle: jasmine.createSpy('handle').and.returnValue(of(new HttpResponse()))
    };

    interceptor.intercept(request, next).subscribe();

    expect(idleTimeoutServiceSpy.resetTimer).toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledWith(request);
  });
});
