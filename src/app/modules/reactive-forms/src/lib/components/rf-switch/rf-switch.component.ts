import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  model,
  OnInit,
  viewChild,
} from '@angular/core';
import { FormControlState, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';

import { RfSwitchClasses } from './models/rf-switch-classes.model';

/**
 * Reusable reactive switch component integrated with Angular Reactive Forms.
 *
 * Features:
 * - Supports boolean values (true/false)
 * - Compatible with `FormControl`, `FormControlState`, and standalone usage
 * - Emits changes on toggle
 * - Handles disabled state and touch status programmatically
 * - Integrates with `RfErrorMessagesComponent` and debugging tools
 */
@Component({
  selector: 'rf-switch',
  standalone: true,
  templateUrl: './rf-switch.component.html',
  styleUrl: './styles/rf-switch.styles.scss',
  host: { class: 'rf-switch' },
  imports: [NgClass, RfErrorMessagesComponent, RfHintMessagesComponent, RfDebugStateComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfSwitchComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfSwitchComponent),
      multi: true,
    },
  ],
})
export class RfSwitchComponent
  extends RfBaseReactiveComponent<
    boolean | FormControlState<boolean>,
    string,
    RfErrorMessageSingleComponent,
    RfSwitchClasses,
    string
  >
  implements OnInit, AfterViewInit, AfterContentInit
{
  /** Reference to the input HTML element */
  public readonly input = viewChild<ElementRef>('switch');

  /** Switch label text */
  public label = model<string>('');
  /** Component type identifier */
  public override rfTypeClass: string = 'RfSwitchComponent';

  /**
   * Initializes default value and handles disabled state subscriptions.
   */
  public ngOnInit(): void {
    if (this.value() === undefined) {
      this.value.set(false);
    }
    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
    }
  }

  public override getElementRef(): ElementRef {
    return this.input()!;
  }

  /**
   * Writes value from form control into the component.
   * @param value New value to write
   */
  public override writeValue(value: boolean | FormControlState<boolean>): void {
    let finalValue = false;
    if (typeof value === 'boolean') {
      finalValue = value;
    } else if (value && typeof value === 'object' && 'value' in value) {
      finalValue = !!value.value;
    }
    this.value.set(finalValue);
  }

  /**
   * Lifecycle hook after projected content is initialized. Syncs value/disabled state.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (!this.formControlName()) {
      this.control?.setValue(this.value());
      this.disabled() ? this.control?.disable() : this.control?.enable();
    }
  }

  /**
   * Lifecycle hook after view is initialized. Syncs disabled state and value.
   */
  public ngAfterViewInit(): void {
    this.control?.setValue(this.value());
    if (!this.formControlName()) {
      this.control?.statusChanges.subscribe(() => {
        const isDisabled: boolean = this.control?.disabled || false;
        this.disabled.set(isDisabled);
      });
    }
    requestAnimationFrame(() => {
      this.changeDetector.markForCheck();
      this.autoId = this.generateAutoId();
    });
  }

  /**
   * Updates the internal value on toggle interaction.
   * @param event DOM event from input toggle
   */
  public updateValue(event: Event): void {
    const newValue = (event.target as HTMLInputElement).checked;
    this.value.set(newValue);
    this.onChange(newValue);
    this.control?.markAsDirty();
  }

  /**
   * Toggles the value and emits change manually.
   * @param event DOM event from toggle input
   */
  public toggleSwitch(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value.set(checked);
    this.onChange(checked);
    this.control?.markAsDirty();
    if (!this.formControlName()) {
      this.control?.setValue(checked, { emitEvent: false });
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

  /**
   * Handles blur event to trigger onTouched only when focus leaves the switch group.
   */
  protected handleFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const hostElement = event.currentTarget as HTMLElement;
    if (!relatedTarget || !hostElement.contains(relatedTarget)) {
      this.decideIfEmitTouch();
    }
  }

  /**
   * Marks the control as touched and calls the `onTouched` callback.
   */
  private decideIfEmitTouch(): void {
    if (this.mouseDownIsInProgress) {
      this.actionBlurIsPending = true;
    } else {
      this.executeActionBlur();
      this.mouseDownIsInProgress = false;
    }
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    if (!this.formControlName()) {
      this.control?.markAsTouched();
    }
    this.onTouched();
  }
}
