import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SessionService } from './session.service';
import { BookingSessionService, Booking, QueryResponse, ChangeBookingModel } from '@dcx/ui/api-layer';
import { StorageService, EnumStorageKey } from '@dcx/ui/libs';

describe('SessionService', () => {
  let service: SessionService;
  let bookingSessionService: jasmine.SpyObj<BookingSessionService>;
  let storageService: jasmine.SpyObj<StorageService>;

  const mockBooking = {
    id: 'booking-123',
    bookingInfo: {},
    bundles: [],
    contacts: [],
    etickets: [],
    hasDisruptions: false,
    journeys: [],
    pax: [],
    payments: [],
    pricing: {},
    services: [],
  } as unknown as Booking;

  const mockBookingResponse: QueryResponse<Booking> = {
    success: true,
    result: {
      result: true,
      data: mockBooking,
    },
  } as QueryResponse<Booking>;

  const mockChangeBookingResponse: QueryResponse<ChangeBookingModel> = {
    success: true,
    result: {
      result: true,
      data: {} as ChangeBookingModel,
    },
  } as QueryResponse<ChangeBookingModel>;

  beforeEach(() => {
    const bookingSessionServiceSpy = jasmine.createSpyObj('BookingSessionService', [
      'getBooking',
      'getChangeBooking',
    ]);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: BookingSessionService, useValue: bookingSessionServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });

    service = TestBed.inject(SessionService);
    bookingSessionService = TestBed.inject(BookingSessionService) as jasmine.SpyObj<BookingSessionService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSessionBooking', () => {
    it('should fetch booking and save it to storage on success', (done) => {
      bookingSessionService.getBooking.and.returnValue(of(mockBookingResponse));

      service.getSessionBooking().subscribe({
        next: (response) => {
          expect(response).toEqual(mockBookingResponse);
          expect(bookingSessionService.getBooking).toHaveBeenCalled();
          expect(storageService.setSessionStorage).toHaveBeenCalledWith(
            EnumStorageKey.SessionBooking,
            mockBooking
          );
          done();
        },
      });
    });

    it('should log error when fetching booking fails', (done) => {
      const errorMessage = 'Network error';
      const consoleErrorSpy = spyOn(console, 'error');
      bookingSessionService.getBooking.and.returnValue(throwError(() => new Error(errorMessage)));

      service.getSessionBooking().subscribe({
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching booking session:', error);
          expect(storageService.setSessionStorage).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('getChangesbooking', () => {
    it('should fetch change booking successfully', (done) => {
      bookingSessionService.getChangeBooking.and.returnValue(of(mockChangeBookingResponse));

      service.getChangesbooking().subscribe({
        next: (response) => {
          expect(response).toEqual(mockChangeBookingResponse);
          expect(bookingSessionService.getChangeBooking).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should propagate error when fetching change booking fails', (done) => {
      const errorMessage = 'Network error';
      bookingSessionService.getChangeBooking.and.returnValue(throwError(() => new Error(errorMessage)));

      service.getChangesbooking().subscribe({
        error: (error) => {
          expect(error.message).toEqual(errorMessage);
          done();
        },
      });
    });
  });

  describe('getBookingFromStorage', () => {
    it('should return booking from storage when it exists', () => {
      storageService.getSessionStorage.and.returnValue(mockBooking);

      const result = service.getBookingFromStorage();

      expect(result).toEqual(mockBooking);
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.SessionBooking);
    });

    it('should return null when booking does not exist in storage', () => {
      storageService.getSessionStorage.and.returnValue(null);

      const result = service.getBookingFromStorage();

      expect(result).toBeNull();
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.SessionBooking);
    });

    it('should return null when storage returns undefined', () => {
      storageService.getSessionStorage.and.returnValue(undefined);

      const result = service.getBookingFromStorage();

      expect(result).toBeNull();
      expect(storageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.SessionBooking);
    });
  });
});
