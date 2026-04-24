import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, forwardRef, input, OnInit, viewChild } from '@angular/core';
import { FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { noop } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';
import { AutocompleteTypes } from '../rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputTextComponent } from '../rf-input-text/rf-input-text.component';

import { RfIpAria } from './models/rf-ip-input-aria.model';
import { RfIpInputClasses } from './models/rf-ip-input-classes.model';
import { RfIpErrorMessages } from './models/rf-ip-input-error-messages.model';
import { RfIpinputValidators } from './models/rf-ip-input-validators.model';
import { RfIpInputValue } from './models/rf-ip-input-value.model';

@Component({
  selector: 'rf-ip-input',
  templateUrl: './rf-ip-input.component.html',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfIpInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfIpInputComponent),
      multi: true,
    },
  ],
  imports: [
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    RfInputTextComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
  ],
})
export class RfIpInputComponent
  extends RfBaseReactiveComponent<RfIpInputValue, string, RfIpErrorMessages, RfIpInputClasses, RfIpAria>
  implements OnInit, AfterViewInit
{
  public readonly input = viewChild<ElementRef>('inputip');
  public placeholder = input<string>('');
  public animatedLabel = input<string>('');
  public inputPattern: RegExp = /^\d+$/;
  public form!: RfFormGroup;
  public isDisabled = false;
  public groupSuffix: string = this.idService.generateRandomId();
  public override rfTypeClass: string = 'RfIpInputComponent';

  public autocompleteTypes = AutocompleteTypes;

  public ngOnInit(): void {
    this.form = new RfFormGroup('formGroupIp' + this.groupSuffix, {
      ip1: new RfFormControl({ value: '', disabled: this.isDisabled }),
      ip2: new RfFormControl({ value: '', disabled: this.isDisabled }),
      ip3: new RfFormControl({ value: '', disabled: this.isDisabled }),
      ip4: new RfFormControl({ value: '', disabled: this.isDisabled }),
    });

    this.form.valueChanges.subscribe((value) => {
      this.value.set(value);
      this.onChange(value);
    });
  }

  public override getElementRef(): ElementRef {
    return this.input()!;
  }

  public ngAfterViewInit(): void {
    const validators = (
      this.getFormControl() as RfFormControl
    )?.getCustomValidators() as unknown as RfIpinputValidators;
    for (const field of ['ip1', 'ip2', 'ip3', 'ip4']) {
      this.form.get(field)?.addValidators(validators.ip);
      this.form.get(field)?.updateValueAndValidity();
    }

    this.registerStateFormEvents(this.getFormControl() as RfFormControl, this.form);
  }

  public override writeValue(value: RfIpInputValue | null): void {
    value ??= { ip1: '', ip2: '', ip3: '', ip4: '' };
    this.value.set(value);
    this.form.setValue(value, { emitEvent: false });
    this.updateDisabledState();
  }

  public override setDisabledState(isDisabled: boolean): void {
    for (const key of Object.keys(this.form.controls)) {
      const control = this.form.get(key);
      if (isDisabled) {
        control?.disable({ emitEvent: false });
      } else {
        control?.enable({ emitEvent: false });
      }
    }
  }

  // public override validate(control: AbstractControl): ValidationErrors | null {
  //   if (this.form.valid) {
  //     return null;
  //   }
  //   const errors: ValidationErrors = {};
  //   Object.keys(this.form.controls).forEach((key) => {
  //     const controlErrors = this.form.get(key)?.errors;
  //     if (controlErrors) {
  //       errors[key] = controlErrors;
  //     }
  //   });
  //   return errors;
  // }

  public getAriaAttributesByKey(index: number): string | undefined {
    const aria = this.ariaLabelledBy();
    return typeof aria === 'object' ? (aria as Record<string, string>)['ip' + index] : undefined;
  }

  /** Set the focus on focussable element */
  public override focus(): void {
    if (this.input()) {
      this.input()?.nativeElement.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }

  private updateDisabledState(): void {
    for (const key of Object.keys(this.form.controls)) {
      if (this.isDisabled) {
        this.form.get(key)?.disable({ emitEvent: false });
      } else {
        this.form.get(key)?.enable({ emitEvent: false });
      }
    }
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    noop();
  }
}
