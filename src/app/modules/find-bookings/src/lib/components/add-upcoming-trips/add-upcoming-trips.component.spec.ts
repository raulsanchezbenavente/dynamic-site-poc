import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import {
  AutocompleteTypes,
  RfErrorDisplayModes,
  RfFormBuilderFieldType,
  GridBuilderLayout,
  RfInputField,
  RfFormBuilderComponent,
} from 'reactive-forms';
import { Validators, FormGroup, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { PanelAppearance } from '@dcx/ui/design-system';
import { SectionColors } from '@dcx/ui/libs';

import { AddUpcomingTripsComponent } from './add-upcoming-trips.component';
import { AddBookingDto } from '../../api-models/find-bookings-response.model';

class FakeLoader implements TranslateLoader {
  public getTranslation(_lang: string) {
    return of({});
  }
}

describe('AddUpcomingTripsComponent', () => {
  let component: AddUpcomingTripsComponent;
  let fixture: ComponentFixture<AddUpcomingTripsComponent>;
  let translate: TranslateService;

  const translations = {
    'FindBookings.AddUpcomingTrips.Title': 'Add Upcoming Trips',
    'FindBookings.AddUpcomingTrips.Form.BookingCode_Label': 'Booking Code',
    'FindBookings.AddUpcomingTrips.Form.BookingCode_Hint': 'Example: AAAAAA',
    'FindBookings.AddUpcomingTrips.Form.BookingCode_RequiredMessage': 'Booking code is required',
    'FindBookings.AddUpcomingTrips.Form.BookingCode_PatternMessage': 'Invalid booking code format',
    'FindBookings.AddUpcomingTrips.Form.BookingCode_MinLengthMessage': 'Booking code too short',
    'FindBookings.AddUpcomingTrips.Form.Surname_Label': 'Surname',
    'FindBookings.AddUpcomingTrips.Form.Surname_Hint': 'As it appears on the booking. Example: Sanchez Pulido',
    'FindBookings.AddUpcomingTrips.Form.Surname_RequiredMessage': 'Surname is required',
    'FindBookings.AddUpcomingTrips.Form.Surname_PatternMessage': 'Invalid surname format',
    'FindBookings.AddUpcomingTrips.Form.Button': 'Add Booking',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        AddUpcomingTripsComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', translations, true);
    translate.use('en');

    spyOn(translate, 'instant').and.callThrough();

    fixture = TestBed.createComponent(AddUpcomingTripsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state before ngOnInit', () => {
    it('should have empty fields signal object', () => {
      expect(component.fields()).toEqual({});
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');
      component.ngOnInit();
      expect((component as any).internalInit).toHaveBeenCalled();
    });

    it('should initialize panelConfig, fields, and submitButtonConfig', () => {
      fixture.detectChanges();
      expect(component.panelConfig).toBeDefined();
      expect(component.fields()).toBeDefined();
      expect(component.submitButtonConfig).toBeDefined();
    });
  });

  describe('Panel configuration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set panel config with correct properties', () => {
      expect(component.panelConfig).toEqual({
        title: 'Add Upcoming Trips',
        appearance: PanelAppearance.SHADOW,
        sectionsColors: SectionColors.OFFER,
      });
    });

    it('should call TranslateService.instant for panel title', () => {
      expect(translate.instant).toHaveBeenCalledWith('FindBookings.AddUpcomingTrips.Title');
    });
  });

  describe('Form fields configuration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should configure booking code (pnr) field correctly', () => {
      const pnrField = component.fields()['pnr'] as RfInputField;
      expect(pnrField).toBeDefined();
      expect(pnrField.type).toBe(RfFormBuilderFieldType.INPUT);
      expect(pnrField.name).toBe('pnr');
      expect(pnrField.autocomplete).toBe(AutocompleteTypes.ON);
      expect(pnrField.animatedLabel).toBe('Booking Code');
      expect(pnrField.hintMessages).toBe('Example: AAAAAA');
      expect(pnrField.leftIcon).toBe('new');
      expect(pnrField.maxLength).toBe(6);

      const pnrValidators = pnrField.validators;
      expect(pnrValidators).toBeDefined();
      if (!pnrValidators) {
        fail('pnr validators should be configured');
        return;
      }

      expect(pnrValidators).toContain(Validators.required);
      // Functional validation tests
      const controlShort = new FormControl('AB'); // <6 chars
      runValidators(pnrValidators, controlShort);
      expect(controlShort.errors?.['minlength']).toBeDefined();

      const controlPatternInvalid = new FormControl('ABC$');
      runValidators(pnrValidators, controlPatternInvalid);
      expect(controlPatternInvalid.errors?.['pattern']).toBeDefined();

      const controlValid = new FormControl('ABC123');
      runValidators(pnrValidators, controlValid);
      expect(controlValid.errors).toBeNull();

      expect(pnrField.inputPattern?.toString()).toBe('/^[a-zA-Z0-9]*$/');
    });

    it('should configure surname field correctly', () => {
      const surnameField = component.fields()['surname'] as RfInputField;
      expect(surnameField).toBeDefined();
      expect(surnameField.type).toBe(RfFormBuilderFieldType.INPUT);
      expect(surnameField.name).toBe('surname');
      expect(surnameField.autocomplete).toBe(AutocompleteTypes.LAST_NAME);
      expect(surnameField.animatedLabel).toBe('Surname');
      expect(surnameField.hintMessages).toBe('As it appears on the booking. Example: Sanchez Pulido');
      expect(surnameField.leftIcon).toBe('user');

      const surnameValidators = surnameField.validators;
      expect(surnameValidators).toBeDefined();
      if (!surnameValidators) {
        fail('surname validators should be configured');
        return;
      }

      expect(surnameValidators).toContain(Validators.required);

      const surnameInvalid = new FormControl('Doe$');
      runValidators(surnameValidators, surnameInvalid);
      expect(surnameInvalid.errors?.['pattern']).toBeDefined();

      const surnameEmpty = new FormControl('');
      runValidators(surnameValidators, surnameEmpty);
      expect(surnameEmpty.errors?.['required']).toBeDefined();

      const surnameValid = new FormControl('María López');
      runValidators(surnameValidators, surnameValid);
      expect(surnameValid.errors).toBeNull();

      expect(surnameField.inputPattern?.toString()).toContain('[a-zA-Z');
    });

    it('should have correct error messages for pnr field', () => {
      const pnrField = component.fields()['pnr'] as RfInputField;
      expect(pnrField.errorMessages).toEqual({
        required: 'Booking code is required',
        pattern: 'Invalid booking code format',
        minlength: 'Booking code too short',
      });
    });

    it('should have correct error messages for surname field', () => {
      const surnameField = component.fields()['surname'] as RfInputField;
      expect(surnameField.errorMessages).toEqual({
        required: 'Surname is required',
        pattern: 'Invalid surname format',
      });
    });
  });

  describe('Submit button configuration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set submit button config with correct label', () => {
      expect(component.submitButtonConfig).toEqual({ label: 'Add Booking' });
    });

    it('should call TranslateService.instant for button label', () => {
      expect(translate.instant).toHaveBeenCalledWith('FindBookings.AddUpcomingTrips.Form.Button');
    });
  });

  describe('Surname blur normalization', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trim and collapse internal spaces', () => {
      const formGroup = new FormGroup({
        surname: new FormControl('Original'),
      });
      const formBuilderComponent = { form: formGroup } as unknown as RfFormBuilderComponent;
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(formBuilderComponent);

      const surnameField = component.fields()['surname'] as RfInputField;
      surnameField.blurInputText?.('  John   Doe  ');
      expect(formGroup.get('surname')?.value).toBe('John Doe');
    });

    it('should handle empty string gracefully', () => {
      const formGroup = new FormGroup({
        surname: new FormControl('Original'),
      });
      const formBuilderComponent = { form: formGroup } as unknown as RfFormBuilderComponent;
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(formBuilderComponent);

      const surnameField = component.fields()['surname'] as RfInputField;
      surnameField.blurInputText?.('   ');
      expect(formGroup.get('surname')?.value).toBe('');
    });
  });

  describe('send method', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return early if form component is not available', () => {
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(undefined);
      spyOn(component.submitForm, 'emit');
      component.send();
      expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should return early if form is not available', () => {
      const formBuilderComponent = { form: null } as unknown as RfFormBuilderComponent;
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(formBuilderComponent);
      spyOn(component.submitForm, 'emit');
      component.send();
      expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched if form invalid', () => {
      const formGroup = new FormGroup({
        pnr: new FormControl('BAD'),
        surname: new FormControl('Doe'),
      });
      Object.defineProperty(formGroup, 'valid', { value: false });
      spyOn(formGroup, 'markAllAsTouched').and.callThrough();
      (formGroup as any).focusFirstInvalidField = jasmine.createSpy('focusFirstInvalidField');
      const formBuilderComponent = { form: formGroup } as unknown as RfFormBuilderComponent;
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(formBuilderComponent);
      spyOn(component.submitForm, 'emit');
      component.send();
      expect(formGroup.markAllAsTouched).toHaveBeenCalled();
      expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should emit form values when form valid', () => {
      const formGroup = new FormGroup({
        pnr: new FormControl('ABC123'),
        surname: new FormControl('Doe'),
      });
      Object.defineProperty(formGroup, 'valid', { value: true });
      const formBuilderComponent = { form: formGroup } as unknown as RfFormBuilderComponent;
      spyOn(component, 'addUpcomingTripsForm').and.returnValue(formBuilderComponent);
      spyOn(component.submitForm, 'emit');
      component.send();
      expect(component.submitForm.emit).toHaveBeenCalledWith({ pnr: 'ABC123', surname: 'Doe' } as AddBookingDto);
    });
  });

  describe('Host class', () => {
    it('should have add-upcoming-trips host class', () => {
      fixture.detectChanges();
      const hostElement: HTMLElement = fixture.debugElement.nativeElement;
      expect(hostElement.classList.contains('add-upcoming-trips')).toBeTrue();
    });
  });

  describe('Configuration constants', () => {
    it('should expose formGridConfig with expected values', () => {
      expect(component.formGridConfig).toEqual({ appearance: GridBuilderLayout.INLINE, cols: 2 });
    });

    it('should use touched error display mode', () => {
      expect(component.displayErrorMode).toBe(RfErrorDisplayModes.TOUCHED);
    });
  });

  function runValidators(validators: unknown, control: AbstractControl): void {
    const list: ValidatorFn[] = normalizeValidators(validators);
    list.forEach(fn => {
      const result = fn(control);
      if (result) {
        control.setErrors({ ...(control.errors ?? {}), ...result });
      }
    });
    if (!control.errors || Object.keys(control.errors).length === 0) {
      control.setErrors(null);
    }
  }

  function normalizeValidators(validators: unknown): ValidatorFn[] {
    if (Array.isArray(validators)) {
      // Already an array of ValidatorFn
      return validators as ValidatorFn[];
    }
    if (validators && typeof validators === 'object') {
      // RfValidator shape: Record<string, ValidatorFn[]>
      const record = validators as Record<string, ValidatorFn[]>;
      return Object.values(record).flat();
    }
    return [];
  }
});
