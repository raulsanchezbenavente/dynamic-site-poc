import { TestBed } from '@angular/core/testing';
import { WindowHelper } from '@dcx/ui/libs';

import { CULTURES, USER_CULTURES } from '../../../resources/cultures';

import { CultureServiceEx } from './culture-ex.service';

describe('CultureServiceEx', () => {
  let service: CultureServiceEx;
  let getLocationSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CultureServiceEx]
    });

    getLocationSpy = spyOn(WindowHelper, 'getLocation').and.returnValue({
      href: 'https://example.com/uiplus/en/home',
      pathname: '/uiplus/en/home'
    } as Location);

    service = TestBed.inject(CultureServiceEx);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize culture configuration with default values', () => {
      expect(service['cultureConfig']).toEqual({
        default: CULTURES.default,
        supported: CULTURES.supported
      });
    });

    it('should load culture during initialization', () => {
      expect(service.culture).toBeDefined();
    });
  });

  describe('getCulture', () => {
    it('should return the current culture', () => {
      service.culture = 'es';
      expect(service.getCulture()).toBe('es');
    });

    it('should return empty string when culture is undefined', () => {
      service.culture = undefined;
      expect(service.getCulture()).toBe('');
    });
  });

  describe('setCulture', () => {
    it('should set culture when valid culture code is provided', () => {
      const cultureCode = 'en';
      service.setCulture(cultureCode);

      expect(service.culture).toBe(cultureCode);
    });

    it('should not set culture when invalid culture code is provided', () => {
      const previousCulture = service.culture;
      const invalidCultureCode = 'invalid';
      service.setCulture(invalidCultureCode);

      expect(service.culture).toBe(previousCulture);
      expect(service.culture).not.toBe(invalidCultureCode);
    });

    it('should not set culture when unsupported culture code is provided', () => {
      const previousCulture = service.culture;
      const unsupportedCultureCode = 'de';
      service.setCulture(unsupportedCultureCode);

      expect(service.culture).toBe(previousCulture);
      expect(service.culture).not.toBe(unsupportedCultureCode);
    });
  });

  describe('getUserCulture', () => {
    it('should return user culture for current culture', () => {
      service.culture = 'en';
      const result = service.getUserCulture();
      expect(result).toEqual(USER_CULTURES['en']);
    });

    it('should handle undefined culture gracefully', () => {
      service.culture = undefined;
      const result = service.getUserCulture();
      expect(result).toBeUndefined();
    });
  });

  describe('getCultureByPriority', () => {
    it('should return URL culture when available and supported', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/uiplus/en/flights',
        pathname: '/uiplus/en/flights'
      } as Location);

      const result = service['getCultureByPriority']();
      expect(result).toBe('en');
    });

    it('should return default culture when URL culture is not available', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/home',
        pathname: '/home'
      } as Location);

      const result = service['getCultureByPriority']();
      expect(result).toBe(CULTURES.default);
    });

    it('should return first supported culture when default is not supported', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/home',
        pathname: '/home'
      } as Location);
      service['cultureConfig'] = {
        default: 'invalid-default',
        supported: CULTURES.supported
      };

      const result = service['getCultureByPriority']();
      expect(result).toBe(CULTURES.supported[0]);
    });
  });

  describe('getCultureFromURL', () => {
    it('should extract culture from URL', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/uiplus/es/flights',
        pathname: '/uiplus/es/flights'
      } as Location);

      const result = service['getCultureFromURL']();
      expect(result).toBe('es');
    });

    it('should return empty string when URL has no culture in expected position', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/home',
        pathname: '/home'
      } as Location);

      const result = service['getCultureFromURL']();
      expect(result).toBe('');
    });

    it('should return empty string when potential culture is not supported', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/booking/de/flights',
        pathname: '/booking/de/flights'
      } as Location);

      const result = service['getCultureFromURL']();
      expect(result).toBe('');
    });

    it('should handle root path correctly', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/',
        pathname: '/'
      } as Location);

      const result = service['getCultureFromURL']();
      expect(result).toBe('');
    });
  });



  describe('getDefaultCulture', () => {
    it('should return default culture from configuration', () => {
      const result = service['getDefaultCulture']();
      expect(result).toBe(CULTURES.default);
    });

    it('should return empty string when configuration is undefined', () => {
      service['cultureConfig'] = undefined;
      const result = service['getDefaultCulture']();
      expect(result).toBe('');
    });
  });

  describe('getFirstSupportedCulture', () => {
    it('should return first supported culture', () => {
      const result = service['getFirstSupportedCulture']();
      expect(result).toBe(CULTURES.supported[0]);
    });

    it('should return empty string when no supported cultures', () => {
      service['cultureConfig'] = {
        default: 'es',
        supported: []
      };
      const result = service['getFirstSupportedCulture']();
      expect(result).toBe('');
    });

    it('should return empty string when configuration is undefined', () => {
      service['cultureConfig'] = undefined;
      const result = service['getFirstSupportedCulture']();
      expect(result).toBe('');
    });
  });

  describe('isCultureSupported', () => {
    it('should return true for supported culture', () => {
      expect(service['isCultureSupported']('en')).toBe(true);
      expect(service['isCultureSupported']('es')).toBe(true);
      expect(service['isCultureSupported']('fr')).toBe(true);
      expect(service['isCultureSupported']('pt')).toBe(true);
    });

    it('should return false for unsupported culture', () => {
      expect(service['isCultureSupported']('de')).toBe(false);
      expect(service['isCultureSupported']('it')).toBe(false);
      expect(service['isCultureSupported']('invalid')).toBe(false);
    });

    it('should return false when configuration is undefined', () => {
      service['cultureConfig'] = undefined;
      expect(service['isCultureSupported']('en')).toBe(false);
    });

    it('should return false when supported cultures array is undefined', () => {
      service['cultureConfig'] = {
        default: 'es',
        supported: undefined as any
      };
      expect(service['isCultureSupported']('en')).toBe(false);
    });
  });

  describe('loadCulture', () => {
    it('should set culture when valid culture is found', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/booking/fr/flights',
        pathname: '/booking/fr/flights'
      } as Location);

      service['loadCulture']();
      expect(service.culture).toBe('fr');
    });

    it('should not set culture when no valid culture is found', () => {
      getLocationSpy.and.returnValue({
        href: 'https://example.com/home',
        pathname: '/home'
      } as Location);
      
      service['cultureConfig'] = {
        default: '',
        supported: []
      };

      service.culture = undefined;
      service['loadCulture']();

      expect(service.culture).toBe(undefined);
    });
  });

  describe('edge cases', () => {
    it('should handle empty configuration gracefully', () => {
      service['cultureConfig'] = {
        default: '',
        supported: []
      };

      expect(service['isCultureSupported']('en')).toBe(false);
      expect(service['getDefaultCulture']()).toBe('');
      expect(service['getFirstSupportedCulture']()).toBe('');
    });

    it('should handle missing USER_CULTURES entries', () => {
      service.culture = 'nonexistent';
      const result = service.getUserCulture();
      expect(result).toBeUndefined();
    });

    it('should handle complex URL structures', () => {
      getLocationSpy.and.returnValue({
        href: 'https://subdomain.example.com/path/subpath/en/more/paths?query=value',
        pathname: '/path/subpath/en/more/paths'
      } as Location);

      const result = service['getCultureFromURL']();
      expect(result).toBe('');
    });
  });

  describe('getLanguageAndRegion', () => {
    it('should return locale from user culture when available', () => {
      service.culture = 'es';
      const result = service.getLanguageAndRegion();
      expect(result).toBe('es-ES');
    });

    it('should return empty for not supported region', () => {
      service.culture = 'st';
      const result = service.getLanguageAndRegion();
      expect(result).toBe('');
    });
  });


});
