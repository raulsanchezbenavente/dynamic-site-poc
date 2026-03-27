import { NgClass } from '@angular/common';
import { Component, model } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { RfBaseReactiveComponent } from '../../../abstract/components/rf-base-reactive.component';
import { DEFAULT_SHOW_ERRORS_MODE } from '../../../abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfErrorMessagesClasses } from '../rf-error-messages/models/rf-error-messages.classes.model';

@Component({
  selector: 'rf-hint-messages',
  templateUrl: './rf-hint-messages.component.html',
  styleUrls: ['./styles/rf-hint-messages.styles.scss'],
  host: { class: 'rf-hint-message' },
  imports: [NgClass],
})
export class RfHintMessagesComponent {
  public control = model<AbstractControl | Record<string, AbstractControl | null> | null>(null);
  public showHintMessages = model<boolean>(true);
  public hintMessage = model<string>();
  public classes = model<RfErrorMessagesClasses>();
  public id = model<string | undefined | null>('');
  public displayErrorsMode = model<RfErrorDisplayModes>(DEFAULT_SHOW_ERRORS_MODE);

  get isErrorBeingDisplayed(): boolean {
    const ctrl = this.control();
    if (!ctrl) return false;
    return this.isControlInvalid(ctrl);
  }

  public isControlInvalid(control: AbstractControl | Record<string, AbstractControl | null> | null): boolean {
    if (this.isSingleControl(control)) {
      return !!(
        control &&
        control.invalid &&
        RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(control, this.displayErrorsMode())
      );
    } else if (this.isMultipleControls(control)) {
      return Object.values(control).some(
        (ctrl) =>
          ctrl &&
          ctrl.invalid &&
          RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(ctrl, this.displayErrorsMode())
      );
    }
    return false;
  }

  private isSingleControl(control: any): control is AbstractControl {
    return control instanceof AbstractControl;
  }

  private isMultipleControls(control: any): control is Record<string, AbstractControl | null> {
    return typeof control === 'object' && !(control instanceof AbstractControl);
  }
}
