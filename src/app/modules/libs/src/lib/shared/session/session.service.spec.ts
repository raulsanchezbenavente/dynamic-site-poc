import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, tap, throwError } from 'rxjs';
import { SessionStore } from './session.service';
import { SessionHttpService } from './session-http.service';
import { StorageService } from '../services/storage.service';
import { EventBusService, LoggerService } from '../../core';
import { BUSINESS_CONFIG } from '../injection-tokens';
import { CLEAN_SESSION_DATA, CLEAN_BOOKING, CLEAN_PROFILE_STATUS, SessionData } from './session.data';

const mockBusinessConfig = { sessionKey: 'testKey', timeoutLocalStorage: 1000 };
const mockSessionResponse = { success: true, result: { result: true, data: CLEAN_BOOKING } };
const mockApiResponse = { success: true };

class MockStorageService {
  getSessionStorage = jasmine.createSpy('getSessionStorage').and.returnValue(undefined);
  setSessionStorage = jasmine.createSpy('setSessionStorage');
}
class MockSessionHttpService {
  GetSession = jasmine.createSpy('GetSession').and.returnValue(of(mockSessionResponse));
  ReloadSession = jasmine.createSpy('ReloadSession').and.returnValue(of(mockApiResponse));
}
class MockEventBusService {}
class MockLoggerService {
  error = jasmine.createSpy('error');
}

