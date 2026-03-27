import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, AbstractControl, Validators } from '@angular/forms';
import { RfHintMessagesComponent } from './rf-hint-messages.component';
import { RfBaseReactiveComponent } from '../../../abstract/components/rf-base-reactive.component';
import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';

describe('RfHintMessagesComponent', () => {
  let fixture: ComponentFixture<RfHintMessagesComponent>;
  let comp: RfHintMessagesComponent;

  const getHintEl = () =>
    fixture.debugElement.query(By.css('.rf-field-message'))?.nativeElement as HTMLDivElement | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfHintMessagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RfHintMessagesComponent);
    comp = fixture.componentInstance;
  });

  it('host should have class rf-hint-message', () => {
    fixture.detectChanges();
    const host: HTMLElement = fixture.debugElement.nativeElement;
    expect(host.classList.contains('rf-hint-message')).toBeTrue();
  });

  describe('basic render', () => {
    it('shows the hint when showHintMessages=true, there is hintMessage and there are no visible errors', () => {
      comp.control.set(null); // no control => no visible error
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Use a valid format');
      fixture.detectChanges();

      const el = getHintEl();
      expect(el).toBeTruthy();
      expect(el!.textContent?.trim()).toBe('Use a valid format');
    });

    it('does not show the hint if showHintMessages=false even if there is hintMessage', () => {
      comp.control.set(null);
      comp.showHintMessages.set(false);
      comp.hintMessage.set('Hint');
      fixture.detectChanges();

      expect(getHintEl()).toBeUndefined();
    });

    it('applies id and extra classes to the hint container', () => {
      comp.control.set(null);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Help text');
      comp.id.set('hint-1');
      comp.classes.set({ message: 'u-text-muted u-mt-1' } as any);
      fixture.detectChanges();

      const el = getHintEl()!;
      expect(el.id).toBe('hint-1');
      expect(el.classList.contains('u-text-muted')).toBeTrue();
      expect(el.classList.contains('u-mt-1')).toBeTrue();
    });
  });

  describe('single control', () => {
    it('shows hint if the control is valid (even if the policy allows showing errors)', () => {
      const ctrl = new FormControl('ok');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.control.set(ctrl);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Help visible because there is no error');
      fixture.detectChanges();

      expect(getHintEl()).toBeTruthy();
    });

    it('hides hint if the control is invalid and the policy allows showing errors', () => {
      const ctrl = new FormControl('');
      ctrl.setValidators(Validators.required);
      ctrl.updateValueAndValidity();

      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.control.set(ctrl);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Should not be visible');
      fixture.detectChanges();

      expect(getHintEl()).toBeUndefined();
    });

    it('shows hint if the control is invalid but the policy does NOT allow showing errors', () => {
      const ctrl = new FormControl('');
      ctrl.setValidators(Validators.required);
      ctrl.updateValueAndValidity();

      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(false);

      comp.control.set(ctrl);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Visible because the policy does not show errors');
      fixture.detectChanges();

      expect(getHintEl()).toBeTruthy();
    });

    it('passes the displayErrorsMode to showErrorsAccordingDisplayConfig', () => {
      const ctrl = new FormControl('');
      ctrl.setValidators(Validators.required);
      ctrl.updateValueAndValidity();

      const spy = spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED as any);
      comp.control.set(ctrl);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('…');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      const [passedCtrl, passedMode] = spy.calls.mostRecent().args as [AbstractControl, RfErrorDisplayModes];
      expect(passedCtrl).toBe(ctrl);
      expect(passedMode).toBe(RfErrorDisplayModes.TOUCHED as any);
    });

    it('reacts to changing from valid→invalid (hides) and from invalid→valid (shows)', () => {
      const ctrl = new FormControl('ok');
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.control.set(ctrl);
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Hint');
      fixture.detectChanges();
      expect(getHintEl()).toBeTruthy();

      // Now invalidate
      ctrl.setValidators(Validators.required);
      ctrl.setValue('');
      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      expect(getHintEl()).toBeUndefined();

      // Back to valid
      ctrl.setValue('something');
      ctrl.updateValueAndValidity();
      fixture.detectChanges();
      expect(getHintEl()).toBeTruthy();
    });
  });

  describe('multiple controls', () => {
    it('hides hint if ANY is invalid and the policy allows showing errors', () => {
      const a = new FormControl('ok');
      const b = new FormControl('');
      b.setValidators(Validators.required);
      b.updateValueAndValidity();

      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(true);

      comp.control.set({ a, b });
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Should not be visible');
      fixture.detectChanges();

      expect(getHintEl()).toBeUndefined();
    });

    it('shows hint if none are invalid or if the policy does not allow showing errors', () => {
      const a = new FormControl('ok');
      const b = new FormControl('');
      b.setValidators(Validators.required);
      b.updateValueAndValidity();

      // Policy does NOT show errors -> even if b is invalid, the hint appears
      spyOn(RfBaseReactiveComponent as any, 'showErrorsAccordingDisplayConfig').and.returnValue(false);

      comp.control.set({ a, b });
      comp.showHintMessages.set(true);
      comp.hintMessage.set('Should be visible');
      fixture.detectChanges();

      expect(getHintEl()).toBeTruthy();
    });
  });
});