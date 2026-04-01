import { TestBed } from '@angular/core/testing';
 import { StorageService } from './storage.service';
 import { LocalStorageService, SessionStorageService } from 'angular-web-storage';

 describe('StorageService', () => {
  let service: StorageService;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;
  let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;

  beforeEach(() => {
    localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['set', 'get', 'clear', 'remove']);
    sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['set', 'get', 'clear', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: LocalStorageService, useValue: localStorageServiceSpy },
        { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
      ],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage', () => {
    const key = 'testKey';
    const value = { data: 'testData' };
    const timeout = 1000;

    it('should set localStorage with key, value, and timeout', () => {
      service.setLocalStorage(key, value, timeout);
      expect(localStorageServiceSpy.set).toHaveBeenCalledWith(key, value, timeout, 't');
    });

    it('should set localStorage with key and value (default timeout)', () => {
      service.setLocalStorage(key, value);
      expect(localStorageServiceSpy.set).toHaveBeenCalledWith(key, value, 0, 't');
    });

    it('should not set localStorage if value is null', () => {
      service.setLocalStorage(key, null, timeout);
      expect(localStorageServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should get localStorage by key', () => {
      localStorageServiceSpy.get.and.returnValue(value);
      const result = service.getLocalStorage(key);
      expect(localStorageServiceSpy.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should remove localStorage by key', () => {
      service.removeLocalStorage(key);
      expect(localStorageServiceSpy.remove).toHaveBeenCalledWith(key);
    });

    it('should remove all localStorage', () => {
      service.removeAllLocalStorage();
      expect(localStorageServiceSpy.clear).toHaveBeenCalled();
    });

    it('should clean localStorage (alias for removeAllLocalStorage)', () => {
      service.cleanLocalStorage();
      expect(localStorageServiceSpy.clear).toHaveBeenCalled();
    });
  });

  describe('sessionStorage', () => {
    const key = 'testSessionKey';
    const value = { sessionData: 'testSessionData' };
    const timeout = 500;

    it('should set sessionStorage with key, value, and timeout', () => {
      service.setSessionStorage(key, value, timeout);
      expect(sessionStorageServiceSpy.set).toHaveBeenCalledWith(key, value, timeout, 't');
    });

    it('should set sessionStorage with key and value (default timeout)', () => {
      service.setSessionStorage(key, value);
      expect(sessionStorageServiceSpy.set).toHaveBeenCalledWith(key, value, 0, 't');
    });

    it('should not set sessionStorage if value is null', () => {
      service.setSessionStorage(key, null, timeout);
      expect(sessionStorageServiceSpy.set).not.toHaveBeenCalled();
    });

    it('should get sessionStorage by key', () => {
      sessionStorageServiceSpy.get.and.returnValue(value);
      const result = service.getSessionStorage(key);
      expect(sessionStorageServiceSpy.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should remove sessionStorage by key', () => {
      service.removeSessionStorage(key);
      expect(sessionStorageServiceSpy.remove).toHaveBeenCalledWith(key);
    });

    it('should remove all sessionStorage', () => {
      service.removeAllSessionStorage();
      expect(sessionStorageServiceSpy.clear).toHaveBeenCalled();
    });

    it('should clean sessionStorage (alias for removeAllSessionStorage)', () => {
      service.cleanSessionStorage();
      expect(sessionStorageServiceSpy.clear).toHaveBeenCalled();
    });
  });
 });