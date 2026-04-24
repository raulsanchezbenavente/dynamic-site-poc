// rf-form-group.component.spec.ts
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { RfFormGroup } from './rf-form-group.component';
import { RfFormControl } from './rf-form-control.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

describe('RfFormGroup', () => {
  afterEach(() => {
    // limpia el registro estático para que no afecte a otros tests
    RfFormGroup.resetNames();
  });

  function makeCtrl(initial = '', validators?: any) {
    return new RfFormControl(initial, validators);
  }

  function compMock() {
    // simula un componente con .displayErrorsMode.set() y flag debug
    let lastMode: RfErrorDisplayModes | undefined;
    return {
      debug: false,
      displayErrorsMode: { set: (m: RfErrorDisplayModes) => (lastMode = m) },
      get _lastMode() {
        return lastMode;
      },
    };
  }

  function compWithInnerFormMock(inner: RfFormGroup) {
    const c = compMock() as any;
    c.form = inner; // para probar recursión en changeDisplayErrorsMode y submitted
    return c;
  }

  it('registra formName y permite limpiar con resetNames()', () => {
    const fg1 = new RfFormGroup('F1', { a: makeCtrl() });
    expect(fg1.formName).toBe('F1');

    // simula duplicado: no lanza, pero dejaría aviso por console.warn
    const warn = spyOn(console, 'warn');
    const fg2 = new RfFormGroup('F1', { b: makeCtrl() }); // allowRepeat=false por defecto
    expect(warn).toHaveBeenCalled();

    RfFormGroup.resetNames();
    const fg3 = new RfFormGroup('F1', { c: makeCtrl() }); // ya no debería avisar
    expect(fg3.formName).toBe('F1');
  });

  it('valueSignal y statusSignal reaccionan a cambios', () => {
    const fg = new RfFormGroup('F', { a: makeCtrl('x') });
    expect(fg.valueSignal()).toEqual({ a: 'x' });
    expect(fg.statusSignal()).toBe('VALID');

    fg.get('a')!.setValue('y');
    expect(fg.valueSignal()).toEqual({ a: 'y' });

    (fg.get('a') as RfFormControl).setValidators(Validators.required);
    (fg.get('a') as RfFormControl).setValue(''); // inválido
    (fg.get('a') as RfFormControl).updateValueAndValidity();
    expect(fg.statusSignal()).toBe('INVALID');
  });

  it('markAllAsDirty() marca todo (incluye FormArray) de forma recursiva', () => {
    const nested = new FormArray([makeCtrl('n1'), makeCtrl('n2')]);
    const fg = new RfFormGroup('F', {
      a: makeCtrl('a'),
      b: new RfFormGroup('Sub', { c: makeCtrl('c') }),
      arr: nested,
    });

    fg.markAllAsDirty();
    expect(fg.dirty).toBeTrue();
    expect(fg.get('a')!.dirty).toBeTrue();
    expect((fg.get('b') as FormGroup).dirty).toBeTrue();
    expect(nested.dirty).toBeTrue();
    expect(nested.at(0).dirty).toBeTrue();
    expect(nested.at(1).dirty).toBeTrue();
  });

  it('changeDisplayErrorsMode() propaga al/los rfComponent y a formularios anidados', () => {
    const inner = new RfFormGroup('Inner', { d: makeCtrl('d') });
    const compA = compMock();
    const compB = compWithInnerFormMock(inner);

    const a = makeCtrl('a'); (a as any).rfComponent = compA;
    const b = makeCtrl('b'); (b as any).rfComponent = compB;

    const root = new RfFormGroup('Root', { a, b, d: makeCtrl('x') });

    root.changeDisplayErrorsMode(RfErrorDisplayModes.TOUCHED);
    expect((compA as any)._lastMode).toBe(RfErrorDisplayModes.TOUCHED);
    expect((compB as any)._lastMode).toBe(RfErrorDisplayModes.TOUCHED);

    // también llega al inner form vía recursión
    const innerD = inner.get('d') as RfFormControl;
    // simula un componente en el inner para verificar propagación
    const innerComp = compMock();
    (innerD as any).rfComponent = innerComp;

    root.changeDisplayErrorsMode(RfErrorDisplayModes.ALWAYS);
    expect((compA as any)._lastMode).toBe(RfErrorDisplayModes.ALWAYS);
    expect((compB as any)._lastMode).toBe(RfErrorDisplayModes.ALWAYS);
    expect((innerComp as any)._lastMode).toBe(RfErrorDisplayModes.ALWAYS);
  });

  it('submitted se propaga con changeSubmitedStatus() a controles y subformularios', () => {
    const a = makeCtrl('a'); (a as any).rfComponent = compMock();
    const b = makeCtrl('b'); (b as any).rfComponent = compMock();

    const root = new RfFormGroup('Root', { a, b });

    root.submitted = true; // invoca changeSubmitedStatus()
    expect((a as RfFormControl).submitted).toBeTrue();
    expect((b as RfFormControl).submitted).toBeTrue();
  });

  it('setDebug(true/false) activa debug en todos los componentes (arrays incluidos)', () => {
    const c1 = compMock();
    const c2 = compMock();
    const c3 = compMock();

    const ctrl1 = makeCtrl('x'); (ctrl1 as any).rfComponent = c1;
    const ctrl2 = makeCtrl('y'); (ctrl2 as any).rfComponent = [c2, c3]; // varios componentes

    const fg = new RfFormGroup('F', { ctrl1, ctrl2 });

    fg.setDebug(true);
    expect((c1 as any).debug).toBeTrue();
    expect((c2 as any).debug).toBeTrue();
    expect((c3 as any).debug).toBeTrue();

    fg.setDebug(false);
    expect((c1 as any).debug).toBeFalse();
    expect((c2 as any).debug).toBeFalse();
    expect((c3 as any).debug).toBeFalse();
  });

  it('markControlsWithValueAsTouched(): sólo marca los que tienen valor', () => {
    const fg = new RfFormGroup('F', {
      a: makeCtrl(''),          // vacío -> no touched
      b: makeCtrl('hola'),      // con valor -> touched
      c: new RfFormGroup('G', { d: makeCtrl('') }), // anidado
      arr: new FormArray([makeCtrl('x'), makeCtrl('')]), // primer elem con valor
    });

    fg.markControlsWithValueAsTouched();

    expect(fg.get('a')!.touched).toBeFalse();
    expect(fg.get('b')!.touched).toBeTrue();
    const arr = fg.get('arr') as FormArray;
    expect(arr.at(0).touched).toBeTrue();
    expect(arr.at(1).touched).toBeFalse();
  });

  it('clearFormName() permite reutilizar un nombre concreto sin resetear todo', () => {
    const warn = spyOn(console, 'warn');
    const f1 = new RfFormGroup('X', { a: makeCtrl() });
    const f2 = new RfFormGroup('X', { b: makeCtrl() }); // debería avisar
    expect(warn).toHaveBeenCalled();

    RfFormGroup.clearFormName('X');
    warn.calls.reset();

    const f3 = new RfFormGroup('X', { c: makeCtrl() });
    expect(warn).not.toHaveBeenCalled();
  });
});
