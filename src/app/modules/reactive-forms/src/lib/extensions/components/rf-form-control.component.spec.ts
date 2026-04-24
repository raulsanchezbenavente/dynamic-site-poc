// rf-form-control.component.spec.ts
import { Validators } from '@angular/forms';
import { RfFormControl } from './rf-form-control.component';

describe('RfFormControl', () => {
  it('setValue() emite onSetValue por defecto', () => {
    const c = new RfFormControl<string>('');
    const spy = jasmine.createSpy('onSetValue');
    c.onSetValue.subscribe(spy);

    c.setValue('hola');
    expect(spy).toHaveBeenCalledOnceWith('hola');
  });

  it('setValue() NO emite si opts.emitEvent === false', () => {
    const c = new RfFormControl<string>('');
    const spy = jasmine.createSpy('onSetValue');
    c.onSetValue.subscribe(spy);

    c.setValue('hola', { emitEvent: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it('markAsTouched() emite onMarkAsTouched (por defecto)', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAsTouched');
    c.onMarkAsTouched.subscribe(spy);

    c.markAsTouched();
    expect(spy).toHaveBeenCalled();
  });

  it('markAsTouched() NO emite si opts.emitEvent === false', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAsTouched');
    c.onMarkAsTouched.subscribe(spy);

    c.markAsTouched({ emitEvent: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it('markAllAsTouched() emite onMarkAllAsTouched', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAllAsTouched');
    c.onMarkAllAsTouched.subscribe(spy);

    c.markAllAsTouched();
    expect(spy).toHaveBeenCalled();
  });

  it('markAsUntouched() emite onMarkAsUntouched', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAsUntouched');
    c.onMarkAsUntouched.subscribe(spy);

    c.markAsUntouched();
    expect(spy).toHaveBeenCalled();
  });

  it('markAsDirty() emite onMarkAsDirty', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAsDirty');
    c.onMarkAsDirty.subscribe(spy);

    c.markAsDirty();
    expect(spy).toHaveBeenCalled();
  });

  it('markAllAsDirty() emite onMarkAllAsDirty una vez', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAllAsDirty');
    c.onMarkAllAsDirty.subscribe(spy);

    c.markAllAsDirty();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('markAsPristine() emite onMarkAsPristine', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onMarkAsPristine');
    c.onMarkAsPristine.subscribe(spy);

    c.markAsPristine();
    expect(spy).toHaveBeenCalled();
  });

  describe('isRequired (detección de Validators.required)', () => {
    it('cuando validator único === required', () => {
      const c = new RfFormControl('', Validators.required);
      expect(c.isRequired).toBeTrue();
    });

    it('cuando validators es un array y contiene required', () => {
      const c = new RfFormControl('', [Validators.minLength(3), Validators.required]);
      expect(c.isRequired).toBeTrue();
    });

    it('cuando validators es objeto compuesto y algún campo contiene required', () => {
      const c = new RfFormControl('', {
        prefix: [Validators.required],
        phone: [Validators.minLength(9)],
      });
      expect(c.isRequired).toBeTrue();
    });

    it('cuando no hay required en ningún lado', () => {
      const c = new RfFormControl('', [Validators.minLength(3)]);
      expect(c.isRequired).toBeFalse();
    });
  });

  describe('customValidators getters/setters', () => {
    it('setCustomValidators() + getCustomValidators() guardan y devuelven la config', () => {
      const cfg = {
        prefix: [Validators.required],
        phone: [Validators.minLength(9)],
      };
      const c = new RfFormControl('');
      c.setCustomValidators(cfg);
      expect(c.getCustomValidators()).toBe(cfg);
    });

    it('constructor guarda customValidators desde el parámetro', () => {
      const cfg = [Validators.required, Validators.minLength(2)];
      const c = new RfFormControl('', cfg);
      expect(c.getCustomValidators()).toBe(cfg);
    });
  });

  it('submitted getter/setter', () => {
    const c = new RfFormControl('');
    expect(c.submitted).toBeFalse();
    c.submitted = true;
    expect(c.submitted).toBeTrue();
  });

  it('rfComponent es asignable (prop pública)', () => {
    const c = new RfFormControl('');
    const compRef = {} as any;
    c.rfComponent = compRef;
    expect(c.rfComponent).toBe(compRef);
  });

  it('setValue respeta onlySelf:true (igual que canISendEvent)', () => {
    const c = new RfFormControl('');
    const spy = jasmine.createSpy('onSetValue');
    c.onSetValue.subscribe(spy);

    c.setValue('x', { onlySelf: true }); // canISendEvent -> true
    expect(spy).toHaveBeenCalledOnceWith('x');
  });
});
