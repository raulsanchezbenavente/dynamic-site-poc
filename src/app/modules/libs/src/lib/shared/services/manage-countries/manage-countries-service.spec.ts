import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BUSINESS_CONFIG } from '../../injection-tokens';
import { ManageCountriesService } from './manage-countries-service';
import { ManageCountriesContextService } from './manage-countries-context-service';
import { BusinessConfig, Country } from '../../model';

describe('ManageCountriesService', () => {
  let service: ManageCountriesService;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockContextService: jasmine.SpyObj<ManageCountriesContextService>;

  const mockBusinessConfig: BusinessConfig = {
    path_CDN: 'https://cdn/',
    manageCountries: {
      enableFlags: true,
      assetsPath: 'flags/{country.code}.svg',
    },
  } as any;

  const countries: Country[] = [
    { code: 'US', name: 'United States', languages: { en: 'United States', es: 'Estados Unidos' } } as Country,
    { code: 'CA', name: 'Canada', languages: { en: 'Canada', fr: 'Canada' } } as Country,
  ];

  beforeEach(() => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockContextService = jasmine.createSpyObj('ManageCountriesContextService', ['processedCountries']);
    TestBed.configureTestingModule({
      providers: [
        ManageCountriesService,
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ManageCountriesContextService, useValue: mockContextService },
      ],
    });
    service = TestBed.inject(ManageCountriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should translate country names and process countries', () => {
    mockTranslateService.instant.and.returnValue('Translated');
    mockContextService.processedCountries.and.callFake((input) => input);
    const result = service.getProcessedCountries([...countries], 'en');
    expect(result[0].name).toBe('United States');
    expect(result[1].name).toBe('Canada');
    expect(mockContextService.processedCountries).toHaveBeenCalled();
  });

  it('should set country image src if enableFlags is true', () => {
    mockTranslateService.instant.and.returnValue('Translated');
    mockContextService.processedCountries.and.callFake((input) => input);
    const result = service.getProcessedCountries([...countries], 'en');
    expect(result[0].image).toContain('flags/us.svg');
    expect(result[1].image).toContain('flags/ca.svg');
  });

  it('should get country name translation from languages', () => {
    mockTranslateService.instant.and.returnValue('Translated');
    const country = { code: 'US', name: 'United States', languages: { es: 'Estados Unidos' } } as Country;
    const name = (service as any).getCountryNameTranslation(country, 'es');
    expect(name).toBe('Estados Unidos');
  });

  it('should fallback to translationValue if no language match', () => {
    mockTranslateService.instant.and.returnValue('Translated');
    const country = { code: 'US', name: 'United States', languages: { fr: 'Etats-Unis' } } as Country;
    const name = (service as any).getCountryNameTranslation(country, 'es');
    expect(name).toBe('United States');
  });

  it('should get translation by language exact and partial match', () => {
    const languages = { en: 'English', es: 'Español', enUS: 'American English' };
    const exact = (service as any).getTranslationByLanguage(languages, 'en');
    const partial = (service as any).getTranslationByLanguage(languages, 'enUS');
    expect(exact).toBe('English');
    expect(partial).toBe('American English');
  });
});
