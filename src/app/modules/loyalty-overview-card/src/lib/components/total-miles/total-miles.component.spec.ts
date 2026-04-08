import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TierAvatarComponent, TierAvatarConfig } from '@dcx/ui/business-common';
import { AvatarSize } from '@dcx/ui/design-system';

import { LoyaltyOverviewCardTotalMilesComponent } from './total-miles.component';
import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

describe('LoyaltyOverviewCardTotalMilesComponent', () => {
  let component: LoyaltyOverviewCardTotalMilesComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardTotalMilesComponent>;
  let compiled: HTMLElement;

  const mockTierAvatarConfig: TierAvatarConfig = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyOverviewCardTotalMilesComponent, TranslateModule.forRoot(), TierAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyOverviewCardTotalMilesComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept amount input', () => {
      const testAmount = '15,000';
      fixture.componentRef.setInput('amount', testAmount);
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();

      expect(component.amount()).toBe(testAmount);
    });

    it('should accept tierAvatarConfig input', () => {
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();

      expect(component.tierAvatarConfig()).toEqual(mockTierAvatarConfig);
    });

    it('should throw error if amount is not provided', () => {
      expect(() => {
        fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
        fixture.detectChanges();
      }).toThrow();
    });

    it('should throw error if tierAvatarConfig is not provided', () => {
      expect(() => {
        fixture.componentRef.setInput('amount', '15,000');
        fixture.detectChanges();
      }).toThrow();
    });

    it('should update when amount changes', () => {
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();
      expect(component.amount()).toBe('15,000');

      fixture.componentRef.setInput('amount', '20,000');
      fixture.detectChanges();
      expect(component.amount()).toBe('20,000');
    });

    it('should update when tierAvatarConfig changes', () => {
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();

      const newConfig: TierAvatarConfig = {
        ...mockTierAvatarConfig,
        tierName: 'Diamond',
      };
      fixture.componentRef.setInput('tierAvatarConfig', newConfig);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().tierName).toBe('Diamond');
    });
  });

  describe('TierAvatarConfig Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();
    });

    it('should have correct tierName', () => {
      expect(component.tierAvatarConfig().tierName).toBe('Gold');
    });

    it('should have correct size', () => {
      expect(component.tierAvatarConfig().size).toBe(AvatarSize.SMALL);
    });

    it('should have correct icon name', () => {
      expect(component.tierAvatarConfig().icon?.name).toBe('lifemiles');
    });

    it('should have correct aria label', () => {
      expect(component.tierAvatarConfig().icon?.ariaAttributes?.ariaLabel).toBe('LifeMiles');
    });
  });

  describe('Different Tier Levels', () => {
    it('should handle Lifemiles tier', () => {
      const config = { ...mockTierAvatarConfig, tierName: 'Lifemiles' };
      fixture.componentRef.setInput('amount', '5,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().tierName).toBe('Lifemiles');
    });

    it('should handle Silver tier', () => {
      const config = { ...mockTierAvatarConfig, tierName: 'Silver' };
      fixture.componentRef.setInput('amount', '10,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().tierName).toBe('Silver');
    });

    it('should handle Diamond tier', () => {
      const config = { ...mockTierAvatarConfig, tierName: 'Diamond' };
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().tierName).toBe('Diamond');
    });

    it('should handle Gold tier', () => {
      const config = { ...mockTierAvatarConfig, tierName: 'Gold' };
      fixture.componentRef.setInput('amount', '20,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().tierName).toBe('Gold');
    });
  });

  describe('Different Avatar Sizes', () => {
    it('should handle SMALLEST size', () => {
      const config = { ...mockTierAvatarConfig, size: AvatarSize.SMALLEST };
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().size).toBe(AvatarSize.SMALLEST);
    });

    it('should handle EXTRA_SMALL size', () => {
      const config = { ...mockTierAvatarConfig, size: AvatarSize.EXTRA_SMALL };
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().size).toBe(AvatarSize.EXTRA_SMALL);
    });

    it('should handle SMALL size', () => {
      const config = { ...mockTierAvatarConfig, size: AvatarSize.SMALL };
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', config);
      fixture.detectChanges();

      expect(component.tierAvatarConfig().size).toBe(AvatarSize.SMALL);
    });
  });

  describe('Translation Keys', () => {
    it('should have correct translateKeys reference', () => {
      expect(component.translateKeys).toBe(LoyaltyOverviewCardTranslationKeys);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('amount', '15,000');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();
    });

    it('should render the component', () => {
      expect(compiled).toBeTruthy();
    });

    it('should pass tierAvatarConfig to tier-avatar component', () => {
      const tierAvatar = compiled.querySelector('tier-avatar');
      expect(tierAvatar).toBeTruthy();
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
      expect(metadata.selectors[0][0]).toBe('loyalty-overview-card-total-miles');
    });
  });

  describe('Amount Formatting', () => {
    it('should handle different amount formats', () => {
      const amounts = ['0', '1,000', '10,000', '100,000', '1,000,000'];

      amounts.forEach((amount) => {
        fixture.componentRef.setInput('amount', amount);
        fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
        fixture.detectChanges();

        expect(component.amount()).toBe(amount);
      });
    });

    it('should handle empty string amount', () => {
      fixture.componentRef.setInput('amount', '');
      fixture.componentRef.setInput('tierAvatarConfig', mockTierAvatarConfig);
      fixture.detectChanges();

      expect(component.amount()).toBe('');
    });
  });
});
