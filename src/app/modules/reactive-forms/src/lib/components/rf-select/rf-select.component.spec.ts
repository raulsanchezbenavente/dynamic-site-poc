import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { RfSelectComponent } from './rf-select.component';
import { RfListComponent } from '../rf-list/rf-list.component';
import { RfDropComponent } from '../common/rf-drop/rf-drop.component';
import { RfGenericDropButtonComponent } from '../common/rf-generic-drop-button/rf-generic-drop-button.component';

import { RfListOption } from '../rf-list/models/rf-list-option.model';
import { RfOptionsFilter } from '../../services/filter/filter.model';
import { FilterService } from '../../services/filter/filter.service';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

// ----------------- Mocks mínimos -----------------
class MockIdService {
  private i = 0;
  generateRandomId() { this.i += 1; return `id-${this.i}`; }
}
class MockGlobalMouseService {
  mousedown$ = new Subject<void>();
  mouseup$ = new Subject<void>();
}
class MockFilterService {
  // Devuelve tal cual (suficiente para estos tests)
  filter(cfg: RfOptionsFilter | undefined, opts: RfListOption[], term: string) {
    return opts;
  }
}

// ----------------- Host mínimo -----------------
@Component({
  standalone: true,
  imports: [RfSelectComponent],
  template: `
    <rf-select
      [options]="options()"
      [placeholder]="placeholder()"
      [filter]="filter()"
      [animatedLabel]="animatedLabel()"
      [rightIcon]="rightIcon()"
      [leftIcon]="leftIcon()"
      [hasGeneralHint]="hasGeneralHint()"
      [hideCaret]="hideCaret()"
    ></rf-select>
  `,
})
class HostComponent {
  options = signal<RfListOption[]>([
    { value: 'a', content: 'A' },
    { value: 'b', content: 'B' },
    { value: 'c', content: 'C', disabled: false },
  ]);
  placeholder = signal<string>('Choose…');
  // Activa el filtro en la lista interna si hiciera falta
  filter = signal<RfOptionsFilter | undefined>({ enabled: true, placeholder: 'Filter…' } as any);
  animatedLabel = signal<string>('Label');
  rightIcon = signal<string>('');
  leftIcon = signal<string>('');
  hasGeneralHint = signal<boolean>(false);
  hideCaret = signal<boolean>(false);
}

// ----------------- Helpers -----------------
function getComp(f: ComponentFixture<HostComponent>): RfSelectComponent {
  return f.debugElement.query(By.directive(RfSelectComponent)).componentInstance;
}
function getListComp(f: ComponentFixture<HostComponent>): RfListComponent {
  return f.debugElement.query(By.directive(RfListComponent)).componentInstance;
}
function getDropComp(f: ComponentFixture<HostComponent>): RfDropComponent {
  return f.debugElement.query(By.directive(RfDropComponent)).componentInstance;
}
function getButtonComp(f: ComponentFixture<HostComponent>): RfGenericDropButtonComponent {
  return f.debugElement.query(By.directive(RfGenericDropButtonComponent)).componentInstance;
}
function getHostEl(f: ComponentFixture<HostComponent>): HTMLElement {
  return f.debugElement.query(By.directive(RfSelectComponent)).nativeElement as HTMLElement;
}
async function flushView(f: ComponentFixture<HostComponent>) {
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
}

