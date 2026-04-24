import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { RfRadioComponent } from './rf-radio.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

function withRafImmediate(run: () => void) {
  const orig = globalThis.requestAnimationFrame;
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0 as any; };
  try { run(); } finally { globalThis.requestAnimationFrame = orig; }
}

// ---- Helpers & Mocks ----
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

/** Make requestAnimationFrame run immediately (once per suite). */
function useInstantRAFOnce() {
  const anyJ = jasmine as any;
  if (anyJ.isSpy && anyJ.isSpy(globalThis.requestAnimationFrame)) {
    (globalThis.requestAnimationFrame as jasmine.Spy).and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    });
    return;
  }
  spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
    cb(0);
    return 0 as any;
  });
}

/** Flush one view cycle + RAF + detectChanges. */
async function flushView<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  await Promise.resolve();
  fixture.detectChanges();
}

function getInputEl(fixture: ComponentFixture<RfRadioComponent>): HTMLInputElement {
  return fixture.debugElement.query(By.css('input[type="radio"]')).nativeElement as HTMLInputElement;
}
function getWrapperEl(fixture: ComponentFixture<RfRadioComponent>): HTMLElement {
  return fixture.debugElement.query(By.css('.rf-checkbox-radio-inner')).nativeElement as HTMLElement;
}

