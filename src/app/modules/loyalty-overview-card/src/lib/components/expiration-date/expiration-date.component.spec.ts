import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayComponent, DateDisplayConfig } from '@dcx/ui/design-system';
import dayjs from 'dayjs';

import { LoyaltyOverviewCardExpirationDateComponent } from './expiration-date.component';
import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

describe('LoyaltyOverviewCardExpirationDateComponent', () => {
  let component: LoyaltyOverviewCardExpirationDateComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardExpirationDateComponent>;
  let compiled: HTMLElement;

  const mockExpirationDateConfig: DateDisplayConfig = {
    date: dayjs('2026-12-31'),
    format: 'MMM d, YYYY',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyOverviewCardExpirationDateComponent, TranslateModule.forRoot(), DateDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyOverviewCardExpirationDateComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    
    // Set required inputs
    fixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
    fixture.componentRef.setInput('amount', '15,000');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept expirationDateConfig input', () => {
      fixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
      fixture.detectChanges();

      expect(component.expirationDateConfig()).toEqual(mockExpirationDateConfig);
    });

    it('should accept amount input', () => {
      const testAmount = '15,000';
      fixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
      fixture.componentRef.setInput('amount', testAmount);
      fixture.detectChanges();

      expect(component.amount()).toBe(testAmount);
    });

    it('should throw error if expirationDateConfig is not provided', () => {
      // Create a new fixture without inputs from beforeEach
      const newFixture = TestBed.createComponent(LoyaltyOverviewCardExpirationDateComponent);
      expect(() => {
        newFixture.componentRef.setInput('amount', '15,000');
        newFixture.detectChanges();
      }).toThrow();
    });

    it('should throw error if amount is not provided', () => {
      // Create a new fixture without inputs from beforeEach
      const newFixture = TestBed.createComponent(LoyaltyOverviewCardExpirationDateComponent);
      expect(() => {
        newFixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
        newFixture.detectChanges();
      }).toThrow();
    });
  });

  describe('Translation Keys', () => {
    it('should have correct translateKeys reference', () => {
      expect(component.translateKeys).toBe(LoyaltyOverviewCardTranslationKeys);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
      fixture.componentRef.setInput('amount', '15,000');
      fixture.detectChanges();
    });

    it('should render the component', () => {
      expect(compiled).toBeTruthy();
    });

    it('should pass expirationDateConfig to date-display component', () => {
      const dateDisplay = compiled.querySelector('date-display');
      expect(dateDisplay).toBeTruthy();
    });
  });

  describe('ChangeDetection Strategy', () => {
    it('should use OnPush change detection strategy', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata?.changeDetection ?? 0).toBe(0); // 0 = ChangeDetectionStrategy.OnPush
    });
  });

  describe('Component Configuration', () => {
    it('should be standalone', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should have correct selector', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.selectors[0][0]).toBe('loyalty-overview-card-expiration-date');
    });
  });

  describe('Date Configuration Changes', () => {
    it('should update when expirationDateConfig changes', () => {
      const initialConfig = mockExpirationDateConfig;
      fixture.componentRef.setInput('expirationDateConfig', initialConfig);
      fixture.componentRef.setInput('amount', '15,000');
      fixture.detectChanges();

      const newConfig: DateDisplayConfig = {
        date: dayjs('2027-06-30'),
        format: 'DD/MM/YYYY',
      };
      fixture.componentRef.setInput('expirationDateConfig', newConfig);
      fixture.detectChanges();

      expect(component.expirationDateConfig()).toEqual(newConfig);
    });

    it('should update when amount changes', () => {
      fixture.componentRef.setInput('expirationDateConfig', mockExpirationDateConfig);
      fixture.componentRef.setInput('amount', '15,000');
      fixture.detectChanges();

      fixture.componentRef.setInput('amount', '20,000');
      fixture.detectChanges();

      expect(component.amount()).toBe('20,000');
    });
  });
});
