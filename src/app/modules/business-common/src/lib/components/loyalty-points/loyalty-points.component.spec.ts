import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoyaltyPointsComponent } from './loyalty-points.component';
import { LoyaltyPoints } from './models/loyalty-points.model';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('LoyaltyPointsComponent', () => {
  let component: LoyaltyPointsComponent;
  let fixture: ComponentFixture<LoyaltyPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoyaltyPointsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyPointsComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit - label initialization', () => {
    it('should set default label when label is undefined', () => {
      component.loyaltyPointsModel = {
        amount: '2000',
        isPositiveSymbol: false,
        symbol: '-',
      };

      component.ngOnInit();

      expect(component.loyaltyPointsModel.label).toBe('Loyalty.PointsUnit.Text');
    });

    it('should set default label when label is null', () => {
      component.loyaltyPointsModel = {
        amount: '1000',
        label: null as any,
      };

      component.ngOnInit();

      expect(component.loyaltyPointsModel.label).toBe('Loyalty.PointsUnit.Text');
    });

    it('should preserve existing label when provided', () => {
      component.loyaltyPointsModel = {
        amount: '3000',
        label: 'Custom.Label.Key',
      };

      component.ngOnInit();

      expect(component.loyaltyPointsModel.label).toBe('Custom.Label.Key');
    });

    it('should preserve empty string label', () => {
      component.loyaltyPointsModel = {
        amount: '800',
        label: '',
      };

      component.ngOnInit();

      expect(component.loyaltyPointsModel.label).toBe('');
    });
  });
});
