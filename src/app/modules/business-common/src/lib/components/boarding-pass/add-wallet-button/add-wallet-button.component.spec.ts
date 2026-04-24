import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AddWalletButtonComponent } from './add-wallet-button.component';
import { AddWalletButtonConfig } from './models/add-wallet-button.config';
import { BoardingPassFormatType } from '@dcx/ui/business-common';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('AddWalletButtonComponent', () => {
  let component: AddWalletButtonComponent;
  let fixture: ComponentFixture<AddWalletButtonComponent>;

  const mockAppleWalletConfig: AddWalletButtonConfig = {
    formatType: BoardingPassFormatType.APPLE_WALLET,
  };

  const mockGooglePayConfig: AddWalletButtonConfig = {
    formatType: BoardingPassFormatType.GOOGLE_PAY,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddWalletButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddWalletButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', mockAppleWalletConfig);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('config input', () => {
    it('should accept config input with Apple Wallet format type', () => {
      fixture.componentRef.setInput('config', mockAppleWalletConfig);

      expect(component.config()).toEqual(mockAppleWalletConfig);
      expect(component.config().formatType).toBe(BoardingPassFormatType.APPLE_WALLET);
    });

    it('should accept config input with Google Pay format type', () => {
      fixture.componentRef.setInput('config', mockGooglePayConfig);

      expect(component.config()).toEqual(mockGooglePayConfig);
      expect(component.config().formatType).toBe(BoardingPassFormatType.GOOGLE_PAY);
    });
  });

  describe('imgSrc computed', () => {
    it('should return Apple Wallet badge path when format type is Apple Wallet', () => {
      fixture.componentRef.setInput('config', mockAppleWalletConfig);

      const result = component['imgSrc']();

      expect(result).toBe('/assets/ui_plus/imgs/boarding-pass/apple-wallet-badge.svg');
    });

    it('should return Google Pay badge path when format type is Google Pay', () => {
      fixture.componentRef.setInput('config', mockGooglePayConfig);

      const result = component['imgSrc']();

      expect(result).toBe('/assets/ui_plus/imgs/boarding-pass/google-pay-badge.svg');
    });

    it('should update imgSrc when config changes', () => {
      fixture.componentRef.setInput('config', mockAppleWalletConfig);
      const appleResult = component['imgSrc']();

      fixture.componentRef.setInput('config', mockGooglePayConfig);
      const googleResult = component['imgSrc']();

      expect(appleResult).toBe('/assets/ui_plus/imgs/boarding-pass/apple-wallet-badge.svg');
      expect(googleResult).toBe('/assets/ui_plus/imgs/boarding-pass/google-pay-badge.svg');
    });
  });

  describe('onButtonClick', () => {
    it('should emit buttonClicked event when called', () => {
      spyOn(component.buttonClicked, 'emit');

      component.onButtonClick();

      expect(component.buttonClicked.emit).toHaveBeenCalled();
    });

    it('should emit Apple Wallet format type when config is Apple Wallet', () => {
      fixture.componentRef.setInput('config', mockAppleWalletConfig);
      spyOn(component.buttonClicked, 'emit');

      component.onButtonClick();

      expect(component.buttonClicked.emit).toHaveBeenCalledWith(BoardingPassFormatType.APPLE_WALLET);
    });

    it('should emit Google Pay format type when config is Google Pay', () => {
      fixture.componentRef.setInput('config', mockGooglePayConfig);
      spyOn(component.buttonClicked, 'emit');

      component.onButtonClick();

      expect(component.buttonClicked.emit).toHaveBeenCalledWith(BoardingPassFormatType.GOOGLE_PAY);
    });

    it('should emit buttonClicked event only once per call', () => {
      spyOn(component.buttonClicked, 'emit');

      component.onButtonClick();

      expect(component.buttonClicked.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('template integration', () => {
    it('should render button element', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button.add-wallet-button_action');

      expect(button).toBeTruthy();
    });

    it('should render img with correct src for Apple Wallet', () => {
      fixture.componentRef.setInput('config', mockAppleWalletConfig);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('/assets/ui_plus/imgs/boarding-pass/apple-wallet-badge.svg');
    });

    it('should render img with correct src for Google Pay', () => {
      fixture.componentRef.setInput('config', mockGooglePayConfig);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');

      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('/assets/ui_plus/imgs/boarding-pass/google-pay-badge.svg');
    });

    it('should call onButtonClick when button is clicked', () => {
      spyOn(component, 'onButtonClick');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button.add-wallet-button_action');
      button.click();

      expect(component.onButtonClick).toHaveBeenCalled();
    });

    it('should emit buttonClicked event when button is clicked', () => {
      spyOn(component.buttonClicked, 'emit');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button.add-wallet-button_action');
      button.click();

      expect(component.buttonClicked.emit).toHaveBeenCalledWith(BoardingPassFormatType.APPLE_WALLET);
    });

    it('should have role presentation on img element', () => {
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');

      expect(img.getAttribute('role')).toBe('presentation');
    });

    it('should have empty alt attribute on img element', () => {
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');

      expect(img.getAttribute('alt')).toBe('');
    });

    it('should render label span with translated text', () => {
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('span.button_label');

      expect(label).toBeTruthy();
    });
  });

  describe('assetsConfig', () => {
    it('should have Apple Wallet asset path defined', () => {
      const assetsConfig = component['assetsConfig'];

      expect(assetsConfig[BoardingPassFormatType.APPLE_WALLET]).toBe(
        '/assets/ui_plus/imgs/boarding-pass/apple-wallet-badge.svg'
      );
    });

    it('should have Google Pay asset path defined', () => {
      const assetsConfig = component['assetsConfig'];

      expect(assetsConfig[BoardingPassFormatType.GOOGLE_PAY]).toBe(
        '/assets/ui_plus/imgs/boarding-pass/google-pay-badge.svg'
      );
    });

    it('should have exactly two format types configured', () => {
      const assetsConfig = component['assetsConfig'];
      const keys = Object.keys(assetsConfig);

      expect(keys.length).toBe(2);
    });
  });
});
