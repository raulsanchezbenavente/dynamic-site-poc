import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { RfInputTextComponent } from './rf-input-text.component';
import { RfInputTypes } from './models/rf-input-types.model';
import { AutocompleteTypes } from './enums/rf-autocomplete-types.enum';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';
import { simulatePaste } from '../../unit-tests-helpers/paste-helper';

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
  imports: [RfInputTextComponent],
  template: `
    <rf-input-text
      [name]="'alias'"
      [autocomplete]="autocomplete"
      [type]="type()"
      [inputPattern]="inputPattern()"
      [placeholder]="placeholder()"
      (blurInputText)="lastBlur = $event"
    ></rf-input-text>
  `,
})
class HostComponent {
  autocomplete = AutocompleteTypes.OFF;
  type = signal<RfInputTypes>(RfInputTypes.TEXT);
  inputPattern = signal<RegExp | undefined>(undefined);
  placeholder = signal<string>('');
  lastBlur: string | null = null;
}

function getComp(fixture: ComponentFixture<HostComponent>): RfInputTextComponent {
  return fixture.debugElement.query(By.directive(RfInputTextComponent)).componentInstance;
}
function getInputEl(fixture: ComponentFixture<HostComponent>): HTMLInputElement {
  return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
}

// requestAnimationFrame is used in ngAfterViewInit => simulate a frame
function flushRaf() {
  jasmine.clock().install();
  jasmine.clock().tick(16);
  jasmine.clock().uninstall();
}

