import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  FormControlState,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfOptionsFilter } from '../../services/filter/filter.model';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfDropComponent } from '../common/rf-drop/rf-drop.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfGenericDropButtonComponent } from '../common/rf-generic-drop-button/rf-generic-drop-button.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';
import { RfListSelectEvent } from '../rf-list/models/rf-list-events.model';
import { RfListOption } from '../rf-list/models/rf-list-option.model';
import { RfListComponent } from '../rf-list/rf-list.component';

import { RfSelectClasses } from './models/rf-select-classes.model';
import { RfSelectForm } from './models/rf-select-form.model';

/**
 * Select component integrated with a reactive form system.
 *
 * Features:
 * - Dropdown with keyboard and mouse support
 * - Fully reactive and standalone compatible
 * - Option filtering and animated label
 * - Works with RfList and custom dropdown button
 */
@Component({
  selector: 'rf-select',
  templateUrl: './rf-select.component.html',
  styleUrls: ['./styles/rf-select.styles.scss'],
  host: { class: 'rf-select' },
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RfSelectComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RfSelectComponent,
      multi: true,
    },
  ],
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    RfGenericDropButtonComponent,
    RfListComponent,
    RfDropComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    RfDebugStateComponent,
  ],
})
export class RfSelectComponent
  extends RfBaseReactiveComponent<
    string | FormControlState<string>,
    string,
    RfErrorMessageSingleComponent,
    RfSelectClasses,
    string
  >
  implements OnInit, AfterViewInit, AfterContentInit
{
  /** Reference to the generic dropdown button */
  public readonly genericbutton = viewChild<RfGenericDropButtonComponent>('genericbutton');
  /** Reference to the dropdown container */
  public readonly drop = viewChild<RfDropComponent>('drop');
  /** Reference to the list component */
  public readonly list = viewChild<RfListComponent>('list');

  /** List of selectable options */
  public options = input<RfListOption[]>([]);
  /** Placeholder text shown in the input */
  public placeholder = input<string>('');
  /** Optional animated floating label text */
  public animatedLabel = input<string>('');
  /** Filter configuration for the dropdown list */
  public filter = input<RfOptionsFilter>();
  /** If true, enables typeahead includes instead startwith */
  public typeaheadIncludes = input<boolean>(false); /** Icon to display on the right side */
  public rightIcon = input<string>('');
  /** Icon to display on the left side */
  public leftIcon = input<string>('');
  /** Indicates if there is a general hint on the parent component */
  public hasGeneralHint = input<boolean>(false);
  /** Whether to hide the dropdown caret icon */
  public hideCaret = input<boolean>(false);
  /** Indicates whether the floating label is visible */
  public floatingLabel: boolean = false;
  /** Currently selected option */
  public selectedOption?: RfListOption;
  /** Function to modify the selected option. */
  public mask = input<((data: SafeHtml) => SafeHtml) | undefined>(undefined);
  /** Internal form group for the select component */
  public form!: RfFormGroup;
  /** Whether the component is disabled */
  public isDisabled: boolean = false;
  /** Whether the dropdown is currently open */
  public dropIsOpen: boolean = false;
  /** Internal component type identifier */
  public override rfTypeClass: string = 'RfSelectComponent';

  get listboxBase(): string {
    return this.list()?.parentId() || this.getFullFormControlName();
  }

  get activeOptionId(): string | null {
    const value = this.selectedOption?.value;
    if (!value) return null;
    return `${this.listboxBase}-${value}`;
  }

  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /**
   * Initializes the internal form group and syncs value and disabled state.
   */
  public ngOnInit(): void {
    this.form = new RfFormGroup('RF-SELECT-' + this.randomId, {
      list: new RfFormControl({ value: this.value(), disabled: this.isDisabled }),
    });

    this.form.valueChanges.subscribe((changes: RfSelectForm) => {
      this.value.set(changes.list);
      this.onChange(changes.list);
    });
  }

  public override getElementRef(): ElementRef {
    return this.genericbutton()!.input()!;
  }

  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (!this.formControlName()) {
      this.selectedOption = this.options()?.find((opt) => opt.value === this.value());
      if (this.selectedOption) {
        this.form.setValue({ list: this.value() }, { emitEvent: false });
      }
    }
  }

  /**
   * Sets up validators, syncs state, and registers reactive form control events.
   */
  public ngAfterViewInit(): void {
    const validators = (this.getFormControl() as RfFormControl)?.getCustomValidators() as ValidatorFn[];
    if (Array.isArray(validators)) {
      for (const validator of validators) {
        this.form.get('list')?.addValidators(validator);
      }
    }
    this.form.get('list')?.updateValueAndValidity();
    this.control?.markAsPristine();
    if (this.getFormControl() as RfFormControl) {
      this.registerStateFormEvents(this.getFormControl() as RfFormControl, this.form);
      (this.control as RfFormControl)?.onMarkAsDirty.subscribe(() => {
        this.form?.markAllAsDirty();
      });
    }
    if (!this.formControlName()) {
      this.disabled() ? this.form?.disable() : this.form?.enable();
      this.disabled() ? this.control?.disable() : this.control?.enable();
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        this.isDisabled = isDisabled;
        isDisabled ? this.form?.disable() : this.form?.enable();
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
      this.control?.statusChanges.subscribe(() => {
        this.isDisabled = this.control?.disabled || false;
        this.disabled.set(this.isDisabled);
      });
    }
    this.list()?.bypassKeys.set(true);
    requestAnimationFrame(() => {
      this.changeDetector.markForCheck();
      this.autoId = this.generateAutoId(this.parentId());
    });
  }

  /**
   * Writes a value into the component from the form control.
   * Syncs selected option from the available list.
   *
   * @param value The value or form control state to write
   */
  public override writeValue(value: string | FormControlState<string>): void {
    if (!value) {
      value = '';
    }
    this.value.set(value);
    this.form.setValue({ list: value }, { emitEvent: false });

    if (typeof value === 'string') {
      this.setSelectedOption(value);
    }

    if (typeof value === 'object' && 'value' in value) {
      this.setSelectedOption(value.value);
    }
    this.updateDisabledState();
  }

  public override setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.updateDisabledState();
  }

  /**
   * Updates the component's value based on list selection.
   *
   * @param data Selection event from the list
   */
  public updateValue(data: RfListSelectEvent): void {
    const value: string = data.option.value;
    this.value.set(value);
    this.setSelectedOption(value);
    if (this.form.get('list')?.value !== value) {
      this.form.get('list')?.setValue(value);
    }
    if (!this.formControlName()) {
      if (this.control) {
        this.control.setValue(value, { emitEvent: false });
        this.control.markAsDirty();
      }
    }
  }

  /**
   * Opens or closes the dropdown and focuses the list.
   *
   * @param isOpen Whether the dropdown is open
   */
  public onOpen(isOpen: boolean): void {
    this.list()?.resetFilter();
    this.dropIsOpen = isOpen;
    this.list()?.focus();
    if (isOpen) {
      this.list()?.control?.setValue(this.control?.value, { emitEvent: false });
      this.list()?.focusOption();
    }
  }

  /**
   * Detects when focus leaves the component to trigger touch state.
   *
   * @param event Focus event
   */
  public handleFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const hostElement = event.currentTarget as HTMLElement;
    if (!relatedTarget || !hostElement.contains(relatedTarget)) {
      this.decideIfEmitTouch();
    }
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    this.control?.markAllAsTouched();
    this.onTouched();
  }

  /**
   * Marks all controls as touched and triggers onTouched callback.
   */
  public decideIfEmitTouch(): void {
    if (this.mouseDownIsInProgress) {
      this.actionBlurIsPending = true;
    } else {
      this.executeActionBlur();
      this.mouseDownIsInProgress = false;
    }
  }

  /**
   * Handles blur event on the select to hide the floating label.
   */
  public onBlur(): void {
    this.floatingLabel = false;
  }

  /**
   * Handles focus event to show floating label.
   */
  public onFocus(): void {
    this.floatingLabel = true;
  }

  /**
   * Handles keyboard navigation and dropdown control when the button is focused.
   *
   * @param event Keyboard event
   */
  public onKeyDownButon(event: KeyboardEvent): void {
    if (!this.readonly() && !this.disabled()) {
      if (event.key === 'Tab') {
        if (this.genericbutton()?.dropIsOpen()) {
          this.actionsCloseDrop(event);
        }
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.list()?.moveSelection('down');
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.list()?.moveSelection('up');
      }
    }
  }

  /**
   * Delegates keydown event to list for typeahead support.
   *
   * @param event Keyboard event
   */
  public onKeyDown(event: KeyboardEvent): void {
    this.list()?.handleTypeAheadKey(event);
    if (event.key === 'Escape') {
      event.preventDefault();
      this.genericbutton()?.focusButton();
      this.drop()?.closeDrop();
    }
  }

  /**
   * Applies the current disabled state to all form controls.
   */
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
   * Sets the selected option based on the given value.
   *
   * @param value The selected value
   */
  private setSelectedOption(value: string): void {
    this.selectedOption = this.options().find((opt) => opt.value === value);
  }

  /**
   * Handles blur from filter input and closes the dropdown if appropriate.
   *
   * @param event Focus event
   */
  public onBlurFilter(event: FocusEvent): void {
    const related: HTMLElement | null = event.relatedTarget as HTMLElement | null;
    this.genericbutton()?.focusButton();
    if (!(related as HTMLElement)?.id?.includes(this.getFullFormControlName())) {
      this.drop()?.closeDrop();
    }
  }

  /**
   * Handles keyboard enter event to close the dropdown.
   *
   * @param event Keyboard event
   */
  public onKeyPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === 'Escape') {
      this.actionsCloseDrop(event);
    }
  }

  /**
   * Do the actions in order to hide the dropdown.
   *
   * @param event The keyboard event
   */
  private actionsCloseDrop(event: KeyboardEvent): void {
    event.preventDefault();
    this.genericbutton()?.focusButton();
    this.drop()?.closeDrop();
  }

  /** Set the focus on focussable element */
  public override focus(): void {
    if (this.genericbutton()) {
      this.genericbutton()?.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }
}
