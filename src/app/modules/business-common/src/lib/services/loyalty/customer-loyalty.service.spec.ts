import { TestBed } from '@angular/core/testing';
import { LoyaltyProgramsFacade } from '@dcx/module/api-clients';
import { CultureServiceEx, CurrencyFormatPipe, CurrencyService } from '@dcx/ui/libs';
import { of } from 'rxjs';

import { CustomerAccount, CustomerBalance } from '../../models';
import { CustomerLoyaltyService } from './customer-loyalty.service';

describe('CustomerLoyaltyService', () => {
  let service: CustomerLoyaltyService;
  let mockCurrencyFormatPipe: jasmine.SpyObj<CurrencyFormatPipe>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockCultureService: jasmine.SpyObj<CultureServiceEx>;
  let mockLoyaltyProgramsFacade: jasmine.SpyObj<LoyaltyProgramsFacade>;

  const cmsProgramsMock = {
    items: [
      { tierCode: 'Lifemiles', tierName: 'Lifemiles', mainColor: '#000000', darkerColor: '#111111' },
      { tierCode: 'Red Plus', tierName: 'Red Plus', mainColor: '#FF0000', darkerColor: '#CC0000' },
      { tierCode: 'Diamond', tierName: 'Diamond', mainColor: '#0000FF', darkerColor: '#0000CC' },
      { tierCode: 'Gold', tierName: 'Gold', mainColor: '#FFD700', darkerColor: '#DAA520' },
      { tierCode: 'Silver', tierName: 'Silver', mainColor: '#C0C0C0', darkerColor: '#A9A9A9' },
    ],
  };

  beforeEach(() => {
    mockCurrencyFormatPipe = jasmine.createSpyObj('CurrencyFormatPipe', ['transform']);
    mockCurrencyService = jasmine.createSpyObj('CurrencyService', ['getCurrentCurrency']);
    mockCultureService = jasmine.createSpyObj('CultureServiceEx', ['getCulture']);
    mockLoyaltyProgramsFacade = jasmine.createSpyObj('LoyaltyProgramsFacade', ['getLoyaltyPrograms']);
    mockLoyaltyProgramsFacade.getLoyaltyPrograms.and.returnValue(of(cmsProgramsMock as any));

    TestBed.configureTestingModule({
      providers: [
        CustomerLoyaltyService,
        { provide: CurrencyFormatPipe, useValue: mockCurrencyFormatPipe },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: CultureServiceEx, useValue: mockCultureService },
        { provide: LoyaltyProgramsFacade, useValue: mockLoyaltyProgramsFacade },
      ],
    });

    service = TestBed.inject(CustomerLoyaltyService);
    mockCurrencyService.getCurrentCurrency.and.returnValue('USD');
    mockCultureService.getCulture.and.returnValue('en-US');
    mockCurrencyFormatPipe.transform.and.returnValue('15,000');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCustomerProgramData', () => {
    it('should return default values when accountDto has no customerPrograms', (done) => {
      const accountDto: CustomerAccount = {
        firstName: '',
        lastName: '',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {},
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result).toEqual({
          tierName: '',
          loyaltyId: '',
          mainColor: '',
          darkerColor: '',
        });
        done();
      });
    });

    it('should return default values when accountDto has no eliteProgress status', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM123',
            tier: 'Gold',
          },
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result).toEqual({
          tierName: '',
          loyaltyId: '',
          mainColor: '',
          darkerColor: '',
        });
        done();
      });
    });

    it('should extract customer program data with exact tier match', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM123456789',
            tier: 'Gold',
          },
        },
        eliteProgress: {
          status: 'Gold',
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result.tierName).toBe('Gold');
        expect(result.loyaltyId).toBe('LM123456789');
        expect(result.mainColor).toBe('#FFD700');
        expect(result.darkerColor).toBe('#DAA520');
        done();
      });
    });

    it('should match tier case-insensitively', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM111',
            tier: 'gold',
          },
        },
        eliteProgress: {
          status: 'gold',
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result.tierName).toBe('Gold');
        expect(result.mainColor).toBe('#FFD700');
        done();
      });
    });

    it('should return default values when tier does not match any CMS tier', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM222',
            tier: 'cenitgold',
          },
        },
        eliteProgress: {
          status: 'cenitgold',
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result.tierName).toBe('');
        expect(result.loyaltyId).toBe('LM222');
        expect(result.mainColor).toBe('');
        expect(result.darkerColor).toBe('');
        done();
      });
    });

    it('should handle multiple customer programs and use first with tier', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM111',
            tier: 'Silver',
          },
          other: {
            programNumber: 'LM222',
            tier: 'Diamond',
          },
        },
        eliteProgress: {
          status: 'Silver',
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result.loyaltyId).toBe('LM111');
        expect(result.tierName).toBe('Silver');
        expect(result.mainColor).toBe('#C0C0C0');
        expect(result.darkerColor).toBe('#A9A9A9');
        done();
      });
    });

    it('should return default values when eliteProgress status is empty', (done) => {
      const accountDto: CustomerAccount = {
        firstName: 'John',
        lastName: 'Doe',
        balance: { lifemiles: { amount: 0 } },
        customerPrograms: {
          lifemiles: {
            programNumber: 'LM123',
            tier: 'Gold',
          },
        },
        eliteProgress: {
          status: '',
        },
      };

      service.getCustomerProgramData(accountDto).subscribe((result) => {
        expect(result.tierName).toBe('');
        expect(result.loyaltyId).toBe('');
        expect(result.mainColor).toBe('');
        expect(result.darkerColor).toBe('');
        done();
      });
    });
  });

  describe('formatLoyaltyPoints', () => {
    it('should format numeric amount', () => {
      service.formatLoyaltyPoints(15000);

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith(15000, 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should format string amount', () => {
      service.formatLoyaltyPoints('15000');

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith('15000', 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should handle undefined amount', () => {
      service.formatLoyaltyPoints(undefined);

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith('', 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should return formatted string from pipe', () => {
      const result = service.formatLoyaltyPoints(15000);

      expect(result).toBe('15,000');
    });
  });

  describe('formatLoyaltyBalance', () => {
    it('should format balance with lifemiles amount', () => {
      const balance: CustomerBalance = {
        lifemiles: {
          amount: 25000,
        },
      };

      service.formatLoyaltyBalance(balance);

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith(25000, 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should handle undefined balance', () => {
      service.formatLoyaltyBalance(undefined);

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith('', 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should handle balance without lifemiles', () => {
      const balance: CustomerBalance = {
        lifemiles: {
          amount: 0,
        },
      };

      service.formatLoyaltyBalance(balance);

      expect(mockCurrencyFormatPipe.transform).toHaveBeenCalledWith(0, 'IntegerOnly', 'USD', 'en-US', 0);
    });

    it('should return formatted string', () => {
      const balance: CustomerBalance = {
        lifemiles: {
          amount: 25000,
        },
      };

      const result = service.formatLoyaltyBalance(balance);

      expect(result).toBe('15,000');
    });
  });
});
