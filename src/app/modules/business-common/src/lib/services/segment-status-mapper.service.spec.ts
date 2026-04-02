import { TestBed } from '@angular/core/testing';
import { SegmentStatusDto, SegmentsStatusResponse } from '@dcx/ui/api-layer';
import { SegmentStatus, TransportType } from '@dcx/ui/libs';

import { CheckInSegmentStatus } from '../models';
import { SegmentStatusMapperService } from './segment-status-mapper.service';

const asApiDate = (isoDate: string): Date => isoDate as unknown as Date;

const createSegmentStatusDto = (overrides: Partial<SegmentStatusDto> = {}): SegmentStatusDto => ({
  delayDeparture: overrides.delayDeparture ?? asApiDate('2024-01-01T00:05:00Z'),
  ata: overrides.ata ?? asApiDate('2024-01-01T03:00:00Z'),
  atd: overrides.atd ?? asApiDate('2024-01-01T01:30:00Z'),
  atautc: overrides.atautc ?? asApiDate('2024-01-01T03:05:00Z'),
  atdutc: overrides.atdutc ?? asApiDate('2024-01-01T01:35:00Z'),
  std: overrides.std ?? asApiDate('2024-01-01T00:30:00Z'),
  etd: overrides.etd ?? asApiDate('2024-01-01T00:45:00Z'),
  stdutc: overrides.stdutc ?? asApiDate('2024-01-01T00:30:00Z'),
  etdutc: overrides.etdutc ?? asApiDate('2024-01-01T00:45:00Z'),
  sta: overrides.sta ?? asApiDate('2024-01-01T02:50:00Z'),
  eta: overrides.eta ?? asApiDate('2024-01-01T02:45:00Z'),
  stautc: overrides.stautc ?? asApiDate('2024-01-01T02:50:00Z'),
  etautc: overrides.etautc ?? asApiDate('2024-01-01T02:45:00Z'),
  duration: overrides.duration ?? 'PT2H30M',
  origin: overrides.origin ?? 'MEX',
  destination: overrides.destination ?? 'LAX',
  transport: overrides.transport ?? {
    carrierName: 'DCX',
    number: '42',
    type: TransportType.PLANE,
  },
  status: overrides.status ?? SegmentStatus.SCHEDULED,
});

describe('SegmentStatusMapperService', () => {
  let service: SegmentStatusMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SegmentStatusMapperService],
    });

    service = TestBed.inject(SegmentStatusMapperService);
  });

  it('should map journey id and preserve the mapped segments status', () => {
    const firstSegment = createSegmentStatusDto({
      origin: 'BOG',
      destination: 'MIA',
      std: asApiDate('2024-02-01T10:00:00Z'),
      status: SegmentStatus.BOARDING,
      duration: 'PT4H05M',
    });
    const secondSegment = createSegmentStatusDto({
      origin: 'MIA',
      destination: 'JFK',
      std: asApiDate('2024-02-02T08:00:00Z'),
      status: SegmentStatus.DELAYED,
      duration: 'PT2H10M',
    });
    const response: SegmentsStatusResponse = {
      requestDate: new Date('2024-02-01T09:45:00Z'),
      segments: [firstSegment, secondSegment],
    };

    const result = service.mapSegmentsStatusByJourney('journey-01', response);

    expect(result.journeyId).toBe('journey-01');
    expect(result.segmentsStatus.length).toBe(2);
    expect(result.segmentsStatus[0]).toEqual(
      jasmine.objectContaining({
        origin: 'BOG',
        destination: 'MIA',
        std: new Date('2024-02-01T10:00:00Z'),
        status: SegmentStatus.BOARDING,
        duration: 'PT4H05M',
      })
    );
    expect(result.segmentsStatus[1]).toEqual(
      jasmine.objectContaining({
        origin: 'MIA',
        destination: 'JFK',
        std: new Date('2024-02-02T08:00:00Z'),
        status: SegmentStatus.DELAYED,
        duration: 'PT2H10M',
      })
    );
  });

  it('should convert every temporal property into a Date instance', () => {
    const isoDates = {
      std: '2024-03-01T10:00:00Z',
      etd: '2024-03-01T10:30:00Z',
      atd: '2024-03-01T10:45:00Z',
      sta: '2024-03-01T13:00:00Z',
      eta: '2024-03-01T13:20:00Z',
      ata: '2024-03-01T13:40:00Z',
      stdutc: '2024-03-01T10:00:00Z',
      stautc: '2024-03-01T13:00:00Z',
      atdutc: '2024-03-01T10:45:00Z',
      atautc: '2024-03-01T13:40:00Z',
    } as const;

    const dateOverrides: Partial<SegmentStatusDto> = {
      std: asApiDate(isoDates.std),
      etd: asApiDate(isoDates.etd),
      atd: asApiDate(isoDates.atd),
      sta: asApiDate(isoDates.sta),
      eta: asApiDate(isoDates.eta),
      ata: asApiDate(isoDates.ata),
      stdutc: asApiDate(isoDates.stdutc),
      stautc: asApiDate(isoDates.stautc),
      atdutc: asApiDate(isoDates.atdutc),
      atautc: asApiDate(isoDates.atautc),
    };

    const response: SegmentsStatusResponse = {
      requestDate: new Date(),
      segments: [createSegmentStatusDto(dateOverrides)],
    };

    const [mappedSegment] = service.mapSegmentsStatusByJourney('journey-02', response).segmentsStatus;

    const dateFields: Array<keyof Pick<CheckInSegmentStatus, 'std' | 'etd' | 'atd' | 'sta' | 'eta' | 'ata' | 'stdutc' | 'stautc' | 'atdutc' | 'atautc'>> = [
      'std',
      'etd',
      'atd',
      'sta',
      'eta',
      'ata',
      'stdutc',
      'stautc',
      'atdutc',
      'atautc',
    ];

    dateFields.forEach((field) => {
      const mappedValue = mappedSegment[field] as unknown as Date;
      expect(mappedValue instanceof Date).toBeTrue();
      expect(mappedValue.getTime()).toBe(new Date(isoDates[field]).getTime());
    });
  });
});
