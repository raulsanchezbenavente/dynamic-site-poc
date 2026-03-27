import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { RfCheckboxComponent } from './rf-checkbox.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

// ----------------- Minimal mocks -----------------
class MockIdService {
  private i = 0;
  generateRandomId() { this.i += 1; return `id-${this.i}`; }
}
class MockGlobalMouseService {
  mousedown$ = new Subject<void>();
  mouseup$ = new Subject<void>();
}

// ----------------- Minimal host (1 checkbox) -----------------
@Component({
  standalone: true,
  imports: [RfCheckboxComponent],
  template: `
    <rf-checkbox></rf-checkbox>
  `,
})
class HostComponent {}

// ----------------- Host for group (2 checkboxes) -----------------
@Component({
  standalone: true,
  imports: [RfCheckboxComponent],
  template: `
    <rf-checkbox></rf-checkbox>
    <rf-checkbox></rf-checkbox>
  `,
})
class MultiHostComponent {}

// ----------------- Helpers -----------------
function flushView<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  return fixture.whenStable().then(() => fixture.detectChanges());
}
function getComp<T>(fixture: ComponentFixture<T>): RfCheckboxComponent {
  return fixture.debugElement.query(By.directive(RfCheckboxComponent)).componentInstance;
}
function getAllComps<T>(fixture: ComponentFixture<T>): RfCheckboxComponent[] {
  return fixture.debugElement.queryAll(By.directive(RfCheckboxComponent)).map(d => d.componentInstance);
}
function getInputEl<T>(fixture: ComponentFixture<T>): HTMLInputElement {
  return fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement as HTMLInputElement;
}
function getWrapperEl<T>(fixture: ComponentFixture<T>): HTMLElement {
  return fixture.debugElement.query(By.css('.rf-checkbox-radio-inner')).nativeElement as HTMLElement;
}

