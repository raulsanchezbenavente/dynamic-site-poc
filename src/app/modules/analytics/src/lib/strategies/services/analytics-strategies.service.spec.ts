import { TestBed } from '@angular/core/testing';
import { AnalyticsStrategiesService } from './analytics-strategies.service';
import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';
import { ANALYTICS_EXPECTED_KEYS_MAP } from '../../tokens/analytics-expected-keys.token';

const MOCK_EXPECTED_KEYS_MAP: Readonly<Record<string, readonly string[]>> = {
  mock_event_a: ['k1', 'k2', 'k3'],
  mock_event_b: [],
};

describe('AnalyticsStrategiesService', () => {
  let service: AnalyticsStrategiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyticsStrategiesService,
        { provide: ANALYTICS_EXPECTED_KEYS_MAP, useValue: MOCK_EXPECTED_KEYS_MAP },
      ],
    });
    service = TestBed.inject(AnalyticsStrategiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('normalizeEvent', () => {
    const [firstEventTypeKey] = Object.keys(MOCK_EXPECTED_KEYS_MAP) as Array<
      keyof typeof MOCK_EXPECTED_KEYS_MAP
    >;

    const expectedKeysForFirstType = MOCK_EXPECTED_KEYS_MAP[firstEventTypeKey] || [];

    it('should include send_to with the event account if valid', () => {
      const event: AnalyticsEvent<string> = {
        eventName: firstEventTypeKey as string,
        account: 'G-ABCDEF1234',
        data: {
          foo: 'bar',
        },
      };

      const normalized = service.normalizeEvent(event, 'UA-999999-1');

      expect(normalized['send_to']).toBe('G-ABCDEF1234');
      expect(normalized['foo']).toBe('bar');
    });

    it('should use the parameter account if the event account is not valid', () => {
      const event: AnalyticsEvent<string> = {
        eventName: firstEventTypeKey as string,
        account: 'INVALID',
        data: {},
      };

      const normalized = service.normalizeEvent(event, 'UA-123456-1');

      expect(normalized['send_to']).toBe('UA-123456-1');
    });

    it('should not include send_to if no account is valid', () => {
      const event: AnalyticsEvent<string> = {
        eventName: firstEventTypeKey as string,
        account: 'INVALID',
        data: {},
      };

      const normalized = service.normalizeEvent(event, 'ALSO_INVALID');

      expect(normalized['send_to']).toBeUndefined();
    });

    it('should fill with null all missing expectedKeys', () => {
      const data: Record<string, any> = { extraProp: 'value' };

      if (expectedKeysForFirstType.length > 0) {
        data[expectedKeysForFirstType[0]] = 'present';
      }

      const event: AnalyticsEvent<string> = {
        eventName: firstEventTypeKey as string,
        data,
      };

      const normalized = service.normalizeEvent(event);

      expect(normalized['extraProp']).toBe('value');
      if (expectedKeysForFirstType.length > 0) {
        expect(normalized[expectedKeysForFirstType[0]]).toBe('present');
      }

      expectedKeysForFirstType.slice(1).forEach((key) => {
        expect(normalized[key]).toBeNull();
      });
    });

    it('should not add keys if there are no expectedKeys for that eventType', () => {
      const unknownType = '___UNKNOWN_EVENT___' as string;

      const event: AnalyticsEvent<string> = {
        eventName: unknownType,
        data: { foo: 'bar' },
      };

      const normalized = service.normalizeEvent(event);

      expect(normalized['foo']).toBe('bar');
      expect(Object.keys(normalized)).not.toContain('send_to'); // there were no valid accounts
    });
  });

  describe('isValidGoogleAnalyticsAccount (private)', () => {
    it('should accept valid UA IDs', () => {
      const isValid = (service as any).isValidGoogleAnalyticsAccount.bind(service);

      expect(isValid('UA-123456-1')).toBeTrue();
      expect(isValid('UA-1234567890-10')).toBeTrue();
    });

    it('should accept valid G- IDs', () => {
      const isValid = (service as any).isValidGoogleAnalyticsAccount.bind(service);

      expect(isValid('G-ABCDEFG12')).toBeTrue();
      expect(isValid('G-ABC123DEF45')).toBeTrue();
    });

    it('should reject invalid accounts', () => {
      const isValid = (service as any).isValidGoogleAnalyticsAccount.bind(service);

      expect(isValid(undefined)).toBeFalse();
      expect(isValid(null)).toBeFalse();
      expect(isValid('')).toBeFalse();
      expect(isValid('UA-123-1')).toBeFalse();
      expect(isValid('G-abc12345')).toBeFalse();
      expect(isValid('G-123456')).toBeFalse();
      expect(isValid('NOT_AN_ACCOUNT')).toBeFalse();
    });
  });
});
