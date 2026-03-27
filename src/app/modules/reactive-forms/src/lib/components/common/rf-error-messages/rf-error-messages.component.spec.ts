import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, AbstractControl } from '@angular/forms';
import { RfBaseReactiveComponent } from '../../../abstract/components/rf-base-reactive.component';
import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfErrorMessagesComponent } from '../rf-error-messages/rf-error-messages.component';
// (Optional) If you want to explicitly check the default value, uncomment this import:
// import { DEFAULT_SHOW_ERRORS_MODE } from '../../../abstract/constants/rf-default-values.constant';

describe('RfErrorMessagesComponent', () => {
  let fixture: ComponentFixture<RfErrorMessagesComponent>;
  let comp: RfErrorMessagesComponent;

  const getMessageDiv = () =>
    fixture.debugElement.query(By.css('.rf-field-message'))?.nativeElement as HTMLDivElement | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfErrorMessagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RfErrorMessagesComponent);
    comp = fixture.componentInstance;
  });

  describe('basic rendering and classes/id', () => {
    it('should not render anything if there is no control', () => {
      comp.control.set(null);
      comp.showErrorMessages.set(true);
      fixture.detectChanges();
      expect(getMessageDiv()).toBeUndefined();
    });

    it('should not render if showErrorMessages() is false even if there are errors', () => {
      const ctrl = new FormControl('');
      // Simulate that errors should be shown according to the policy
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);
      ctrl.setErrors({ required: true });

      comp.control.set(ctrl);
      comp.showErrorMessages.set(false);
      fixture.detectChanges();

      expect(getMessageDiv()).toBeUndefined();
    });

    it('should render message when showErrorMessages() is true and there is firstErrorMessage', () => {
      const ctrl = new FormControl('');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);
      ctrl.setErrors({ required: true });

      comp.control.set(ctrl);
      comp.showErrorMessages.set(true);
      fixture.detectChanges();

      const div = getMessageDiv();
      expect(div).toBeTruthy();
      expect(div?.textContent?.trim()).toBe('required'); // no mapping -> uses the key
    });

    it('should apply id and extra classes', () => {
      const ctrl = new FormControl('');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);
      ctrl.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });

      comp.control.set(ctrl);
      comp.showErrorMessages.set(true);
      comp.id.set('err-1');
      comp.classes.set({ message: 'u-text-danger u-mt-2' } as any);
      fixture.detectChanges();

      const div = getMessageDiv()!;
      expect(div.getAttribute('id')).toBe('err-1');
      expect(div.classList.contains('u-text-danger')).toBeTrue();
      expect(div.classList.contains('u-mt-2')).toBeTrue();
    });

    it('host should have class rf-error-message', () => {
      fixture.detectChanges();
      const host: HTMLElement = fixture.debugElement.nativeElement as HTMLElement;
      expect(host.classList.contains('rf-error-message')).toBeTrue();
    });
  });

  describe('single control (AbstractControl)', () => {
    it('maps the first error using errorMessages if present, otherwise uses the key', () => {
      const ctrl = new FormControl('');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);
      ctrl.setErrors({ minlength: true, required: true });

      comp.control.set(ctrl);
      comp.errorMessages.set({
        minlength: 'Text is too short',
        // intentionally omit "required" to verify fallback
      } as any);
      comp.showErrorMessages.set(true);

      fixture.detectChanges();

      // Takes the first key in the errors object: "minlength"
      expect(getMessageDiv()?.textContent?.trim()).toBe('Text is too short');

      // Now change the order simulating another error first
      ctrl.setErrors({ required: true, minlength: true });
      fixture.detectChanges();
      expect(getMessageDiv()?.textContent?.trim()).toBe('required');
    });

    it('shows nothing if showErrorsAccordingDisplayConfig returns false', () => {
      const ctrl = new FormControl('');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(false);
      ctrl.setErrors({ required: true });

      comp.control.set(ctrl);
      comp.showErrorMessages.set(true);

      fixture.detectChanges();
      expect(getMessageDiv()).toBeUndefined();
    });
  });

  describe('multiple controls (Record<string, AbstractControl | null>)', () => {
    it('shows the message of the first control (in order) that has errors when one is ready to show', () => {
      const a = new FormControl('');
      const b = new FormControl('');
      a.setErrors(null);
      b.setErrors({ pattern: true });

      const spy = spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig');
      // Returns true for both (at least one is ready)
      spy.and.callFake((_control: AbstractControl, _mode: RfErrorDisplayModes) => true);

      comp.control.set({ a, b }); // order: a, then b
      comp.errorMessages.set({
        b: { pattern: 'Invalid format' },
      } as any);
      comp.showErrorMessages.set(true);

      fixture.detectChanges();
      expect(getMessageDiv()?.textContent?.trim()).toBe('Invalid format');
    });

    it('shows nothing if no control is ready according to the policy', () => {
      const a = new FormControl('');
      const b = new FormControl('');
      a.setErrors({ required: true });
      b.setErrors({ minlength: true });

      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(false);

      comp.control.set({ a, b });
      comp.showErrorMessages.set(true);
      fixture.detectChanges();

      expect(getMessageDiv()).toBeUndefined();
    });

    it('if the control with errors has no mapping, uses the error key', () => {
      const x = new FormControl('');
      x.setErrors({ customErr: true });

      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.control.set({ x });
      comp.errorMessages.set({ /* no mapping for x */ } as any);
      comp.showErrorMessages.set(true);

      fixture.detectChanges();
      expect(getMessageDiv()?.textContent?.trim()).toBe('customErr');
    });
  });

  describe('displayErrorsMode (model) and ngOnInit', () => {
    it('if displayErrorsMode is falsy on init, ngOnInit resets it to a default value', () => {
      // Force to undefined and explicitly call ngOnInit
      comp.displayErrorsMode.set(undefined as unknown as RfErrorDisplayModes);
      comp.ngOnInit();
      expect(comp.displayErrorsMode()).toBeTruthy();
      // If you want to check the exact value:
      // expect(comp.displayErrorsMode()).toBe(DEFAULT_SHOW_ERRORS_MODE);
    });

    it('passes the current value of displayErrorsMode to showErrorsAccordingDisplayConfig', () => {
      const ctrl = new FormControl('');
      ctrl.setErrors({ required: true });

      const spy = spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      // Select a specific mode and verify it is used in the call
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED as any);
      comp.control.set(ctrl);
      comp.showErrorMessages.set(true);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      const [passedCtrl, passedMode] = spy.calls.mostRecent().args;
      expect(passedCtrl).toBe(ctrl);
      expect(passedMode).toBe(RfErrorDisplayModes.TOUCHED as any);
    });
  });
});