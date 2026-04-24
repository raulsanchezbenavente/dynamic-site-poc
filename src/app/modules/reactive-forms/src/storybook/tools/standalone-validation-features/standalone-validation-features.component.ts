import { Component, input, output, Signal } from '@angular/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfCheckboxComponent } from '../../../lib/components/rf-checkbox/rf-checkbox.component';
import { RfRadioComponent } from '../../../lib/components/rf-radio/rf-radio.component';
import { RfFormControl } from '../../../lib/extensions/components/rf-form-control.component';
import { RfComponentTypes } from '../../../lib/extensions/types/rf-form-control-validations.types';

@Component({
  selector: 'standalone-validation-features',
  imports: [],
  templateUrl: './standalone-validation-features.component.html',
  styleUrl: '../../../storybook/stories/reactive-forms/styles/stories-styles.scss',
  standalone: true,
})
export class StandaloneValidationFeaturesComponent {
  public changeErrorDisplayMode = output<RfErrorDisplayModes>();

  public components = input<any[]>();
  public errorDisplayModes = Object.values(RfErrorDisplayModes);
  public selectedErrorDisplayMode: RfErrorDisplayModes = DEFAULT_SHOW_ERRORS_MODE;

  public changeDisplayErrorsMode(event: Event): void {
    this.selectedErrorDisplayMode = (event.target as HTMLSelectElement).value as RfErrorDisplayModes;
    this.applyToComponents(this.components()!, (component) => {
      component.displayErrorsMode.set(this.selectedErrorDisplayMode);
    });
    this.changeErrorDisplayMode.emit(this.selectedErrorDisplayMode);
  }

  public markAllAsTouched(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.markAllAsTouched();
    });
  }

  public markAsTouched(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.markAsTouched();
    });
  }

  public markAsUntouched(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.markAsUntouched();
    });
  }

  public markAllAsDirty(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.markAllAsDirty();
    });
  }

  public markAsPristine(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.markAsPristine();
    });
  }

  public enable(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.enable();
    });
  }

  public disable(): void {
    this.applyToComponentsControls(this.components()!, (control) => {
      control.disable();
    });
  }

  public setDebug(event: Event): void {
    this.components()?.forEach((component) => {
      const isEnabled: boolean = (event.target as HTMLInputElement).checked;
      component.debug = isEnabled;
    });
  }

  private componentRegistry: Record<string, typeof RfCheckboxComponent | typeof RfRadioComponent> = {
    RfCheckboxComponent,
    RfRadioComponent,
  };

  private applyToComponents<
    T extends { rfTypeClass: string; rfComponent: RfComponentTypes; control: RfFormControl; name: Signal<string> },
  >(components: T[], fn: (component: any) => void): void {
    components.forEach((component) => {
      if (component) {
        if (['RfCheckboxComponent', 'RfRadioComponent'].includes(component.rfTypeClass)) {
          const controls = this.componentRegistry[component.rfTypeClass].controls[component.name()];
          controls?.forEach((component) => {
            fn(component);
          });
        } else {
          fn(component);
        }
      }
    });
  }

  private applyToComponentsControls<T extends { getFormControl(): RfFormControl | null }>(
    components: T[],
    fn: (control: RfFormControl) => void
  ): void {
    components.forEach((component) => {
      const control = component.getFormControl();
      if (control) {
        fn(control);
      }
    });
  }
}
