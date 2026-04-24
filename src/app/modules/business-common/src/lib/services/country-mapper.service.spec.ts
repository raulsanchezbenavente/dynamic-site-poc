import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Country, CultureServiceEx, ManageCountriesService, ResourcesRetrieveService } from '@dcx/ui/libs';
import { of, throwError } from 'rxjs';

import { AMBIGUOUS_PREFIX_COUNTRIES } from './guess-prefix.service';
import { ApiCountry, CountriesResponse, UnifiedCountry } from './models/country-lf.models';
import { CountryMapperService } from './country-mapper.service';

describe('CountryMapperService', () => {
  let service: CountryMapperService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let resourcesRetrieveServiceSpy: jasmine.SpyObj<ResourcesRetrieveService>;
  let manageCountryServiceSpy: jasmine.SpyObj<ManageCountriesService>;
  let cultureServiceExSpy: jasmine.SpyObj<CultureServiceEx>;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  const mockCountries: Country[] = [
    {
      code: 'US',
      name: 'United States',
      phonePrefix: '+1',
      currencyCode: 'USD',
      order: 1,
      languages: { 'en-US': 'United States' },
    },
    {
      code: 'ES',
      name: 'Spain',
      phonePrefix: '+34',
      currencyCode: 'EUR',
      order: 2,
      languages: { 'en-US': 'Spain', 'es-ES': 'España' },
    },
    {
      code: 'MX',
      name: 'Mexico',
      phonePrefix: '+52',
      currencyCode: 'MXN',
      order: 3,
      languages: { 'en-US': 'Mexico' },
    },
  ];

  const mockApiCountries: ApiCountry[] = [
    {
      codeIso2: 'US',
      countryCode: 'USA',
      countryName: 'United States',
      defaultLanguage: 'en',
    },
    {
      codeIso2: 'ES',
      countryCode: 'ESP',
      countryName: 'Spain',
      defaultLanguage: 'es',
    },
    {
      codeIso2: 'MX',
      countryCode: 'MEX',
      countryName: 'Mexico',
      defaultLanguage: 'es',
    },
  ];

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    resourcesRetrieveServiceSpy = jasmine.createSpyObj('ResourcesRetrieveService', ['GetCountries']);
    manageCountryServiceSpy = jasmine.createSpyObj('ManageCountriesService', ['getProcessedCountries']);
    cultureServiceExSpy = jasmine.createSpyObj('CultureServiceEx', ['getLanguageAndRegion']);
    consoleErrorSpy = spyOn(console, 'error').and.stub();
    consoleWarnSpy = spyOn(console, 'warn').and.stub();

    // Default mock for CultureServiceEx
    cultureServiceExSpy.getLanguageAndRegion.and.returnValue('en-US');

    TestBed.configureTestingModule({
      providers: [
        CountryMapperService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: ResourcesRetrieveService, useValue: resourcesRetrieveServiceSpy },
        { provide: ManageCountriesService, useValue: manageCountryServiceSpy },
        { provide: CultureServiceEx, useValue: cultureServiceExSpy },
      ],
    });

    service = TestBed.inject(CountryMapperService);
    // Reset cache before each test
    (service as any).countries = [];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('countries getter', () => {
    it('should return empty array initially', () => {
      expect((service as any).countries).toEqual([]);
    });

    it('should return cached countries after loading', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };

      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe(() => {
        expect((service as any).countries).toEqual(mockApiCountries);
        done();
      });
    });
  });

  describe('getCountriesListOptions', () => {
    beforeEach(() => {
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(mockCountries);
    });

    it('should return countries and prefix options without preferred codes', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        expect(result.countriesOptions).toBeDefined();
        expect(result.countryPrefixOptions).toBeDefined();
        expect(result.countriesOptions.length).toBe(3);
        expect(result.countryPrefixOptions.length).toBe(3);
        done();
      });
    });

    it('should place preferred countries at the top', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));

      service.getCountriesListOptions('en-US', ['ES', 'MX']).subscribe((result) => {
        expect(result.countriesOptions[0].value).toBe('ES');
        expect(result.countriesOptions[0].preferred).toBe(true);
        expect(result.countriesOptions[1].value).toBe('MX');
        expect(result.countriesOptions[1].preferred).toBe(true);
        done();
      });
    });

    it('should handle same origin and destination country', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));

      service.getCountriesListOptions('en-US', ['ES', 'ES']).subscribe((result) => {
        const preferredCount = result.countriesOptions.filter((opt) => opt.preferred).length;
        expect(preferredCount).toBe(1);
        expect(result.countriesOptions[0].value).toBe('ES');
        done();
      });
    });

    it('should sort countries alphabetically after preferred ones', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));

      service.getCountriesListOptions('en-US', ['ES']).subscribe((result) => {
        const nonPreferredOptions = result.countriesOptions.filter((opt) => !opt.preferred);
        expect(nonPreferredOptions[0].content).toBe('Mexico');
        expect(nonPreferredOptions[1].content).toBe('Spain');
        expect(nonPreferredOptions[2].content).toBe('United States');
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(throwError(() => new Error('Network error')));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue([]);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        expect(result.countriesOptions).toEqual([]);
        expect(result.countryPrefixOptions).toEqual([]);
        done();
      });
    });

    it('should create country prefix options with name and prefix', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        const usOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'US');
        expect(usOption?.content).toBe('United States (+1)');
        expect(usOption?.value).toBe('+1');
        done();
      });
    });

    it('should handle countries with missing data', (done) => {
      const incompleteCountries: Country[] = [
        { code: null, name: null, phonePrefix: null } as any,
        { code: 'ES', name: 'Spain', phonePrefix: '+34' } as any,
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(incompleteCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(incompleteCountries);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        expect(result.countriesOptions.some((opt) => opt.value === 'Unknown')).toBe(true);
        done();
      });
    });

    it('should append country code to ambiguous prefix in countryPrefixOptions', (done) => {
      const countriesWithAmbiguous: Country[] = [
        { code: 'US', name: 'United States', phonePrefix: '1', currencyCode: 'USD', order: 1, languages: {} },
        { code: 'CA', name: 'Canada', phonePrefix: '1', currencyCode: 'CAD', order: 2, languages: {} },
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(countriesWithAmbiguous));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(countriesWithAmbiguous);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        const usOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'US');
        const caOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'CA');
        expect(usOption?.value).toBe('1-US');
        expect(caOption?.value).toBe('1-CA');
        done();
      });
    });

    it('should NOT append country code when prefix is not ambiguous', (done) => {
      const nonAmbiguousCountries: Country[] = [
        { code: 'CO', name: 'Colombia', phonePrefix: '57', currencyCode: 'COP', order: 1, languages: {} },
        { code: 'ES', name: 'Spain', phonePrefix: '34', currencyCode: 'EUR', order: 2, languages: {} },
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(nonAmbiguousCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(nonAmbiguousCountries);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        const coOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'CO');
        const esOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'ES');
        expect(coOption?.value).toBe('57');
        expect(esOption?.value).toBe('34');
        done();
      });
    });

    it('should NOT append country code when prefix is ambiguous but country code is missing', (done) => {
      const countryWithoutCode: Country[] = [
        { code: null as any, name: 'Unknown Country', phonePrefix: '1', currencyCode: '', order: 1, languages: {} },
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(countryWithoutCode));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(countryWithoutCode);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        expect(result.countryPrefixOptions[0]?.value).toBe('1');
        done();
      });
    });

    it('should cover all ambiguous prefixes defined in AMBIGUOUS_PREFIX_COUNTRIES', (done) => {
      const ambiguousCountries: Country[] = AMBIGUOUS_PREFIX_COUNTRIES.map((prefix, i) => ({
        code: `C${i}`,
        name: `Country ${i}`,
        phonePrefix: prefix,
        currencyCode: '',
        order: i,
        languages: {},
      }));
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(ambiguousCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(ambiguousCountries);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        AMBIGUOUS_PREFIX_COUNTRIES.forEach((prefix, i) => {
          const option = result.countryPrefixOptions.find((opt: any) => opt.code === `C${i}`);
          expect(option?.value).toBe(`${prefix}-C${i}`);
        });
        done();
      });
    });

    it('should preserve original phonePrefix in content even when value is disambiguated', (done) => {
      const countriesWithAmbiguous: Country[] = [
        { code: 'GB', name: 'United Kingdom', phonePrefix: '44', currencyCode: 'GBP', order: 1, languages: {} },
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(countriesWithAmbiguous));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(countriesWithAmbiguous);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        const gbOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'GB');
        expect(gbOption?.value).toBe('44-GB');
        expect(gbOption?.content).toBe('United Kingdom (44)');
        done();
      });
    });

    it('should expose country code property in prefix options', (done) => {
      const countries: Country[] = [
        { code: 'AU', name: 'Australia', phonePrefix: '61', currencyCode: 'AUD', order: 1, languages: {} },
      ];
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(countries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(countries);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        const auOption = result.countryPrefixOptions.find((opt: any) => opt.code === 'AU');
        expect(auOption?.value).toBe('61-AU');
        expect((auOption as any).code).toBe('AU');
        done();
      });
    });
  });

  describe('getCountiesUsingResourceClient', () => {
    beforeEach(() => {
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(mockCountries);
    });

    it('should return countries and prefix options', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.getCountiesUsingResourceClient('en-US', 'ES').subscribe((result) => {
        expect(result.countriesOptions).toBeDefined();
        expect(result.countryPrefixOptions).toBeDefined();
        expect(result.countriesOptions.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should mark preferred country correctly', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.getCountiesUsingResourceClient('en-US', 'ES').subscribe((result) => {
        const preferredCountry = result.countriesOptions.find((opt) => opt.value === 'ES');
        expect(preferredCountry?.preferred).toBe(true);
        done();
      });
    });

    it('should append country code to ambiguous prefixes', (done) => {
      const countriesWithAmbiguousPrefix: Country[] = [
        {
          code: 'US',
          name: 'United States',
          phonePrefix: '1',
          currencyCode: 'USD',
          order: 1,
          languages: {},
        },
        {
          code: 'CA',
          name: 'Canada',
          phonePrefix: '1',
          currencyCode: 'CAD',
          order: 2,
          languages: {},
        },
      ];

      const mockApiCountriesWithCA: ApiCountry[] = [
        {
          codeIso2: 'US',
          countryCode: 'USA',
          countryName: 'United States',
          defaultLanguage: 'en',
        },
        {
          codeIso2: 'CA',
          countryCode: 'CAN',
          countryName: 'Canada',
          defaultLanguage: 'en',
        },
      ];

      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountriesWithCA,
      };

      httpClientSpy.get.and.returnValue(of(mockResponse));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(countriesWithAmbiguousPrefix);

      service.getCountiesUsingResourceClient('en-US', 'US').subscribe((result) => {
        const usPrefix = result.countryPrefixOptions.find((opt) => opt.value === '1-US');
        const caPrefix = result.countryPrefixOptions.find((opt) => opt.value === '1-CA');

        expect(usPrefix).toBeDefined();
        expect(caPrefix).toBeDefined();
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      httpClientSpy.get.and.returnValue(throwError(() => new Error('API error')));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue([]);

      service.getCountiesUsingResourceClient('en-US', 'ES').subscribe((result) => {
        expect(result.countriesOptions).toEqual([]);
        expect(result.countryPrefixOptions).toEqual([]);
        done();
      });
    });

    it('should sort countries alphabetically by name', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.getCountiesUsingResourceClient('en-US', '').subscribe((result) => {
        for (let i = 0; i < result.countriesOptions.length - 1; i++) {
          const current = String(result.countriesOptions[i].content);
          const next = String(result.countriesOptions[i + 1].content);
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
        done();
      });
    });
  });

  describe('loadUnifiedCountries', () => {
    it('should load countries from API when cache is empty', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result).toBeDefined();
        expect(result.length).toBe(3);
        expect(httpClientSpy.get).toHaveBeenCalledWith('/configuration/api/v1/Countries?culture=en-US');
        expect(cultureServiceExSpy.getLanguageAndRegion).toHaveBeenCalled();
        done();
      });
    });

    it('should return cached countries if already loaded', (done) => {
      // Explicitly ensure cache is empty before starting
      (service as any).countries = [];

      // First load to populate the cache
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((firstResult) => {
        // Verify cache is populated
        expect((service as any).countries.length).toBe(3);
        const cachedData = [...(service as any).countries];

        // Reset the spy to verify it's not called again
        httpClientSpy.get.calls.reset();

        // Second call should return same cached data without HTTP call
        service.loadUnifiedCountries().subscribe((secondResult) => {
          expect(secondResult.length).toBe(3);
          expect(secondResult[0].code).toBeDefined();
          expect(secondResult[0].name).toBeDefined();
          // Verify cache is still the same
          expect((service as any).countries).toEqual(cachedData);
          // Verify both results are equivalent
          expect(secondResult.length).toBe(firstResult.length);
          // Verify no HTTP call was made on second invocation
          expect(httpClientSpy.get).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('should transform API countries to unified format', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        const usCountry = result.find((c) => c.code === 'US');
        expect(usCountry).toBeDefined();
        expect(usCountry?.name).toBe('United States');
        expect(usCountry?.phonePrefix).toBeDefined();
        expect(usCountry?.languages).toBeDefined();
        done();
      });
    });

    it('should handle empty countries array', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: [],
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle API errors and return empty array', (done) => {
      httpClientSpy.get.and.returnValue(throwError(() => new Error('Network error')));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should sort unified countries alphabetically by name', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0);
        }
        done();
      });
    });

    it('should skip countries without ISO2 code', (done) => {
      const countriesWithInvalid: ApiCountry[] = [
        ...mockApiCountries,
        { codeIso2: '', countryCode: 'XXX', countryName: 'Invalid', defaultLanguage: 'en' },
      ];
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: countriesWithInvalid,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result.length).toBe(3);
        expect(result.find((c) => c.code === '')).toBeUndefined();
        done();
      });
    });

    it('should set default language entries for all languages', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        const country = result[0];
        expect(country.languages['en-US']).toBeDefined();
        expect(country.languages['es-ES']).toBeDefined();
        expect(country.languages['fr-FR']).toBeDefined();
        expect(country.languages['pt-BR']).toBeDefined();
        done();
      });
    });

    it('should use culture from CultureServiceEx', (done) => {
      cultureServiceExSpy.getLanguageAndRegion.and.returnValue('es-CO');
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe(() => {
        expect(httpClientSpy.get).toHaveBeenCalledWith('/configuration/api/v1/Countries?culture=es-CO');
        done();
      });
    });

    it('should handle null or undefined countries in response', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: undefined as any,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('isCountryInLifemilesList', () => {
    beforeEach((done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe(() => {
        done();
      });
    });

    it('should return true for existing country code', () => {
      expect(service.isCountryInLifemilesList('US')).toBe(true);
      expect(service.isCountryInLifemilesList('ES')).toBe(true);
      expect(service.isCountryInLifemilesList('MX')).toBe(true);
    });

    it('should return false for non-existing country code', () => {
      expect(service.isCountryInLifemilesList('XX')).toBe(false);
      expect(service.isCountryInLifemilesList('ZZ')).toBe(false);
    });

    it('should handle lowercase country codes', () => {
      expect(service.isCountryInLifemilesList('us')).toBe(true);
      expect(service.isCountryInLifemilesList('es')).toBe(true);
    });

    it('should handle country codes with whitespace', () => {
      expect(service.isCountryInLifemilesList(' US ')).toBe(true);
      expect(service.isCountryInLifemilesList('  ES  ')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(service.isCountryInLifemilesList('')).toBe(false);
    });

    it('should return false before countries are loaded', () => {
      // Create a completely fresh service by resetting the TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          CountryMapperService,
          { provide: HttpClient, useValue: httpClientSpy },
          { provide: ResourcesRetrieveService, useValue: resourcesRetrieveServiceSpy },
          { provide: ManageCountriesService, useValue: manageCountryServiceSpy },
          { provide: CultureServiceEx, useValue: cultureServiceExSpy },
        ],
      });
      const freshService = TestBed.inject(CountryMapperService);
      // Ensure cache is empty
      (freshService as any).countries = [];

      expect(freshService.isCountryInLifemilesList('US')).toBe(false);
    });
  });

  describe('private methods - sortOptionsWithPreferredFirst', () => {
    it('should sort options with preferred items first', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(mockCountries);

      service.getCountriesListOptions('en-US', ['MX']).subscribe((result) => {
        expect(result.countriesOptions[0].value).toBe('MX');
        expect(result.countriesOptions[0].preferred).toBe(true);

        // The preferred item should also appear in alphabetical order later
        const mexicoInAlphabetical = result.countriesOptions.find(
          (opt, idx) => idx > 0 && opt.value === 'MX' && !opt.preferred
        );
        expect(mexicoInAlphabetical).toBeDefined();
        done();
      });
    });

    it('should maintain alphabetical order for non-preferred items', (done) => {
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(mockCountries);

      service.getCountriesListOptions('en-US', ['ES']).subscribe((result) => {
        const nonPreferredItems = result.countriesOptions.slice(1);

        for (let i = 0; i < nonPreferredItems.length - 1; i++) {
          const current = String(nonPreferredItems[i].content);
          const next = String(nonPreferredItems[i + 1].content);
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
        done();
      });
    });
  });

  describe('private methods - toUnified', () => {
    it('should cache countries in countries', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      expect((service as any).countries.length).toBe(0);

      service.loadUnifiedCountries().subscribe(() => {
        expect((service as any).countries.length).toBe(3);
        expect((service as any).countries).toEqual(mockApiCountries);
        done();
      });
    });

    it('should convert ISO2 codes to uppercase', (done) => {
      const mixedCaseCountries: ApiCountry[] = [
        { codeIso2: 'us', countryCode: 'USA', countryName: 'United States', defaultLanguage: 'en' },
        { codeIso2: 'Es', countryCode: 'ESP', countryName: 'Spain', defaultLanguage: 'es' },
      ];
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mixedCaseCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result.find((c) => c.code === 'US')).toBeDefined();
        expect(result.find((c) => c.code === 'ES')).toBeDefined();
        expect(result.find((c) => c.code === 'us')).toBeUndefined();
        done();
      });
    });

    it('should trim country names', (done) => {
      const countriesWithSpaces: ApiCountry[] = [
        { codeIso2: 'US', countryCode: 'USA', countryName: '  United States  ', defaultLanguage: 'en' },
      ];
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: countriesWithSpaces,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.loadUnifiedCountries().subscribe((result) => {
        expect(result[0].name).toBe('United States');
        expect(result[0].name.startsWith(' ')).toBe(false);
        expect(result[0].name.endsWith(' ')).toBe(false);
        done();
      });
    });
  });

  describe('edge cases and integration', () => {
    it('should handle multiple calls to different methods concurrently', (done) => {
      const mockResponse: CountriesResponse = {
        companyCode: 'TEST',
        entityCode: 'TEST',
        countries: mockApiCountries,
      };
      httpClientSpy.get.and.returnValue(of(mockResponse));
      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(mockCountries));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(mockCountries);

      let completedCalls = 0;
      const checkDone = () => {
        completedCalls++;
        if (completedCalls === 3) {
          done();
        }
      };

      service.loadUnifiedCountries().subscribe(() => checkDone());
      service.getCountriesListOptions('en-US', ['ES']).subscribe(() => checkDone());
      service.getCountiesUsingResourceClient('en-US', 'MX').subscribe(() => checkDone());
    });

    it('should handle very large country lists', (done) => {
      const largeCountryList: Country[] = Array.from({ length: 250 }, (_, i) => ({
        code: `C${i}`,
        name: `Country ${i}`,
        phonePrefix: `+${i}`,
        currencyCode: 'XXX',
        order: i,
        languages: {},
      }));

      resourcesRetrieveServiceSpy.GetCountries.and.returnValue(of(largeCountryList));
      manageCountryServiceSpy.getProcessedCountries.and.returnValue(largeCountryList);

      service.getCountriesListOptions('en-US', []).subscribe((result) => {
        expect(result.countriesOptions.length).toBe(250);
        expect(result.countryPrefixOptions.length).toBe(250);
        done();
      });
    });
  });
});
