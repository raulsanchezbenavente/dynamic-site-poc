// rf-base-reactive.component.spec.ts
import { Component, ElementRef, forwardRef, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';

import { RfBaseReactiveComponent } from './rf-base-reactive.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfErrorDisplayModes } from '../enums/rf-base-reactive-display-mode.enum';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { IdService } from '../../services/id/id.service';
import { GlobalEventsService } from '../../services/mouseEvents/mouse-events.service';

// ---- Required mocks ----
@Injectable()
class IdServiceMock {
  private i = 0;
  generateRandomId() { return ('id' + (++this.i)).padStart(3, '0'); }
}

@Injectable()
class GlobalEventsServiceMock {
  mousedown$ = new Subject<MouseEvent>();
  mouseup$ = new Subject<MouseEvent>();
  keydown$ = new Subject<KeyboardEvent>();
}

// ---- Fake component that extends the abstract one ----
@Component({
  selector: 'fake-field',
  standalone: true,
  template: `<span></span>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FakeFieldComponent), multi: true },
    { provide: NG_VALIDATORS,    useExisting: forwardRef(() => FakeFieldComponent), multi: true },
    { provide: (globalThis as any).IdService ?? 'IdService', useClass: IdServiceMock },
    { provide: (globalThis as any).GlobalEventsService ?? 'GlobalEventsService', useClass: GlobalEventsServiceMock  },
  ],
})
class FakeFieldComponent extends RfBaseReactiveComponent<string> {
  // For IDs / autoId
  public override rfTypeClass = 'RfInputTextComponent';

  // Minimal required implementations
  public override executeActionBlur(): void { /* noop */ }
  public override focus(): void { /* noop */ }
  public override focusError(): void { /* noop */ }
  public override getElementRef(): ElementRef { return new ElementRef(document.createElement('input')); }
}

// ---- Host that provides ControlContainer via form/formControlName ----
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FakeFieldComponent],
  template: `
    <form [formGroup]="form">
      <fake-field formControlName="foo"
                  [displayErrorsMode]="displayMode()"
                  [readonly]="readonly()"
                  [disabled]="disabled()"></fake-field>
    </form>
  `,
})
class HostComponent {
  form = new RfFormGroup('HostForm', {
    foo: new RfFormControl('', [Validators.required]),
  });  

  // Simulate the new input signals (model() in the abstract accepts a setter fn)
  displayMode = () => this._displayMode;
  private _displayMode = RfErrorDisplayModes.NONE;

  readonly = () => this._readonly;
  private _readonly = false;

  disabled = () => this._disabled;
  private _disabled = false;

  setMode(m: RfErrorDisplayModes) { this._displayMode = m; }
  setReadonly(v: boolean) { this._readonly = v; }
  setDisabled(v: boolean) { this._disabled = v; }
}

// ----------------- TESTS -----------------
describe('RfBaseReactiveComponent (via FakeFieldComponent)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let field: FakeFieldComponent;

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
    field = fixture.debugElement.query(By.directive(FakeFieldComponent)).componentInstance;
  });

  it('instantiates and links to the form FormControl', () => {
    console.log(field);
    expect(field).toBeTruthy();
    // The abstract class links the control and parentForm in ngAfterContentInit()
    expect(field.getFormControl()).toBe(host.form.get('foo') as RfFormControl);
    expect(field.getParentFormGroup()).toBe(host.form);
  });

  it('setDisabledState(true/false) syncs with the control (reactive effect)', () => {
    // via host's `disabled` input signal
    host.setDisabled(true);
    fixture.detectChanges();
    expect(host.form.get('foo')!.disabled).toBeTrue();

    host.setDisabled(false);
    fixture.detectChanges();
    expect(host.form.get('foo')!.disabled).toBeFalse();
  });

  it('errorMessagesShouldBeDisplayed: respects TOUCHED mode', () => {
    // force required error
    host.form.get('foo')!.setValue('');
    host.form.get('foo')!.setErrors({ required: true });
    host.setReadonly(false);
    host.setDisabled(false);
    host.setMode(RfErrorDisplayModes.TOUCHED);
    fixture.detectChanges();

    // not touched yet → does not display
    expect(field.errorMessagesShouldBeDisplayed).toBeFalse();

    // mark as touched and detect
    host.form.get('foo')!.markAsTouched();
    fixture.detectChanges();
    expect(field.errorMessagesShouldBeDisplayed).toBeTrue();

    // if readonly/disabled → forces false
    host.setReadonly(true);
    fixture.detectChanges();
    expect(field.errorMessagesShouldBeDisplayed).toBeFalse();
  });

  it('generateAutoId() composes the id with form name, type, and formControlName', () => {
    const id = field.generateAutoId(null);
    // FormName_ControlType_ControlName
    expect(id).toContain('HostForm_');
    expect(id).toContain('RfFormGroup-HostForm__RfInputText'); // getComponentForId() without "Component"
    expect(id).toContain('foo');
  });

  it('showErrorsAccordingDisplayConfig() (static) works for different modes', () => {
    const c = host.form.get('foo') as RfFormControl;

    // DIRTY
    c.markAsPristine();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.DIRTY)).toBeFalse();
    c.markAsDirty();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.DIRTY)).toBeTrue();

    // TOUCHED
    c.markAsUntouched();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.TOUCHED)).toBeFalse();
    c.markAsTouched();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.TOUCHED)).toBeTrue();

    // DIRTY_AND_TOUCHED
    c.markAsPristine(); c.markAsUntouched();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.DIRTY_AND_TOUCHED)).toBeFalse();
    c.markAsDirty(); c.markAsTouched();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.DIRTY_AND_TOUCHED)).toBeTrue();

    // ALWAYS / NEVER
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.ALWAYS)).toBeTrue();
    expect(RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(c, RfErrorDisplayModes.NEVER)).toBeFalse();
  });
});
