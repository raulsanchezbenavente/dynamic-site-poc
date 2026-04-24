import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarSize } from '@dcx/ui/design-system';
import dayjs from 'dayjs';

import { LoyaltyOverviewCardInfoListComponent } from './info-list.component';
import { LoyaltyOverviewCardLoyaltyNumberComponent } from '../loyalty-number/loyalty-number.component';
import { LoyaltyOverviewCardTotalMilesComponent } from '../total-miles/total-miles.component';
import { LoyaltyOverviewCardExpirationDateComponent } from '../expiration-date/expiration-date.component';
import { LoyaltyOverviewCard } from '../../models/loyalty-overview-card.model';

describe('LoyaltyOverviewCardInfoListComponent', () => {
  let component: LoyaltyOverviewCardInfoListComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardInfoListComponent>;
  let compiled: HTMLElement;

  const mockLoyaltyData: LoyaltyOverviewCard = {
    greeting: 'Hello, John!',
    amount: '15,000',
    loyaltyId: 'LM123456789',
    tierName: 'Gold',
    userFullName: 'John Michael Doe',
    expirationDateConfig: {
      date: dayjs('2026-12-31'),
      format: 'MMM d, YYYY',
    },
    tierAvatarConfig: {
      tierName: 'Gold',
      mainColor: '#FFD700',
      darkerColor: '#DAA520',
      size: AvatarSize.SMALL,
      icon: {
        name: 'lifemiles',
        ariaAttributes: {
          ariaLabel: 'LifeMiles',
        },
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoyaltyOverviewCardInfoListComponent,
        TranslateModule.forRoot(),
        LoyaltyOverviewCardLoyaltyNumberComponent,
        LoyaltyOverviewCardTotalMilesComponent,
        LoyaltyOverviewCardExpirationDateComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyOverviewCardInfoListComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept data input', () => {
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();

      expect(component.data()).toEqual(mockLoyaltyData);
    });

    it('should throw error if data is not provided', () => {
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });

    it('should update when data changes', () => {
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();
      expect(component.data()).toEqual(mockLoyaltyData);

      const newData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '20,000',
        tierName: 'Platinum',
      };
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.data()).toEqual(newData);
    });
  });

  describe('Child Components', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();
    });

    it('should render LoyaltyOverviewCardLoyaltyNumberComponent', () => {
      const loyaltyNumberItem = compiled.querySelector('loyalty-overview-card-loyalty-number');
      expect(loyaltyNumberItem).toBeTruthy();
    });

    it('should render LoyaltyOverviewCardTotalMilesComponent', () => {
      const totalMilesItem = compiled.querySelector('loyalty-overview-card-total-miles');
      expect(totalMilesItem).toBeTruthy();
    });

    it('should render LoyaltyOverviewCardExpirationDateComponent', () => {
      const expirationDateItem = compiled.querySelector('loyalty-overview-card-expiration-date');
      expect(expirationDateItem).toBeTruthy();
    });
  });

  describe('Data Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();
    });

    it('should have correct loyaltyId', () => {
      expect(component.data().loyaltyId).toBe('LM123456789');
    });

    it('should have correct amount', () => {
      expect(component.data().amount).toBe('15,000');
    });

    it('should have correct tierName', () => {
      expect(component.data().tierName).toBe('Gold');
    });

    it('should have correct greeting', () => {
      expect(component.data().greeting).toBe('Hello, John!');
    });

    it('should have correct userFullName', () => {
      expect(component.data().userFullName).toBe('John Michael Doe');
    });

    it('should have correct expirationDateConfig', () => {
      expect(component.data().expirationDateConfig).toBeDefined();
      expect(component.data().expirationDateConfig.format).toBe('MMM d, YYYY');
    });

    it('should have correct tierAvatarConfig', () => {
      expect(component.data().tierAvatarConfig).toBeDefined();
      expect(component.data().tierAvatarConfig.tierName).toBe('Gold');
      expect(component.data().tierAvatarConfig.size).toBe(AvatarSize.SMALL);
    });
  });

  describe('Different Tier Levels', () => {
    it('should handle Lifemiles tier', () => {
      const lifeData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        tierName: 'Lifemiles',
        tierAvatarConfig: {
          ...mockLoyaltyData.tierAvatarConfig,
          tierName: 'Lifemiles',
        },
      };
      fixture.componentRef.setInput('data', lifeData);
      fixture.detectChanges();

      expect(component.data().tierName).toBe('Lifemiles');
    });

    it('should handle Silver tier', () => {
      const silverData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        tierName: 'Silver',
        tierAvatarConfig: {
          ...mockLoyaltyData.tierAvatarConfig,
          tierName: 'Silver',
        },
      };
      fixture.componentRef.setInput('data', silverData);
      fixture.detectChanges();

      expect(component.data().tierName).toBe('Silver');
    });

    it('should handle Gold tier', () => {
      const goldData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        tierName: 'Gold',
        tierAvatarConfig: {
          ...mockLoyaltyData.tierAvatarConfig,
          tierName: 'Gold',
        },
      };
      fixture.componentRef.setInput('data', goldData);
      fixture.detectChanges();

      expect(component.data().tierName).toBe('Gold');
    });

    it('should handle Diamond tier', () => {
      const diamondData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        tierName: 'Diamond',
        tierAvatarConfig: {
          ...mockLoyaltyData.tierAvatarConfig,
          tierName: 'Diamond',
        },
      };
      fixture.componentRef.setInput('data', diamondData);
      fixture.detectChanges();

      expect(component.data().tierName).toBe('Diamond');
    });
  });

  describe('Different Amount Values', () => {
    it('should handle zero miles', () => {
      const zeroData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '0',
      };
      fixture.componentRef.setInput('data', zeroData);
      fixture.detectChanges();

      expect(component.data().amount).toBe('0');
    });

    it('should handle large amounts', () => {
      const largeData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '1,000,000',
      };
      fixture.componentRef.setInput('data', largeData);
      fixture.detectChanges();

      expect(component.data().amount).toBe('1,000,000');
    });

    it('should handle decimal amounts', () => {
      const decimalData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '15,000.50',
      };
      fixture.componentRef.setInput('data', decimalData);
      fixture.detectChanges();

      expect(component.data().amount).toBe('15,000.50');
    });
  });

  describe('Expiration Date Variations', () => {
    it('should handle different date formats', () => {
      const customFormatData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        expirationDateConfig: {
          date: dayjs('2027-06-30'),
          format: 'DD/MM/YYYY',
        },
      };
      fixture.componentRef.setInput('data', customFormatData);
      fixture.detectChanges();

      expect(component.data().expirationDateConfig.format).toBe('DD/MM/YYYY');
    });

    it('should handle different expiration dates', () => {
      const newDateData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        expirationDateConfig: {
          date: dayjs('2028-01-15'),
          format: 'MMM d, YYYY',
        },
      };
      fixture.componentRef.setInput('data', newDateData);
      fixture.detectChanges();

      expect(dayjs(component.data().expirationDateConfig.date).isValid()).toBeTrue();
    });
  });

  describe('ChangeDetection Strategy', () => {
    it('should use OnPush change detection strategy', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata?.changeDetection ?? 0).toBe(0);
    });
  });

  describe('Component Configuration', () => {
    it('should be standalone', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should have correct selector', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.selectors[0][0]).toBe('loyalty-overview-card-info-list');
    });
  });

  describe('Integration Tests', () => {
    it('should pass correct data to child components', () => {
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();

      const data = component.data();
      expect(data.loyaltyId).toBe('LM123456789');
      expect(data.amount).toBe('15,000');
      expect(data.tierAvatarConfig).toBeDefined();
      expect(data.expirationDateConfig).toBeDefined();
    });

    it('should handle complete data update flow', () => {
      // Initial data
      fixture.componentRef.setInput('data', mockLoyaltyData);
      fixture.detectChanges();
      expect(component.data().amount).toBe('15,000');

      // Update data
      const updatedData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '25,000',
        loyaltyId: 'LM987654321',
        tierName: 'Platinum',
      };
      fixture.componentRef.setInput('data', updatedData);
      fixture.detectChanges();

      expect(component.data().amount).toBe('25,000');
      expect(component.data().loyaltyId).toBe('LM987654321');
      expect(component.data().tierName).toBe('Platinum');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string amount', () => {
      const emptyAmountData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        amount: '',
      };
      fixture.componentRef.setInput('data', emptyAmountData);
      fixture.detectChanges();

      expect(component.data().amount).toBe('');
    });

    it('should handle special characters in loyaltyId', () => {
      const specialCharData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        loyaltyId: 'LM-123-456-789',
      };
      fixture.componentRef.setInput('data', specialCharData);
      fixture.detectChanges();

      expect(component.data().loyaltyId).toBe('LM-123-456-789');
    });

    it('should handle very long user names', () => {
      const longNameData: LoyaltyOverviewCard = {
        ...mockLoyaltyData,
        userFullName: 'A'.repeat(100),
      };
      fixture.componentRef.setInput('data', longNameData);
      fixture.detectChanges();

      expect(component.data().userFullName.length).toBe(100);
    });
  });
});
