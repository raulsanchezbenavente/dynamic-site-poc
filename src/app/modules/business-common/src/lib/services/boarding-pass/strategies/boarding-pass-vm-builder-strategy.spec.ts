import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Booking, Journey, Pax, PaxSegmentInfo, Segment, Transport } from '@dcx/ui/api-layer';
import { CultureServiceEx, EnumSeparators, EnumStorageKey, StorageService, TextHelperService } from '@dcx/ui/libs';
import { BoardingPassVMBuilderService } from './boarding-pass-vm-builder-strategy';
import { BoardingPassVMBuilderData } from '..';

class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('BoardingPassVMBuilderService', () => {
  let service: BoardingPassVMBuilderService;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockTextHelperService: jasmine.SpyObj<TextHelperService>;

  const mockBooking: Booking = {
    id: 'booking123',
    pax: [
      {
        id: 'pax1',
        name: {
          first: 'john',
          last: 'doe',
        },
        segmentsInfo: [
          {
            segmentId: 'seg1',
            seat: '12A',
          } as PaxSegmentInfo,
          {
            segmentId: 'seg2',
            seat: '15C',
          } as PaxSegmentInfo,
        ],
      } as Pax,
      {
        id: 'pax2',
        name: {
          first: 'jane',
          last: 'smith',
        },
        segmentsInfo: [] as PaxSegmentInfo[],
      } as Pax,
    ],
    journeys: [
      {
        id: 'journey1',
        segments: [
          {
            id: 'seg1',
            origin: 'BOG',
            destination: 'MIA',
            std: new Date('2025-12-15T10:30:00'),
            transport: {
              carrier: {
                code: 'AV',
              },
              number: '123',
            } as Transport,
          } as Segment,
          {
            id: 'seg2',
            origin: 'MIA',
            destination: 'JFK',
            std: new Date('2025-12-15T14:30:00'),
            transport: {
              carrier: {
                code: 'AV',
              },
              number: '456',
            } as Transport,
          } as Segment,
        ],
      } as Journey,
    ],
  } as Booking;

  beforeEach(() => {
    mockStorageService = jasmine.createSpyObj('StorageService', ['getSessionStorage']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getUserCulture']);
    mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['getCapitalizeWords']);

    mockTranslateService.instant.and.callFake((key: string) => {
      if (key === 'City.BOG') return 'Bogotá';
      if (key === 'City.MIA') return 'Miami';
      if (key === 'City.JFK') return 'New York';
      return key;
    });

    mockCultureServiceEx.getUserCulture.and.returnValue({
      timeFormat: 'HH:mm',
      shortDateFormat: 'DD/MM/YYYY',
    } as any);

    mockTextHelperService.getCapitalizeWords.and.callFake((text: string) => {
      return text
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        BoardingPassVMBuilderService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: TextHelperService, useValue: mockTextHelperService },
      ],
    });

    service = TestBed.inject(BoardingPassVMBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBoardingPassVM', () => {
    it('should return empty boarding pass when booking is not found in session', () => {
      mockStorageService.getSessionStorage.and.returnValue(null);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result).toEqual({
        paxId: '',
        passengerName: EnumSeparators.DASH,
        segments: [],
      });
      expect(mockStorageService.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.SessionBooking);
    });

    it('should return empty boarding pass when passenger is not found', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'invalidPax',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result).toEqual({
        paxId: '',
        passengerName: EnumSeparators.DASH,
        segments: [],
      });
    });

    it('should return empty boarding pass when journey is not found', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'invalidJourney',
      };

      const result = service.getBoardingPassVM(data);

      expect(result).toEqual({
        paxId: '',
        passengerName: EnumSeparators.DASH,
        segments: [],
      });
    });

    it('should build boarding pass VM with passenger and segments', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.paxId).toBe('pax1');
      expect(result.passengerName).toBe('John Doe');
      expect(result.segments.length).toBe(2);
      expect(mockTextHelperService.getCapitalizeWords).toHaveBeenCalledWith('john doe');
    });

    it('should build correct segment information', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);
      const firstSegment = result.segments[0];

      expect(firstSegment.id).toBe('seg1');
      expect(firstSegment.journeyId).toBe('journey1');
      expect(firstSegment.origin).toBe('Bogotá');
      expect(firstSegment.destination).toBe('Miami');
      expect(firstSegment.originCode).toBe('BOG');
      expect(firstSegment.destinationCode).toBe('MIA');
      expect(firstSegment.seat).toBe('12A');
      expect(firstSegment.flightNumber).toBe('AV 123');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('City.BOG');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('City.MIA');
    });

    it('should handle passenger without seat assignment', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax2',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);
      const firstSegment = result.segments[0];

      expect(firstSegment.seat).toBe(EnumSeparators.DASH);
    });

    it('should return empty segments when journey has no segments', () => {
      const bookingWithoutSegments = {
        ...mockBooking,
        journeys: [
          {
            id: 'journey1',
            segments: [],
          } as unknown as Journey,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithoutSegments);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments).toEqual([]);
    });

    it('should handle passenger with empty name', () => {
      const bookingWithEmptyName = {
        ...mockBooking,
        pax: [
          {
            id: 'pax1',
            name: {
              first: '',
              last: '',
            },
            segmentsInfo: [],
          } as unknown as Pax,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithEmptyName);
      mockTextHelperService.getCapitalizeWords.and.returnValue('');
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.passengerName).toBe(EnumSeparators.DASH);
    });

    it('should format departure time correctly', () => {
      mockStorageService.getSessionStorage.and.returnValue(mockBooking);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments[0].departureTime).toBe('10:30');
      expect(mockCultureServiceEx.getUserCulture).toHaveBeenCalled();
    });

    it('should handle invalid departure time', () => {
      const bookingWithInvalidDate = {
        ...mockBooking,
        journeys: [
          {
            id: 'journey1',
            segments: [
              {
                id: 'seg1',
                origin: 'BOG',
                destination: 'MIA',
                std: '0001-01-01T00:00:00',
                transport: {
                  carrier: { code: 'AV' },
                  number: '123',
                } as Transport,
              } as unknown as Segment,
            ],
          } as Journey,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithInvalidDate);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments[0].departureTime).toBe('-');
    });

    it('should handle missing flight number', () => {
      const bookingWithoutFlightNumber = {
        ...mockBooking,
        journeys: [
          {
            id: 'journey1',
            segments: [
              {
                id: 'seg1',
                origin: 'BOG',
                destination: 'MIA',
                std: new Date('2025-12-15T10:30:00'),
                transport: {
                  carrier: { code: '' },
                  number: '',
                } as Transport,
              } as Segment,
            ],
          } as Journey,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithoutFlightNumber);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments[0].flightNumber).toBe(EnumSeparators.DASH);
    });

    it('should handle flight number without carrier code', () => {
      const bookingWithOnlyNumber = {
        ...mockBooking,
        journeys: [
          {
            id: 'journey1',
            segments: [
              {
                id: 'seg1',
                origin: 'BOG',
                destination: 'MIA',
                std: new Date('2025-12-15T10:30:00'),
                transport: {
                  carrier: { code: '' },
                  number: '123',
                } as Transport,
              } as Segment,
            ],
          } as Journey,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithOnlyNumber);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments[0].flightNumber).toBe('123');
    });

    it('should handle segment without id', () => {
      const bookingWithoutSegmentId = {
        ...mockBooking,
        journeys: [
          {
            id: 'journey1',
            segments: [
              {
                id: undefined,
                origin: 'BOG',
                destination: 'MIA',
                std: new Date('2025-12-15T10:30:00'),
                transport: {
                  carrier: { code: 'AV' },
                  number: '123',
                } as Transport,
              } as unknown as Segment,
            ],
          } as Journey,
        ],
      } as Booking;

      mockStorageService.getSessionStorage.and.returnValue(bookingWithoutSegmentId);
      const data: BoardingPassVMBuilderData = {
        paxId: 'pax1',
        journeyId: 'journey1',
      };

      const result = service.getBoardingPassVM(data);

      expect(result.segments[0].id).toBe(EnumSeparators.DASH);
    });
  });
});
