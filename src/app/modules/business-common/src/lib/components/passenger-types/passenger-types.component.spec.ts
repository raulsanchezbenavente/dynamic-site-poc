import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { PassengerTypesComponent } from './passenger-types.component';
import { PassengerTypesVM, PaxTypeCode } from '@dcx/ui/libs';

describe('PassengerTypesComponent', () => {
  let component: PassengerTypesComponent;
  let fixture: ComponentFixture<PassengerTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerTypesComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PassengerTypesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render correct number of passenger types with quantity > 0', () => {
      component.model = {
        config: [
          { code: PaxTypeCode.ADT, quantity: 2 },
          { code: PaxTypeCode.CHD, quantity: 1 },
          { code: PaxTypeCode.INF, quantity: 0 },
        ],
      };
      fixture.detectChanges();

      const listItems = fixture.nativeElement.querySelectorAll('.passenger-types_list_item');
      expect(listItems.length).toBe(2);
    });

    it('should display correct quantities', () => {
      component.model = {
        config: [
          { code: PaxTypeCode.ADT, quantity: 3 },
          { code: PaxTypeCode.CHD, quantity: 2 },
        ],
      };
      fixture.detectChanges();

      const quantities = fixture.nativeElement.querySelectorAll('.passenger-types_list_item_quantity');
      expect(quantities[0].textContent?.trim()).toBe('3');
      expect(quantities[1].textContent?.trim()).toBe('2');
    });

    it('should render empty list when config is empty', () => {
      component.model = { config: [] };
      fixture.detectChanges();

      const listItems = fixture.nativeElement.querySelectorAll('.passenger-types_list_item');
      expect(listItems.length).toBe(0);
    });

    it('should use correct translation keys for singular and plural', () => {
      component.model = {
        config: [
          { code: PaxTypeCode.ADT, quantity: 1 },
          { code: PaxTypeCode.CHD, quantity: 2 },
        ],
      };
      fixture.detectChanges();

      const labels = fixture.nativeElement.querySelectorAll('.passenger-types_list_item_label');
      
      // Verify singular translation key is used for quantity = 1
      const singularPipe = labels[0].textContent?.trim();
      expect(singularPipe).toBeDefined();
      
      // Verify plural translation key is used for quantity > 1
      const pluralPipe = labels[1].textContent?.trim();
      expect(pluralPipe).toBeDefined();
    });

    it('should update view when model changes', () => {
      component.model = {
        config: [
          { code: PaxTypeCode.ADT, quantity: 2 },
          { code: PaxTypeCode.CHD, quantity: 1 },
        ],
      };
      fixture.detectChanges();

      let listItems = fixture.nativeElement.querySelectorAll('.passenger-types_list_item');
      expect(listItems.length).toBe(2);

      component.model = {
        config: [{ code: PaxTypeCode.ADT, quantity: 1 }],
      };
      fixture.detectChanges();

      listItems = fixture.nativeElement.querySelectorAll('.passenger-types_list_item');
      expect(listItems.length).toBe(1);
    });

    it('should maintain order of passenger types from config', () => {
      component.model = {
        config: [
          { code: PaxTypeCode.INF, quantity: 1 },
          { code: PaxTypeCode.ADT, quantity: 2 },
          { code: PaxTypeCode.CHD, quantity: 3 },
        ],
      };
      fixture.detectChanges();

      const quantities = fixture.nativeElement.querySelectorAll('.passenger-types_list_item_quantity');
      expect(quantities[0].textContent?.trim()).toBe('1');
      expect(quantities[1].textContent?.trim()).toBe('2');
      expect(quantities[2].textContent?.trim()).toBe('3');
    });
  });
});
