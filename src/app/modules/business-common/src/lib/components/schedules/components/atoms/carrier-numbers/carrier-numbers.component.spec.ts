import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CarrierNumbersComponent } from './carrier-numbers.component';
import { CarrierNumbers } from './models/carrier-numbers.model';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('CarrierNumbersComponent', () => {
  let component: CarrierNumbersComponent;
  let fixture: ComponentFixture<CarrierNumbersComponent>;

  const mockCarrierNumbers: CarrierNumbers[] = [
    { code: 'AV', number: '123' },
    { code: 'CO', number: '456' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CarrierNumbersComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarrierNumbersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render carrier numbers with correct format', () => {
      component.data = mockCarrierNumbers;
      fixture.detectChanges();

      const listItems = fixture.nativeElement.querySelectorAll('.carrier-number_item');

      expect(listItems.length).toBe(2);
      expect(listItems[0].textContent?.trim()).toBe('AV123');
      expect(listItems[1].textContent?.trim()).toBe('CO456');
    });

    it('should render empty list when data is empty', () => {
      component.data = [];
      fixture.detectChanges();

      const listItems = fixture.nativeElement.querySelectorAll('.carrier-number_item');
      expect(listItems.length).toBe(0);
    });

    it('should update view when data changes', () => {
      component.data = mockCarrierNumbers;
      fixture.detectChanges();

      let listItems = fixture.nativeElement.querySelectorAll('.carrier-number_item');
      expect(listItems.length).toBe(2);

      component.data = [{ code: 'UA', number: '789' }];
      fixture.detectChanges();

      listItems = fixture.nativeElement.querySelectorAll('.carrier-number_item');
      expect(listItems.length).toBe(1);
      expect(listItems[0].textContent?.trim()).toBe('UA789');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic list structure with aria-label', () => {
      component.data = mockCarrierNumbers;
      fixture.detectChanges();

      const list = fixture.nativeElement.querySelector('.carrier-number_list');
      const listItems = fixture.nativeElement.querySelectorAll('.carrier-number_item');

      expect(list.tagName).toBe('UL');
      expect(list.getAttribute('aria-label')).toBeTruthy();
      listItems.forEach((item: Element) => {
        expect(item.tagName).toBe('LI');
      });
    });
  });
});
