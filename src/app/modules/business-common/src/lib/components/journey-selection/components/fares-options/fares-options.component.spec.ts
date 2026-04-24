import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FaresOptionsComponent } from './fares-options.component';
import { BUSINESS_CONFIG, Fare } from '@dcx/ui/libs';
import { FareOptions } from './models/fare-options.model';
import { By } from '@angular/platform-browser';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

const mockBusinessConfig = {
  businessName: 'TEST_BUSINESS',
  imagePopUpFrecuencyTime: 0,
  manageCountries: [],
  passengers: {},
  phoneValidationMessage: '',
  prefixValidationMessage: '',
  roundingCurrencyFactors: [
    { code: 'USD', factor: '1.00' },
    { code: 'COP', factor: '1.00' },
  ],
};

describe('FaresOptionsComponent', () => {
  let component: FaresOptionsComponent;
  let fixture: ComponentFixture<FaresOptionsComponent>;

  const mockFares: Fare[] = [
    {
      id: 'FARE1',
      referenceId: 'REF1',
      fareBasisCode: 'Y26NR',
      classOfService: 'Y',
      productClass: 'Economy',
      serviceBundleCode: 'BUNDLE1',
      availableSeats: 10,
      charges: [
        {
          type: 'BASE',
          code: 'BASE',
          amount: 100,
          currency: 'USD',
        },
      ],
      isRecommended: true,
    } as Fare,
    {
      id: 'FARE2',
      referenceId: 'REF2',
      fareBasisCode: 'M26NR',
      classOfService: 'M',
      productClass: 'Business',
      serviceBundleCode: 'BUNDLE2',
      availableSeats: 5,
      charges: [
        {
          type: 'BASE',
          code: 'BASE',
          amount: 200,
          currency: 'USD',
        },
      ],
      isRecommended: false,
    } as Fare,
  ];

  const mockFareOptions: FareOptions = {
    title: 'Select Your Fare',
    options: mockFares,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FaresOptionsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [{ provide: BUSINESS_CONFIG, useValue: mockBusinessConfig }],
    }).compileComponents();

    fixture = TestBed.createComponent(FaresOptionsComponent);
    component = fixture.componentInstance;
    component.data = mockFareOptions;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template rendering', () => {
    it('should render title when provided', () => {
      fixture.detectChanges();
      const titleElement = fixture.debugElement.query(By.css('.fares-options_title'));

      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Select Your Fare');
    });

    it('should render fare-options-item for each fare', () => {
      fixture.detectChanges();
      const fareItems = fixture.debugElement.queryAll(By.css('fare-options-item'));

      expect(fareItems.length).toBe(2);
    });

    it('should not render items when options array is empty', () => {
      component.data = { title: 'No Fares', options: [] };
      fixture.detectChanges();
      const fareItems = fixture.debugElement.queryAll(By.css('fare-options-item'));

      expect(fareItems.length).toBe(0);
    });

    it('should pass data and translations to fare-options-item components', () => {
      fixture.detectChanges();
      const fareItems = fixture.debugElement.queryAll(By.css('fare-options-item'));

      expect(fareItems[0].componentInstance.data).toEqual(mockFares[0]);
      expect(fareItems[1].componentInstance.data).toEqual(mockFares[1]);
    });
  });

  describe('Input handling', () => {
    it('should handle data without title', () => {
      component.data = { options: mockFares };
      fixture.detectChanges();
      const titleElement = fixture.debugElement.query(By.css('.fares-options_title'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('');
    });

    it('should update view when data changes', () => {
      fixture.detectChanges();
      let fareItems = fixture.debugElement.queryAll(By.css('fare-options-item'));
      expect(fareItems.length).toBe(2);

      component.data = { title: 'Updated', options: [mockFares[0]] };
      fixture.detectChanges();
      fareItems = fixture.debugElement.queryAll(By.css('fare-options-item'));

      expect(fareItems.length).toBe(1);
    });
  });
});
