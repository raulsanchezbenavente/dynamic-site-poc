import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslatePipe, TranslateLoader } from '@ngx-translate/core';
import { IconButtonComponent } from '@dcx/ui/design-system';
import { ClipboardCopyHelperService } from '@dcx/ui/libs';
import { of } from 'rxjs';

import { LoyaltyOverviewCardLoyaltyNumberComponent } from './loyalty-number.component';
import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('LoyaltyOverviewCardLoyaltyNumberComponent', () => {
  let component: LoyaltyOverviewCardLoyaltyNumberComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardLoyaltyNumberComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardCopyHelperService>;
  let translateService: TranslateService;

  beforeEach(async () => {
    const clipboardSpy = jasmine.createSpyObj('ClipboardCopyHelperService', ['copy']);

    await TestBed.configureTestingModule({
      imports: [
        LoyaltyOverviewCardLoyaltyNumberComponent,
        IconButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [{ provide: ClipboardCopyHelperService, useValue: clipboardSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyOverviewCardLoyaltyNumberComponent);
    component = fixture.componentInstance;
    clipboardService = TestBed.inject(ClipboardCopyHelperService) as jasmine.SpyObj<ClipboardCopyHelperService>;
    translateService = TestBed.inject(TranslateService);
    
    // Mock translateService methods
    spyOn(translateService, 'instant').and.returnValue('Mocked Translation');
    spyOn(translateService, 'get').and.returnValue(of('Mocked Translation'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept loyaltyId input', () => {
      const testLoyaltyId = 'LM123456789';
      fixture.componentRef.setInput('loyaltyId', testLoyaltyId);
      fixture.detectChanges();

      expect(component.loyaltyId()).toBe(testLoyaltyId);
    });

    it('should throw error if loyaltyId is not provided', () => {
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });

    it('should update when loyaltyId changes', () => {
      fixture.componentRef.setInput('loyaltyId', 'LM111111111');
      fixture.detectChanges();
      expect(component.loyaltyId()).toBe('LM111111111');

      fixture.componentRef.setInput('loyaltyId', 'LM999999999');
      fixture.detectChanges();
      expect(component.loyaltyId()).toBe('LM999999999');
    });
  });

  describe('Copied Signal', () => {
    it('should initialize copied signal as false', () => {
      expect(component.copied()).toBe(false);
    });

    it('should set copied to true when copyToClipboard is called', () => {
      fixture.componentRef.setInput('loyaltyId', 'LM123456789');
      fixture.detectChanges();

      component.copyToClipboard();
      expect(component.copied()).toBe(true);
    });

    it('should reset copied to false after 3 seconds', fakeAsync(() => {
      fixture.componentRef.setInput('loyaltyId', 'LM123456789');
      fixture.detectChanges();

      component.copyToClipboard();
      expect(component.copied()).toBe(true);

      tick(3000);
      expect(component.copied()).toBe(false);
    }));

    it('should remain true before 3 seconds timeout', fakeAsync(() => {
      fixture.componentRef.setInput('loyaltyId', 'LM123456789');
      fixture.detectChanges();

      component.copyToClipboard();
      expect(component.copied()).toBe(true);

      tick(2999);
      expect(component.copied()).toBe(true);

      tick(1);
      expect(component.copied()).toBe(false);
    }));
  });

  describe('copyToClipboard', () => {
    it('should call clipboard service with loyaltyId', () => {
      const testLoyaltyId = 'LM123456789';
      fixture.componentRef.setInput('loyaltyId', testLoyaltyId);
      fixture.detectChanges();

      component.copyToClipboard();

      expect(clipboardService.copy).toHaveBeenCalledWith(testLoyaltyId);
    });

    it('should copy correct loyaltyId when it changes', () => {
      fixture.componentRef.setInput('loyaltyId', 'LM111111111');
      fixture.detectChanges();
      component.copyToClipboard();
      expect(clipboardService.copy).toHaveBeenCalledWith('LM111111111');

      fixture.componentRef.setInput('loyaltyId', 'LM999999999');
      fixture.detectChanges();
      component.copyToClipboard();
      expect(clipboardService.copy).toHaveBeenCalledWith('LM999999999');
    });
  });

  describe('copyIconButtonConfig', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('loyaltyId', 'LM123456789');
      fixture.detectChanges();
    });

    it('should have copy icon when copied is false', () => {
      component.copied.set(false);
      const config = component.copyIconButtonConfig();

      expect(config.icon?.name).toBe('copy');
    });

    it('should have check icon when copied is true', () => {
      component.copied.set(true);
      const config = component.copyIconButtonConfig();

      expect(config.icon?.name).toBe('check');
    });

    it('should call translateService for aria label when not copied', () => {
      component.copied.set(false);
      component.copyIconButtonConfig();

      expect(translateService.instant).toHaveBeenCalledWith(
        LoyaltyOverviewCardTranslationKeys.OverviewCard_CopyLoyaltyNumber
      );
    });

    it('should call translateService for aria label when copied', () => {
      component.copied.set(true);
      component.copyIconButtonConfig();

      expect(translateService.instant).toHaveBeenCalledWith(
        LoyaltyOverviewCardTranslationKeys.OverviewCard_CopyLoyaltyNumberSuccess
      );
    });

    it('should update icon config reactively when copied changes', () => {
      component.copied.set(false);
      let config = component.copyIconButtonConfig();
      expect(config.icon?.name).toBe('copy');

      component.copied.set(true);
      config = component.copyIconButtonConfig();
      expect(config.icon?.name).toBe('check');
    });
  });

  describe('Translation Keys', () => {
    it('should have correct translateKeys reference', () => {
      expect(component.translateKeys).toBe(LoyaltyOverviewCardTranslationKeys);
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
      expect(metadata.selectors[0][0]).toBe('loyalty-overview-card-loyalty-number');
    });
  });

  describe('Integration Test', () => {
    it('should handle complete copy flow', fakeAsync(() => {
      fixture.componentRef.setInput('loyaltyId', 'LM123456789');
      fixture.detectChanges();

      // Initial state
      expect(component.copied()).toBe(false);
      let config = component.copyIconButtonConfig();
      expect(config.icon?.name).toBe('copy');

      // Copy action
      component.copyToClipboard();
      expect(clipboardService.copy).toHaveBeenCalledWith('LM123456789');
      expect(component.copied()).toBe(true);
      config = component.copyIconButtonConfig();
      expect(config.icon?.name).toBe('check');

      // After timeout
      tick(3000);
      expect(component.copied()).toBe(false);
      config = component.copyIconButtonConfig();
      expect(config.icon?.name).toBe('copy');
    }));
  });
});
