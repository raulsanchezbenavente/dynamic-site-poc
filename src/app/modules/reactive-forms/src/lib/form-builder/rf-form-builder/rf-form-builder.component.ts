import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, input, model } from '@angular/core';
import { AbstractControl, FormControlState, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { RfInputTypes } from '../../../lib/components/rf-input-text/models/rf-input-types.model';
import { DEFAULT_SHOW_ERRORS_MODE } from '../../abstract/constants/rf-default-values.constant';
import { RfAppearanceTypes } from '../../abstract/enums/rf-base-reactive-appearance.enum';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfValidatorsMultiple } from '../../abstract/models/rf-base-reactive-valdators.model';
import { RfCheckboxGroupComponent } from '../../components/common/rf-checkbox-group/rf-checkbox-group.component';
import { RfRadioGroupComponent } from '../../components/common/rf-radio-group/rf-radio-group.component';
import { RfCheckboxComponent } from '../../components/rf-checkbox/rf-checkbox.component';
import { RfDatepickerComponent } from '../../components/rf-datepicker/rf-datepicker.component';
import { RfInputDatepickerComponent } from '../../components/rf-input-datepicker/rf-input-datepicker.component';
import { AutocompleteTypes } from '../../components/rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputTextComponent } from '../../components/rf-input-text/rf-input-text.component';
import { RfIpInputComponent } from '../../components/rf-ip-input/rf-ip-input.component';
import { RfListComponent } from '../../components/rf-list/rf-list.component';
import { RfPrefixPhoneComponent } from '../../components/rf-prefix-phone/rf-prefix-phone.component';
import { RfRadioComponent } from '../../components/rf-radio/rf-radio.component';
import { RfSelectDatePickerComponent } from '../../components/rf-select-date-picker/rf-select-date-picker.component';
import { RfSelectComponent } from '../../components/rf-select/rf-select.component';
import { RfSwitchComponent } from '../../components/rf-switch/rf-switch.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfComponentTypes } from '../../extensions/types/rf-form-control-validations.types';
import { IdService } from '../../services/id/id.service';
import { RfFormStore } from '../../store/rf-form.store';
import { RfFormBuilderFieldType } from '../enums/rf-form-builder.types.enum';
import { RfFormBuilderValue } from '../models/rf-form-builder-value.interface';

/**
 * `RfFormBuilderComponent` is a dynamic form generator that builds reactive forms (`RfFormGroup`)
 * based on a declarative configuration object. It supports custom components, state persistence,
 * validator assignment, and error display modes.
 *
 * This component is particularly useful for rendering form templates dynamically
 * from a CMS or JSON-based configuration.
 *
 * Selector: `rf-form-builder`
 */
@Component({
  selector: 'rf-form-builder',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    FormsModule,
    RfInputTextComponent,
    RfRadioComponent,
    RfCheckboxComponent,
    RfSwitchComponent,
    RfListComponent,
    RfSelectComponent,
    RfIpInputComponent,
    RfPrefixPhoneComponent,
    RfSelectDatePickerComponent,
    RfDatepickerComponent,
    RfInputDatepickerComponent,
    RfRadioGroupComponent,
    RfCheckboxGroupComponent,
  ],
  templateUrl: './rf-form-builder.component.html',
  standalone: true,
})
export class RfFormBuilderComponent {
  /** Service to generate unique IDs used internally (e.g., label IDs, form keys). */
  public idService = inject(IdService);

  /** Array of created form groups (one per configuration instance). */
  public _formsCollection: RfFormGroup[] = [];

  /** Name or ID of the form (optional). */
  public name = input<string>();

  /** Default mode for displaying validation errors. */
  public displayErrorsMode = model<RfErrorDisplayModes>(DEFAULT_SHOW_ERRORS_MODE);

  /** Configuration object defining the structure of the dynamic form. */
  public config = input<Record<string, any>>({});

  /** Internal structure storing the field keys per form instance. */
  public _formKeys: string[][] = [];

  /** Storage of the configuration used to render each form template. */
  public _formConfigTemplate: Record<string, any>[] = [];

  /** Controller-level storage of the actual form config (used to build controls). */
  public _formConfigController: Record<string, any>[] = [];

  /** Stores sanitized HTML strings for fields of type HTML_INJECTION. */
  public _sanitizedHtmlMap: Record<string, SafeHtml>[] = [];

  /** Enum of supported field types (e.g., INPUT, RADIO, HTML_INJECTION, etc.). */
  public formBuilderType = RfFormBuilderFieldType;

