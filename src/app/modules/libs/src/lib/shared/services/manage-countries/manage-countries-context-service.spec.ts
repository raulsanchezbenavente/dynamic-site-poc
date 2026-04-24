import { TestBed } from '@angular/core/testing';
import { ManageCountriesContextService } from './manage-countries-context-service';
import { BUSINESS_CONFIG, MANAGE_COUNTRIES_STRATEGY } from '../../injection-tokens';
import { ManageCountriesTypeEnum } from '../../enums/manage-countries/manage-countries-type.enum';
import { IManageCountriesStrategy } from '../../interfaces';
import { BusinessConfig, Country } from '../../model';

const mockStrategy: IManageCountriesStrategy = {
  name: ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_CONFIG_STRATEGY,
  process: jasmine.createSpy('process').and.callFake((data: any) => {
    data.countries = data.countries.map((c: any) => ({ ...c, processed: true }));
    data.maxOrderValue = 1;
  }),
};

const mockBusinessConfig: BusinessConfig = {
  manageCountries: {
    preferredCountriesStrategy: [ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_CONFIG_STRATEGY],
  },
  // ...other config properties
} as any;

const mockCountries: Country[] = [
  { code: 'US', name: 'United States' } as Country,
  { code: 'CA', name: 'Canada' } as Country,
];

describe('ManageCountriesContextService', () => {
  let service: ManageCountriesContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ManageCountriesContextService,
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
        { provide: MANAGE_COUNTRIES_STRATEGY, useValue: [mockStrategy] },
      ],
    });
    service = TestBed.inject(ManageCountriesContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if no suitable strategy found', () => {
    const badConfig = { manageCountries: { preferredCountriesStrategy: ['NON_EXISTENT'] } } as any;
    expect(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ManageCountriesContextService,
          { provide: BUSINESS_CONFIG, useValue: badConfig },
          { provide: MANAGE_COUNTRIES_STRATEGY, useValue: [mockStrategy] },
        ],
      });
      TestBed.inject(ManageCountriesContextService);
    }).toThrowError('No suitable preferred countries strategy found');
  });

  it('should use default strategy if preferredCountriesStrategy is empty', () => {
    const config = { manageCountries: { preferredCountriesStrategy: [] } } as any;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ManageCountriesContextService,
        { provide: BUSINESS_CONFIG, useValue: config },
        { provide: MANAGE_COUNTRIES_STRATEGY, useValue: [mockStrategy] },
      ],
    });
    const svc = TestBed.inject(ManageCountriesContextService);
    const result = svc.processedCountries(mockCountries);
    expect(result.every((c) => (c as any).processed)).toBe(true);
  });
});
