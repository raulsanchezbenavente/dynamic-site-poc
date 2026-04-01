import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { BUSINESS_CONFIG } from '../injection-tokens';
import { BusinessConfig, IbeFlow } from '../model';
import { CLEAN_SESSION_DATA, SessionData } from '../session';
import { SessionStore } from '../session';
import { CurrencyService } from '../services/currency.service';
import { CurrencySymbolPipe } from './currency-symbol.pipe';

describe('CurrencySymbolPipe', () => {
  let pipe: CurrencySymbolPipe;
  let mockSessionStore: jasmine.SpyObj<SessionStore>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let sessionDataSubject: BehaviorSubject<SessionData>;

  const mockBusinessConfig: Partial<BusinessConfig> = {};

  beforeEach(() => {
    sessionDataSubject = new BehaviorSubject<SessionData>(CLEAN_SESSION_DATA);

    mockSessionStore = jasmine.createSpyObj('SessionStore', [], {
      sessionData$: sessionDataSubject.asObservable(),
    });

    mockCurrencyService = jasmine.createSpyObj('CurrencyService', ['getCurrentCurrency']);

    TestBed.configureTestingModule({
      providers: [
        CurrencySymbolPipe,
        { provide: SessionStore, useValue: mockSessionStore },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        { provide: LOCALE_ID, useValue: 'en-US' },
      ],
    });

    pipe = TestBed.inject(CurrencySymbolPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return USD symbol ($) for USD currency code', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'USD',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('USD');

      expect(result).toBe('$');
    });

    it('should return EUR symbol (€) for EUR currency code', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'EUR',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('EUR');

      expect(result).toBe('€');
    });

    it('should return GBP symbol (£) for GBP currency code', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'GBP',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('GBP');

      expect(result).toBe('£');
    });

    it('should return empty string when currency is empty', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: '',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('');

      expect(result).toBe('');
    });

    it('should return currency code as fallback for invalid currency', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'INVALID',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('INVALID');

      expect(result).toBe('INVALID');
    });
  });

  describe('switchTypeBooking for WCI flow', () => {
    it('should set bookingCurrency from session booking pricing for WCI flow', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'USD',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('USD');

      expect(result).toBe('$');
    });
  });

  describe('switchTypeBooking for MMB flow', () => {
    it('should set bookingCurrency from session booking pricing for MMB flow', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.MMB,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'EUR',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('EUR');

      expect(result).toBe('€');
    });
  });

  describe('switchTypeBooking for default flow', () => {
    it('should use selected currency from CurrencyService for default flow', () => {
      mockCurrencyService.getCurrentCurrency.and.returnValue('GBP');

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'USD',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('GBP');

      expect(mockCurrencyService.getCurrentCurrency).toHaveBeenCalled();
      expect(result).toBe('£');
    });

    it('should fall back to booking currency when selected currency is not set', () => {
      mockCurrencyService.getCurrentCurrency.and.returnValue('');

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'EUR',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('EUR');

      expect(result).toBe('€');
    });
  });

  describe('getCurrencySymbol with different locales', () => {
    it('should return correct symbol for en-US locale', () => {

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'USD',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('USD');

      expect(result).toBe('$');
    });

    it('should return correct symbol for es-ES locale', () => {
      const pipeEsES = new CurrencySymbolPipe(
        mockSessionStore,
        mockCurrencyService,
        mockBusinessConfig as BusinessConfig,
        'es-ES'
      );

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'EUR',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipeEsES.transform('EUR');

      expect(result).toBe('€');
    });

    it('should handle currency symbols with different locales - CAD in en-CA', () => {
      const pipeEnCA = new CurrencySymbolPipe(
        mockSessionStore,
        mockCurrencyService,
        mockBusinessConfig as BusinessConfig,
        'en-CA'
      );

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'CAD',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipeEnCA.transform('CAD');

      expect(result).toBe('$');
    });
  });

  describe('edge cases', () => {
    it('should use value parameter when selectedCurrency does not match bookingCurrency', () => {
      mockCurrencyService.getCurrentCurrency.and.returnValue('USD');

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'GBP',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('EUR');

      expect(result).toBe('€');
    });

    it('should handle null/undefined business config gracefully', () => {
      const sessionDataSubjectNoConfig = new BehaviorSubject<SessionData>(CLEAN_SESSION_DATA);
      const mockSessionStoreNoConfig = jasmine.createSpyObj('SessionStore', [], {
        sessionData$: sessionDataSubjectNoConfig.asObservable(),
      });

      const pipeNoConfig = new CurrencySymbolPipe(
        mockSessionStoreNoConfig,
        mockCurrencyService,
        null as any,
        'en-US'
      );

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'USD',
            },
          },
        },
      };
      sessionDataSubjectNoConfig.next(sessionData);

      const result = pipeNoConfig.transform('USD');

      expect(result).toBe('$');
    });

    it('should return currency code when Intl.NumberFormat throws error', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'FAKE',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('FAKE');

      expect(result).toBe('FAKE');
    });

    it('should handle special currencies like JPY (no decimals)', () => {
      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          flow: IbeFlow.WCI,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'JPY',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('JPY');

      expect(result).toBe('¥');
    });

    it('should handle when selected currency from CurrencyService matches booking currency', () => {
      mockCurrencyService.getCurrentCurrency.and.returnValue('EUR');

      const sessionData: SessionData = {
        session: {
          ...CLEAN_SESSION_DATA.session,
          booking: {
            ...CLEAN_SESSION_DATA.session.booking,
            pricing: {
              ...CLEAN_SESSION_DATA.session.booking.pricing,
              currency: 'EUR',
            },
          },
        },
      };
      sessionDataSubject.next(sessionData);

      const result = pipe.transform('USD'); // Different currency passed

      expect(result).toBe('€'); // Should use selected currency
    });
  });
});
