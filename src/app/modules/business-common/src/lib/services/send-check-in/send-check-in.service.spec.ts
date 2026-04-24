import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  Booking,
  CultureServiceEx,
  KeycloakAuthService,
  LoggerService,
  PaxSegmentCheckinStatus,
  StorageService,
} from '@dcx/ui/libs';

import { SendCheckInService } from './send-check-in.service';
import { BOOKING_PROXY_SERVICE, SegmentPaxCheckin, SendCheckinRequest } from '../../proxies';
import { CheckInEmailStateService } from '../check-in-email-state.service';

describe('SendCheckInService', () => {
  let service: SendCheckInService;
  let bookingProxyService: jasmine.SpyObj<any>;
  let cultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let keycloakAuthService: jasmine.SpyObj<KeycloakAuthService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let logger: jasmine.SpyObj<LoggerService>;
  let checkInEmailStateService: jasmine.SpyObj<CheckInEmailStateService>;

  const mockToken = 'mock-auth-token';
  const mockCulture = 'en-US';

  beforeEach(() => {
    bookingProxyService = jasmine.createSpyObj('BookingProxyService', ['sendCheckin']);
    bookingProxyService.sendCheckin.and.returnValue(of(undefined));

    cultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getLanguageAndRegion']);
    cultureServiceEx.getLanguageAndRegion.and.returnValue(mockCulture);

    keycloakAuthService = jasmine.createSpyObj('KeycloakAuthService', ['getTokenSync']);
    keycloakAuthService.getTokenSync.and.returnValue(mockToken);

    storageService = jasmine.createSpyObj('StorageService', ['getSessionStorage']);

    logger = jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error']);

    checkInEmailStateService = jasmine.createSpyObj('CheckInEmailStateService', [
      'isEmailPending',
      'clearEmailPending',
    ]);
    checkInEmailStateService.isEmailPending.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        SendCheckInService,
        { provide: BOOKING_PROXY_SERVICE, useValue: bookingProxyService },
        { provide: CultureServiceEx, useValue: cultureServiceEx },
        { provide: KeycloakAuthService, useValue: keycloakAuthService },
        { provide: StorageService, useValue: storageService },
        { provide: LoggerService, useValue: logger },
        { provide: CheckInEmailStateService, useValue: checkInEmailStateService },
      ],
    });

    service = TestBed.inject(SendCheckInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('send', () => {
    it('should return early and log warning when no selected passengers found', (done) => {
      storageService.getSessionStorage.and.returnValue({});

      const mockBooking = {} as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No selected passengers found for check-in'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return early and log warning when selected passengers is null', (done) => {
      storageService.getSessionStorage.and.returnValue(null);

      const mockBooking = {} as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No selected passengers found for check-in'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return early and log warning when no passengers have completed check-in', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No passengers with completed check-in found'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should send check-in request with correct passenger IDs for checked-in passengers', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1', 'pax-ref-2'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
          {
            id: 'pax-2',
            referenceId: 'pax-ref-2',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(bookingProxyService.sendCheckin).toHaveBeenCalledWith({
          authenticationToken: mockToken,
          segmentsPaxCheckin: [
            {
              segmentId: 'segment-1',
              pax: ['pax-1', 'pax-2'],
              isExternalCheckInProcess: false,
              culture: mockCulture,
            },
          ],
        } as SendCheckinRequest);
        expect(logger.info).toHaveBeenCalledWith(
          'SendCheckInService',
          'Sending check-in request',
          jasmine.any(Object)
        );
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should handle multiple journeys and segments correctly', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
        'journey-2': ['pax-ref-2'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }, { id: 'segment-2' }],
          },
          {
            id: 'journey-2',
            segments: [{ id: 'segment-3' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
              {
                segmentId: 'segment-2',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
          {
            id: 'pax-2',
            referenceId: 'pax-ref-2',
            segmentsInfo: [
              {
                segmentId: 'segment-3',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        const expectedSegments: SegmentPaxCheckin[] = [
          {
            segmentId: 'segment-1',
            pax: ['pax-1'],
            isExternalCheckInProcess: false,
            culture: mockCulture,
          },
          {
            segmentId: 'segment-2',
            pax: ['pax-1'],
            isExternalCheckInProcess: false,
            culture: mockCulture,
          },
          {
            segmentId: 'segment-3',
            pax: ['pax-2'],
            isExternalCheckInProcess: false,
            culture: mockCulture,
          },
        ];

        expect(bookingProxyService.sendCheckin).toHaveBeenCalledWith({
          authenticationToken: mockToken,
          segmentsPaxCheckin: expectedSegments,
        } as SendCheckinRequest);
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should skip journey when journey is not found in booking', (done) => {
      const selectedPassengers = {
        'non-existent-journey': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking = {
        journeys: [],
        pax: [],
      } as unknown as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No passengers with completed check-in found'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should skip journey when journey has no segments', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: undefined,
          },
        ],
        pax: [],
      } as unknown as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No passengers with completed check-in found'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should skip passenger when passenger is not found in booking', (done) => {
      const selectedPassengers = {
        'journey-1': ['non-existent-pax'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [],
      } as unknown as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No passengers with completed check-in found'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });

    it('should use default culture when cultureServiceEx returns null', (done) => {
      cultureServiceEx.getLanguageAndRegion.and.returnValue('');

      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          } as any,
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              } as any,
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        const call = bookingProxyService.sendCheckin.calls.mostRecent();
        expect(call.args[0].segmentsPaxCheckin[0].culture).toBe('en-US');
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should use empty token when keycloakAuthService returns null', (done) => {
      keycloakAuthService.getTokenSync.and.returnValue(null);

      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        const call = bookingProxyService.sendCheckin.calls.mostRecent();
        expect(call.args[0].authenticationToken).toBe('');
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should only include passengers with CHECKED_IN status', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1', 'pax-ref-2', 'pax-ref-3'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
          {
            id: 'pax-2',
            referenceId: 'pax-ref-2',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
              },
            ],
          },
          {
            id: 'pax-3',
            referenceId: 'pax-ref-3',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        const call = bookingProxyService.sendCheckin.calls.mostRecent();
        expect(call.args[0].segmentsPaxCheckin[0].pax).toEqual(['pax-1', 'pax-3']);
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should include passengers with STAND_BY status', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1', 'pax-ref-2'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.STAND_BY,
              },
            ],
          },
          {
            id: 'pax-2',
            referenceId: 'pax-ref-2',
            segmentsInfo: [
              {
                segmentId: 'segment-1',
                status: PaxSegmentCheckinStatus.NOT_CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        const call = bookingProxyService.sendCheckin.calls.mostRecent();
        expect(call.args[0].segmentsPaxCheckin[0].pax).toEqual(['pax-1']);
        expect(checkInEmailStateService.clearEmailPending).toHaveBeenCalled();
        done();
      });
    });

    it('should exclude passenger when segmentInfo does not match segment id', (done) => {
      const selectedPassengers = {
        'journey-1': ['pax-ref-1'],
      };
      storageService.getSessionStorage.and.returnValue(selectedPassengers);

      const mockBooking: Booking = {
        journeys: [
          {
            id: 'journey-1',
            segments: [{ id: 'segment-1' }],
          },
        ],
        pax: [
          {
            id: 'pax-1',
            referenceId: 'pax-ref-1',
            segmentsInfo: [
              {
                segmentId: 'other-segment',
                status: PaxSegmentCheckinStatus.CHECKED_IN,
              },
            ],
          },
        ],
      } as Booking;

      service.send(mockBooking).subscribe(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          'SendCheckInService',
          'No passengers with completed check-in found'
        );
        expect(bookingProxyService.sendCheckin).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
