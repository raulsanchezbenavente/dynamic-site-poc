import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import { RfFormStore } from './rf-form.store'; // <-- adjust the path
import { RfFormGroup } from '../extensions/components/rf-form-group.component';
import { RfFormControl } from '../extensions/components/rf-form-control.component';

describe('RfFormStore', () => {
  let store: InstanceType<typeof RfFormStore>;

  const createForm = (name = 'FormA') =>
    new RfFormGroup(name, {
      first: new RfFormControl<string>('x'),
      second: new RfFormControl<number | null>(null),
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RfFormStore],
    });
    store = TestBed.inject(RfFormStore);
  });

  it('initializes without formGroups', () => {
    expect(store.formGroups().size).toBe(0);
    expect(store.formValue().size).toBe(0);
    expect(store.formStatus().size).toBe(0);
    expect(store.controls().size).toBe(0);
  });

  it('setFormGroup() registers a form and prevents duplicates', () => {
    const fg = createForm('F1');
    const ok1 = store.setFormGroup('F1', fg);
    const ok2 = store.setFormGroup('F1', fg); // duplicate

    expect(ok1).toBeTrue();
    expect(ok2).toBeFalse();
    expect(store.formGroups().has('F1')).toBeTrue();
    expect(store.getFormGroup('F1')).toBe(fg);
  });

  it('formValue and formStatus reflect FormGroup changes (signals)', () => {
    const fg = createForm('F2');
    store.setFormGroup('F2', fg);

    // initial state
    expect(store.formValue().get('F2')).toEqual(fg.value);
    expect(store.formStatus().get('F2')).toBe('VALID');

    // modify control -> signals should update
    fg.get('first')!.setValue('updated');
    expect(store.formValue().get('F2')).toEqual(fg.value);

    // force required error on "second"
    fg.get('second')!.setValidators(Validators.required);
    fg.get('second')!.updateValueAndValidity();
    expect(store.formStatus().get('F2')).toBe('INVALID');

    // clear errors
    fg.get('second')!.clearValidators();
    fg.get('second')!.updateValueAndValidity();
    expect(store.formStatus().get('F2')).toBe('VALID');
  });

  it('controls computed exposes the AbstractControl of the group', () => {
    const fg = createForm('F3');
    store.setFormGroup('F3', fg);

    const controlsMap = store.controls().get('F3')!;
    expect(controlsMap.get('first')).toBe(fg.get('first')!);
    expect(controlsMap.get('second')).toBe(fg.get('second')!);
  });

  it('isValid(): true/false/undefined based on state or non-existence', () => {
    const fg = createForm('F4');
    store.setFormGroup('F4', fg);

    expect(store.isValid('F4')).toBeTrue();

    fg.get('second')!.setValidators(Validators.required);
    fg.get('second')!.updateValueAndValidity();
    expect(store.isValid('F4')).toBeFalse();

    expect(store.isValid('NOPE')).toBeUndefined();
  });

  it('resetForm() resets the form if it exists and returns boolean', () => {
    const fg = createForm('F5');
    store.setFormGroup('F5', fg);

    fg.get('first')!.setValue('changed');
    const ok = store.resetForm('F5');
    expect(ok).toBeTrue();
    expect(fg.get('first')!.value).toBeNull(); // FormGroup reset sets null by default

    const nok = store.resetForm('NOPE');
    expect(nok).toBeFalse();
  });

  it('disableControl() enables/disables existing controls and warns if not found', () => {
    const fg = createForm('F6');
    store.setFormGroup('F6', fg);

    const warnSpy = spyOn(console, 'warn');

    // success cases
    const ok1 = store.disableControl('F6', 'first', true);
    expect(ok1).toBeTrue();
    expect(fg.get('first')!.disabled).toBeTrue();

    const ok2 = store.disableControl('F6', 'first', false);
    expect(ok2).toBeTrue();
    expect(fg.get('first')!.enabled).toBeTrue();

    // form not found
    const nok1 = store.disableControl('NOPE', 'first', true);
    expect(nok1).toBeFalse();
    expect(warnSpy).toHaveBeenCalled();

    // control not found
    const nok2 = store.disableControl('F6', 'missing', true);
    expect(nok2).toBeFalse();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('setNewValueOnControl() assigns value to control and handles search errors', () => {
    const fg = createForm('F7');
    store.setFormGroup('F7', fg);

    const warnSpy = spyOn(console, 'warn');

    const ok = store.setNewValueOnControl('F7', 'first', 'new');
    expect(ok).toBeTrue();
    expect(fg.get('first')!.value).toBe('new');

    const nok1 = store.setNewValueOnControl('NOPE', 'first', 'x');
    expect(nok1).toBeFalse();
    expect(warnSpy).toHaveBeenCalled();

    const nok2 = store.setNewValueOnControl('F7', 'missing', 'x');
    expect(nok2).toBeFalse();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('setValidatorOnControl() applies validators and updates validity', () => {
    const fg = createForm('F8');
    store.setFormGroup('F8', fg);

    // add required to "second"
    const ok = store.setValidatorOnControl('F8', 'second', Validators.required);
    expect(ok).toBeTrue();
    expect(fg.get('second')!.errors).toEqual({ required: true });

    // clear validators
    const ok2 = store.setValidatorOnControl('F8', 'second', []);
    expect(ok2).toBeTrue();
    expect(fg.get('second')!.errors).toBeNull();
  });

  it('getControlErrors() returns errors, undefined if form/control does not exist', () => {
    const fg = createForm('F9');
    store.setFormGroup('F9', fg);

    fg.get('second')!.setValidators(Validators.required);
    fg.get('second')!.updateValueAndValidity();

    expect(store.getControlErrors('F9', 'second')).toEqual({ required: true });
    expect(store.getControlErrors('F9', 'first')).toBeNull();

    const warnSpy = spyOn(console, 'warn');
    expect(store.getControlErrors('NOPE', 'first')).toBeUndefined();
    expect(store.getControlErrors('F9', 'missing')).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('onFormValueChanges() subscribe/unsubscribe works and returns teardown', () => {
    const fg = createForm('F10');
    store.setFormGroup('F10', fg);

    const spy = jasmine.createSpy('cb');
    const teardown = store.onFormValueChanges('F10', spy)!;
    expect(typeof teardown).toBe('function');

    fg.get('first')!.setValue('changed');
    expect(spy).toHaveBeenCalledWith(fg.value);

    teardown();
    fg.get('first')!.setValue('changed-again');
    // no new calls
    expect(spy.calls.count()).toBe(1);
  });

  it('removeFormGroup() removes and warns if it does not exist', () => {
    const fg = createForm('F11');
    store.setFormGroup('F11', fg);

    const ok = store.removeFormGroup('F11');
    expect(ok).toBeTrue();
    expect(store.formGroups().has('F11')).toBeFalse();

    const warnSpy = spyOn(console, 'warn');
    const nok = store.removeFormGroup('F11');
    expect(nok).toBeFalse();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('removeAllFormGroups() clears everything (even though Map does not have length)', () => {
    store.setFormGroup('F12', createForm('F12'));
    store.setFormGroup('F13', createForm('F13'));

    store.removeAllFormGroups();
    console.log(store.formGroups().size);
    expect(store.formGroups().size).toBe(0);
  });
});
