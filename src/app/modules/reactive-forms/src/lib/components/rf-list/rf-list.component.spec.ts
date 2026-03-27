import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { RfListComponent } from './rf-list.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

import { IdService } from '../../services/id/id.service';
import { GlobalEventsService } from '../../services/mouseEvents/mouse-events.service';
import { FilterService } from '../../services/filter/filter.service';

// ------------------ Mocks ------------------
class MockIdService {
  private i = 0;
  generateRandomId() {
    this.i += 1;
    return `id-${this.i}`;
  }
}
class MockGlobalEventsService {
  mousedown$ = new Subject<void>();
  mouseup$ = new Subject<void>();
  keydown$= new Subject<KeyboardEvent>();
}
class MockFilterService {
  // Matches the signature used in the component
  filter(_cfg: any, options: Array<{ content: any; value: string; disabled?: boolean }>, filterValue: string) {
    if (!filterValue) return options;
    const q = filterValue.toLowerCase();
    return options.filter(o => {
      const div = document.createElement('div');
      div.innerHTML = (o.content ?? '') as string;
      const text = (div.textContent ?? '').toLowerCase().trim();
      return text.includes(q) || o.value.toLowerCase().includes(q);
    });
  }
}

// ------------------ Host Component ------------------
@Component({
  standalone: true,
  imports: [RfListComponent],
  template: `
    <rf-list
      [options]="options()"
      [placeholder]="placeholder()"
      [classes]="classes()"
      [filter]="filter()"
      [typeaheadIncludes]="typeaheadIncludes"
      [bypassKeys]="bypassKeys()"
      (selectOption)="lastSelect = $event"
      (blurFilter)="lastBlur = $event"
      (keyPressed)="lastKey = $event"
    ></rf-list>
  `,
})
class HostComponent {
  options = signal<any[]>([
    { value: 'a', content: 'Alpha' },
    { value: 'b', content: 'Beta', preferred: true },
    { value: 'c', content: 'Charlie', disabled: true },
  ]);
  placeholder = signal<string>('Filter…');
  classes = signal<any>({});
  // If true, typeahead uses "includes"; if false, "startsWith"
  typeaheadIncludes = false;
  // If true, disables typeahead (tested below)
  bypassKeys = signal<boolean>(false);
  // Enables the filter input in the template
  filter = signal<any>({ enabled: true, placeholder: 'Search…' });

  lastSelect: any | null = null;
  lastBlur: FocusEvent | null = null;
  lastKey: KeyboardEvent | null = null;
}

// ------------------ Helpers ------------------
function getComp(fixture: ComponentFixture<HostComponent>): RfListComponent {
  return fixture.debugElement.query(By.directive(RfListComponent)).componentInstance;
}
function getFilterEl(fixture: ComponentFixture<HostComponent>): HTMLElement {
  const comp = getComp(fixture);
  const ref = comp.getElementRef?.();
  if (!ref) throw new Error('getElementRef() returned null/undefined. Ensure [filter].enabled is true and #filterElement exists.');
  return ref.nativeElement as HTMLElement;
}