describe('RfSelectComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    // Evita NG0100 por requestAnimationFrame en ngAfterViewInit
    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    });

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
        { provide: FilterService, useClass: MockFilterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await flushView(fixture);
  });

  // ---------------- writeValue ----------------
  describe('writeValue()', () => {
    it('writes a string value and syncs selectedOption + inner form', async () => {
      const comp = getComp(fixture);
      comp.writeValue('b');
      await flushView(fixture);

      expect(comp.value()).toBe('b');
      expect(comp.selectedOption?.value).toBe('b');
      expect(comp.form?.get('list')?.value).toBe('b');
    });

    it('accepts a FormControlState-like object { value }', async () => {
      const comp = getComp(fixture);
      comp.writeValue({ value: 'a' } as any);
      await flushView(fixture);

      expect(comp.value()).toEqual({ value: 'a' } as any);
      expect(comp.form?.get('list')?.value).toEqual({ value: 'a' } as any);
      // setSelectedOption mira strings; si pasas objeto, el método luego lo traduce a string cuando hay 'value'
      // El propio writeValue llama a setSelectedOption(value.value)
      expect(comp.selectedOption?.value).toBe('a');
    });
  });

  // ---------------- registerOnChange / registerOnTouched ----------------
  describe('registerOnChange / registerOnTouched', () => {
    it('invokes onChange when updateValue() is called (from list selection)', async () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const optB = host.options()[1];
      comp.updateValue({ option: optB, nativeEvent: new MouseEvent('click') });
      await flushView(fixture);

      expect(comp.value()).toBe('b');
      expect(spy).toHaveBeenCalledWith('b');
    });

    it('invokes onTouched when executeActionBlur() runs', async () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onTouched');
      comp.registerOnTouched(spy);

      comp.executeActionBlur();
      await flushView(fixture);

      expect(spy).toHaveBeenCalled();
      expect(comp.control?.touched).toBeTrue();
    });

    it('does not emit onChange twice when list value was already updated', async () => {
      const comp = getComp(fixture);
      const spy = jasmine.createSpy('onChange');
      comp.registerOnChange(spy);

      const optB = host.options()[1];
      comp.form.get('list')?.setValue('b');
      await flushView(fixture);

      comp.updateValue({ option: optB, nativeEvent: new MouseEvent('click') });
      await flushView(fixture);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('b');
    });
  });

  // ---------------- setDisabledState ----------------
  describe('setDisabledState / disabled propagation', () => {
    it('disables/enables internal form controls', async () => {
      const comp = getComp(fixture);

      comp.setDisabledState(true);
      await flushView(fixture);
      expect(comp.form.get('list')?.disabled).toBeTrue();

      comp.setDisabledState(false);
      await flushView(fixture);
      expect(comp.form.get('list')?.disabled).toBeFalse();
    });
  });

  // ---------------- ElementRef & focus methods ----------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the GenericButton input ElementRef', () => {
      const comp = getComp(fixture);
      const el = comp.getElementRef();
      expect(el).toBeTruthy();
      // no asumimos tagName específico; basta con que exista
    });

    it('focus() calls focus() on the generic button', async () => {
      const comp = getComp(fixture);
      const btn = getButtonComp(fixture);
      const spyFocus = spyOn(btn as any, 'focus').and.callThrough();

      comp.focus();
      await flushView(fixture);

      expect(spyFocus).toHaveBeenCalled();
    });

    it('focusError() delegates to focus()', async () => {
      const comp = getComp(fixture);
      const btn = getButtonComp(fixture);
      const spyFocus = spyOn(btn as any, 'focus').and.callThrough();

      comp.focusError();
      await flushView(fixture);

      expect(spyFocus).toHaveBeenCalled();
    });
  });

  // ---------------- onOpen (drop) ----------------
  describe('onOpen()', () => {
    it('does not invoke onChange when opening without selecting an option', async () => {
      const comp = getComp(fixture);
      const onChangeSpy = jasmine.createSpy('onChange');
      comp.registerOnChange(onChangeSpy);

      comp.writeValue('b');
      await flushView(fixture);

      onChangeSpy.calls.reset();
      comp.onOpen(true);
      await flushView(fixture);

      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(comp.value()).toBe('b');
    });

    it('resets list filter, sets dropIsOpen, focuses list and syncs value when opening', async () => {
      const comp = getComp(fixture);
      const list = getListComp(fixture);

      const spyReset = spyOn(list, 'resetFilter').and.callThrough();
      const spyFocus = spyOn(list, 'focus').and.callThrough();
      const spyFocusOption = spyOn(list, 'focusOption').and.callThrough();

      comp.writeValue('b');
      await flushView(fixture);

      comp.onOpen(true);
      await flushView(fixture);

      expect(spyReset).toHaveBeenCalled();
      expect(comp.dropIsOpen).toBeTrue();
      expect(spyFocus).toHaveBeenCalled();
      expect(spyFocusOption).toHaveBeenCalled();
      // La lista recibe el valor actual al abrir
      expect(list.control?.value).toEqual(comp.control?.value);
    });

    it('closing sets dropIsOpen=false and leaves focus handling to button', async () => {
      const comp = getComp(fixture);

      comp.onOpen(true);
      await flushView(fixture);
      expect(comp.dropIsOpen).toBeTrue();

      comp.onOpen(false);
      await flushView(fixture);
      expect(comp.dropIsOpen).toBeFalse();
    });
  });

  // ---------------- keyboard: button & list delegation ----------------
  describe('keyboard handling', () => {
    it('onKeyDownButon ArrowDown/ArrowUp move selection in the inner list', async () => {
      const comp = getComp(fixture);
      const list = getListComp(fixture);

      const spyDown = spyOn(list, 'moveSelection').and.callThrough();

      // ArrowDown
      const evDown = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      const spyPrevDown = spyOn(evDown, 'preventDefault').and.callThrough();
      comp.onKeyDownButon(evDown);
      expect(spyPrevDown).toHaveBeenCalled();
      expect(spyDown).toHaveBeenCalledWith('down');

      // ArrowUp
      const evUp = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      const spyPrevUp = spyOn(evUp, 'preventDefault').and.callThrough();
      comp.onKeyDownButon(evUp);
      expect(spyPrevUp).toHaveBeenCalled();
      expect(spyDown).toHaveBeenCalledWith('up');
    });

    it('onKeyDown delegates typeahead to list; Escape focuses button and closes drop', async () => {
      const comp = getComp(fixture);
      const list = getListComp(fixture);
      const drop = getDropComp(fixture);
      const btn = getButtonComp(fixture);

      const spyType = spyOn(list, 'handleTypeAheadKey').and.callThrough();
      const spyClose = spyOn(drop as any, 'closeDrop').and.callThrough();
      const spyFocusBtn = spyOn(btn as any, 'focusButton').and.callThrough();

      // General key -> typeahead
      const evA = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      comp.onKeyDown(evA);
      expect(spyType).toHaveBeenCalledWith(evA);

      // Escape -> close + focus button
      const evEsc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      const prevSpy = spyOn(evEsc, 'preventDefault').and.callThrough();
      comp.onKeyDown(evEsc);
      expect(prevSpy).toHaveBeenCalled();
      expect(spyClose).toHaveBeenCalled();
      expect(spyFocusBtn).toHaveBeenCalled();
    });
  });

  // ---------------- updateValue (from list) ----------------
  describe('updateValue()', () => {
    it('sets value + selectedOption + marks outer control dirty in standalone mode', async () => {
      const comp = getComp(fixture);
      const optC = host.options()[2];

      comp.updateValue({ option: optC, nativeEvent: new MouseEvent('click') });
      await flushView(fixture);

      expect(comp.value()).toBe('c');
      expect(comp.selectedOption?.value).toBe('c');
      expect(comp.control?.dirty).toBeTrue();
    });
  });

  // ---------------- focus/blur lifecycle ----------------
  describe('focus/blur lifecycle', () => {
    it('onFocus() shows floatingLabel; onBlur() hides it', async () => {
      const comp = getComp(fixture);
      comp.onBlur(); // start hidden
      await flushView(fixture);
      expect(comp.floatingLabel).toBeFalse();

      comp.onFocus();
      await flushView(fixture);
      expect(comp.floatingLabel).toBeTrue();

      comp.onBlur();
      await flushView(fixture);
      expect(comp.floatingLabel).toBeFalse();
    });

    it('handleFocusOut() calls executeActionBlur() when focus leaves host', async () => {
      const comp = getComp(fixture);

      const hostEl = getHostEl(fixture);
      const outside = document.createElement('button');

      const ev = { relatedTarget: outside, currentTarget: hostEl } as any as FocusEvent;
      comp.handleFocusOut(ev);
      await flushView(fixture);

      expect(comp.control?.touched).toBeTrue();
    });
  });

  // ---------------- outputs via list bindings ----------------
  describe('onBlurFilter() / onKeyPressed()', () => {
    it('onKeyPressed Enter/Tab/Escape close the drop and focus button', async () => {
      const comp = getComp(fixture);
      const drop = getDropComp(fixture);
      const btn = getButtonComp(fixture);

      const spyClose = spyOn(drop as any, 'closeDrop').and.callThrough();
      const spyFocusBtn = spyOn(btn as any, 'focusButton').and.callThrough();

      comp.onKeyPressed(new KeyboardEvent('keydown', { key: 'Enter' }));
      comp.onKeyPressed(new KeyboardEvent('keydown', { key: 'Tab' }));
      comp.onKeyPressed(new KeyboardEvent('keydown', { key: 'Escape' }));
      await flushView(fixture);

      expect(spyClose).toHaveBeenCalled();
      expect(spyFocusBtn).toHaveBeenCalled();
    });

    it('onBlurFilter() focuses button and conditionally closes drop', async () => {
      const comp = getComp(fixture);
      const drop = getDropComp(fixture);
      const btn = getButtonComp(fixture);

      const spyClose = spyOn(drop as any, 'closeDrop').and.callThrough();
      const spyFocusBtn = spyOn(btn as any, 'focusButton').and.callThrough();

      // relatedTarget fuera -> cierra
      const outside = document.createElement('div');
      const ev = new FocusEvent('focusout', { relatedTarget: outside } as any);
      comp.onBlurFilter(ev);
      await flushView(fixture);

      expect(spyFocusBtn).toHaveBeenCalled();
      expect(spyClose).toHaveBeenCalled();
    });
  });

  // ---------------- error visibility ----------------
  describe('errorMessagesShouldBeDisplayed (getter)', () => {
    it('default false; true when TOUCHED + errors; disabled/readonly force false', async () => {
      const comp = getComp(fixture);

      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      (comp as any).control?.setErrors({ required: true });
      comp.executeActionBlur(); // marca touched
      await flushView(fixture);
      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();

      comp.readonly.set(true);
      await flushView(fixture);
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

      comp.readonly.set(false);
      comp.disabled.set(true);
      await flushView(fixture);
      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });
  });

  // ---------------- IDs & utilities ----------------
  describe('IDs & utilities', () => {
    it('ngAfterViewInit sets autoId (via rAF) and generateAutoId()/getComponentForId()', async () => {
      const comp = getComp(fixture);

      await flushView(fixture);
      expect((comp.autoId ?? '').length).toBeGreaterThan(0);
      expect(comp.getComponentForId()).toBe('RfSelect'); // rfTypeClass = 'RfSelectComponent' by default

      const manual = comp.generateAutoId(null);
      expect(manual).toContain('RfSelect-');
    });

    it('hostClasses (HostBinding) reflects classes()?.container on host', async () => {
      const comp = getComp(fixture);
      comp.classes.set({ container: 'host-x' } as any);
      await flushView(fixture);

      const hostEl = getHostEl(fixture);
      expect(hostEl.classList.contains('host-x')).toBeTrue();
    });

    it('appearance() accepts public enum from base via signal', async () => {
      const comp = getComp(fixture);
      comp.appearance.set(comp.appearanceTypes.INTEGRATED);
      await flushView(fixture);

      expect(comp.appearance()).toBe(comp.appearanceTypes.INTEGRATED);
    });
  });
});