describe('RfCheckboxComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    // Force synchronous rAF (the component uses it for post-render actions)
    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    });

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await flushView(fixture);
  });

  afterEach(() => {
    // Clean static state between tests (very important)
    (RfCheckboxComponent as any).controls = {};
    (RfCheckboxComponent as any).globalGroups = {};
    (RfCheckboxComponent as any).checkboxValues = {};
    (RfCheckboxComponent as any).checkboxOrder = {};
    (RfCheckboxComponent as any).validators = {};
    (RfCheckboxComponent as any).disabled = {};
    (RfCheckboxComponent as any).errorMessages = {};
    (RfCheckboxComponent as any).ariaIds = {};
    (RfCheckboxComponent as any).previosGroupId = '';
  });

  // ---------------- writeValue ----------------
  describe('writeValue()', () => {
    it('marks checked when its value is in the array', async () => {
      const comp = getComp(fixture);
      comp.value.set('apple');
      await flushView(fixture);

      comp.writeValue(['banana', 'apple']);
      await flushView(fixture);

      expect(comp.isChecked).toBeTrue();
      expect(comp.checked()).toBeTrue();
    });

    it('accepts FormControlState-like object { value }', async () => {
      const comp = getComp(fixture);
      comp.value.set('banana');
      await flushView(fixture);

      comp.writeValue({ value: ['banana'] } as any);
      await flushView(fixture);

      expect(comp.isChecked).toBeTrue();
      expect(comp.checked()).toBeTrue();
    });
  });

  // ---------------- change + output ----------------
  describe('onCheckboxChange()', () => {
    it('emits changeChecked and updates the group/value', async () => {
      const comp = getComp(fixture);
      comp.value.set('x');
      await flushView(fixture);

      const spyEmit = spyOn(comp.changeChecked, 'emit');
      const input = getInputEl(fixture);

      // simulate check
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      await flushView(fixture);

      expect(spyEmit).toHaveBeenCalledWith(true);
      expect(comp.isChecked).toBeTrue();
    });
  });

  // ---------------- setChecked ----------------
  describe('setChecked()', () => {
    it('sets the state and propagates to the group', async () => {
      const comp = getComp(fixture);
      comp.value.set('v1');
      await flushView(fixture);

      comp.setChecked(true);
      await flushView(fixture);

      expect(comp.isChecked).toBeTrue();

      comp.setChecked(false);
      await flushView(fixture);

      expect(comp.isChecked).toBeFalse();
    });
  });

  // ---------------- focus / ElementRef ----------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the ElementRef of the input', () => {
      const comp = getComp(fixture);
      const el = comp.getElementRef();
      expect(el).toBeTruthy();
      expect((el.nativeElement as HTMLElement).tagName.toLowerCase()).toBe('input');
    });

    it('focus() moves focus to the input', async () => {
      const comp = getComp(fixture);
      comp.focus();
      await flushView(fixture);

      const input = getInputEl(fixture);
      expect(document.activeElement).toBe(input);
    });

    it('focusError() delegates to focus()', async () => {
      const comp = getComp(fixture);
      comp.focusError();
      await flushView(fixture);

      const input = getInputEl(fixture);
      expect(document.activeElement).toBe(input);
    });
  });

  // ---------------- blur / touched ----------------
  describe('blur & touched', () => {
    it('executeActionBlur() marks touched when focus leaves the group', async () => {
      const comp = getComp(fixture);

      // Clear preconditions
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      comp.disabled.set(false);
      comp.readonly.set(false);
      comp.disabledCheckbox.set(false);

      // Force a group id consistent with the template and render the attribute
      (comp as any).checkFormName = 'grp1';
      fixture.detectChanges();

      // Use the REAL wrapper from the template (has (focusout)="handleBlur($event)")
      const wrapper: HTMLElement = fixture.debugElement
        .query(By.css('.rf-checkbox-radio-inner')).nativeElement;

      // Sanity check: the wrapper must have the group attribute
      expect(wrapper.getAttribute('data-checkbox-group')).toBe('grp1');

      // Make sure it does not block blur
      (comp as any).mouseDownIsInProgress = false;

      // Set errors
      comp.control?.setErrors({ required: true });
      fixture.detectChanges();

      // Create an element outside the group and focus it
      const outside = document.createElement('button');
      outside.setAttribute('data-checkbox-group', 'OTHER');
      outside.tabIndex = 0;
      document.body.appendChild(outside);
      outside.focus(); // will be document.activeElement when RAF runs

      // Fire focusout on the real wrapper (this invokes handleBlur from the template)
      const ev = new FocusEvent('focusout', { relatedTarget: outside } as any);
      wrapper.dispatchEvent(ev);
      fixture.detectChanges();

      // rAF is already instant thanks to beforeAll(useInstantRAFOnce)
      expect(comp.control?.touched).toBeTrue();

      // And now, with touched + errors + TOUCHED mode ⇒ getter is true
      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();
    });
  });


  // ---------------- disabled & classes ----------------
  describe('disabled & classes', () => {
    it('disabledCheckbox() disables the input and applies is-disabled class', async () => {
      const comp = getComp(fixture);
      comp.disabledCheckbox.set(true);
      await flushView(fixture);

      const input = getInputEl(fixture);
      const wrapper = getWrapperEl(fixture);
      expect(input.disabled).toBeTrue();
      expect(wrapper.classList.contains('is-disabled')).toBeTrue();
    });

    it('hostClasses reflects classes()?.container on the host', async () => {
      const comp = getComp(fixture);
      comp.classes.set({ container: 'host-xx' } as any);
      await flushView(fixture);

      const hostEl = fixture.debugElement.query(By.directive(RfCheckboxComponent)).nativeElement as HTMLElement;
      expect(hostEl.classList.contains('host-xx')).toBeTrue();
    });
  });

  // ---------------- label ----------------
  describe('label (input())', () => {
    it('updates the visible label', async () => {
      const comp = getComp(fixture);
      comp.label.set('Accept terms');
      await flushView(fixture);

      const labelEl = fixture.debugElement.query(By.css('label.rf-checkbox-radio_label')).nativeElement as HTMLElement;
      expect(labelEl.innerHTML).toContain('Accept terms');
    });
  });

  // ---------------- errors / display ----------------
  describe('errorMessagesShouldBeDisplayed (getter)', () => {
    it('default false; true with TOUCHED + errors; readonly/disabled force false', async () => {
      const comp = getComp(fixture);

      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.readonly.set(true);
      await flushView(fixture);
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.readonly.set(false);
      comp.disabled.set(true);
      await flushView(fixture);
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });
  });
});

describe('RfCheckboxComponent — Group behavior', () => {
  let fixture: ComponentFixture<MultiHostComponent>;

  beforeEach(async () => {
    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => { cb(0); return 0 as any; });

    await TestBed.configureTestingModule({
      imports: [MultiHostComponent],
      providers: [
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiHostComponent);
    const [c1, c2] = getAllComps(fixture);

    // Configure same group and different values BEFORE first detectChanges
    c1.name.set('fruits'); c2.name.set('fruits');
    c1.value.set('apple'); c2.value.set('banana');

    await flushView(fixture);
  });

  afterEach(() => {
    (RfCheckboxComponent as any).controls = {};
    (RfCheckboxComponent as any).globalGroups = {};
    (RfCheckboxComponent as any).checkboxValues = {};
    (RfCheckboxComponent as any).checkboxOrder = {};
    (RfCheckboxComponent as any).validators = {};
    (RfCheckboxComponent as any).disabled = {};
    (RfCheckboxComponent as any).errorMessages = {};
    (RfCheckboxComponent as any).ariaIds = {};
    (RfCheckboxComponent as any).previosGroupId = '';
  });

  it('checking apple adds "apple" to the group and synchronizes both controls', async () => {
    const [c1, c2] = getAllComps(fixture);
    const input1 = fixture.debugElement.queryAll(By.css('input[type="checkbox"]'))[0].nativeElement as HTMLInputElement;

    input1.checked = true;
    input1.dispatchEvent(new Event('change'));
    await flushView(fixture);

    // Both components share the same group control/value (standalone sync)
    expect(c1.isChecked).toBeTrue();
    expect((c1.control?.value as string[])).toEqual(['apple']);
    expect((c2.control?.value as string[])).toEqual(['apple']);
  });
}); 