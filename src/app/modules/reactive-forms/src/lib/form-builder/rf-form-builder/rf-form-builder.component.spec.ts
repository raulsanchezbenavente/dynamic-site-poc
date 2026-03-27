// rf-form-builder.component.spec.ts
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { RfFormBuilderComponent } from './rf-form-builder.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormBuilderFieldType as FB } from '../enums/rf-form-builder.types.enum';

// Adjust if your IdService is in another path
import { IdService } from '../../services/id/id.service';
import { RfFormStore } from '../../store/rf-form.store';

// ---- Basic mocks ----
class IdServiceMock {
  generateRandomId() { return 'rnd-id'; }
}

// Host to pass the config as input (signal)
@Component({
  standalone: true,
  selector: 'host-fb',
  imports: [ReactiveFormsModule, RfFormBuilderComponent],
  template: `
    <rf-form-builder
      [name]="name"
      [config]="config"
      [displayErrorsMode]="displayErrorsMode">
    </rf-form-builder>
  `,
})
class HostComponent {
  name = 'TestFormBuilder';
  displayErrorsMode = 0 as any;
  config: Record<string, any> = {};
}

describe('RfFormBuilderComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let store: InstanceType<typeof RfFormStore>;

  const getFB = (): RfFormBuilderComponent =>
    fixture.debugElement.query(By.directive(RfFormBuilderComponent)).componentInstance as RfFormBuilderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: IdService, useClass: IdServiceMock },
        // Use the real RfFormStore instead of a mock
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    store = TestBed.inject(RfFormStore);
    
    // Clean up the store before each test
    store.removeAllFormGroups();
  });

  it('creates and generates the RfFormGroup with controls from the config', () => {
    host.config = {
      firstName: {
        type: FB.INPUT,
        value: 'John',
        validators: [Validators.required],
      },
      contact: {
        type: FB.RADIO,
        radios: [{ value: 'email', checked: true }, { value: 'phone' }],
      },
    };
    fixture.detectChanges();

    const cmp = getFB();
    expect(cmp).toBeTruthy();
    expect(cmp.form instanceof RfFormGroup).toBeTrue();

    const fg = cmp.form as RfFormGroup;
    const cFirst = fg.get('firstName') as RfFormControl;
    const cContact = fg.get('contact') as RfFormControl;

    expect(cFirst.value).toBe('John');
    expect(cContact.value).toBe('email');

    // Required validator on firstName
    cFirst.setValue('');
    expect(cFirst.invalid).toBeTrue();
    expect(cFirst.hasError('required')).toBeTrue();
  });

  it('marks the control as disabled when the config indicates so', () => {
    host.config = {
      code: {
        type: FB.INPUT,
        value: 'XYZ',
        disabled: true,
      },
    };
    fixture.detectChanges();

    const cmp = getFB();
    const fg = cmp.form as RfFormGroup;
    const code = fg.get('code') as RfFormControl;

    expect(code.disabled).toBeTrue();
  });

  it('HTML_INJECTION does not create a control in the form, but sanitizes and stores in _sanitizedHtmlMap', () => {
    host.config = {
      htmlBlock: {
        type: FB.HTML_INJECTION,
        html: '<div><b>Safe</b></div>',
      },
      plain: { type: FB.INPUT, value: '' },
    };
    fixture.detectChanges();

    const cmp = getFB();
    const fg = cmp.form as RfFormGroup;

    expect(fg.get('htmlBlock')).toBeNull();              // Not a control
    expect(cmp._sanitizedHtmlMap.length).toBeGreaterThan(0);
    const lastIdx = cmp._sanitizedHtmlMap.length - 1;
    expect(cmp._sanitizedHtmlMap[lastIdx]['htmlBlock']).toBeTruthy(); // Sanitized present
  });

  it('getValidators maps arrays of ValidatorFn and returns the object as is if not an array', () => {
    const cmp = getFB();

    // Array -> array of functions
    const arr = cmp.getValidators([Validators.required, Validators.minLength(3)]);
    expect(Array.isArray(arr)).toBeTrue();
    expect(arr!.length).toBe(2);

    // Object -> returns as is
    const obj = { a: [Validators.required] } as any;
    const ret = cmp.getValidators(obj);
    expect(ret).toBe(obj);
  });

  it('persists state (value/touched/dirty/disabled/displayErrorsMode) between rebuilds', (done) => {
    // 1) First config and creation
    host.config = {
      fieldA: { type: FB.INPUT, value: 'A' },
      fieldB: { type: FB.INPUT, value: 'B' },
    };
    fixture.detectChanges();

    const cmp = getFB();
    const fg1 = cmp.form as RfFormGroup;

    // Change state of the controls
    const a1 = fg1.get('fieldA') as RfFormControl;
    const b1 = fg1.get('fieldB') as RfFormControl;

    a1.setValue('A*');
    a1.markAsTouched();
    a1.markAsDirty();
    b1.disable();

    // 2) New config (new object to trigger effect)
    host.config = {
      fieldA: { type: FB.INPUT, value: '' }, // will keep previous value after persisting
      fieldB: { type: FB.INPUT, value: '' },
    };
    fixture.detectChanges();

    // manageCreateForm notifies via formReady$ in requestAnimationFrame,
    // wait for the next macrotask
    setTimeout(() => {
      const fg2 = cmp.form as RfFormGroup;
      const a2 = fg2.get('fieldA') as RfFormControl;
      const b2 = fg2.get('fieldB') as RfFormControl;

      expect(a2.value).toBe('A*');      // persisted value
      expect(a2.touched).toBeTrue();    // persisted touched
      expect(a2.dirty).toBeTrue();      // persisted dirty
      expect(b2.disabled).toBeTrue();   // persisted disabled

      done();
    }, 0);
  });

  it('registers the form in the store via setFormGroup', (done) => {
    const cmp = getFB();
    
    // Subscribe to formReady$ to know when the form is created
    cmp.formReady$.subscribe((state) => {
      if (state?.ready) {
        // Verify the form was registered in the real store
        const registeredForm = store.getFormGroup('TestFormBuilder');
        expect(registeredForm).toBeTruthy();
        expect(registeredForm instanceof RfFormGroup).toBeTrue();
        
        // Verify the form has the expected control
        const xControl = registeredForm?.get('x');
        expect(xControl).toBeTruthy();
        
        done();
      }
    });

    host.config = {
      x: { type: FB.INPUT, value: '' },
    };
    fixture.detectChanges();
  });
}); 