  /** Enum of appearance types for components (e.g., DEFAULT, INTEGRATED, etc.). */
  public RfAppearanceTypes = RfAppearanceTypes;

  /** Enum of autocomplete types for input fields. */
  public autocompleteTypes = AutocompleteTypes;

  /** Key used to track how many forms have been generated (acts like an index). */
  public templateKey: number = 0;

  /** Unique label ID for the rendered form instance. */
  public labelId: string = this.idService.generateRandomId();

  public formReady$ = new BehaviorSubject<{ ready: boolean; formName: string | undefined } | null>(null);

  public RfInputTypes = RfInputTypes;

  /** Stores the last processed config to avoid redundant rebuilds. */
  private previousFormConfig: Record<string, any> | undefined;
  private readonly formStore = inject(RfFormStore);

  /**
   * Constructs the form builder component with dependency injection for Angular CD and DOM sanitization.
   *
   * @param changeDetector - Angular's ChangeDetectorRef for triggering manual change detection.
   * @param sanitizer - Angular DomSanitizer to securely render HTML content (e.g., for HTML injection fields).
   */
  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    public sanitizer: DomSanitizer
  ) {}

  /**
   * Reactive effect triggered whenever the input config changes.
   * Responsible for allocating dynamic controls into the proper DOM container.
   */
  private readonly registerEffect = effect(() => {
    const currentFormConfig: Record<string, any> = this.config();
    if (currentFormConfig === this.previousFormConfig) {
      return;
    }
    this.previousFormConfig = currentFormConfig;
    this.allocateControlsInWildcards();
  });

  /**
   * Manages the form creation process based on the current configuration.
   * Restores previous control states if applicable, sanitizes HTML fields,
   * and updates internal tracking for repeatable form templates.
   */
  public manageCreateForm(): void {
    const previousValues: Record<string, any> =
      this.templateKey > 0 ? this.getFormControlStates(this.templateKey - 1) : {};
    this._formConfigController[this.templateKey] = this.config();
    this.generateFormKeys(this.templateKey);
    this.mapSanitizedKeys(this.templateKey);
    this.createForm(this.templateKey);
    this._formConfigTemplate[this.templateKey] = this.config();
    if (!this.isObjectEmpty(previousValues)) {
      this.setFormControlStates(previousValues, this.templateKey);
    }
    this.changeDetector.markForCheck();
    this.templateKey++;
    requestAnimationFrame(() => {
      this.formReady$.next({
        ready: true,
        formName: this.name(),
      });
    });
  }

  /**
   * Generates and stores the list of field keys for the form at the given index.
   *
   * @param index - Index of the form/template in the form collection.
   */
  public generateFormKeys(index: number): void {
    this._formKeys[index] = Object.keys(this._formConfigController[index]);
  }

  /**
   * Returns the latest generated form group, or null if none exists.
   */
  get form(): RfFormGroup | null {
    return this._formsCollection.length > 0 ? this._formsCollection.at(-1)! : null;
  }

  /**
   * Builds a new form group from the configuration at the given index.
   * Each field is converted into an `RfFormControl` with proper validators and initial values.
   *
   * @param index - Index of the form to generate.
   */
  public createForm(index: number): void {
    const group: Record<string, RfFormControl> = {};
    for (const key of Object.keys(this._formConfigController[index])) {
      const field: any = this._formConfigController[index][key];
      if (field.type === this.formBuilderType.HTML_INJECTION) {
        continue;
      }
      let controlValue = '';
      if (field.type === this.formBuilderType.RADIO && field.radios) {
        const checkedRadio = field.radios.find((radio: any) => radio.checked);
        if (checkedRadio) {
          controlValue = checkedRadio.value;
        }
      } else {
        controlValue = field.value ?? '';
      }
      const formControlValue: FormControlState<any> | string = field.disabled
        ? { value: controlValue, disabled: true }
        : controlValue;
      group[key] = new RfFormControl(formControlValue, this.getValidators(field.validators));
    }
    this._formsCollection[index] = new RfFormGroup(
      this.templateKey > 0 ? { name: this.name() ?? '', allowRepeat: true } : (this.name() ?? ''),
      group,
      null,
      null,
      this.displayErrorsMode()
    );
    this.formStore.setFormGroup(this._formsCollection[index].formName, this._formsCollection[index]);
  }

  /**
   * Maps input validators (functions or structures) into a usable array of ValidatorFn.
   *
   * @param validators - Array of validator functions or a composite validator object.
   * @returns An array of ValidatorFn or the original composite validator.
   */
  public getValidators(validators: any[]): ValidatorFn[] | RfValidatorsMultiple {
    if (!validators) return [];
    if (Array.isArray(validators)) {
      return validators
        .map((validator) => {
          if (typeof validator === 'function') {
            return validator;
          }
          return null!;
        })
        .filter((v) => v !== null);
    } else {
      return validators;
    }
  }

  /**
   * Rebuilds and repositions dynamic form controls inside their corresponding container nodes
   * using the wildcard projection system (`form-control-name`, `form-control-name-container`).
   */
  private allocateControlsInWildcards(): void {
    if (!this.isObjectEmpty(this.config())) {
      this.manageCreateForm();
      this.changeDetector.detectChanges();
      const keys: string[] = Object.keys(this.config());
      const formContainer: HTMLElement | null = document.getElementById('form-builder-container-' + this.labelId);
      const projection: HTMLElement | null = document.getElementById('form-builder-projection-' + this.labelId);
      for (const key of keys) {
        const formControl: HTMLElement | undefined | null = formContainer?.querySelector(
          `[form-control-name="${key}"]`
        );
        if (formControl) {
          const controlContainer: HTMLElement | undefined | null = projection?.querySelector(
            `[form-control-name-container="${key}"]`
          );
          if (controlContainer) {
            controlContainer.innerHTML = '';
            controlContainer.appendChild(formControl);
          } else {
            formControl.remove();
          }
        }
      }
    }
  }

  /**
   * Extracts the current state of all controls (value, touched, dirty, disabled, displayErrorsMode)
   * in a given form and stores it for reuse (e.g., when switching templates).
   *
   * @param index - Index of the form whose control states will be extracted.
   * @returns A record of control states keyed by field name.
   */
  private getFormControlStates(index: number): Record<string, any> {
    const result: Record<string, RfFormBuilderValue> = {};
    if (this._formsCollection[index]?.controls) {
      for (const key of Object.keys(this._formsCollection[index].controls)) {
        const control: AbstractControl<any, any> | null = this._formsCollection[index].get(key);
        const rfComponent: RfComponentTypes | RfComponentTypes[] = (control as RfFormControl)?.rfComponent;
        const displayErrorsMode: RfErrorDisplayModes =
          (Array.isArray(rfComponent) ? rfComponent[0]?.displayErrorsMode() : rfComponent?.displayErrorsMode()) ??
          DEFAULT_SHOW_ERRORS_MODE;

        result[key] = {
          value: control?.getRawValue(),
          disabled: control?.disabled ?? false,
          touched: control?.touched ?? false,
          dirty: control?.dirty ?? false,
          displayErrorsMode,
        };
      }
    }
    return result;
  }

  /**
   * Applies a previously saved state (value, touched, dirty, disabled, displayErrorsMode)
   * to each control in the form at the given index.
   *
   * @param values - A record of form control states keyed by field name.
   * @param index - Index of the form to which the states should be applied.
   */
  private setFormControlStates(values: Record<string, any>, index: number): void {
    for (const [key, value] of Object.entries(values)) {
      const control: RfFormControl = this._formsCollection[index].controls[key] as RfFormControl;
      if (control) {
        control.setValue(value.value);

        if (value.disabled) {
          control.disable();
        } else {
          control.enable();
        }

        if (value.touched) {
          control.markAsTouched();
        }
        if (value.dirty) {
          control.markAsDirty();
        }
        requestAnimationFrame(() => {
          const rfComponent: RfComponentTypes | RfComponentTypes[] = control?.rfComponent;
          if (Array.isArray(rfComponent)) {
            for (const component of rfComponent) {
              component?.displayErrorsMode.set(value.displayErrorsMode);
            }
          } else {
            rfComponent?.displayErrorsMode.set(value.displayErrorsMode);
          }
        });
      }
    }
  }

  /**
   * Iterates over all fields in the form config and sanitizes those with HTML content
   * (i.e., fields of type `HTML_INJECTION`), storing them in a safe map.
   *
   * @param index - Index of the form/template to process.
   */
  private mapSanitizedKeys(index: number): void {
    const config: Record<string, any> = this._formConfigController[index];
    const htmlMap: Record<string, SafeHtml> = {};
    for (const key in config) {
      if (config[key].type === this.formBuilderType.HTML_INJECTION) {
        const rawHtml = config[key]?.html ?? '';
        htmlMap[key] = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
      }
    }
    this._sanitizedHtmlMap[index] = htmlMap;
  }

  /**
   * Checks whether a given object is empty (has no keys).
   *
   * @param obj - The object to check.
   * @returns True if the object has no keys, false otherwise.
   */
  private isObjectEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }
}
