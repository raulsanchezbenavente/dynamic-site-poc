import { NgClass } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { RfBaseReactiveComponent } from '../../../abstract/components/rf-base-reactive.component';
import { DEFAULT_SHOW_ERRORS_MODE } from '../../../abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';

import { RfErrorMessagesClasses } from './models/rf-error-messages.classes.model';
import { RfErrorMessageMultipleComponent, RfErrorMessageSingleComponent } from './models/rf-error-messages.model';
import { RfErrorMessages } from './types/rf-error-messages.types';

@Component({
  selector: 'rf-error-messages',
  templateUrl: './rf-error-messages.component.html',
  styleUrls: ['./styles/rf-error-messages.styles.scss'],
  host: { class: 'rf-error-message' },
  imports: [NgClass],
})
export class RfErrorMessagesComponent implements OnInit {
  public displayErrorsMode = model<RfErrorDisplayModes>(DEFAULT_SHOW_ERRORS_MODE);
  public control = model<AbstractControl | Record<string, AbstractControl | null> | null>(null);
  public showErrorMessages = model<boolean>(true);
  public errorMessages = model<RfErrorMessages>();
  public classes = model<RfErrorMessagesClasses>();
  public id = model<string | undefined | null>('');

  public ngOnInit(): void {
    if (!this.displayErrorsMode()) {
      this.displayErrorsMode.set(DEFAULT_SHOW_ERRORS_MODE);
    }
  }
  get firstErrorMessage(): string | null {
    const ctrl = this.control();
    if (!ctrl) return null;
    if (
      this.isSingleControl(ctrl) &&
      RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(ctrl, this.displayErrorsMode())
    ) {
      return this.getFirstErrorMessageForControl(ctrl, this.errorMessages() as RfErrorMessageSingleComponent);
    }
    if (this.isMultipleControls(ctrl)) {
      const hasAnyControlReadyToShowErrors = Object.values(ctrl).some(
        (control) =>
          control && RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(control, this.displayErrorsMode())
      );

      if (hasAnyControlReadyToShowErrors) {
        for (const [controlName, control] of Object.entries(ctrl)) {
          if (control?.errors) {
            return this.getFirstErrorMessageForControl(
              control,
              (this.errorMessages() as RfErrorMessageMultipleComponent)?.[controlName]
            );
          }
        }
      }
    }
    return null;
  }

  private getFirstErrorMessageForControl(
    control: AbstractControl | null,
    errorMessages?: RfErrorMessageSingleComponent
  ): string | null {
    if (!control?.errors) return null;
    const errorKeys = Object.keys(control.errors);
    if (errorKeys.length > 0) {
      const errorKey = errorKeys[0];
      return errorMessages?.[errorKey] ?? errorKey;
    }
    return null;
  }

  private isSingleControl(control: any): control is AbstractControl {
    return control instanceof AbstractControl;
  }

  private isMultipleControls(control: any): control is Record<string, AbstractControl | null> {
    return typeof control === 'object' && !(control instanceof AbstractControl);
  }
}
