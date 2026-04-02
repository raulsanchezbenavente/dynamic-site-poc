import { TestBed } from '@angular/core/testing';

import { Browser } from '../models/browsers.enum';
import { DetectionsService } from './detections.service';

describe('DetectionsService', () => {
  let service: DetectionsService;
  let originalNavigatorDescriptor: PropertyDescriptor | undefined;

  const overrideNavigator = (value: Navigator | Partial<Navigator> | null | undefined) => {
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      get: () => value as Navigator,
    });
  };

  const restoreNavigator = () => {
    if (originalNavigatorDescriptor) {
      Object.defineProperty(window, 'navigator', originalNavigatorDescriptor);
    }
  };

  beforeAll(() => {
    const windowPrototype = Object.getPrototypeOf(window);
    originalNavigatorDescriptor =
      Object.getOwnPropertyDescriptor(window, 'navigator') ??
      Object.getOwnPropertyDescriptor(windowPrototype, 'navigator');
    restoreNavigator();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetectionsService);
    restoreNavigator();
  });

  afterEach(() => {
    restoreNavigator();
  });

  afterAll(() => {
    restoreNavigator();
  });

  describe('getBrowser', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return Unknown when navigator is undefined', () => {
      overrideNavigator(undefined);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should return Unknown when navigator is null', () => {
      overrideNavigator(null);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should detect Edge browser from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Edge);
    });

    it('should detect Edge iOS from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0.0.0 Mobile/15E148 Safari/605.1.15',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Edge);
    });

    it('should detect Opera from userAgent with opr/', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Opera);
    });

    it('should detect Opera from userAgent with opera', () => {
      const mockNavigator = {
        userAgent: 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Opera);
    });

    it('should detect Firefox from userAgent', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Firefox);
    });

    it('should detect Firefox iOS from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/121.0 Mobile/15E148 Safari/605.1.15',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Firefox);
    });

    it('should detect Internet Explorer with trident', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.IE);
    });

    it('should detect Internet Explorer with MSIE', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.IE);
    });

    it('should detect Chrome from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Chrome);
    });

    it('should detect Chrome iOS from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Chrome);
    });

    it('should detect Safari from userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Safari);
    });

    it('should detect Safari on iOS', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Safari);
    });

    it('should detect browser using userAgentData brands', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0',
        userAgentData: {
          brands: [
            { brand: 'Not_A Brand', version: '8' },
            { brand: 'Chromium', version: '120' },
            { brand: 'Chrome', version: '120' },
          ],
        },
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Chrome);
    });

    it('should detect Edge using userAgentData brands', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0',
        userAgentData: {
          brands: [
            { brand: 'Not_A Brand', version: '8' },
            { brand: 'Chromium', version: '120' },
            { brand: 'Microsoft Edge', version: '120' },
          ],
        },
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Edge);
    });

    it('should prioritize userAgentData over userAgent', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        userAgentData: {
          brands: [
            { brand: 'Not_A Brand', version: '8' },
            { brand: 'Chromium', version: '120' },
            { brand: 'Microsoft Edge', version: '120' },
          ],
        },
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Edge);
    });

    it('should return Unknown for unrecognized userAgent', () => {
      const mockNavigator = {
        userAgent: 'Some Unknown Browser/1.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should handle empty userAgent', () => {
      const mockNavigator = {
        userAgent: '',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should handle userAgentData with empty brands array', () => {
      const mockNavigator = {
        userAgent: 'Mozilla/5.0',
        userAgentData: {
          brands: [],
        },
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should handle navigator with missing userAgent property', () => {
      const mockNavigator = {
        userAgent: undefined,
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Unknown);
    });

    it('should follow regex priority order (Edge before Chrome)', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Edge);
    });

    it('should follow regex priority order (Opera before Chrome)', () => {
      const mockNavigator = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
      };
      overrideNavigator(mockNavigator);
      const result = service.getBrowser();
      expect(result).toBe(Browser.Opera);
    });
  });
});