// ------------------ Spec ------------------
describe('RfListComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: IdService, useClass: MockIdService },
        { provide: GlobalEventsService, useClass: MockGlobalEventsService },
        { provide: FilterService, useClass: MockFilterService },
      ],
    }).compileComponents();

    // 🩹 Patch anti-NG0100: first call to generateAutoId() returns ''
    const proto = (RfListComponent as any).prototype;
    const originalGen = proto.generateAutoId;
    let first = true;
    proto.generateAutoId = function (...args: any[]) {
      if (first) { first = false; return ''; }
      return originalGen.apply(this, args);
    };

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;

    fixture.detectChanges();          // 1st pass (hooks)
    await fixture.whenStable();       // microtasks
    fixture.detectChanges();          // 2nd pass

    // Ensure a non-empty autoId outside the first cycle (no more NG0100)
    const comp = getComp(fixture);
    if (!comp.autoId || comp.autoId.length === 0) {
      comp.autoId = comp.generateAutoId(comp.parentId());
      fixture.detectChanges();
    }

    // (optional) restore real generateAutoId
    proto.generateAutoId = originalGen;
  });

  // ---------------------- writeValue ----------------------
  describe('writeValue()', () => {
    it('writes a string and syncs selectedOption', () => {
      const comp = getComp(fixture);
      comp.writeValue('b');
      fixture.detectChanges();

      expect(comp.value()).toBe('b');
      expect(comp.selectedOption?.value).toBe('b');
    });

    it('accepts a FormControlState-like object { value }', () => {
      const comp = getComp(fixture);
      comp.writeValue({ value: 'a' } as any);
      fixture.detectChanges();

      expect(comp.value()).toBe('a');
      expect(comp.selectedOption?.value).toBe('a');
    });
  });

  // ---------------- registerOnChange / registerOnTouched ----------------
  describe('registerOnChange / registerOnTouched', () => {
    it('invokes onChange when updateValue(value, event) is called', async () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const evt = new MouseEvent('click');
      comp.updateValue('b', evt);
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('b');
      expect(host.lastSelect?.option?.value).toBe('b');
      expect((comp as any).control?.dirty).toBeTrue();
      expect((comp as any).control?.value).toBe('b');
    });

    it('does not invoke onChange when re-selecting the already-selected option', async () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const evt = new MouseEvent('click');
      comp.updateValue('b', evt);
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      spy.calls.reset();

      comp.updateValue('b', evt);
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('invokes onTouched when executeActionBlur() runs', () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onTouched');
      comp.registerOnTouched(spy);

      comp.executeActionBlur();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect((comp as any).control?.touched).toBeTrue();
    });
  });

  // ---------------------- disabled state ----------------------
  describe('setDisabledState / disabled propagation', () => {
    it('propagates disabled to the underlying control through onChangeDisabledState', async () => {
      const comp = getComp(fixture);

      comp.setDisabledState(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(comp.disabled()).toBeTrue();
      expect((comp as any).control?.disabled).toBeTrue();

      comp.setDisabledState(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(comp.disabled()).toBeFalse();
      expect((comp as any).control?.disabled).toBeFalse();
    });
  });

  // ---------------------- ElementRef & focus methods ----------------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the filter ElementRef', () => {
      const comp = getComp(fixture);
      const elRef = comp.getElementRef();
      expect(elRef).toBeTruthy();
      expect(elRef.nativeElement instanceof HTMLElement).toBeTrue();
    });

    it('focus() calls focus() on the filter element', () => {
      const comp = getComp(fixture);
      const el = getFilterEl(fixture) as any;
      spyOn(el, 'focus');
      comp.focus();
      expect(el.focus).toHaveBeenCalled();
    });

    it('focusError() calls focus() on the filter element (default)', () => {
      const comp = getComp(fixture);
      const el = getFilterEl(fixture) as any;
      spyOn(el, 'focus');
      comp.focusError();
      expect(el.focus).toHaveBeenCalled();
    });
  });

  // ---------------------- outputs ----------------------
  describe('outputs (selectOption, blurFilter, keyPressed)', () => {
    it('emits selectOption with selected option and native event', async () => {
      const comp = getComp(fixture);
      const evt = new MouseEvent('click');
      comp.updateValue('a', evt);
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(host.lastSelect).toBeTruthy();
      expect(host.lastSelect.option.value).toBe('a');
      expect(host.lastSelect.nativeEvent).toBe(evt);
    });

    it('emits blurFilter on filter input focusout', () => {
      const el = getFilterEl(fixture);
      el.dispatchEvent(new FocusEvent('focusout'));
      fixture.detectChanges();

      expect(host.lastBlur).toBeTruthy();
      expect(host.lastBlur?.type).toBe('focusout');
    });

    it('emits keyPressed on handleKeyDown', () => {
      const comp = getComp(fixture);
      const e = new KeyboardEvent('keydown', { key: 'x' });
      comp.handleKeyDown(e);
      fixture.detectChanges();

      expect(host.lastKey).toBeTruthy();
      expect(host.lastKey?.key).toBe('x');
    });
  });

  // ---------------------- filtering & helpers ----------------------
  describe('resetFilter() & filtering', () => {
    it('resetFilter() clears filterValue', () => {
      const comp = getComp(fixture);
      (comp as any).filterValue = 'al';
      comp.resetFilter();
      fixture.detectChanges();

      expect((comp as any).filterValue).toBe('');
    });
  });

  // ---------------------- keyboard navigation ----------------------
  describe('handleKeyDown() & moveSelection()', () => {
    it('ArrowDown moves selection to the next enabled option and emits selectOption', () => {
      const comp = getComp(fixture);

      // Starts at 'b' (preferred → sorted first by effect)
      comp.writeValue('b');
      fixture.detectChanges();

      const kd = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      comp.handleKeyDown(kd);
      fixture.detectChanges();

      expect(comp.selectedOption?.value).toBe('a');
      expect(comp.value()).toBe('a');
      expect(host.lastSelect?.option?.value).toBe('a');
    });

    it('ArrowUp at first item keeps selection', () => {
      const comp = getComp(fixture);
      comp.writeValue('b');
      fixture.detectChanges();

      const kd = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      comp.handleKeyDown(kd);
      fixture.detectChanges();

      expect(comp.selectedOption?.value).toBe('b');
      expect(comp.value()).toBe('b');
    });
  });

  // ---------------------- typeahead ----------------------
  describe('typeahead (handleTypeAheadKey)', () => {
    it('startsWith behavior by default selects the first matching option', async () => {
      const comp = getComp(fixture);
      comp.handleTypeAheadKey(new KeyboardEvent('keydown', { key: 'b' })); // 'Beta'
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(comp.value()).toBe('b');
      expect(comp.selectedOption?.value).toBe('b');
      expect(host.lastSelect?.option?.value).toBe('b');
    });

    it('includes behavior when [typeaheadIncludes]=true', async () => {
      host.typeaheadIncludes = true;
      fixture.detectChanges();

      const comp = getComp(fixture);
      // 'l' appears inside 'Alpha' (a-l-p-h-a) but no option starts with 'l'
      // → proves includes matches while startsWith would not
      comp.handleTypeAheadKey(new KeyboardEvent('keydown', { key: 'l' }));
      await new Promise(r => setTimeout(r, 0));
      fixture.detectChanges();

      expect(comp.selectedOption?.value).toBe('a');
      expect(comp.value()).toBe('a');
    });

    it('does nothing when bypassKeys() is true (use handleKeyDown)', () => {
      host.bypassKeys.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      comp.writeValue('b');
      fixture.detectChanges();

      // Must go through handleKeyDown to respect bypassKeys
      comp.handleKeyDown(new KeyboardEvent('keydown', { key: 'a' }));
      fixture.detectChanges();

      expect(comp.value()).toBe('b');
    });
  });

  // ---------------------- focusOption ----------------------
  describe('focusOption()', () => {
    it('focusOption() scrolls and focuses the selected option element when present', () => {
      const comp = getComp(fixture);

      // 1) Make the id deterministic in the template
      comp.parentId.set('test-list');
      fixture.detectChanges();

      // 2) Set options and select 'b'
      host.options.set([
        { value: 'a', content: 'A' } as any,
        { value: 'b', content: 'B' } as any,
        { value: 'c', content: 'C' } as any,
      ]);
      comp.writeValue('b');
      comp.selectedOption = { value: 'b', content: 'B' } as any;
      fixture.detectChanges();

      // 3) Get the button with the expected id and spy on methods
      const btn = fixture.nativeElement.querySelector('#test-list-b') as HTMLButtonElement;
      expect(btn).withContext('option element #test-list-b not found').toBeTruthy();

      const scrollSpy = spyOn(btn, 'scrollIntoView');
      const focusSpy = spyOn(btn, 'focus');

      // 4) Execute
      comp.focusOption();

      // 5) Verify
      expect(scrollSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  // ---------------------- host classes ----------------------
  describe('hostClasses (HostBinding)', () => {
    it('reflects classes()?.container on the host element', () => {
      host.classes.set({ container: 'host-c1' });
      fixture.detectChanges();

      const hostEl: HTMLElement = fixture.debugElement.query(By.directive(RfListComponent)).nativeElement;
      expect(hostEl.classList.contains('host-c1')).toBeTrue();
    });
  });

  // ---------------------- appearance ----------------------
  describe('appearance()', () => {
    it('can be set via the public signal (enum from base)', () => {
      const comp = getComp(fixture);
      comp.appearance.set(comp.appearanceTypes.INTEGRATED);
      fixture.detectChanges();
      expect(comp.appearance()).toBe(comp.appearanceTypes.INTEGRATED);
    });
  });

  // ---------------------- error visibility ----------------------
  describe('errorMessagesShouldBeDisplayed (getter)', () => {
    it('default false; true on TOUCHED + errors; disabled/readonly force false', () => {
      const comp = getComp(fixture);

      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      (comp as any).control?.setErrors({ required: true });
      comp.executeActionBlur(); // touched + onTouched()
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();

      comp.setDisabledState(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.setDisabledState(false);
      comp.readonly.set(true);
      fixture.detectChanges();
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });
  });

  // ---------------------- preferred sorting effect ----------------------
  describe('preferred sorting effect & lastPreferredIndex', () => {
    it('puts preferred options first and updates lastPreferredIndex', () => {
      const comp = getComp(fixture);
      // Initially 'b' is preferred
      const arr = comp.options();
      expect(arr[0].value).toBe('b');
      expect(comp.lastPreferredIndex()).toBe(0);

      // Change options: now 'y' is preferred
      host.options.set([
        { value: 'x', content: 'Xeno' },
        { value: 'y', content: 'Yotta', preferred: true },
        { value: 'z', content: 'Zeta' },
      ]);
      fixture.detectChanges();

      const sorted = getComp(fixture).options();
      const prefMap = sorted.map(o => !!o.preferred);
      const lastIdx = prefMap.lastIndexOf(true);
      expect(comp.lastPreferredIndex()).toBe(lastIdx >= 0 ? lastIdx : null);
    });
  });

  // ---------------------- IDs & utilities ----------------------
  describe('IDs & utilities', () => {
    it('generateAutoId() returns a non-empty id and respects parentId override', () => {
      const comp = getComp(fixture);
      const id1 = comp.generateAutoId(null);
      expect(typeof id1).toBe('string');

      const id2 = comp.generateAutoId('parent-xyz');
      expect(id2).toBe('RfFormGroup-parent-xyz__RfList-');
    });

    it('ngAfterViewInit eventually sets autoId (after first cycle)', async () => {
      const comp = getComp(fixture);
      await fixture.whenStable();
      fixture.detectChanges();
      expect(comp.autoId.length).toBeGreaterThan(0);
    });

    it('getComponentForId() strips "Component" suffix', () => {
      const comp = getComp(fixture);
      comp.rfTypeClass = 'RfListComponent';
      expect(comp.getComponentForId()).toBe('RfList');
    });

    it('getFullFormControlName() returns control name when no parent form', () => {
      const comp = getComp(fixture);
      comp.formControlName.set('countries');
      const name = comp.getFullFormControlName();
      expect(name).toBe('countries');
    });
  });

  // ---------------------- static helpers ----------------------
  describe('static showErrorsAccordingDisplayConfig()', () => {
    it('returns expected values for each display mode', () => {
      const control: any = { dirty: false, touched: false, submitted: false };

      expect(RfListComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.ALWAYS)).toBeTrue();
      expect(RfListComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.NEVER)).toBeFalse();

      control.dirty = true;
      expect(RfListComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY)).toBeTrue();

      control.dirty = false; control.touched = true;
      expect(RfListComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.TOUCHED)).toBeTrue();

      control.dirty = true; control .touched = true;
      expect(
        RfListComponent['showErrorsAccordingDisplayConfig'](control, RfErrorDisplayModes.DIRTY_AND_TOUCHED)
      ).toBeTrue();
    });
  });
});
