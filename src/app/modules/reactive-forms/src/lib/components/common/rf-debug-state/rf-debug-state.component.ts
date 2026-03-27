import { JsonPipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, model, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { RfErrorDisplayModes } from '../../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../../extensions/components/rf-form-control.component';
import { RfValidatorsConfig } from '../../../extensions/types/rf-form-control-validations.types';

@Component({
  selector: 'rf-debug-state',
  imports: [NgClass, JsonPipe],
  templateUrl: './rf-debug-state.component.html',
  styleUrl: './styles/rf-debug-state.component.scss',
  standalone: true,
})
export class RfDebugStateComponent implements AfterViewInit {
  public control = model<AbstractControl | null>(null);
  public displayErrorsMode = model<RfErrorDisplayModes>(RfErrorDisplayModes.NONE);
  public debug = model<boolean>(false);
  public hide = model<boolean>(false);
  public collapsed = signal(false);
  public validatorsList: string[] = [];
  public changeDetector = inject(ChangeDetectorRef);

  public toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  get errorsList(): { key: string; value: any }[] {
    const errors = this.control()?.errors;
    return errors ? Object.entries(errors).map(([key, value]) => ({ key, value })) : [];
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      const validationErrors: RfValidatorsConfig = (this.control() as RfFormControl)?.getCustomValidators();
      if (validationErrors) {
        if (typeof validationErrors === 'function') {
          this.validatorsList.push(validationErrors.name);
        } else if (Array.isArray(validationErrors)) {
          for (const element of validationErrors) {
            this.validatorsList.push(element.name);
          }
        }
      }
      this.changeDetector.detectChanges();
    }, 0);
  }
}
