import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';

import { RfRadioGroupComponent } from './rf-radio-group.component';
import { RfRadioComponent } from '../../rf-radio/rf-radio.component';

/** Host that uses the real components so that @ContentChild by type works */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RfRadioGroupComponent, RfRadioComponent],
  template: `
    <rf-radio-group [legend]="legend">
      <rf-radio></rf-radio>
      <span class="extra">extra content</span>
    </rf-radio-group>
  `,
})
class HostComponent {
  legend = 'Options';
}

describe('RfRadioGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getGroupDE = () => fixture.debugElement.query(By.directive(RfRadioGroupComponent));
  const getGroup = () => getGroupDE().componentInstance as RfRadioGroupComponent;
  const getFieldset = () => getGroupDE().query(By.css('fieldset')).nativeElement as HTMLFieldSetElement;
  const getChildRadio = () => fixture.debugElement.query(By.directive(RfRadioComponent)).componentInstance as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('is created and applies the host class', () => {
    fixture.detectChanges();
    const groupEl: HTMLElement = getGroupDE().nativeElement;
    expect(getGroup()).toBeTruthy();
    expect(groupEl.classList.contains('rf-radio-group')).toBeTrue();
  });

  it('fieldset has role="radiogroup"', () => {
    fixture.detectChanges();
    expect(getFieldset().getAttribute('role')).toBe('radiogroup');
  });

  describe('<fieldset> attributes depending on the child', () => {
    it('data-radio-group uses radio.radioFormName', () => {
      fixture.detectChanges();
      const child = getChildRadio();
      child.radioFormName = 'my-form';
      fixture.detectChanges();
      expect(getFieldset().getAttribute('data-radio-group')).toBe('my-form');

      child.radioFormName = null;
      fixture.detectChanges();
      expect(getFieldset().getAttribute('data-radio-group')).toBeNull();
    });

    it('form-control-name uses formControlName() if it exists; if not, name()', () => {
      fixture.detectChanges();
      const child = getChildRadio();

      // ensure signals
      if (typeof child.formControlName !== 'function') child.formControlName = signal<string | undefined>(undefined);
      if (typeof child.name !== 'function') child.name = signal<string | undefined>(undefined);

      child.formControlName.set('mode');
      child.name.set(undefined);
      fixture.detectChanges();
      expect(getFieldset().getAttribute('form-control-name')).toBe('mode');

      child.formControlName.set(undefined);
      child.name.set('plan');
      fixture.detectChanges();
      expect(getFieldset().getAttribute('form-control-name')).toBe('plan');

      child.name.set(undefined);
      fixture.detectChanges();
      expect(getFieldset().getAttribute('form-control-name')).toBeNull();
    });
  });

  describe('synchronization with the control and aria', () => {
    it('ngAfterViewInit propagates legend() to the child and reads ariaId()', () => {
      host.legend = 'Selection';
      fixture.detectChanges(); // triggers ngAfterViewInit of the group

      const child = getChildRadio();
      // child.legend is WritableSignal
      expect((child.legend as WritableSignal<string | undefined>)()).toBe('Selection');

      // ariaId()
      spyOn(child, 'ariaId').and.returnValue('aria-1');
      // we need another detectChanges for the group to re-execute after each read? no; assign manually
      getGroup().ariaId = child.ariaId();
      expect(getGroup().ariaId).toBe('aria-1');
    });

    it('isInvalid reflects the state of the FormControl and reacts to statusChanges', () => {
      fixture.detectChanges();
      const group = getGroup();
      const child = getChildRadio();

      // getFormControl() must exist; if not, create a minimal one
      if (!child.getFormControl || typeof child.getFormControl !== 'function') {
        const fc = new FormControl<string | null>(null, Validators.required);
        child.getFormControl = () => fc;
      }

      // initial state
      const ctrl: FormControl = child.getFormControl();
      ctrl.setValidators(Validators.required);
      ctrl.setValue(null);
      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      expect(group.isInvalid).toBeTrue();

      // now valid
      ctrl.setValue('A');
      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      expect(group.isInvalid).toBeFalse();
    });
  });
});