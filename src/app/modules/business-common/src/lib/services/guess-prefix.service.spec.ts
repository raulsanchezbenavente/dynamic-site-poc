import { RfListOption } from 'reactive-forms';

import { CountryResult, PhoneCountryService } from './guess-prefix.service';

describe('PhoneCountryService', () => {
  let service: PhoneCountryService;

  beforeEach(() => {
    service = new PhoneCountryService();
  });

  describe('countryFromPrefix', () => {
    it('returns empty array when inputs are invalid', () => {
      expect(service.countryFromPrefix('abc', '1234')).toEqual([]);
      expect(service.countryFromPrefix('+1', '12 34x')).toEqual([]);
    });

    it('disambiguates NANP prefixes based on available digits', () => {
      expect(service.countryFromPrefix('+1', '12')).toEqual(['US', 'CA']);

      const nanpCases: Array<{ phone: string; expected: CountryResult }> = [
        { phone: '2425550000', expected: 'BS' },
        { phone: '9055556789', expected: 'CA' },
        { phone: '2125551234', expected: 'US' },
      ];

      nanpCases.forEach(({ phone, expected }) => {
        expect(service.countryFromPrefix('1', phone)).toEqual(expected);
      });
    });

    it('handles country codes that share prefixes', () => {
      const sharedPrefixCases: Array<{ prefix: string; phone: string; expected: CountryResult }> = [
        { prefix: '+7', phone: '612345678', expected: 'KZ' },
        { prefix: '7', phone: '512345678', expected: 'RU' },
        { prefix: '39', phone: '066981234', expected: 'VA' },
        { prefix: '39', phone: '123456789', expected: 'IT' },
        { prefix: '44', phone: '16241234', expected: 'IM' },
        { prefix: '44', phone: '12345678', expected: 'GB' },
        { prefix: '61', phone: '89164222', expected: 'CX' },
        { prefix: '61', phone: '89162222', expected: 'CC' },
        { prefix: '61', phone: '212345678', expected: 'AU' },
        { prefix: '262', phone: '2691234', expected: 'YT' },
        { prefix: '262', phone: '8881234', expected: 'RE' },
        { prefix: '290', phone: '81234', expected: 'TA' },
        { prefix: '290', phone: '91234', expected: 'SH' },
        { prefix: '358', phone: '181234', expected: 'AX' },
        { prefix: '358', phone: '221234', expected: 'FI' },
        { prefix: '590', phone: '1234', expected: ['GP', 'BL', 'MF'] },
        { prefix: '599', phone: '91234', expected: 'CW' },
        { prefix: '599', phone: '81234', expected: 'BQ' },
        { prefix: '672', phone: '1', expected: 'AQ' },
        { prefix: '672', phone: '3', expected: 'NF' },
        { prefix: '672', phone: '0', expected: ['AQ', 'NF'] },
        { prefix: '999', phone: '1234', expected: [] },
      ];

      sharedPrefixCases.forEach(({ prefix, phone, expected }) => {
        expect(service.countryFromPrefix(prefix, phone)).toEqual(expected);
      });
    });
  });

  describe('getCountryNameByPrefix', () => {
    const list: RfListOption[] = [
      { value: '+1', content: 'United States (1)' },
      { value: '44', content: 'United Kingdom (44)' },
      { value: '33', content: 'France' },
    ];

    it('returns normalized country names stripped of numeric suffixes', () => {
      expect(service.getCountryNameByPrefix(list, ' +44 ')).toBe('United Kingdom');
      expect(service.getCountryNameByPrefix(list, '+1')).toBe('United States');
    });

    it('returns null when prefix is empty or not found', () => {
      expect(service.getCountryNameByPrefix(list, '')).toBeNull();
      expect(service.getCountryNameByPrefix(list, '999')).toBeNull();
    });
  });

  describe('getCountryCodeByName', () => {
    const list: RfListOption[] = [
      { value: '+34', content: 'España (34)' },
      { value: '+33', content: 'France' },
    ];

    it('matches countries ignoring case, diacritics, and parenthetical suffixes', () => {
      expect(service.getCountryCodeByName(list, 'espana')).toBe('+34');
      expect(service.getCountryCodeByName(list, 'FRANCE')).toBe('+33');
    });

    it('returns null when the country name is not present', () => {
      expect(service.getCountryCodeByName(list, 'Germany')).toBeNull();
    });
  });
});
