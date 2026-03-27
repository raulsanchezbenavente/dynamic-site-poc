import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  input,
  model,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { FormControlState, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconButtonComponent, IconComponent } from '@dcx/storybook/design-system';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfAnimatedLabelComponent } from '../common/rf-animated-label/rf-animated-label.component';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';

import { AutocompleteTypes } from './enums/rf-autocomplete-types.enum';
import { RfInputClasses } from './models/rf-input-classes.model';
import { RfInputTextMessages } from './models/rf-input-text-messages.model';
import { RfInputTypes } from './models/rf-input-types.model';

/**
 * Input text component integrated with Angular Reactive Forms.
 * Inherits base reactive behavior and adds UI-specific features like animated labels,
 * icons, floating labels, password toggle, and input pattern filtering.
 */
@Component({
  selector: 'rf-input-text',
  templateUrl: './rf-input-text.component.html',
  styleUrls: ['./styles/rf-input-text.styles.scss'],
  host: { class: 'rf-input-text' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfInputTextComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfInputTextComponent),
      multi: true,
    },
  ],
  imports: [
    NgClass,
    RfAnimatedLabelComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    RfDebugStateComponent,
    IconButtonComponent,
    IconComponent,
  ],
})
export class RfInputTextComponent
  extends RfBaseReactiveComponent<
    string | FormControlState<string>,
    string,
    RfErrorMessageSingleComponent,
    RfInputClasses,
    string
  >
  implements OnInit, AfterViewInit
{
  /** Emits value string when the input is blur */
  public blurInputText = output<string>();
  /** Emits event when the input gets a paste action */
  public pasteInputText = output<ClipboardEvent>();
  /** Dragleave Input action */
  public dragleaveInputText = output<DragEvent>();
  /** Reference to the input HTML element */
  public readonly input = viewChild<ElementRef>('input');
  /** Name attribute of the input field */
  public name = input.required<string>();
  /** Right icon (e.g., eye for password fields) */
  public rightIcon = model<string>('');
  /** Left icon */
  public leftIcon = model<string>('');
  /** Input type (text, password, etc.) */
  public type = model<RfInputTypes>(RfInputTypes.TEXT);
  /** Placeholder for the input field */
  public placeholder = model<string>('');
  /** Optional animated label text */
  public animatedLabel = model<string>('');
  /** Additional input messages */
  public messages = model<RfInputTextMessages>({});
  /** Maximum character length */
  public maxLength = model<number>();
  /** Minimum character length */
  public minLength = model<number>();
  /** Input autocomplete attribute */
  public autocomplete = model.required<AutocompleteTypes>();
  /** Regular expression pattern for input filtering */
  public inputPattern = model<RegExp>();
  /** Indicates if there is a general hint on the parent component */
  public hasGeneralHint = model<boolean>(false);

  /** Indicates if label should float above input */
  public floatingLabel: boolean = false;
  /** Label element ID used for accessibility */
  public labelId: string = this.idService.generateRandomId();
  /** Enum access to input types */
  public rfInputTypes = RfInputTypes;
  /** Whether password is currently masked */
  public passwordTransformation: boolean = false;
  /** Overrides the type class used for control registration */
  public override rfTypeClass: string = 'RfInputTextComponent';
  /** Whether the password is currently shown */
  public passwordShown: boolean = false;

  /** Whether the label should appear on top */
  get isLabelOnTop(): boolean {
    return Boolean(
      this.placeholder() || this.appearance() === this.appearanceTypes.INTEGRATED || this.floatingLabel || this.value()
    );
  }

  /** Host binding to apply container classes dynamically */
  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  public getDragableInfo(event: DragEvent): void {
    this.dragleaveInputText.emit(event);
  }

  /** Lifecycle hook: Initializes the component state */
  public ngOnInit(): void {
    if (this.value() === undefined) {
      this.value.set('');
    }
    if (this.type() === RfInputTypes.PASSWORD) {
      this.passwordTransformation = true;
      this.rightIcon.set('eye');
    }
  }

  public override getElementRef(): ElementRef {
    return this.input()!;
  }

  /** Lifecycle hook: Subscribes to control status changes */
  public ngAfterViewInit(): void {
    if (!this.formControlName()) {
      this.control?.statusChanges.subscribe(() => {
        const isDisabled: boolean = this.control?.disabled || false;
        this.disabled.set(isDisabled);
      });
      (this.control as RfFormControl)?.onSetValue.subscribe((value: string) => {
        if (!this.formControlName()) {
          this.changeDetector.detectChanges();
          this.value.set(value);
        }
      });
    }
    requestAnimationFrame(() => {
      this.changeDetector.markForCheck();
      this.autoId = this.generateAutoId(this.parentId());
    });
  }

  /** Writes value to the component from the form */
  public override writeValue(value: string | FormControlState<string>): void {
    if (!value) {
      value = '';
    }

    if (typeof value === 'string') {
      this.value.set(value ?? '');
    }

    if (typeof value === 'object' && 'value' in value) {
      this.value.set(value.value);
    }
  }

  /** Updates the component value and form control based on input event */
  public updateValue(event: Event): void {
    let newValue = (event.target as HTMLInputElement).value;

    if (this.inputPattern()) {
      const regex = this.inputPattern()!;
      newValue = newValue
        .split('')
        .filter((char) => regex.test(char))
        .join('');
      (event.target as HTMLInputElement).value = newValue;
    }

    this.value.set(newValue);
    this.onChange(newValue);

    if (!this.formControlName()) {
      if (this.control) {
        this.control.setValue(newValue, { emitEvent: false });
        this.control.markAsDirty();
      }
    }
  }

  /** Toggles the password visibility */
  public toggleIconPassword(): void {
    if (this.passwordTransformation) {
      this.passwordShown = !this.passwordShown;
      this.rightIcon.set(this.passwordShown ? 'eye-off' : 'eye');
      this.type.set(this.passwordShown ? RfInputTypes.TEXT : RfInputTypes.PASSWORD);
    }
  }

  /** Handles blur event to mark control as touched */
  public onBlur(): void {
    const el = this.input()?.nativeElement as HTMLInputElement;
    if (el) el.style.outline = '';
    if (this.mouseDownIsInProgress) {
      this.actionBlurIsPending = true;
    } else {
      this.executeActionBlur();
      this.mouseDownIsInProgress = false;
    }
  }

  public onPaste(event: ClipboardEvent): void {
    this.pasteInputText.emit(event);
  }

  public override executeActionBlur(): void {
    this.onTouched();
    this.floatingLabel = false;
    if (!this.formControlName()) {
      this.control?.markAsTouched();
    }
    this.blurInputText.emit(this.control?.value);
  }

  /** Handles focus event to float the label */
  public onFocus(): void {
    this.floatingLabel = true;
    const el = this.input()?.nativeElement as HTMLInputElement;
    if (!el) return;

    if (this.mouseDownIsInProgress) {
      el.style.outline = '0';
    } else {
      el.style.outline = '';
    }
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
}