describe('SessionStore', () => {
  let service: SessionStore;
  let storageService: MockStorageService;
  let sessionHttpService: MockSessionHttpService;
  let loggerService: MockLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useClass: MockStorageService },
        { provide: SessionHttpService, useClass: MockSessionHttpService },
        { provide: EventBusService, useClass: MockEventBusService },
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        SessionStore,
      ],
    });
    service = TestBed.inject(SessionStore);
    storageService = TestBed.inject(StorageService) as any;
    sessionHttpService = TestBed.inject(SessionHttpService) as any;
    loggerService = TestBed.inject(LoggerService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set session data', () => {
    const data: SessionData = { ...CLEAN_SESSION_DATA };
    service.setSessionData(data);
    expect(service.getSession()).toEqual(data);
  });

  it('should get initial session data', () => {
    expect(service.INITIAL_SESSION_DATA).toEqual(CLEAN_SESSION_DATA);
  });

  it('should call initSession', async () => {
  const result = await service.initSession();
  expect(result).toEqual(mockSessionResponse);
  expect(sessionHttpService.GetSession).toHaveBeenCalled();
  });

  it('should get session', () => {
    expect(service.getSession()).toBeDefined();
  });

  it('should getApiSession and update session', (done) => {
    service.getApiSession().subscribe((session) => {
      expect(session.session.booking).toEqual(CLEAN_BOOKING);
      done();
    });
  });

  it('should resetApiSession and update session', (done) => {
    service.resetApiSession().subscribe((session) => {
      expect(session.session.booking).toEqual(CLEAN_BOOKING);
      done();
    });
  });

  it('should reloadBooking with booking', (done) => {
    service.reloadBooking(CLEAN_BOOKING).subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should reloadBooking without booking', (done) => {
    service.reloadBooking().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should resetBooking', () => {
    service.resetBooking();
    expect(service.getSession().session.booking).toEqual(CLEAN_BOOKING);
    expect(service.getSession().session.accountProfileStatus).toEqual(CLEAN_PROFILE_STATUS);
  });

  it('should cleanBooking and keep userAgent', () => {
  service.setSessionData({ ...CLEAN_SESSION_DATA, userAgentResponse: undefined } as any);
  service.cleanBooking(undefined, true);
  expect(service.getSession().userAgentResponse).toBeUndefined();
  });

  it('should cleanBooking and set flow', () => {
  const flowValue = {} as any;
  service.cleanBooking(flowValue);
  expect(service.getSession().session.flow).toBe(flowValue);
  });

  it('should saveSession', () => {
    const spy = spyOn(service, 'saveSession').and.callThrough();
    service.saveSession({ ...CLEAN_SESSION_DATA });
    expect(spy).toHaveBeenCalled();
    expect(storageService.setSessionStorage).toHaveBeenCalledWith(
      mockBusinessConfig.sessionKey,
      jasmine.any(Object),
      mockBusinessConfig.timeoutLocalStorage
    );
  });

  it('should showDeclined', () => {
    service.showDeclined(true);
    expect(service.getSession().session.showDeclined).toBeTrue();
  });

  it('should setOriginalBooking', () => {
    service.setOriginalBooking(CLEAN_BOOKING);
    expect(service.getSession().session.originalBooking).toEqual(CLEAN_BOOKING);
  });

  it('should getValidSessionData', () => {
    const valid = (service as any).getValidSessionData({ session: undefined });
    expect(valid).toEqual(CLEAN_SESSION_DATA);
    const valid2 = (service as any).getValidSessionData({ ...CLEAN_SESSION_DATA });
    expect(valid2).toEqual(CLEAN_SESSION_DATA);
  });

  it('should loadInitSession successfully', (done) => {
    service.loadInitSession().subscribe({
      next: (result) => {
        expect(result).toBeTrue();
        expect(sessionHttpService.GetSession).toHaveBeenCalled();
        done();
      },
      error: () => {
        fail('Should not have errored');
      }
    });
  });

  it('should handle loadInitSession error on initSession', (done) => {
    spyOn(service, 'initSession').and.returnValue(Promise.reject(new Error('Init error')));
    
    service.loadInitSession().subscribe({
      next: () => {
        fail('Should not have succeeded');
      },
      error: (error) => {
        expect(error.message).toBe('Init error');
        done();
      }
    });
  });

  it('should handle loadInitSession error on reloadBooking', (done) => {
    const errorMessage = 'Reload error';
    spyOn(service, 'reloadBooking').and.returnValue(
      new BehaviorSubject<boolean>(false).pipe(
        tap(() => { throw new Error(errorMessage); })
      )
    );
    
    service.loadInitSession().subscribe({
      next: () => {
        fail('Should not have succeeded');
      },
      error: (error) => {
        expect(error.message).toBe(errorMessage);
        done();
      }
    });
  });

  it('should handle getApiSession error', (done) => {
    sessionHttpService.GetSession.and.returnValue(throwError(() => new Error('API Error')));
    
    service.getApiSession().subscribe((session) => {
      expect(loggerService.error).toHaveBeenCalledWith('SessionService', 'No session', jasmine.any(Error));
      expect(session).toBeDefined();
      done();
    });
  });

  it('should handle resetApiSession when reset fails', (done) => {
    const failResponse = { success: false, errors: ['Reset failed'] };
    sessionHttpService.ReloadSession.and.returnValue(of(failResponse));
    
    service.resetApiSession().subscribe({
      next: () => {
        fail('Should not have succeeded');
      },
      error: (errors) => {
        expect(loggerService.error).toHaveBeenCalledWith('SessionService', 'No reset the session');
        expect(errors).toEqual(['Reset failed']);
        done();
      }
    });
  });

  it('should handle resetApiSession error on ReloadSession', (done) => {
    sessionHttpService.ReloadSession.and.returnValue(throwError(() => new Error('Reload Error')));
    
    service.resetApiSession().subscribe({
      next: () => {
        fail('Should not have succeeded');
      },
      error: (error) => {
        expect(loggerService.error).toHaveBeenCalledWith('SessionService', 'No session');
        expect(error.message).toBe('Reload Error');
        done();
      }
    });
  });

  it('should handle reloadBooking error without booking parameter', (done) => {
    sessionHttpService.GetSession.and.returnValue(throwError(() => new Error('Get Session Error')));
    
    service.reloadBooking().subscribe((result) => {
      expect(loggerService.error).toHaveBeenCalledWith('SessionService', 'No session', jasmine.any(Error));
      expect(result).toBeFalse();
      done();
    });
  });
});

describe('SessionStore with existing sessionStorage', () => {
  let service: SessionStore;
  let storageService: MockStorageService;

  beforeEach(() => {
    const existingSessionData = { ...CLEAN_SESSION_DATA, session: { ...CLEAN_SESSION_DATA.session, booking: CLEAN_BOOKING } };
    
    TestBed.configureTestingModule({
      providers: [
        { 
          provide: StorageService, 
          useValue: {
            getSessionStorage: jasmine.createSpy('getSessionStorage').and.returnValue(existingSessionData),
            setSessionStorage: jasmine.createSpy('setSessionStorage')
          }
        },
        { provide: SessionHttpService, useClass: MockSessionHttpService },
        { provide: EventBusService, useClass: MockEventBusService },
        { provide: LoggerService, useClass: MockLoggerService },
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        SessionStore,
      ],
    });
    service = TestBed.inject(SessionStore);
    storageService = TestBed.inject(StorageService) as any;
  });

  it('should initialize with existing session data from storage', () => {
    expect(service.INITIAL_SESSION_DATA.session.booking).toEqual(CLEAN_BOOKING);
    expect(storageService.getSessionStorage).toHaveBeenCalledWith(mockBusinessConfig.sessionKey);
  });
});
