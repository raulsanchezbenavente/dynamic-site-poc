import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomerAccount, CustomerLoyaltyService, LoyaltyTranslationKeys } from '@dcx/ui/business-common';
import { CultureServiceEx, TextHelperService } from '@dcx/ui/libs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { of } from 'rxjs';

import { LoyaltyOverviewCardBuilderService } from './loyalty-overview-card-builder.service';
import { LoyaltyOverviewCardTranslationKeys } from '../enums/loyalty-overview-card-translation-keys.enum';
import { LoyaltyOverviewCardBuilderData } from '../models/loyalty-overview-card-builder-data.model';

dayjs.extend(utc);

describe('LoyaltyOverviewCardBuilderService', () => {
  let service: LoyaltyOverviewCardBuilderService;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTextHelperService: jasmine.SpyObj<TextHelperService>;
  let mockCustomerLoyaltyService: jasmine.SpyObj<CustomerLoyaltyService>;

  const mockAccount: CustomerAccount = {
    firstName: 'john',
    middleName: 'michael',
    lastName: 'doe',
    username: 'johndoe',
    customerNumber: '123456',
    dateOfBirth: '1990-01-01',
    balance: {
      lifemiles: {
        amount: 15000,
        expiryDate: new Date('2026-12-31T00:00:00Z'),
      },
    },
    customerPrograms: {
      lifemiles: {
        programNumber: 'LM123456789',
        tier: 'Gold',
      },
    },
  };

  beforeEach(() => {
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getUserCulture']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['getCapitalizeWords']);
    mockCustomerLoyaltyService = jasmine.createSpyObj('CustomerLoyaltyService', [
      'formatLoyaltyBalance',
      'getCustomerProgramData',
    ]);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LoyaltyOverviewCardBuilderService,
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TextHelperService, useValue: mockTextHelperService },
        { provide: CustomerLoyaltyService, useValue: mockCustomerLoyaltyService },
      ],
    });

    service = TestBed.inject(LoyaltyOverviewCardBuilderService);

    // Setup default mock responses
    mockCultureServiceEx.getUserCulture = jasmine.createSpy().and.returnValue({
      longDateFormat: 'MMM d, YYYY',
    });
    mockTextHelperService.getCapitalizeWords.and.callFake((text: string) => {
      return text
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });
    mockTranslateService.instant.and.callFake((key: string, params?: any) => {
      if (key === LoyaltyOverviewCardTranslationKeys.OverviewCard_Greeting_Text) {
        return `Hello, ${params.name}!`;
      }
      if (key === LoyaltyTranslationKeys.Lifemiles_Text) {
        return 'LifeMiles';
      }
      return key;
    });
    mockCustomerLoyaltyService.formatLoyaltyBalance.and.returnValue('15,000');
    mockCustomerLoyaltyService.getCustomerProgramData.and.returnValue(
      of({
        tierName: 'Gold',
        loyaltyId: 'LM123456789',
        mainColor: '#FFD700',
        darkerColor: '#DAA520',
      })
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getData', () => {
    it('should return complete LoyaltyOverviewCardVM with all properties', (done) => {
      const builderData: LoyaltyOverviewCardBuilderData = {
        account: mockAccount,
        isMobile: false,
      };

      service.getData(builderData).subscribe((result) => {
        expect(result).toBeDefined();
        expect(result.greeting).toBe('Hello, John!');
        expect(result.amount).toBe('15,000');
        expect(result.loyaltyId).toBe('LM123456789');
        expect(result.tierName).toBe('Gold');
        expect(result.userFullName).toBe('John Michael Doe');
        done();
      });
    });

    it('should format loyalty balance', (done) => {
      const builderData: LoyaltyOverviewCardBuilderData = {
        account: mockAccount,
        isMobile: false,
      };

      service.getData(builderData).subscribe(() => {
        expect(mockCustomerLoyaltyService.formatLoyaltyBalance).toHaveBeenCalledWith(mockAccount.balance);
        done();
      });
    });

    it('should get customer program data', (done) => {
      const builderData: LoyaltyOverviewCardBuilderData = {
        account: mockAccount,
        isMobile: false,
      };

      service.getData(builderData).subscribe(() => {
        expect(mockCustomerLoyaltyService.getCustomerProgramData).toHaveBeenCalledWith(mockAccount);
        done();
      });
    });

    it('should configure expiration date with user culture format', (done) => {
      const builderData: LoyaltyOverviewCardBuilderData = {
        account: mockAccount,
        isMobile: false,
      };

      service.getData(builderData).subscribe((result) => {
        expect(result.expirationDateConfig).toBeDefined();
        expect(result.expirationDateConfig.format).toBe('MMM d, YYYY');
        expect(result.expirationDateConfig.date).toBeDefined();
        expect(dayjs(result.expirationDateConfig.date).isValid()).toBeTrue();
        done();
      });
    });

    it('should handle different tier levels correctly', (done) => {
      mockCustomerLoyaltyService.getCustomerProgramData.and.returnValue(
        of({
          tierName: 'Diamond',
          loyaltyId: 'LM987654321',
          mainColor: '#0000FF',
          darkerColor: '#0000CC',
        })
      );

      const builderData: LoyaltyOverviewCardBuilderData = {
        account: mockAccount,
        isMobile: false,
      };

      service.getData(builderData).subscribe((result) => {
        expect(result.tierName).toBe('Diamond');
        expect(result.loyaltyId).toBe('LM987654321');
        done();
      });
    });
  });
});
