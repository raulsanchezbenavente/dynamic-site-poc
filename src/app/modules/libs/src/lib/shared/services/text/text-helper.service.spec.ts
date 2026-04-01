import { TestBed } from '@angular/core/testing';
import { TextHelperService } from './text-helper.service';

describe('TextHelperService', () => {
  let service: TextHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TextHelperService] });
    service = TestBed.inject(TextHelperService);
  });

  describe('getCapitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(service.getCapitalizeWords('john arias')).toBe('John Arias');
    });

    it('should handle extra spaces', () => {
      expect(service.getCapitalizeWords('  john   arias   ')).toBe('John Arias');
    });

    it('should lowercase letters after the first', () => {
      expect(service.getCapitalizeWords('jOhN ARIAS')).toBe('John Arias');
    });

    it('should return empty string for null/undefined/empty input', () => {
      expect(service.getCapitalizeWords('')).toBe('');
      expect(service.getCapitalizeWords(null as unknown as string)).toBe('');
      expect(service.getCapitalizeWords(undefined as unknown as string)).toBe('');
    });
  });

  describe('getLastWordInitialWithDot', () => {
    it('should return initial of the last word with a dot', () => {
      expect(service.getLastWordInitialWithDot('John Arias')).toBe('A.');
    });

    it('should handle extra spaces and multiple words', () => {
      expect(service.getLastWordInitialWithDot('  John   Freddy   Arias  ')).toBe('A.');
    });

    it('should work with single word', () => {
      expect(service.getLastWordInitialWithDot('Arias')).toBe('A.');
    });

    it('should return empty string for null/undefined/empty', () => {
      expect(service.getLastWordInitialWithDot('')).toBe('');
      expect(service.getLastWordInitialWithDot(null as unknown as string)).toBe('');
      expect(service.getLastWordInitialWithDot(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for whitespace-only input (after hardening)', () => {
      expect(service.getLastWordInitialWithDot('   ')).toBe('');
    });
  });

  describe('getInitials', () => {
    it('should return initials from first name and last name', () => {
      expect(service.getInitials('John', 'Arias')).toBe('JA');
      expect(service.getInitials('Jane', 'Doe')).toBe('JD');
    });

    it('should handle multiple names by taking only the first character of each argument', () => {
      expect(service.getInitials('Jose María', 'Lopez')).toBe('JL');
      expect(service.getInitials('María José', 'García López')).toBe('MG');
    });

    it('should handle single name scenarios', () => {
      expect(service.getInitials('John', undefined)).toBe('J');
      expect(service.getInitials(undefined, 'Arias')).toBe('A');
    });

    it('should handle lowercase and mixed case', () => {
      expect(service.getInitials('john', 'arias')).toBe('JA');
      expect(service.getInitials('jOhN', 'aRiAs')).toBe('JA');
    });

    it('should trim spaces from inputs', () => {
      expect(service.getInitials('  John  ', '  Arias  ')).toBe('JA');
    });

    it('should return empty string when both inputs are empty or undefined', () => {
      expect(service.getInitials('', '')).toBe('');
      expect(service.getInitials(undefined, undefined)).toBe('');
      expect(service.getInitials('   ', '   ')).toBe('');
    });
  });

  describe('toCamelCase', () => {
    it('should convert mixed delimiters', () => {
      expect(service.toCamelCase('hello-world_example text')).toBe('helloWorldExampleText');
    });

    it('should return empty string for null/undefined/empty input', () => {
      expect(service.toCamelCase('')).toBe('');
      expect(service.toCamelCase(null as unknown as string)).toBe('');
      expect(service.toCamelCase(undefined as unknown as string)).toBe('');
    });
  });

  describe('toKebabCase', () => {
    it('should trim and collapse dashes', () => {
      expect(service.toKebabCase('  --Hello__World--  ')).toBe('hello-world');
    });

    it('should return empty string for null/undefined/empty input', () => {
      expect(service.toKebabCase('')).toBe('');
      expect(service.toKebabCase(null as unknown as string)).toBe('');
      expect(service.toKebabCase(undefined as unknown as string)).toBe('');
    });
  });

  describe('toCapitalCase', () => {
    it('should return empty string for null/undefined/empty input', () => {
      expect(service.toCapitalCase('')).toBe('');
      expect(service.toCapitalCase(null as unknown as string)).toBe('');
      expect(service.toCapitalCase(undefined as unknown as string)).toBe('');
    });
  });

  describe('normalizeTextSpacing', () => {
    it('should normalize multiple spaces to single space', () => {
      const result = service.normalizeTextSpacing('hello   world');
      expect(result).toBe('hello world');
    });

    it('should trim leading and trailing spaces', () => {
      const result = service.normalizeTextSpacing('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should handle mixed spacing scenarios', () => {
      const result = service.normalizeTextSpacing('  hello   world  test  ');
      expect(result).toBe('hello world test');
    });

    it('should handle single word with spaces', () => {
      const result = service.normalizeTextSpacing('  hello  ');
      expect(result).toBe('hello');
    });

    it('should return empty string for empty input', () => {
      const result = service.normalizeTextSpacing('');
      expect(result).toBe('');
    });

    it('should return empty string for whitespace-only input', () => {
      const result = service.normalizeTextSpacing('   ');
      expect(result).toBe('');
    });

    it('should handle null and undefined inputs', () => {
      expect(service.normalizeTextSpacing(null as any)).toBe('');
      expect(service.normalizeTextSpacing(undefined as any)).toBe('');
    });

    it('should handle tabs and newlines as spaces', () => {
      const result = service.normalizeTextSpacing('hello\t\nworld');
      expect(result).toBe('hello world');
    });

    it('should handle already normalized text', () => {
      const result = service.normalizeTextSpacing('hello world');
      expect(result).toBe('hello world');
    });
  });

  describe('normalizeUrlParameter', () => {
    it('should normalize ñ to n and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('iñaqui');
      expect(result).toBe('inaqui');
    });

    it('should normalize Ñ to n and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('IÑAQUI');
      expect(result).toBe('inaqui');
    });

    it('should remove accents from vowels and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('José María');
      expect(result).toBe('jose maria');
    });

    it('should handle multiple special characters and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('García-López');
      expect(result).toBe('garcia-lopez');
    });

    it('should normalize spacing and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('  Hello   World  ');
      expect(result).toBe('hello world');
    });

    it('should handle empty string', () => {
      const result = service.normalizeUrlParameter('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = service.normalizeUrlParameter(null);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = service.normalizeUrlParameter(undefined);
      expect(result).toBe('');
    });

    it('should preserve hyphens and other valid URL characters and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('García-López');
      expect(result).toBe('garcia-lopez');
    });

    it('should handle text without special characters and convert to lowercase', () => {
      const result = service.normalizeUrlParameter('Doe');
      expect(result).toBe('doe');
    });

    it('should convert uppercase text to lowercase', () => {
      const result = service.normalizeUrlParameter('SMITH');
      expect(result).toBe('smith');
    });
  });

  describe('formatPassengerName', () => {
    it('should capitalize first letter of each word and lowercase the rest', () => {
      expect(service.formatPassengerName('john doe')).toBe('John Doe');
      expect(service.formatPassengerName('JOHN DOE')).toBe('John Doe');
      expect(service.formatPassengerName('jOhN dOe')).toBe('John Doe');
    });

    it('should remove accents from vowels', () => {
      expect(service.formatPassengerName('JOSÉ MARÍA')).toBe('Jose Maria');
      expect(service.formatPassengerName('garcía lópez')).toBe('Garcia Lopez');
      expect(service.formatPassengerName('ÁNGEL MÓNICA')).toBe('Angel Monica');
    });

    it('should replace Ñ/ñ with N/n', () => {
      expect(service.formatPassengerName('MUÑOZ')).toBe('Munoz');
      expect(service.formatPassengerName('PEÑA')).toBe('Pena');
      expect(service.formatPassengerName('niño')).toBe('Nino');
    });

    it('should handle combined accents and ñ', () => {
      expect(service.formatPassengerName('JOSÉ MUÑOZ')).toBe('Jose Munoz');
      expect(service.formatPassengerName('maría peña')).toBe('Maria Pena');
      expect(service.formatPassengerName('ÁNGEL NIÑO GARCÍA')).toBe('Angel Nino Garcia');
    });

    it('should handle extra spaces', () => {
      expect(service.formatPassengerName('  JOSÉ   MARÍA  ')).toBe('Jose Maria');
      expect(service.formatPassengerName('   garcía    muñoz   ')).toBe('Garcia Munoz');
    });

    it('should return empty string for null/undefined/empty input', () => {
      expect(service.formatPassengerName('')).toBe('');
      expect(service.formatPassengerName(null as unknown as string)).toBe('');
      expect(service.formatPassengerName(undefined as unknown as string)).toBe('');
      expect(service.formatPassengerName('   ')).toBe('');
    });

    it('should handle single name', () => {
      expect(service.formatPassengerName('JOSÉ')).toBe('Jose');
      expect(service.formatPassengerName('muñoz')).toBe('Munoz');
    });

    it('should handle names with multiple accented characters', () => {
      expect(service.formatPassengerName('JOSÉ RAMÓN GARCÍA NÚÑEZ')).toBe('Jose Ramon Garcia Nunez');
      expect(service.formatPassengerName('maría josé pérez')).toBe('Maria Jose Perez');
    });
  });
});
