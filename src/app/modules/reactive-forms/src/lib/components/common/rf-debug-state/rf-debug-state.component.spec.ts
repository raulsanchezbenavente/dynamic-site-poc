import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, Validators } from '@angular/forms';
import { RfDebugStateComponent } from './rf-debug-state.component';
import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';

describe('RfDebugStateComponent', () => {
  let fixture: ComponentFixture<RfDebugStateComponent>;
  let comp: RfDebugStateComponent;

  const getCard = () => fixture.debugElement.query(By.css('.card'));
  const getHeaderBtn = () => fixture.debugElement.query(By.css('.card-header button'))?.nativeElement as HTMLButtonElement;
  const getBody = () => fixture.debugElement.query(By.css('.card-body'))?.nativeElement as HTMLElement;

  const text = (sel: string) => fixture.debugElement.query(By.css(sel))?.nativeElement?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfDebugStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RfDebugStateComponent);
    comp = fixture.componentInstance;
  });

  describe('conditional render', () => {
    it('does not render if control is missing', () => {
      comp.control.set(null);
      comp.debug.set(true);
      comp.hide.set(false);
      fixture.detectChanges();
      expect(getCard()).toBeNull();
    });

    it('does not render if debug=false', () => {
      comp.control.set(new FormControl('x'));
      comp.debug.set(false);
      comp.hide.set(false);
      fixture.detectChanges();
      expect(getCard()).toBeNull();
    });

    it('does not render if hide=true', () => {
      comp.control.set(new FormControl('x'));
      comp.debug.set(true);
      comp.hide.set(true);
      fixture.detectChanges();
      expect(getCard()).toBeNull();
    });

    it('renders when control && debug && !hide', () => {
      comp.control.set(new FormControl('x'));
      comp.debug.set(true);
      comp.hide.set(false);
      fixture.detectChanges();
      expect(getCard()).toBeTruthy();
    });
  });

  describe('collapse / expand', () => {
    beforeEach(() => {
      comp.control.set(new FormControl('x'));
      comp.debug.set(true);
      comp.hide.set(false);
    });

    it('shows by default uncollapsed and toggles with the button (➖/➕ and aria-label)', () => {
      fixture.detectChanges();
      const btn = getHeaderBtn();
      expect(btn).toBeTruthy();
      // By default collapsed=false
      expect(getBody()).toBeTruthy();
      expect(btn.textContent?.trim()).toBe('➖');
      expect(btn.getAttribute('aria-label')).toBe('Collapse');

      btn.click(); // collapse
      fixture.detectChanges();
      expect(getBody()).toBeFalsy();
      expect(btn.textContent?.trim()).toBe('➕');
      expect(btn.getAttribute('aria-label')).toBe('Expand');

      btn.click(); // expand
      fixture.detectChanges();
      expect(getBody()).toBeTruthy();
      expect(btn.textContent?.trim()).toBe('➖');
      expect(btn.getAttribute('aria-label')).toBe('Collapse');
    });
  });

  describe('body content: value/touched/dirty/invalid/errors/mode/status', () => {
    beforeEach(() => {
      comp.control.set(new FormControl(null));
      comp.debug.set(true);
      comp.hide.set(false);
    });

    it('shows the value in JSON', () => {
      const ctrl = comp.control() as FormControl;
      ctrl.setValue({ a: 1, b: 'z' });
      fixture.detectChanges();
      // appears in code.small.text-primary
      const valueText = text('.col-3:nth-child(1) code.small');
      expect(valueText).toContain('"a": 1');
      expect(valueText).toContain('"b": "z"');
    });

    it('touched/dirty change classes and text', () => {
      const ctrl = comp.control() as FormControl;
      fixture.detectChanges();
      // initially: touched=false (text-muted), dirty=false (text-muted)
      const touchedEl = fixture.debugElement.queryAll(By.css('.col-3'))[1];
      const dirtyEl = fixture.debugElement.queryAll(By.css('.col-3'))[2];
      expect(touchedEl.query(By.css('div:nth-child(2)')).nativeElement.classList.contains('text-muted')).toBeTrue();
      expect(dirtyEl.query(By.css('div:nth-child(2)')).nativeElement.classList.contains('text-muted')).toBeTrue();

      ctrl.markAsTouched();
      ctrl.markAsDirty();
      fixture.detectChanges();
      expect(touchedEl.query(By.css('div:nth-child(2)')).nativeElement.classList.contains('text-success')).toBeTrue();
      expect(dirtyEl.query(By.css('div:nth-child(2)')).nativeElement.classList.contains('text-success')).toBeTrue();

      // And the texts should reflect true/false
      expect(touchedEl.nativeElement.textContent).toContain('true');
      expect(dirtyEl.nativeElement.textContent).toContain('true');
    });

    it('invalid/valid toggles text-danger/text-success classes and shows the boolean', () => {
      const ctrl = comp.control() as FormControl;
      ctrl.setValidators(Validators.required);
      ctrl.setValue(null);
      ctrl.updateValueAndValidity();
      fixture.detectChanges();

      const invalidCol = fixture.debugElement.queryAll(By.css('.col-3'))[3];
      const stateDiv = invalidCol.query(By.css('div:nth-child(2)')).nativeElement as HTMLDivElement;
      expect(stateDiv.classList.contains('text-danger')).toBeTrue();
      expect(invalidCol.nativeElement.textContent).toContain('true');

      ctrl.setValue('ok');
      ctrl.updateValueAndValidity();
      fixture.detectChanges();

      expect(stateDiv.classList.contains('text-success')).toBeTrue();
      expect(invalidCol.nativeElement.textContent).toContain('false');
    });

    it('list of errors vs "No errors"', () => {
      const ctrl = comp.control() as FormControl;

      // No errors
      ctrl.setErrors(null);
      ctrl.updateValueAndValidity({ emitEvent: false });
      fixture.detectChanges();
      const errorsCol = fixture.debugElement.queryAll(By.css('.col-3'))[4];
      expect(errorsCol.nativeElement.textContent).toContain('No errors');

      // With errors
      ctrl.setErrors({ minlength: { requiredLength: 3, actualLength: 1 }, customErr: true });
      fixture.detectChanges();
      const items = errorsCol.queryAll(By.css('.small.ps-2'));
      const txts = items.map(i => i.nativeElement.textContent.trim());
      expect(txts.some(t => t.includes('▪️minlength'))).toBeTrue();
      expect(txts.some(t => t.includes('▪️customErr'))).toBeTrue();
    });

    it('shows the displayErrorsMode', () => {
      comp.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED as any);
      fixture.detectChanges();
      const modeCol = fixture.debugElement.queryAll(By.css('.col-3'))[5];
      expect(modeCol.nativeElement.textContent).toContain(String(RfErrorDisplayModes.TOUCHED));
    });

    it('list of validators (getCustomValidators) is filled in ngAfterViewInit with setTimeout(0)', fakeAsync(() => {
      // Inject a "control" with getCustomValidators that returns named functions
      function myRequired() {/* no-op */}
      function myMaxLen() {/* no-op */}

      const fakeCtrl: any = {
        value: null,
        touched: false,
        dirty: false,
        valid: true,
        invalid: false,
        errors: null,
        status: 'VALID',
        getCustomValidators: () => [myRequired, myMaxLen],
      };

      comp.control.set(fakeCtrl);
      comp.debug.set(true);
      comp.hide.set(false);

      fixture.detectChanges();       // calls ngAfterViewInit
      tick(0);                       // resolves setTimeout(0)
      fixture.detectChanges();

      const validatorsCol = fixture.debugElement.queryAll(By.css('.col-3'))[6];
      const items = validatorsCol.queryAll(By.css('.small.ps-2'));
      const txts = items.map(i => i.nativeElement.textContent.trim());
      expect(txts).toContain('▪️myRequired');
      expect(txts).toContain('▪️myMaxLen');
    }));

    it('supports getCustomValidators() that returns a single function', fakeAsync(() => {
      function onlyOne() {/* no-op */}
      const fakeCtrl: any = {
        value: null, touched: false, dirty: false, valid: true, invalid: false, errors: null, status: 'VALID',
        getCustomValidators: () => onlyOne,
      };
      comp.control.set(fakeCtrl);
      comp.debug.set(true);
      comp.hide.set(false);

      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();

      const validatorsCol = fixture.debugElement.queryAll(By.css('.col-3'))[6];
      const items = validatorsCol.queryAll(By.css('.small.ps-2'));
      expect(items.length).toBe(1);
      expect(items[0].nativeElement.textContent.trim()).toBe('▪️onlyOne');
    }));

    it('status badge: classes according to VALID/INVALID/PENDING/DISABLED', () => {
      const fakeCtrl: any = {
        value: null, touched: false, dirty: false, valid: true, invalid: false, errors: null, status: 'VALID',
      };
      comp.control.set(fakeCtrl);
      comp.debug.set(true);
      comp.hide.set(false);

      fixture.detectChanges();
      const badge = fixture.debugElement.query(By.css('.badge')).nativeElement as HTMLSpanElement;

      // VALID
      expect(badge.classList.contains('bg-success')).toBeTrue();
      expect(badge.textContent?.trim()).toBe('VALID');

      // INVALID
      fakeCtrl.status = 'INVALID';
      fixture.detectChanges();
      expect(badge.classList.contains('bg-danger')).toBeTrue();
      expect(badge.textContent?.trim()).toBe('INVALID');

      // PENDING
      fakeCtrl.status = 'PENDING';
      fixture.detectChanges();
      expect(badge.classList.contains('bg-info')).toBeTrue();
      expect(badge.classList.contains('text-dark')).toBeTrue();
      expect(badge.textContent?.trim()).toBe('PENDING');

      // DISABLED
      fakeCtrl.status = 'DISABLED';
      fixture.detectChanges();
      expect(badge.classList.contains('bg-light')).toBeTrue();
      expect(badge.classList.contains('text-dark')).toBeTrue();
      expect(badge.textContent?.trim()).toBe('DISABLED');
    });
  });
});