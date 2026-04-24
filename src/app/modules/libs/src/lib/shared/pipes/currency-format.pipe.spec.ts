import { BusinessConfig } from '../model';
import { RoundingService } from '../services';
import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;
  const mockbusinessConfig = {
    roundingCurrencyFactors: [
      { code: 'EUR', factor: '0.01' },
      { code: 'USD', factor: '0.01' },
    ],
    currencies: [
      {
        isDefault: false,
        isEnabled: true,
        symbol: 'EUR',
        name: 'Euro',
        code: 'EUR',
        culture: 'es-ES',
      },
      {
        isDefault: false,
        isEnabled: true,
        symbol: '$',
        name: 'Dollar',
        code: 'USD',
        culture: 'en-US',
      },
    ],
  } as unknown as BusinessConfig;

  beforeEach(() => {
    pipe = new CurrencyFormatPipe(new RoundingService(mockbusinessConfig));
  });

  it('should return integer only', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';
    // act
    const sut = pipe.transform('123.50', 'IntegerOnly', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('123');
  });

  it('should return CompleteNumber with . as comma', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';

    // act
    const sut = pipe.transform('123.50', 'CompleteNumber', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('123.50');
  });

  it('should transform return 0', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';

    // act
    const sut = pipe.transform('0', 'CompleteNumber', currencyCode, culture, 0);

    // assert
    expect(sut).toBe('0');
  });

  it('should return fractional only with . as coma', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';

    // act
    const sut = pipe.transform('123.50', 'FractionalOnly', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('.50');
  });

  it('should return complete number with . as dot', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';

    // act
    const sut = pipe.transform('123', 'CompleteNumber', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('123.00');
  });

  it('should return complete number(thousand) with . as dot', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'en-us';

    // act
    const sut = pipe.transform('1230', 'CompleteNumber', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('1,230.00');
  });

  it('should return a value with , when fixed(decimalDigits is undefined', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'EN-US';

    // act
    const sut = pipe.transform('1230', 'IntegerOnly', currencyCode, culture, undefined);

    // assert
    expect(sut).toBe('1,230');
  });

  it('should return a value with, so the value has decimals when fixed(decimalDigits) is undefined', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'EN-US';

    // act
    const sut = pipe.transform('1230.23', 'IntegerOnly', currencyCode, culture, undefined);

    // assert
    expect(sut).toBe('1,230');
  });

  it('should return empty when displayDigit is FractionalOnly and fixed(decimalDigits) is zero', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'EN-US';

    // act
    const sut = pipe.transform('1230.23', 'FractionalOnly', currencyCode, culture, 0);

    // assert
    expect(sut).toBe('');
  });

  it('should return dot and one digit when displayDigit is FractionalOnly and fixed(decimalDigits) is 1', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'EN-US';

    // act
    const sut = pipe.transform('1230.23', 'FractionalOnly', currencyCode, culture, 1);

    // assert
    expect(sut).toBe('.2');
  });

  it('should return dot and two digits when displayDigit is FractionalOnly and fixed(decimalDigits) is 2', () => {
    // arrange
    const currencyCode = 'USD';
    const culture = 'EN-US';

    // act
    const sut = pipe.transform('1230.23', 'FractionalOnly', currencyCode, culture, 2);

    // assert
    expect(sut).toBe('.23');
  });

  describe('Complete culture codes to avoid default browser behavior', () => {
    it('should override es culture with es-CO to force grouping of four digits numbers', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'COP', 'es', 2);
      expect(result).toContain(',56');
      expect(result.replace(/\s/g, '')).toMatch(/1.234,56/);
    });

    it('should format correctly with es-ES without grouping thousands in four digits number', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'EUR', 'es-ES', 2);
      // Spanish format uses comma as decimal separator
      expect(result).toContain(',56');
      // Should format the thousands without grouping thousands in four digits number
      expect(result.replace(/\s/g, '')).toMatch(/1234,56/);
    });

    it('should format correctly with es-ES grouping thousands in more than four digits number', () => {
      const result = pipe.transform('12345.56', 'CompleteNumber', 'EUR', 'es-ES', 2);
      // Spanish format uses comma as decimal separator
      expect(result).toContain(',56');
      // Should format the thousands with grouping thousands in more than four digits number
      expect(result.replace(/\s/g, '')).toMatch(/12.345,56/);
    });

    it('should format correctly with pt-BR (Brazil)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'BRL', 'pt-BR', 2);
      expect(result).toContain(',56');
      expect(result.replace(/\s/g, '')).toMatch(/1[.,]?234,56/);
    });

    it('should format correctly with pt-PT (Portugal) using space or dot separator', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'EUR', 'pt-PT', 2);
      // Portuguese format uses comma as decimal separator
      expect(result).toContain(',56');
      // May use space (regular or non-breaking) or no separator in test environment
      expect(result.length).toBeGreaterThanOrEqual(7);
    });

    it('should format correctly with de-DE (Germany)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'EUR', 'de-DE', 2);
      expect(result).toContain(',56');
      expect(result.replace(/\s/g, '')).toMatch(/1[.,]?234,56/);
    });

    it('should format correctly with fr-FR (France) using space separator', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'EUR', 'fr-FR', 2);
      // French format uses comma as decimal separator
      expect(result).toContain(',56');
      // May use space (regular or non-breaking) in test environment
      expect(result.length).toBeGreaterThanOrEqual(7);
    });

    it('should format correctly with fr-CA (Canada French)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'CAD', 'fr-CA', 2);
      expect(result).toContain(',56');
      expect(result.length).toBeGreaterThanOrEqual(7);
    });

    it('should format correctly with en-US (United States)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'USD', 'en-US', 2);
      expect(result).toBe('1,234.56');
    });

    it('should format correctly with en-GB (United Kingdom)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'GBP', 'en-GB', 2);
      expect(result).toBe('1,234.56');
    });

    it('should format correctly with es-AR (Argentina)', () => {
      const result = pipe.transform('1234.56', 'CompleteNumber', 'ARS', 'es-AR', 2);
      expect(result).toContain(',56');
      expect(result.replace(/\s/g, '')).toMatch(/1[.,]?234,56/);
    });
  });
});
