import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { RfSwitchComponent } from './rf-switch.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

// --- Mocks for services injected by the base class ---
class MockIdService {
  private i = 0;
  generateRandomId() {
    this.i += 1;
    return `id-${this.i}`;
  }
}
class MockGlobalMouseService {
  mousedown$ = new Subject<void>();
  mouseup$ = new Subject<void>();
}

// Minimal host: lets the component run as a standalone control
@Component({
  standalone: true,
  imports: [RfSwitchComponent],
  template: `
    <rf-switch
      [label]="label()"
    ></rf-switch>
  `,
})
class HostComponent {
  label = signal<string>('My switch');
}

function getComp(fixture: ComponentFixture<HostComponent>): RfSwitchComponent {
  return fixture.debugElement.query(By.directive(RfSwitchComponent)).componentInstance;
}
function getSwitchEl(fixture: ComponentFixture<HostComponent>): HTMLInputElement {
  // Adjust if your template uses a different element ref; most likely it's an <input type="checkbox" #switch>
  const el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  return el;
}

// requestAnimationFrame helper — only needed if the component/base uses rAF in lifecycle
function flushRaf() {
  jasmine.clock().install();
  jasmine.clock().tick(16);
  jasmine.clock().uninstall();
}

describe('RfSwitchComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        // Prefer real tokens if available:
        // { provide: IdService, useClass: MockIdService },
        // { provide: GlobalMouseService, useClass: MockGlobalMouseService },
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    flushRaf();
  });

  // ---------------------- ngOnInit defaults ----------------------
  describe('ngOnInit defaults', () => {
    it('initializes value() to false when undefined', () => {
      const comp = getComp(fixture);
      // On first render, ngOnInit should set false if value was undefined
      expect(comp.value()).toBeFalse();
    });
  });

  // ---------------------- writeValue ----------------------
  describe('writeValue()', () => {
    it('accepts boolean and writes to value()', () => {
      const comp = getComp(fixture);
      comp.writeValue(true);
      fixture.detectChanges();
      expect(comp.value()).toBeTrue();

      comp.writeValue(false);
      fixture.detectChanges();
      expect(comp.value()).toBeFalse();
    });

    it('accepts FormControlState-like object { value } (coerced to boolean)', () => {
      const comp = getComp(fixture);
      comp.writeValue({ value: 1 } as any);
      fixture.detectChanges();
      expect(comp.value()).toBeTrue();

      comp.writeValue({ value: 0 } as any);
      fixture.detectChanges();
      expect(comp.value()).toBeFalse();
    });
  });

  // ---------------- registerOnChange / registerOnTouched ----------------
  describe('registerOnChange / registerOnTouched', () => {
    it('invokes onChange when updateValue() processes a change event', () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const input = getSwitchEl(fixture);
      // simulate a user toggling the checkbox to checked = true
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      // Most templates bind (change) to updateValue($event). If not, call directly:
      comp.updateValue({ target: input } as any as Event);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(true);
      expect(comp.value()).toBeTrue();
      expect((comp as any).control?.dirty).toBeTrue();
    });

    it('invokes onTouched when executeActionBlur() runs', () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onTouched');
      comp.registerOnTouched(spy);

      // Call the public method that is used to handle blur logic
      comp.executeActionBlur();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect((comp as any).control?.touched).toBeTrue();
    });
  });

  // ---------------------- disabled state ----------------------
  describe('setDisabledState / disabled propagation', () => {
    it('propagates disabled to the underlying control via onChangeDisabledState subscription', () => {
      const comp = getComp(fixture);

      comp.setDisabledState(true);
      fixture.detectChanges();
      expect(comp.disabled()).toBeTrue();
      expect((comp as any).control?.disabled).toBeTrue();

      comp.setDisabledState(false);
      fixture.detectChanges();
      expect(comp.disabled()).toBeFalse();
      expect((comp as any).control?.disabled).toBeFalse();
    });
  });

  // ---------------------- ElementRef & focus methods ----------------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the switch ElementRef', () => {
      const comp = getComp(fixture);
      const el = comp.getElementRef();
      expect(el).toBeTruthy();
      expect(el.nativeElement instanceof HTMLElement).toBeTrue();
    });

    it('focus() moves focus to the switch', () => {
      const comp = getComp(fixture);
      comp.focus();
      fixture.detectChanges();

      const input = getSwitchEl(fixture);
      expect(document.activeElement).toBe(input);
    });

    it('focusError() focuses the switch (same as focus())', () => {
      const comp = getComp(fixture);
      comp.focusError();
      fixture.detectChanges();

      const input = getSwitchEl(fixture);
      expect(document.activeElement).toBe(input);
    });
  });

  // ---------------------- toggle & updateValue ----------------------
  describe('toggle & updateValue()', () => {
    it('updateValue(event) sets value(), calls onChange, and marks dirty', () => {
      const comp = getComp(fixture);
      const input = getSwitchEl(fixture);

      input.checked = true;
      comp.updateValue({ target: input } as any as Event);
      fixture.detectChanges();

      expect(comp.value()).toBeTrue();
      expect((comp as any).control?.dirty).toBeTrue();

      input.checked = false;
      comp.updateValue({ target: input } as any as Event);
      fixture.detectChanges();

      expect(comp.value()).toBeFalse();
    });

    it('toggleSwitch(event) sets value(), calls onChange, marks dirty, and syncs control value', () => {
      const comp = getComp(fixture);
      const input = getSwitchEl(fixture);

      input.checked = true;
      comp.toggleSwitch({ target: input } as any as Event);
      fixture.detectChanges();

      expect(comp.value()).toBeTrue();
      expect((comp as any).control?.dirty).toBeTrue();
      expect((comp as any).control?.value).toBeTrue();

      input.checked = false;
      comp.toggleSwitch({ target: input } as any as Event);
      fixture.detectChanges();

      expect(comp.value()).toBeFalse();
      expect((comp as any).control?.value).toBeFalse();
    });
  });

  // ---------------------- label (public model) ----------------------
  describe('label (public model)', () => {
    it('exposes and updates the label() model', () => {
      const comp = getComp(fixture);
      // Initial value comes from Host binding
      expect(comp.label()).toBe('My switch');

      comp.label.set('New label');
      fixture.detectChanges();
      expect(comp.label()).toBe('New label');
    });
  });

  // ---------------------- error visibility ----------------------
  describe('errorMessagesShouldBeDisplayed (getter)', () => {
    it('default is false; true when TOUCHED + errors; disabled/readonly force false', () => {
      const comp = getComp(fixture);

      // default
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // configure touched mode
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // add errors and mark touched
      (comp as any).control?.setErrors({ required: true });
      comp.executeActionBlur(); // marks touched + onTouched()
      fixture.detectChanges();

      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();

      // disabled => false
      comp.setDisabledState(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // re-enable and set readonly => false
      comp.setDisabledState(false);
      comp.readonly.set(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });
  });

  // ---------------------- IDs & utilities ----------------------
  describe('IDs & utilities', () => {
    it('rfTypeClass is "RfSwitchComponent" and getComponentForId() strips suffix', () => {
      const comp = getComp(fixture);
      expect(comp.rfTypeClass).toBe('RfSwitchComponent');
      expect(comp.getComponentForId()).toBe('RfSwitch');
    });

    it('ngAfterViewInit sets autoId via generateAutoId()', async () => {
      const comp = getComp(fixture);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(comp.autoId.length).toBeGreaterThan(0);
      expect(comp.autoId).toContain('RfFormGroup-RfSwitch-');
    });

    it('generateAutoId() respects provided parentId override', () => {
      const comp = getComp(fixture);
      const id1 = comp.generateAutoId(null);
      expect(id1).toContain('RfFormGroup-RfSwitch-');

      const id2 = comp.generateAutoId('parent-xyz');
      expect(id2).toBe('RfFormGroup-parent-xyz__RfSwitch-');
    });

    it('getFullFormControlName() returns control name (no parent RfFormGroup => just control)', () => {
      const comp = getComp(fixture);
      comp.formControlName.set('agree');
      const name = comp.getFullFormControlName();
      expect(name).toBe('agree');
    });
  });

  // ---------------------- static helpers ----------------------
  describe('static showErrorsAccordingDisplayConfig()', () => {
    it('returns expected values for each display mode', () => {
      const control: any = { dirty: false, touched: false, submitted: false };

      expect(RfSwitchComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.ALWAYS)).toBeTrue();
      expect(RfSwitchComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.NEVER)).toBeFalse();

      control.dirty = true;
      expect(RfSwitchComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY)).toBeTrue();

      control.dirty = false; control.touched = true;
      expect(RfSwitchComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.TOUCHED)).toBeTrue();

      control.dirty = true; control.touched = true;
      expect(
        RfSwitchComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY_AND_TOUCHED)
      ).toBeTrue();
    });
  });
});
