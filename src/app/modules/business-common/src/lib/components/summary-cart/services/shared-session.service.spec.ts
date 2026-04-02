import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  CurrencyService,
  EnumSellType,
  EnumStorageKey,
  LoggerService,
  Pricing,
  Service,
  SessionData,
  SessionStore,
  StorageService,
  EnumServiceType,
} from '@dcx/ui/libs';
import { of, throwError } from 'rxjs';
import { SharedSessionService } from './shared-session.service';

describe('SharedSessionService', () => {
  let service: SharedSessionService;
  let sessionStoreMock: jasmine.SpyObj<SessionStore>;
  let loggerMock: jasmine.SpyObj<LoggerService>;
  let currencyServiceMock: jasmine.SpyObj<CurrencyService>;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  const mockSessionData: SessionData = {
    session: {
      booking: {
        journeys: [
          {
            id: 'J0',
            segments: [],
            origin: 'MAD',
            destination: 'BCN',
            schedule: {
              departure: '2025-01-01T10:00:00',
              arrival: '2025-01-01T12:00:00',
            },
            duration: '02:00:00',
          } as any,
        ],
        bookingInfo: {
          comments: [],
          createdDate: '2025-01-01',
          pointOfSale: {
            agent: { id: 'A1' },
            organization: { id: 'O1' },
          },
          queues: [],
          recordLocator: 'ABC123',
          status: 'Confirmed',
        },
        pricing: {
          balanceDue: 100,
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxJourney: [
              {
                paxId: 'P1',
                journeyId: 'J0',
                referenceId: 'R1',
                totalAmount: 50,
                currency: 'USD',
                charges: [
                  {
                    type: 'Service',
                    code: 'SEAT',
                    amount: 50,
                    currency: 'USD',
                  },
                ],
              },
            ],
            perPaxSegment: [],
            perSegment: [],
          },
          currency: 'USD',
          isBalanced: false,
          totalAmount: 100,
        },
        contacts: [],
        bookingFees: [],
        pax: [
          {
            id: 'P1',
            name: {
              first: 'John',
              last: 'Doe',
            },
            type: 'Adult',
          } as any,
        ],
        payments: [],
        services: [
          {
            id: 'S1',
            referenceId: 'R1',
            code: 'SEAT',
            sellKey: 'J0',
            paxId: 'P1',
            type: EnumServiceType.SEAT,
            scope: EnumSellType.PER_PAX_SEGMENT,
            priceAmount: 50,
          } as Service,
        ],
      },
      culture: 'en-US',
      originalBooking: {} as any,
    },
  };

  beforeEach(fakeAsync(() => {
    sessionStoreMock = jasmine.createSpyObj('SessionStore', ['getApiSession']);
    loggerMock = jasmine.createSpyObj('LoggerService', ['error', 'info', 'warn']);
    currencyServiceMock = jasmine.createSpyObj('CurrencyService', ['getCurrentCurrency']);
    storageServiceMock = jasmine.createSpyObj('StorageService', ['getSessionStorage', 'setSessionStorage']);

    sessionStoreMock.getApiSession.calls.reset();
    loggerMock.error.calls.reset();
    loggerMock.info.calls.reset();
    loggerMock.warn.calls.reset();
    currencyServiceMock.getCurrentCurrency.calls.reset();
    storageServiceMock.getSessionStorage.calls.reset();
    storageServiceMock.setSessionStorage.calls.reset();

    sessionStoreMock.getApiSession.and.returnValue(of(structuredClone(mockSessionData)));
    currencyServiceMock.getCurrentCurrency.and.returnValue('USD');

    TestBed.configureTestingModule({
      providers: [
        SharedSessionService,
        { provide: SessionStore, useValue: sessionStoreMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    });

    service = TestBed.inject(SharedSessionService);
    tick();
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load session on initialization', fakeAsync(() => {
    expect(sessionStoreMock.getApiSession).toHaveBeenCalledTimes(1);
    expect(service.sessionSubject.value).toEqual(mockSessionData);
  }));  it('should emit session data through session$ observable', fakeAsync(() => {
    let emittedSession: SessionData | undefined;
    service.session$.subscribe((session) => {
      emittedSession = session;
    });
    tick();
    expect(emittedSession).toBeTruthy();
    expect(emittedSession!.session.booking.bookingInfo.recordLocator).toBe('ABC123');
  }));

  it('should log error when session loading fails', fakeAsync(() => {
    const errorMessage = 'Session load error';
    sessionStoreMock.getApiSession.and.returnValue(throwError(() => new Error(errorMessage)));

    service.updateBooking();
    tick();

    expect(loggerMock.error).toHaveBeenCalledWith(
      'SharedSessionService',
      'Error initializing session',
      jasmine.any(Error)
    );
  }));

  describe('updateBooking', () => {
    it('should reload session when updateBooking is called', fakeAsync(() => {
      sessionStoreMock.getApiSession.calls.reset();

      service.updateBooking();
      tick();

      expect(sessionStoreMock.getApiSession).toHaveBeenCalledTimes(1);
    }));
  });

  describe('removeService', () => {
    it('should remove a service by matching all keys', fakeAsync(() => {
      const serviceToRemove = {
        id: 'S2',
        paxId: 'P1',
        sellKey: 'J0',
        code: 'MEAL',
        type: EnumServiceType.MEAL,
      };

      const sessionWithService = structuredClone(mockSessionData);
      sessionWithService.session.booking.services.push(serviceToRemove as Service);
      service.sessionSubject.next(sessionWithService);

      service.removeService(serviceToRemove);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(1);
      expect(currentSession?.session.booking.services.find((s) => s.id === 'S2')).toBeUndefined();
    }));

    it('should remove a SEAT service by id only', fakeAsync(() => {
      const seatServiceToRemove = {
        id: 'S1',
        type: EnumServiceType.SEAT,
      };

      service.removeService(seatServiceToRemove);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(0);
    }));

    it('should not remove service if not found', fakeAsync(() => {
      const nonExistentService = {
        id: 'S999',
        paxId: 'P999',
        sellKey: 'J999',
        code: 'NONE',
      };

      service.removeService(nonExistentService);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(1);
    }));

    it('should return early if current session is null', fakeAsync(() => {
      service.sessionSubject.next(null);

      service.removeService({ id: 'S1' });
      tick();

      expect(service.sessionSubject.value).toBeNull();
    }));    it('should delete breakdown entry when removing service', fakeAsync(() => {
      const serviceToRemove = {
        id: 'S1',
        code: 'SEAT',
        sellKey: 'J0',
        paxId: 'P1',
        type: EnumServiceType.SEAT,
      };

      service.removeService(serviceToRemove);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.pricing.breakdown.perPaxJourney.length).toBe(0);
    }));    it('should recompute totals after removing service', fakeAsync(() => {
      const serviceToRemove = {
        id: 'S1',
        code: 'SEAT',
        sellKey: 'J0',
        paxId: 'P1',
        type: EnumServiceType.SEAT,
      };

      service.removeService(serviceToRemove);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.pricing.totalAmount).toBe(0);
      expect(currentSession?.session.booking.pricing.balanceDue).toBe(0);
    }));

    it('should save to storage when saveStorage is true', fakeAsync(() => {
      const serviceToRemove = {
        id: 'S1',
        type: EnumServiceType.SEAT,
      };

      service.removeService(serviceToRemove, true);
      tick();

      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.SeatMapBooking,
        jasmine.any(Object)
      );
    }));

    it('should not save to storage when saveStorage is false', fakeAsync(() => {
      const serviceToRemove = {
        id: 'S1',
        type: EnumServiceType.SEAT,
      };

      service.removeService(serviceToRemove, false);
      tick();

      expect(storageServiceMock.setSessionStorage).not.toHaveBeenCalled();
    }));
  });

  describe('validateServices', () => {
    it('should remove service if it matches criteria', fakeAsync(() => {
      const serviceToVerify = [
        {
          id: 'S1',
          paxId: 'P1',
          sellKey: 'J0',
        },
      ];

      spyOn(service, 'removeService');

      service.validateServices(serviceToVerify);
      tick();

      expect(service.removeService).toHaveBeenCalledWith(serviceToVerify[0]);
    }));

    it('should not remove service if no match found', fakeAsync(() => {
      const serviceToVerify = [
        {
          id: 'S999',
          paxId: 'P999',
          sellKey: 'J999',
        },
      ];

      spyOn(service, 'removeService');

      service.validateServices(serviceToVerify);
      tick();

      expect(service.removeService).not.toHaveBeenCalled();
    }));

    it('should not remove service if serviceToVerify is empty', fakeAsync(() => {
      const serviceToVerify: any[] = [];

      spyOn(service, 'removeService');

      service.validateServices(serviceToVerify);
      tick();

      expect(service.removeService).not.toHaveBeenCalled();
    }));

    it('should handle null or undefined session safely', fakeAsync(() => {
      service.sessionSubject.next(null);

      const serviceToVerify = [
        {
          id: 'S1',
          paxId: 'P1',
          sellKey: 'J0',
        },
      ];

      spyOn(service, 'removeService');

      service.validateServices(serviceToVerify);
      tick();

      expect(service.removeService).not.toHaveBeenCalled();
    }));
  });

  describe('addService', () => {
    it('should add a new service to the booking', fakeAsync(() => {
      const newService = {
        id: 'S2',
        referenceId: 'R2',
        code: 'MEAL',
        paxId: 'P1',
        type: EnumServiceType.MEAL,
        scope: 'Segment',
        priceAmount: 25,
        price: 25,
      };

      service.addService(newService);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(2);
      expect(currentSession?.session.booking.services[1].code).toBe('MEAL');
      expect(currentSession?.session.booking.services[1].sellKey).toBe('J0');
    }));

    it('should return early if current session is null', fakeAsync(() => {
      service.sessionSubject.next(null);

      const newService = {
        id: 'S2',
        code: 'MEAL',
      };

      service.addService(newService);
      tick();

      expect(service.sessionSubject.value).toBeNull();
    }));

    it('should update pricing when adding service', fakeAsync(() => {
      const newService = {
        id: 'S2',
        referenceId: 'R2',
        code: 'MEAL',
        paxId: 'P1',
        type: EnumServiceType.MEAL,
        price: 30,
        selectedUnits: 1,
      };

      service.addService(newService);
      tick();

      const currentSession = service.sessionSubject.value;
      const pricing = currentSession?.session.booking.pricing;
      expect(pricing?.breakdown.perPaxJourney.length).toBe(2);
      expect(pricing?.totalAmount).toBeGreaterThan(50);
    }));

    it('should recompute totals after adding service', fakeAsync(() => {
      const newService = {
        id: 'S2',
        referenceId: 'R2',
        code: 'MEAL',
        paxId: 'P1',
        type: EnumServiceType.MEAL,
        price: 30,
      };

      service.addService(newService);
      tick();

      const currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.pricing.totalAmount).toBe(80);
      expect(currentSession?.session.booking.pricing.balanceDue).toBe(80);
    }));

    it('should save to storage when saveStorage is true', fakeAsync(() => {
      const newService = {
        id: 'S2',
        code: 'MEAL',
        paxId: 'P1',
        price: 25,
      };

      service.addService(newService, true);
      tick();

      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.SeatMapBooking,
        jasmine.any(Object)
      );
    }));

    it('should not save to storage when saveStorage is false', fakeAsync(() => {
      const newService = {
        id: 'S2',
        code: 'MEAL',
        paxId: 'P1',
        price: 25,
      };

      service.addService(newService, false);
      tick();

      expect(storageServiceMock.setSessionStorage).not.toHaveBeenCalled();
    }));

    it('should handle service with selectedUnits in pricing', fakeAsync(() => {
      const newService = {
        id: 'S2',
        referenceId: 'R2',
        code: 'BAGGAGE',
        paxId: 'P1',
        type: EnumServiceType.BAG,
        price: 20,
        selectedUnits: 3,
      };

      service.addService(newService);
      tick();

      const currentSession = service.sessionSubject.value;
      const paxJourney = currentSession?.session.booking.pricing.breakdown.perPaxJourney.find(
        (p) => p.charges?.[0]?.code === 'BAGGAGE'
      );
      expect(paxJourney?.charges[0].amount).toBe(60);
    }));
  });

  describe('addSeatService', () => {
    it('should remove existing seat service for same passenger before adding new one', fakeAsync(() => {
      const existingSeatService = {
        id: 'S1',
        type: EnumServiceType.SEAT,
        paxId: 'P1',
      };

      const newSeatService = {
        id: 'S3',
        referenceId: 'R3',
        code: 'SEAT',
        paxId: 'P1',
        type: EnumServiceType.SEAT,
        price: 40,
      };

      storageServiceMock.getSessionStorage.and.returnValue({
        services: [existingSeatService],
      });

      spyOn(service, 'removeService');
      spyOn(service, 'addService');

      service.addSeatService(newSeatService);
      tick();

      expect(service.removeService).toHaveBeenCalledWith(existingSeatService, true);
      expect(service.addService).toHaveBeenCalledWith(newSeatService, true);
    }));

    it('should add seat service without removing if no existing seat for passenger', fakeAsync(() => {
      const newSeatService = {
        id: 'S3',
        code: 'SEAT',
        paxId: 'P2',
        type: EnumServiceType.SEAT,
        price: 40,
      };

      storageServiceMock.getSessionStorage.and.returnValue({
        services: [
          {
            id: 'S1',
            type: EnumServiceType.SEAT,
            paxId: 'P1',
          },
        ],
      });

      spyOn(service, 'removeService');
      spyOn(service, 'addService');

      service.addSeatService(newSeatService);
      tick();

      expect(service.removeService).not.toHaveBeenCalled();
      expect(service.addService).toHaveBeenCalledWith(newSeatService, true);
    }));

    it('should handle null storage data gracefully', fakeAsync(() => {
      const newSeatService = {
        id: 'S3',
        code: 'SEAT',
        paxId: 'P1',
        price: 40,
      };

      storageServiceMock.getSessionStorage.and.returnValue(null);

      spyOn(service, 'removeService');
      spyOn(service, 'addService');

      service.addSeatService(newSeatService);
      tick();

      expect(service.removeService).not.toHaveBeenCalled();
      expect(service.addService).toHaveBeenCalledWith(newSeatService, true);
    }));
  });

  describe('private methods', () => {
    describe('ensurePricing', () => {
      it('should initialize all breakdown arrays if missing', () => {
        const pricing: Pricing = {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: '',
        } as Pricing;

        (service as any).ensurePricing(pricing, 'EUR');

        expect(pricing.breakdown).toBeDefined();
        expect(pricing.breakdown.perBooking).toEqual([]);
        expect(pricing.breakdown.perPax).toEqual([]);
        expect(pricing.breakdown.perPaxJourney).toEqual([]);
        expect(pricing.breakdown.perPaxSegment).toEqual([]);
        expect(pricing.breakdown.perSegment).toEqual([]);
        expect(pricing.currency).toBe('EUR');
      });

      it('should not override existing breakdown arrays', () => {
        const pricing: Pricing = {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [{ referenceId: 'R1', totalAmount: 10, currency: 'USD', charges: [] }],
            perPax: [],
            perPaxJourney: [],
            perPaxSegment: [],
            perSegment: [],
          },
        };

        (service as any).ensurePricing(pricing, 'EUR');

        expect(pricing.breakdown.perBooking.length).toBe(1);
        expect(pricing.currency).toBe('USD');
      });
    });

    describe('deleteBreakDownEntry', () => {
      it('should delete matching breakdown entry', () => {
        const pricing: Pricing = {
          totalAmount: 100,
          balanceDue: 100,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxJourney: [
              {
                paxId: 'P1',
                journeyId: 'J0',
                referenceId: 'R1',
                totalAmount: 50,
                currency: 'USD',
                charges: [{ type: 'Service', code: 'SEAT', amount: 50, currency: 'USD' }],
              },
            ],
            perPaxSegment: [],
            perSegment: [],
          },
        };

        (service as any).deleteBreakDownEntry(pricing, 'J0', 'P1', 'SEAT');

        expect(pricing.breakdown.perPaxJourney.length).toBe(0);
      });

      it('should not delete non-matching entries', () => {
        const pricing: Pricing = {
          totalAmount: 100,
          balanceDue: 100,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxJourney: [
              {
                paxId: 'P1',
                journeyId: 'J0',
                referenceId: 'R1',
                totalAmount: 50,
                currency: 'USD',
                charges: [{ type: 'Service', code: 'SEAT', amount: 50, currency: 'USD' }],
              },
            ],
            perPaxSegment: [],
            perSegment: [],
          },
        };

        (service as any).deleteBreakDownEntry(pricing, 'J1', 'P2', 'MEAL');

        expect(pricing.breakdown.perPaxJourney.length).toBe(1);
      });

      it('should return early if pricing breakdown is undefined', () => {
        const pricing: Pricing = {
          totalAmount: 100,
          balanceDue: 100,
          isBalanced: false,
          currency: 'USD',
        } as Pricing;

        expect(() => {
          (service as any).deleteBreakDownEntry(pricing, 'J0', 'P1', 'SEAT');
        }).not.toThrow();
      });
    });

    describe('getPricingInfo', () => {      it('should return pricing info for existing service', fakeAsync(() => {
        const sessionData = structuredClone(mockSessionData);
        // The service needs to have a 'price' property to be found by getPricingInfo
        sessionData.session.booking.services[0] = {
          ...sessionData.session.booking.services[0],
          price: 50,
        } as Service;

        const serviceToAdd: Service = {
          id: 'S1',
          code: 'SEAT',
        } as Service;

        const result = (service as any).getPricingInfo(sessionData, serviceToAdd);

        expect(result.priceAmount).toBe(50);
        expect(result.priceCode).toBe('SEAT');
      }));

      it('should return 0 price for non-existing service', fakeAsync(() => {
        const sessionData = structuredClone(mockSessionData);
        const serviceToAdd: Service = {
          id: 'S999',
          code: 'MEAL',
        } as Service;

        const result = (service as any).getPricingInfo(sessionData, serviceToAdd);

        expect(result.priceAmount).toBe(0);
        expect(result.priceCode).toBe('MEAL');
      }));
    });

    describe('updatePricing', () => {
      it('should add new perPaxJourney entry to pricing', fakeAsync(() => {
        const sessionData = structuredClone(mockSessionData);
        const serviceToAdd: Service = {
          id: 'S2',
          referenceId: 'R2',
          code: 'MEAL',
          sellKey: 'J0',
          paxId: 'P1',
          type: EnumServiceType.MEAL,
          price: 30,
        } as any;

        sessionData.session.booking.services.push(serviceToAdd);

        (service as any).updatePricing(sessionData, serviceToAdd);

        expect(sessionData.session.booking.pricing.breakdown.perPaxJourney.length).toBe(2);
        expect(sessionData.session.booking.pricing.breakdown.perPaxJourney[1].paxId).toBe('P1');
        expect(sessionData.session.booking.pricing.breakdown.perPaxJourney[1].totalAmount).toBe(30);
      }));

      it('should return early if pricing is undefined', fakeAsync(() => {
        const sessionData = structuredClone(mockSessionData);
        sessionData.session.booking.pricing = undefined as any;

        const serviceToAdd: Service = {
          id: 'S2',
          code: 'MEAL',
        } as Service;

        expect(() => {
          (service as any).updatePricing(sessionData, serviceToAdd);
        }).not.toThrow();
      }));

      it('should use current currency from currencyService', fakeAsync(() => {
        currencyServiceMock.getCurrentCurrency.and.returnValue('EUR');

        const sessionData = structuredClone(mockSessionData);
        const serviceToAdd: Service = {
          id: 'S2',
          referenceId: 'R2',
          code: 'MEAL',
          sellKey: 'J0',
          paxId: 'P1',
          type: EnumServiceType.MEAL,
          price: 30,
        } as any;

        sessionData.session.booking.services.push(serviceToAdd);
        sessionData.session.booking.pricing.currency = '';

        (service as any).updatePricing(sessionData, serviceToAdd);

        expect(sessionData.session.booking.pricing.currency).toBe('EUR');
      }));
    });

    describe('recomputeTotals', () => {
      it('should compute total from all breakdown arrays', () => {
        const pricing: Pricing = {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [{ referenceId: 'R1', totalAmount: 10, currency: 'USD', charges: [] }],
            perPax: [{ paxId: 'P1', referenceId: 'R1', totalAmount: 20, currency: 'USD', charges: [] }],
            perPaxJourney: [
              {
                paxId: 'P1',
                journeyId: 'J0',
                referenceId: 'R1',
                totalAmount: 30,
                currency: 'USD',
                charges: [],
              },
            ],
            perPaxSegment: [
              {
                paxId: 'P1',
                segmentId: 'S1',
                referenceId: 'R1',
                totalAmount: 15,
                currency: 'USD',
                charges: [],
              },
            ],
            perSegment: [{ referenceId: 'R1', totalAmount: 25, currency: 'USD', charges: [] }],
          },
        };

        (service as any).recomputeTotals(pricing);

        expect(pricing.totalAmount).toBe(100);
        expect(pricing.balanceDue).toBe(100);
        expect(pricing.isBalanced).toBe(false);
      });

      it('should handle empty breakdown arrays', () => {
        const pricing: Pricing = {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [],
            perPax: [],
            perPaxJourney: [],
            perPaxSegment: [],
            perSegment: [],
          },
        };

        (service as any).recomputeTotals(pricing);

        expect(pricing.totalAmount).toBe(0);
        expect(pricing.balanceDue).toBe(0);
      });

      it('should return early if pricing is undefined', () => {
        expect(() => {
          (service as any).recomputeTotals(undefined);
        }).not.toThrow();
      });

      it('should handle null totalAmount values', () => {
        const pricing: Pricing = {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: false,
          currency: 'USD',
          breakdown: {
            perBooking: [{ referenceId: 'R1', totalAmount: null as any, currency: 'USD', charges: [] }],
            perPax: [],
            perPaxJourney: [],
            perPaxSegment: [],
            perSegment: [],
          },
        };

        (service as any).recomputeTotals(pricing);

        expect(pricing.totalAmount).toBe(0);
      });
    });
  });
  describe('emit', () => {
    it('should emit cloned session data', fakeAsync(() => {
      const testSession = structuredClone(mockSessionData);
      let emittedSession: SessionData | undefined;

      service.session$.subscribe((session) => {
        emittedSession = session;
      });

      (service as any).emit(testSession);
      tick();

      expect(emittedSession).toBeTruthy();
      expect(emittedSession).not.toBe(testSession);
      expect(emittedSession!.session.booking.bookingInfo.recordLocator).toBe('ABC123');
    }));
  });

  describe('complex scenarios', () => {    it('should handle multiple service additions and removals', fakeAsync(() => {
      const service1 = {
        id: 'S2',
        referenceId: 'R2',
        code: 'MEAL',
        paxId: 'P1',
        type: EnumServiceType.MEAL,
        price: 20,
      };

      const service2 = {
        id: 'S3',
        referenceId: 'R3',
        code: 'BAGGAGE',
        paxId: 'P1',
        type: EnumServiceType.BAG,
        price: 30,
      };

      service.addService(service1);
      tick();
      service.addService(service2);
      tick();

      let currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(3);

      // To remove non-SEAT services, we need to provide all matching keys
      const serviceToRemove = {
        id: 'S2',
        paxId: 'P1',
        sellKey: 'J0',
        code: 'MEAL',
      };

      service.removeService(serviceToRemove);
      tick();

      currentSession = service.sessionSubject.value;
      expect(currentSession?.session.booking.services.length).toBe(2);
      expect(currentSession?.session.booking.services.find((s) => s.code === 'MEAL')).toBeUndefined();
    }));    it('should maintain pricing integrity across operations', fakeAsync(() => {
      // The initial total is based on the breakdown, which has 50 from the SEAT service
      // The pricing.totalAmount in mock is 100, but after recomputeTotals it will be recalculated from breakdown
      const initialBreakdownTotal = service.sessionSubject.value?.session.booking.pricing.breakdown.perPaxJourney.reduce(
        (sum, entry) => sum + entry.totalAmount,
        0
      ) || 0;

      const newService = {
        id: 'S2',
        referenceId: 'R2',
        code: 'MEAL',
        paxId: 'P1',
        type: EnumServiceType.MEAL,
        price: 25,
      };

      service.addService(newService);
      tick();

      let currentTotal = service.sessionSubject.value?.session.booking.pricing.totalAmount || 0;
      expect(currentTotal).toBe(initialBreakdownTotal + 25);

      // To remove the service, we need to provide all matching keys
      const serviceToRemove = {
        id: 'S2',
        paxId: 'P1',
        sellKey: 'J0',
        code: 'MEAL',
      };

      service.removeService(serviceToRemove);
      tick();

      currentTotal = service.sessionSubject.value?.session.booking.pricing.totalAmount || 0;
      expect(currentTotal).toBe(initialBreakdownTotal);
    }));
  });
});