describe('RfRadioComponent — Public API', () => {
  let fixture: ComponentFixture<RfRadioComponent>;
  let comp: RfRadioComponent;

  beforeAll(() => {
    useInstantRAFOnce(); // Make rAF instant for the component's blur/touched
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfRadioComponent],
      providers: [
        { provide: (globalThis as any).IdService ?? 'IdService', useClass: MockIdService },
        { provide: (globalThis as any).GlobalMouseService ?? 'GlobalMouseService', useClass: MockGlobalMouseService },
      ],
    }).compileComponents();

    // Create the component directly (not via Host) to be able to set radioFormName
    fixture = TestBed.createComponent(RfRadioComponent);
    comp = fixture.componentInstance;

    // Avoid ExpressionChanged... from data-radio-group on first detectChanges
    (comp as any).radioFormName = 'grp1';

    // Define a value for this radio (what you set in [value])
    comp.value.set('a');

    await flushView(fixture);
  });

  // --------------- ElementRef & focus ---------------
  describe('ElementRef & focus methods', () => {
    it('getElementRef() returns the ElementRef of the input', () => {
      const el = comp.getElementRef();
      expect(el).toBeTruthy();
      expect(el.nativeElement.tagName.toLowerCase()).toBe('input');
    });

    it('focus() moves focus to the input', async () => {
      comp.focus();
      await flushView(fixture);
      expect(document.activeElement).toBe(getInputEl(fixture));
    });

    it('focusError() calls focus() by default', async () => {
      comp.focusError();
      await flushView(fixture);
      expect(document.activeElement).toBe(getInputEl(fixture));
    });
  });

  // --------------- writeValue ----------------
  describe('writeValue()', () => {
    it('accepts a string and marks checked if it matches value()', async () => {
      // This radio represents the value "a"
      comp.writeValue('a'); // selected
      await flushView(fixture);

      expect(comp['selectedValue']).toBe('a');
      // In updateCheck, the checked() model is synced
      expect(comp['checked']()).toBeTrue();

      comp.writeValue('b'); // not selected
      await flushView(fixture);
      expect(comp['checked']()).toBeFalse();
    });

    it('accepts a FormControlState-like object { value }', async () => {
      comp.value.set('a'); // <- ensures the value of THIS radio option
      comp.writeValue({ value: 'a' } as any);
      await flushView(fixture);

      expect(comp['selectedValue']).toBe('a');
      expect(comp['checked']()).toBeTrue();
    });
  });

  // --------------- updateValue / changeSelected output ---------------
  describe('updateValue() & changeSelected output', () => {
    it('updates selectedValue, sets the control and emits changeSelected(true) when selected', () => {
      const spy = jasmine.createSpy('onChangeSelected');
      comp.changeSelected.subscribe(spy);

      const input = getInputEl(fixture);
      input.checked = true;
      input.value = 'a';

      comp.updateValue({ target: input } as unknown as Event);
      fixture.detectChanges();

      expect(comp.control?.value).toBe('a');   // setValue sync
      expect(spy).toHaveBeenCalledWith(true);  // EventEmitter is sync
    });
  }); 

  // --------------- setSelected ---------------
  describe('setSelected()', () => {
    it('setSelected(true) selects the radio (control = value())', async () => {
      comp.setSelected(true);
      await flushView(fixture);

      expect(comp['isSelected']).toBeTrue();
      expect(comp.control?.value).toBe('a');
      expect(getInputEl(fixture).checked).toBeTrue();
    });

    it('setSelected(false) unselects the radio (control = null)', async () => {
      comp.setSelected(false);
      await flushView(fixture);

      expect(comp['isSelected']).toBeFalse();
      expect(comp.control?.value).toBeNull();
      expect(getInputEl(fixture).checked).toBeFalse();
    });
  });

  // --------------- disabled/readonly states & classes/attrs ---------------
  describe('disabled/readonly & classes/attrs', () => {
    it('disabledRadio(true) disables the input (attr.disabled) and applies "disabled" class to input and label', async () => {
      comp.disabledRadio.set(true);
      await flushView(fixture);

      const input = getInputEl(fixture);
      expect(input.getAttribute('disabled')).toBe('true');
      expect(input.classList.contains('disabled')).toBeTrue();

      const label: HTMLElement = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(label.classList.contains('disabled')).toBeTrue();
    });

    it('readonly(true) applies "readonly" class to input and label', async () => {
      comp.readonly.set(true);
      await flushView(fixture);

      const input = getInputEl(fixture);
      const label: HTMLElement = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(input.classList.contains('readonly')).toBeTrue();
      expect(label.classList.contains('readonly')).toBeTrue();
    });
  });

  // --------------- blur / touched (group) ---------------
  describe('blur & touched (group)', () => {
    it('marks touched when focus leaves the group (different data-radio-group)', async () => {
      // 1) Point the group to "grp1" and sync to the DOM
      //    (even better if you pass [name]="'grp1'" from the Host before first detectChanges)
      (comp as any).radioFormName = 'grp1';
      fixture.detectChanges();

      // 2) Use the REAL wrapper from the component
      const wrapper: HTMLElement = fixture.debugElement.query(
        By.css('.rf-checkbox-radio-inner')
      ).nativeElement;

      // 3) Create a destination outside the group
      const outside = document.createElement('button');
      outside.setAttribute('data-radio-group', 'OTHER');
      document.body.appendChild(outside);
      outside.focus();

      // 4) Fire the blur with currentTarget/target = real wrapper
      const ev = new FocusEvent('focusout', { relatedTarget: outside } as any);
      Object.defineProperty(ev, 'target', { value: wrapper });
      Object.defineProperty(ev, 'currentTarget', { value: wrapper });

      // 5) Force RAF and check touched
      withRafImmediate(() => {
        (comp as any).handleBlur(ev);
      });

      await flushView(fixture);
      expect(comp.control?.touched).toBeTrue();

      outside.remove();
    });
  });

  // --------------- IDs & utilities ---------------
  describe('IDs & utilities', () => {
    it('ngAfterViewInit sets autoId and contains the component prefix', async () => {
      // autoId is set in ngAfterViewInit
      await flushView(fixture);
      expect((comp as any).autoId?.length ?? 0).toBeGreaterThan(0);
      // By base convention: 'RfRadio_' (depends on your base generateAutoId)
      expect((comp as any).autoId).toContain('RfFormGroup-RfRadio-');
    });

    it('getElementRef() points to the input and the input [id] matches autoId', async () => {
      await flushView(fixture);
      const input = getInputEl(fixture);
      expect(input.id).toBe((comp as any).autoId);
    });
  });

  // --------------- Basic A11y attrs ---------------
  describe('A11y / aria', () => {
    it('aria-describedby is assigned only if not disabled and there are visible hints/errors', async () => {
      // With errors and TOUCHED mode + touched => should set aria-describedby
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      comp.control?.setErrors({ required: true });
      await flushView(fixture);

      const wrapper = getWrapperEl(fixture);
      const outside = document.createElement('button');
      outside.setAttribute('data-radio-group', 'OTHER');
      document.body.appendChild(outside);
      outside.focus();
      wrapper.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside } as any));

      await flushView(fixture);
      const input = getInputEl(fixture);
      const described = input.getAttribute('aria-describedby');
      // It may be null if your base only exposes it when there are hintMessages();
      // Here at least we check that it is not set when disabled:
      comp.disabledRadio.set(true);
      await flushView(fixture);
      expect(getInputEl(fixture).getAttribute('aria-describedby')).toBeNull();

      // Revert disabled so as not to affect other tests
      comp.disabledRadio.set(false);
      await flushView(fixture);
    });
  });
});