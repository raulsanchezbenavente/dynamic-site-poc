import { TestBed } from '@angular/core/testing';
import { AccountV2Client } from '@dcx/module/api-clients';
import {
  AuthService,
  BROWSER_COUNTRY,
  BROWSER_LANGUAGE,
  BROWSER_REGION,
  CultureHelperService,
  CultureService,
  PointOfSaleService,
} from '@dcx/ui/libs';
import { of } from 'rxjs';

import { CutureConfigService } from './cuture-config.service';

describe('CutureConfigService', () => {
  let service: CutureConfigService;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPointOfSaleService: jasmine.SpyObj<PointOfSaleService>;
  let mockAccountClientV2: jasmine.SpyObj<AccountV2Client>;
  let mockCultureService: jasmine.SpyObj<CultureService>;
  let mockCultureHelper: jasmine.SpyObj<CultureHelperService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticatedKeycloak$']);
    mockPointOfSaleService = jasmine.createSpyObj('PointOfSaleService', ['getCurrentPointOfSale']);
    mockAccountClientV2 = jasmine.createSpyObj('AccountV2Client', ['sessionGET']);
    mockCultureService = jasmine.createSpyObj('CultureService', ['setCulture']);
    mockCultureHelper = jasmine.createSpyObj('CultureHelperService', [
      'getShortDateFormat',
      'getLongDateFormat',
      'getTimeFormat',
      'is24HourFormat',
      'getFirstDayOfWeek',
      'getDecimalSeparator',
      'getThousandsSeparator',
      'getNameOrder',
      'getCurrencyFromLocale',
      'getDirection',
    ]);

    mockPointOfSaleService.getCurrentPointOfSale.and.returnValue({ currency: { code: 'usd' } } as any);
    mockCultureHelper.getShortDateFormat.and.returnValue('DD/MM/YYYY');
    mockCultureHelper.getLongDateFormat.and.returnValue('MMMM D, YYYY');
    mockCultureHelper.getTimeFormat.and.returnValue('HH:mm');
    mockCultureHelper.is24HourFormat.and.returnValue(true);
    mockCultureHelper.getFirstDayOfWeek.and.returnValue(1);
    mockCultureHelper.getDecimalSeparator.and.returnValue('.');
    mockCultureHelper.getThousandsSeparator.and.returnValue(',');
    mockCultureHelper.getNameOrder.and.returnValue('FIRST_LAST' as any);
    mockCultureHelper.getCurrencyFromLocale.and.returnValue('USD');
    mockCultureHelper.getDirection.and.returnValue('LEFT_TO_RIGHT' as any);

    TestBed.configureTestingModule({
      providers: [
        CutureConfigService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: PointOfSaleService, useValue: mockPointOfSaleService },
        { provide: AccountV2Client, useValue: mockAccountClientV2 },
        { provide: CultureService, useValue: mockCultureService },
        { provide: CultureHelperService, useValue: mockCultureHelper },
      ],
    });

    service = TestBed.inject(CutureConfigService);
  });

  it('sets culture using session data when authenticated', () => {
    mockAuthService.isAuthenticatedKeycloak$.and.returnValue(of(true));
    mockAccountClientV2.sessionGET.and.returnValue(
      of({
        result: {
          data: {
            accountSettings: { language: 'ES' },
            nationality: 'CO',
          },
        },
      } as any)
    );

    service.setInitialCulture();

    expect(mockAccountClientV2.sessionGET).toHaveBeenCalledWith('2');
    expect(mockCultureService.setCulture).toHaveBeenCalledWith(
      jasmine.objectContaining({
        language: 'es',
        locale: 'es-CO',
        currency: 'USD',
      })
    );
  });

  it('sets culture using browser fallbacks when unauthenticated', () => {
    mockAuthService.isAuthenticatedKeycloak$.and.returnValue(of(false));

    service.setInitialCulture();

    expect(mockAccountClientV2.sessionGET).not.toHaveBeenCalled();
    expect(mockCultureService.setCulture).toHaveBeenCalledWith(
      jasmine.objectContaining({
        language: BROWSER_LANGUAGE,
        locale: `${BROWSER_LANGUAGE}-${BROWSER_COUNTRY}`,
        region: BROWSER_REGION,
      })
    );
  });
});
