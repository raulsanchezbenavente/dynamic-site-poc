// rf-prefix-phone.component.spec.ts
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { RfPrefixPhoneComponent } from './rf-prefix-phone.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { Validators } from '@angular/forms';

// ⚠️ Adjust these paths to the real ones in your project.
import { IdService } from '../../services/id/id.service';
import { GlobalEventsService } from '../../services/mouseEvents/mouse-events.service';

// ---- Minimal mocks for injections required by RfBaseReactiveComponent ----
class IdServiceMock {
  generateRandomId() { return 'test-id'; }
}
class GlobalEventsServiceMock {
  mousedown$ = new Subject<MouseEvent>();
  mouseup$ = new Subject<MouseEvent>();
  keydown$= new Subject<KeyboardEvent>();
}

// ---- Host using the component in Reactive Forms (CVA) mode ----
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RfPrefixPhoneComponent],
  template: `
    <form [formGroup]="form">
      <rf-prefix-phone
        formControlName="phone"
        [phoneName]="'phone'"
        [autocompletePhone]="autocompletePhone"
        [options]="options">
      </rf-prefix-phone>
    </form>
  `,
})
class HostComponent {
  // Per-field validators so the component can pick them up in ngAfterViewInit
  private fieldValidators = {
    prefix: [Validators.required],
    phone: [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(9)],
  };

  form = new RfFormGroup('TestForm', {
    phone: new RfFormControl<{ prefix: string; phone: string } | null>(
      null,
      this.fieldValidators // <- The component interprets these as RfPrefixPhoneValidators
    ),
  });

  // Required inputs
  autocompletePhone = 'tel' as any; // AutocompleteTypes
  options = [
    { value: '+34', content: '+34' },
    { value: '+44', content: '+44' },
  ];
}

describe('RfPrefixPhoneComponent — Public API with RfFormGroup/RfFormControl', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  // Helpers
  const getComp = (): RfPrefixPhoneComponent =>
    fixture.debugElement.children[0].query((de) => de.componentInstance instanceof RfPrefixPhoneComponent)
      .componentInstance as RfPrefixPhoneComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: IdService, useClass: IdServiceMock },
        { provide: GlobalEventsService, useClass: GlobalEventsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates inside an RfFormGroup/RfFormControl', () => {
    const comp = getComp();
    expect(comp).toBeTruthy();
    // The external control exists and is bound
    expect(host.form.get('phone')).toBeTruthy();
  });

  it('propagates value EXTERNAL → INTERNAL: setValue() on the FormControl updates the internal form', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    const value = { prefix: '+34', phone: '600123123' };
    outer.setValue(value);
    fixture.detectChanges();

    // The internal form should reflect the value
    expect(comp.form.get('prefix')?.value).toBe('+34');
    expect(comp.form.get('phone')?.value).toBe('600123123');
  });

  it('propagates value INTERNAL → EXTERNAL: changing the internal form emits onChange and updates the FormControl', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    // Simulate user filling internal fields
    comp.form.get('prefix')?.setValue('+44');
    comp.form.get('phone')?.setValue('207946095');
    fixture.detectChanges();

    // The CVA should have propagated the combined object
    expect(outer.value).toEqual({ prefix: '+44', phone: '207946095' });
  });

  it('setDisabledState via ReactiveForms: disable/enable on the external control disables/enables the internal form', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    outer.disable({ emitEvent: false });
    fixture.detectChanges();

    expect(comp.form.get('prefix')?.disabled).toBeTrue();
    expect(comp.form.get('phone')?.disabled).toBeTrue();

    outer.enable({ emitEvent: false });
    fixture.detectChanges();

    expect(comp.form.get('prefix')?.enabled).toBeTrue();
    expect(comp.form.get('phone')?.enabled).toBeTrue();
  });

  it('validate(): returns aggregated errors when internal fields do not pass validation', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    // Invalid value: phone does not meet minLength(9) nor pattern
    outer.setValue({ prefix: '', phone: 'abc' });
    fixture.detectChanges();

    const errors = comp.validate(outer);
    // There should be errors per field
    expect(errors).toBeTruthy();
    expect(errors!['prefix']).toEqual({ required: true });
    expect(errors!['phone']).toBeTruthy(); // pattern/minLength
  });

  it('markAsTouched/Dirty on children marks the external control as touched/dirty', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    expect(outer.touched).toBeFalse();
    expect(outer.dirty).toBeFalse();

    // The component subscribes in ngOnInit to onMarkAsTouched/onMarkAsDirty of the children
    (comp.form.get('phone') as RfFormControl).markAsTouched();
    (comp.form.get('prefix') as RfFormControl).markAsDirty();

    fixture.detectChanges();

    expect(outer.touched).toBeTrue();
    expect(outer.dirty).toBeTrue();
  });

  it('writeValue() accepts FormControlState-like { value } and updates the internal form', () => {
    const comp = getComp();
    const outer = host.form.get('phone') as RfFormControl;

    // Angular Forms would call writeValue when setValue is called on the external control,
    // here we simulate the wrapper { value }
    const wrapped = { value: { prefix: '+34', phone: '600600600' } };
    outer.setValue(wrapped as any);
    fixture.detectChanges();

    expect(comp.form.get('prefix')?.value).toBe('+34');
    expect(comp.form.get('phone')?.value).toBe('600600600');
  });

  it('setDisabledState(true/false) directly on the component affects the children and keeps validity in sync', () => {
    const comp = getComp();

    comp.setDisabledState(true);
    fixture.detectChanges();
    expect(comp.form.get('prefix')?.disabled).toBeTrue();
    expect(comp.form.get('phone')?.disabled).toBeTrue();

    comp.setDisabledState(false);
    fixture.detectChanges();
    expect(comp.form.get('prefix')?.enabled).toBeTrue();
    expect(comp.form.get('phone')?.enabled).toBeTrue();
  });
});