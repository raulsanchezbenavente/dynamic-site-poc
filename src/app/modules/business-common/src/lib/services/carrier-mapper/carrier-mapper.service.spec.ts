import { TestBed } from '@angular/core/testing';
import type { CarrierVM, LegVM, SegmentVM } from '@dcx/ui/libs';

import { CarrierMapperService } from './carrier-mapper.service';

describe('CarrierMapperService', () => {
  let service: CarrierMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CarrierMapperService],
    });
    service = TestBed.inject(CarrierMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapCarrierNamesInSegments', () => {
    it('should map carrier names using operatingAirlineCode', () => {
      const carriers: CarrierVM[] = [
        { code: 'AV', name: 'Avianca', externalUrl: '', logo: '' },
        { code: 'LA', name: 'LATAM Airlines', externalUrl: '', logo: '' },
      ];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: {
              code: 'XX',
              name: 'Old Name',
              operatingAirlineCode: 'AV',
            },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].transport.carrier.code).toBe('XX');
      expect(result[0].transport.carrier.operatingAirlineCode).toBe('AV');
    });

    it('should fallback to carrier code when operatingAirlineCode is missing', () => {
      const carriers: CarrierVM[] = [{ code: 'LA', name: 'LATAM Airlines', externalUrl: '', logo: '' }];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: {
              code: 'LA',
              name: 'Old Name',
              operatingAirlineCode: undefined,
            },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('LATAM Airlines');
    });

    it('should preserve original name when carrier not found in map', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: {
              code: 'CM',
              name: 'Copa Airlines',
              operatingAirlineCode: 'CM',
            },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Copa Airlines');
    });

    it('should handle multiple segments with different carriers', () => {
      const carriers: CarrierVM[] = [
        { code: 'AV', name: 'Avianca', externalUrl: '', logo: '' },
        { code: 'LA', name: 'LATAM Airlines', externalUrl: '', logo: '' },
        { code: 'CM', name: 'Copa Airlines', externalUrl: '', logo: '' },
      ];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Old1', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'LA', name: 'Old2', operatingAirlineCode: 'LA' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'CM', name: 'Old3', operatingAirlineCode: 'CM' },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
      expect(result[1].transport.carrier.name).toBe('LATAM Airlines');
      expect(result[2].transport.carrier.name).toBe('Copa Airlines');
    });

    it('should return original segments when segments array is empty', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const result = service.mapCarrierNamesInSegments([], carriers);

      expect(result).toEqual([]);
    });

    it('should return original segments when segments is null', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const result = service.mapCarrierNamesInSegments(null as any, carriers);

      expect(result).toBeNull();
    });

    it('should return original segments when carriers array is empty', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, []);

      expect(result).toEqual(segments);
    });

    it('should return original segments when carriers is null', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, null as any);

      expect(result).toEqual(segments);
    });

    it('should preserve original segment when carrier name is undefined in repository', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: undefined as any, externalUrl: '', logo: '' }];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Original Name', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Original Name');
    });

    it('should skip carriers without code when building map', () => {
      const carriers: CarrierVM[] = [
        { code: '', name: 'Empty Code Carrier', externalUrl: '', logo: '' },
        { code: 'AV', name: 'Avianca', externalUrl: '', logo: '' },
      ];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Old Name', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
    });

    it('should create new segment objects (immutability)', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const originalSegment: SegmentVM = {
        transport: {
          carrier: { code: 'AV', name: 'Old Name', operatingAirlineCode: 'AV' },
        },
      } as SegmentVM;

      const segments: SegmentVM[] = [originalSegment];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0]).not.toBe(originalSegment);
      expect(result[0].transport).not.toBe(originalSegment.transport);
      expect(result[0].transport.carrier).not.toBe(originalSegment.transport.carrier);
      expect(originalSegment.transport.carrier.name).toBe('Old Name');
    });

    it('should map carrier names in nested legs', () => {
      const carriers: CarrierVM[] = [
        { code: 'AV', name: 'Avianca', externalUrl: '', logo: '' },
        { code: 'LA', name: 'LATAM Airlines', externalUrl: '', logo: '' },
      ];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Old Segment Name', operatingAirlineCode: 'AV' },
          },
          legs: [
            {
              transport: {
                carrier: { code: 'AV', name: 'Old Leg Name 1', operatingAirlineCode: 'AV' },
              },
            } as LegVM,
            {
              transport: {
                carrier: { code: 'LA', name: 'Old Leg Name 2', operatingAirlineCode: 'LA' },
              },
            } as LegVM,
          ],
        } as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].legs[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].legs[1].transport.carrier.name).toBe('LATAM Airlines');
    });

    it('should handle segments without legs', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Old Name', operatingAirlineCode: 'AV' },
          },
          legs: undefined,
        } as unknown as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].legs).toBeUndefined();
    });

    it('should handle segments with empty legs array', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Old Name', operatingAirlineCode: 'AV' },
          },
          legs: [],
        } as unknown as SegmentVM,
      ];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0].transport.carrier.name).toBe('Avianca');
      expect(result[0].legs).toEqual([]);
    });

    it('should preserve immutability when mapping legs', () => {
      const carriers: CarrierVM[] = [{ code: 'AV', name: 'Avianca', externalUrl: '', logo: '' }];

      const originalLeg: LegVM = {
        transport: {
          carrier: { code: 'AV', name: 'Old Leg Name', operatingAirlineCode: 'AV' },
        },
      } as LegVM;

      const originalSegment: SegmentVM = {
        transport: {
          carrier: { code: 'AV', name: 'Old Segment Name', operatingAirlineCode: 'AV' },
        },
        legs: [originalLeg],
      } as SegmentVM;

      const segments: SegmentVM[] = [originalSegment];

      const result = service.mapCarrierNamesInSegments(segments, carriers);

      expect(result[0]).not.toBe(originalSegment);
      expect(result[0].legs[0]).not.toBe(originalLeg);
      expect(originalLeg.transport.carrier.name).toBe('Old Leg Name');
      expect(originalSegment.transport.carrier.name).toBe('Old Segment Name');
    });
  });

  describe('getUniqueOperatingCarriers', () => {
    it('should return unique carrier names', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'LA', name: 'LATAM', operatingAirlineCode: 'LA' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca', 'LATAM']);
    });

    it('should deduplicate carriers with same operatingAirlineCode', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca']);
      expect(result.length).toBe(1);
    });

    it('should fallback to code when operatingAirlineCode is undefined', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'LA', name: 'LATAM Airlines', operatingAirlineCode: undefined },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['LATAM Airlines']);
    });

    it('should handle mixed operatingAirlineCode and code fallbacks', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'LA', name: 'LATAM', operatingAirlineCode: undefined },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'CM', name: 'Copa', operatingAirlineCode: 'CM' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca', 'LATAM', 'Copa']);
    });

    it('should preserve insertion order', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'CM', name: 'Copa', operatingAirlineCode: 'CM' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'LA', name: 'LATAM', operatingAirlineCode: 'LA' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Copa', 'Avianca', 'LATAM']);
    });

    it('should return empty array when segments is empty', () => {
      const result = service.getUniqueOperatingCarriers([]);

      expect(result).toEqual([]);
    });

    it('should return empty array when segments is null', () => {
      const result = service.getUniqueOperatingCarriers(null as any);

      expect(result).toEqual([]);
    });

    it('should deduplicate by code but return first encountered name', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca First', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca Second', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca First']);
    });

    it('should handle single segment', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca']);
    });

    it('should handle segments with different codes but same names', () => {
      const segments: SegmentVM[] = [
        {
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
          },
        } as SegmentVM,
        {
          transport: {
            carrier: { code: 'TP', name: 'Avianca', operatingAirlineCode: 'TP' },
          },
        } as SegmentVM,
      ];

      const result = service.getUniqueOperatingCarriers(segments);

      expect(result).toEqual(['Avianca', 'Avianca']);
      expect(result.length).toBe(2);
    });
  });
});
