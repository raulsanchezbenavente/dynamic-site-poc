import { TestBed } from '@angular/core/testing';
 import { CookieService } from 'ngx-cookie';
 import { CookiesStore, TIME_EXPIRES_COOKIES } from './cookie-store.service';

 describe('CookiesStore', () => {
  let service: CookiesStore;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['getObject', 'putObject', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        CookiesStore,
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: TIME_EXPIRES_COOKIES, useValue: 3600 },
      ],
    });
    service = TestBed.inject(CookiesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize dateExpires with default time if TIME_EXPIRES_COOKIES is provided', () => {
      const currentTime = new Date();
      const expectedExpiry = new Date(currentTime.getTime() + (3600 / 60 + 60) * 60 * 1000);
      expect(service['dateExpires'].getTime()).toBeGreaterThanOrEqual(expectedExpiry.getTime() - 500);
      expect(service['dateExpires'].getTime()).toBeLessThanOrEqual(expectedExpiry.getTime() + 500);
    });
  });

  describe('getCookie', () => {
    it('should call cookieService.getObject with the provided key', () => {
      const key = 'testKey';
      const mockData = { value: 'testValue' };
      cookieServiceSpy.getObject.and.returnValue(mockData);

      const result = service.getCookie(key);

      expect(cookieServiceSpy.getObject).toHaveBeenCalledWith(key);
      expect(result).toEqual(mockData);
    });
  });

  describe('setCookie', () => {
    const key = 'testSetKey';
    const data = { setValue: 'testSetValue' };

    it('should call cookieService.putObject with the provided key, data, and default expiry date if no time is provided', () => {
      service.setCookie(key, data);
      expect(cookieServiceSpy.putObject).toHaveBeenCalledWith(key, data, { expires: service['dateExpires'] });
    });

    it('should call cookieService.putObject with the provided key, data, and provided expiry date if time is provided', () => {
      const customExpiry = new Date(2026, 0, 1);
      service.setCookie(key, data, customExpiry);
      expect(cookieServiceSpy.putObject).toHaveBeenCalledWith(key, data, { expires: customExpiry });
    });

    it('should not call cookieService.putObject if data is null', () => {
      service.setCookie(key, null);
      expect(cookieServiceSpy.putObject).not.toHaveBeenCalled();
    });
  });

  describe('removeCookie', () => {
    it('should call cookieService.remove with the provided key', () => {
      const key = 'testRemoveKey';
      service.removeCookie(key);
      expect(cookieServiceSpy.remove).toHaveBeenCalledWith(key);
    });
  });

  describe('cleanCookies', () => {
    let originalCookie: string;

    beforeEach(() => {
      originalCookie = document.cookie;
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
    });

    afterEach(() => {
      document.cookie = originalCookie;
    });

    it('should remove all cookies by setting their expiry date to the past', () => {
      document.cookie = 'cookie1=value1; cookie2=value2; cookie3=value3;';
      service.cleanCookies();
      console.log(document.cookie);
      expect(document.cookie).toBe('=;expires=Thu, 21 Sep 1979 00:00:01 UTC;');
    });

    it('should do nothing if there are no cookies', () => {
      const initialCookieValue = document.cookie;
      service.cleanCookies();
      expect('').toBe(initialCookieValue);
    });

    it('should handle cookies with no value', () => {
      document.cookie = 'cookieWithoutValue=;';
      service.cleanCookies();
      expect(document.cookie).toBe('=;expires=Thu, 21 Sep 1979 00:00:01 UTC;');
    });

    it('should handle cookies with only a key', () => {
      document.cookie = 'onlyKey;';
      service.cleanCookies();
      expect(document.cookie).toBe('=;expires=Thu, 21 Sep 1979 00:00:01 UTC;');
    });
  });
 });