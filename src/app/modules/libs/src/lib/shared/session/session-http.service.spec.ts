import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SessionHttpService } from './session-http.service';
import { IdleTimeoutService, ConfigService } from '../../core';

const mockConfigService = {
  getEndpointsConfig: jasmine.createSpy('getEndpointsConfig').and.returnValue({
    apiURLAccounts: 'https://accounts.api',
    apiURLBooking: 'https://booking.api'
  })
};

const mockIdleTimeoutService = {
  resetTimer: jasmine.createSpy('resetTimer')
};

describe('SessionHttpService', () => {
  let service: SessionHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: mockConfigService },
        { provide: IdleTimeoutService, useValue: mockIdleTimeoutService }
      ]
    });
    service = TestBed.inject(SessionHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('AccountSession', () => {
    it('should make a GET request to accounts session endpoint', () => {
      const mockResponse = { booking: {}, culture: 'en-US' } as any;

      service.AccountSession().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://accounts.api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should propagate error response', () => {
      const mockError = { status: 404, statusText: 'Not Found' };
      service.AccountSession().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });
      const req = httpMock.expectOne('https://accounts.api/session');
      req.flush('Invalid request', mockError);
    });
  });

  describe('GetSession', () => {
    it('should make a GET request to booking session endpoint', () => {
      const mockResponse = { booking: {}, culture: 'en-US' } as any;

      service.GetSession().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://booking.api/booking/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('ReloadSession', () => {
    it('should make a PUT request to booking session endpoint', () => {
      const mockResponse = { success: true } as any;

      service.ReloadSession().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://booking.api/booking/session');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('CleanSession', () => {
    it('should make a DELETE request to booking session endpoint with options', () => {
      const mockResponse = { success: true } as any;

      service.CleanSession().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://booking.api/booking/session');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockResponse);
    });
  });
});