describe('RfInputTextComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    flushRaf();
  });

  // -------------------- writeValue --------------------
  describe('writeValue()', () => {
    it('writes a plain string to the input and value()', () => {
      const comp = getComp(fixture);
      comp.writeValue('hello');
      fixture.detectChanges();

      const input = getInputEl(fixture);
      expect(input.value).toBe('hello');
      expect(comp.value()).toBe('hello');
    });

    it('accepts a FormControlState-like object with { value }', () => {
      const comp = getComp(fixture);
      comp.writeValue({ value: 'state' } as any);
      fixture.detectChanges();

      expect(getInputEl(fixture).value).toBe('state');
      expect(comp.value()).toBe('state');
    });
  });

  // ---------------- registerOnChange / registerOnTouched ----------------
  describe('registerOnChange / registerOnTouched', () => {
    it('invokes onChange when input event updates the value', () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const input = getInputEl(fixture);
      input.value = 'aa';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('aa');
    });

    it('invokes onTouched on blur', () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onTouched');
      comp.registerOnTouched(spy);

      const input = getInputEl(fixture);
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  // ---------------------- disabled & state events ----------------------
  describe('setDisabledState / disabled events', () => {
    it('reflects disabled on the input and emits onChangeDisabledState', () => {
      const comp = getComp(fixture);
      const emitted: boolean[] = [];
      comp.onChangeDisabledState.subscribe(v => emitted.push(v));

      comp.setDisabledState(true);
      fixture.detectChanges();
      expect(getInputEl(fixture).disabled).toBeTrue();

      comp.setDisabledState(false);
      fixture.detectChanges();
      expect(getInputEl(fixture).disabled).toBeFalse();

      expect(emitted).toEqual([true, false]);
    });
  });

  // ---------------------- ElementRef & focus methods ----------------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the input ElementRef', () => {
      const comp = getComp(fixture);
      const el = comp.getElementRef();
      expect(el).toBeTruthy();
      expect(el.nativeElement.tagName.toLowerCase()).toBe('input');
    });

    it('focus() moves focus to the input', () => {
      const comp = getComp(fixture);
      comp.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(getInputEl(fixture));
    });

    it('focusError() focuses the input (default behavior)', () => {
      const comp = getComp(fixture);
      comp.focusError();
      fixture.detectChanges();

      expect(document.activeElement).toBe(getInputEl(fixture));
    });
  });

  // ---------------------- focus / blur lifecycle ----------------------
  describe('focus/blur lifecycle', () => {
    it('onFocus() sets floatingLabel (and clears outline when applicable)', () => {
      const comp = getComp(fixture);
      comp.onFocus();
      fixture.detectChanges();

      expect(comp.floatingLabel).toBeTrue();
    });

    it('onBlur() & executeActionBlur() mark touched and emit blurInputText with current value', () => {
      const comp = getComp(fixture);

      const input = getInputEl(fixture);
      input.value = 'blurred';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(host.lastBlur).toBe('blurred');
    });
  });

  // ---------------------- inputPattern ----------------------
  describe('inputPattern', () => {
    it('filters characters not matching the regex', () => {
      host.inputPattern.set(/[0-9]/); // digits only
      fixture.detectChanges();

      const comp = getComp(fixture);
      const input = getInputEl(fixture);

      input.value = 'a1b2c3';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(comp.value()).toBe('123');
      expect(input.value).toBe('123');
    });
  });

  // ---------------------- maxlength / minLength ----------------------
  describe('maxlength / minLength', () => {
    it('maxlength=10: input does not accept more than 10 chars (browser clamps)', () => {
      const comp = getComp(fixture);
      comp.maxLength.set(10);
      fixture.detectChanges();

      const input = getInputEl(fixture);
      simulatePaste(input, 'abcdefghijklmnopqrst'); // 20 chars
      fixture.detectChanges();

      expect(input.maxLength).toBe(10);
      expect(input.value.length).toBe(10);
      expect(comp.value()?.toString().length).toBe(10);
    });

    it('paste respects maxlength=10', () => {
      const comp = getComp(fixture);
      comp.maxLength.set(10);
      fixture.detectChanges();

      const input = getInputEl(fixture);
      simulatePaste(input, 'abcdefghijklmnopqrst'); // 20 chars
      expect(input.value).toBe('abcdefghij');
      expect(comp.value()).toBe('abcdefghij');
    });

    it('minLength exposes the configured value (validation usually handled elsewhere)', () => {
      const comp = getComp(fixture);
      comp.minLength.set(3);
      fixture.detectChanges();
      expect(comp.minLength()).toBe(3);
    });
  });

  // ---------------------- password toggle ----------------------
  describe('password mode / toggleIconPassword()', () => {
    it('ngOnInit enables password state/icon when type=PASSWORD, and toggles correctly', () => {
      const comp = getComp(fixture);

      // Simulate @Input type = PASSWORD before ngOnInit:
      comp.type.set(RfInputTypes.PASSWORD);
      comp.ngOnInit();
      fixture.detectChanges();

      expect(comp['passwordTransformation']).toBeTrue();
      expect(comp.rightIcon()).toBe('eye');

      comp.toggleIconPassword();
      fixture.detectChanges();
      expect(comp.type()).toBe(RfInputTypes.TEXT);
      expect(comp.rightIcon()).toBe('eye-off');

      comp.toggleIconPassword();
      fixture.detectChanges();
      expect(comp.type()).toBe(RfInputTypes.PASSWORD);
      expect(comp.rightIcon()).toBe('eye');
    });
  });

  // ---------------------- label & classes ----------------------
  describe('label & classes', () => {
    it('isLabelOnTop is true when placeholder exists, or there is a value, or focused', () => {
      const comp = getComp(fixture);

      host.placeholder.set('Alias');
      fixture.detectChanges();
      expect(comp.isLabelOnTop).toBeTrue();

      host.placeholder.set('');
      fixture.detectChanges();
      comp.writeValue('x');
      fixture.detectChanges();
      expect(comp.isLabelOnTop).toBeTrue();

      comp.writeValue('');
      fixture.detectChanges();
      comp.onFocus();
      fixture.detectChanges();
      expect(comp.isLabelOnTop).toBeTrue();
    });

    it('hostClasses reflects classes()?.container on the host element', () => {
      const comp = getComp(fixture);
      comp.classes.set({ container: 'host-c1' } as any);
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.debugElement.query(By.directive(RfInputTextComponent)).nativeElement;
      expect(hostEl.classList.contains('host-c1')).toBeTrue();
    });
  });

  // ---------------------- appearance ----------------------
  describe('appearance()', () => {
    it('uses the public enum via the appearance() signal', () => {
      const comp = getComp(fixture);
      comp.appearance.set(comp.appearanceTypes.INTEGRATED);
      fixture.detectChanges();
      expect(comp.appearance()).toBe(comp.appearanceTypes.INTEGRATED);
    });
  });

  // ---------------------- error visibility ----------------------
  describe('errorMessagesShouldBeDisplayed (getter)', () => {
    it('respects disabled/readonly and displayErrorsMode logic', () => {
      const comp = getComp(fixture);

      // Default => false
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // disabled => always false
      comp.disabled.set(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // Enable and set TOUCHED mode
      comp.disabled.set(false);
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      fixture.detectChanges();

      // Not touched yet => false
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      // Add errors to underlying control
      (comp as any).control?.setErrors({ required: true });
      fixture.detectChanges();

      // Touch via blur
      const input = getInputEl(fixture);
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();

      // readonly => false even when touched with errors
      comp.readonly.set(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });
  });

  // ---------------------- IDs & utilities ----------------------
  describe('IDs & utilities', () => {
    it('generateAutoId() uses formName/controlName/value to build the id', () => {
      const comp = getComp(fixture);
      comp.rfTypeClass = 'RfInputTextComponent';
      comp.formControlName.set('alias');

      const id1 = comp.generateAutoId(null);
      expect(id1).toContain('RfInputText-');
      expect(id1).toContain('alias');

      const id2 = comp.generateAutoId('parent-xyz');
      expect(id2).toBe('RfFormGroup-parent-xyz__RfInputText-alias');
    });

    it('getCustomAutoId() concatenates parts correctly', () => {
      const comp = getComp(fixture);
      comp.rfTypeClass = 'RfInputTextComponent';
      comp.formControlName.set('alias');
      const id = comp.getCustomAutoId();
      expect(id).toContain('RfInputText-');
      expect(id).toContain('RfInputText-alias');
    });

    it('getComponentForId() strips the "Component" suffix', () => {
      const comp = getComp(fixture);
      comp.rfTypeClass = 'RfInputTextComponent';
      expect(comp.getComponentForId()).toBe('RfInputText');
    });

    it('getFullFormControlName() uses formName when present plus control name', () => {
      const comp = getComp(fixture);
      comp.formControlName.set('alias');

      const only = comp.getFullFormControlName();
      expect(only).toBe('alias');

      expect(comp.getFullFormControlName().length).toBeGreaterThan(0);
    });
  });

  // ---------------------- static helpers ----------------------
  describe('static showErrorsAccordingDisplayConfig()', () => {
    it('returns expected booleans for each mode given control flags', () => {
      const control: any = { dirty: false, touched: false, submitted: false };

      expect(RfInputTextComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.ALWAYS)).toBeTrue();
      expect(RfInputTextComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.NEVER)).toBeFalse();

      control.dirty = true;
      expect(RfInputTextComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY)).toBeTrue();

      control.dirty = false; control.touched = true;
      expect(RfInputTextComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.TOUCHED)).toBeTrue();

      control.dirty = true; control.touched = true;
      expect(
        RfInputTextComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY_AND_TOUCHED)
      ).toBeTrue();
    });
  });
});
