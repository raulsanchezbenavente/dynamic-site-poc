import { NgClass } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, input, OnInit, output, viewChild } from '@angular/core';
import dayjs from 'dayjs';
import { Subject, takeUntil } from 'rxjs';

import {
  ModalDialogConfig,
  ModalDialogService,
  ModalDialogSize,
} from '../../../../../design-system/src/lib/components/modal-dialog';
import { ButtonStyles, LayoutSize, type UserCulture } from '../../../../../libs';
import { RfBaseReactiveComponent } from '../../../lib/abstract/components/rf-base-reactive.component';
import { DEFAULT_SHOW_ERRORS_MODE } from '../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../lib/extensions/components/rf-form-group.component';
import { RfFormBuilderComponent } from '../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { FormCustomModalComponent } from '../form-custom-modal/form-custom-modal.component';

@Component({
  selector: 'form-validation-features',
  templateUrl: './form-validation-features.component.html',
  styleUrl: './form-validation-features.component.scss',
  standalone: true,
  imports: [NgClass],
})
export class FormValidationFeaturesComponent implements OnInit {
  @HostListener('window:keydown', ['$event']) public handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.altKey && this.container()?.nativeElement.offsetWidth > 0) {
      this.submitForm();
      event.preventDefault();
    }
  }

  public readonly container = viewChild<ElementRef>('container');

  public changeErrorDisplayMode = output<RfErrorDisplayModes>();

  public form = input<RfFormGroup | RfFormBuilderComponent>();

  public _formBuilder: RfFormBuilderComponent | null = null;
  public _form: RfFormGroup | null = null;

  public errorDisplayModes = Object.values(RfErrorDisplayModes);
  public selectedErrorDisplayMode: RfErrorDisplayModes = DEFAULT_SHOW_ERRORS_MODE;

  public modalDialogConfig: ModalDialogConfig = {
    title: 'Form validation info',
    layoutConfig: {
      size: ModalDialogSize.MEDIUM,
    },
    footerButtonsConfig: {
      actionButton: {
        label: 'Close',
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.ACTION,
        },
      },
    },
  };
  private readonly $unsubscribe: Subject<void> = new Subject<void>();
  private readonly dialogService: ModalDialogService = inject(ModalDialogService);

  constructor() {}

  private readonly registerEffect = effect(() => {
    if (this.form() instanceof RfFormBuilderComponent) {
      this._formBuilder = this.form() as RfFormBuilderComponent;
      this._form = this._formBuilder?.form;
    }
    if (this.form() instanceof RfFormGroup) {
      this._form = this.form() as RfFormGroup;
    }
  });

  public ngOnInit(): void {
    this.changeErrorDisplayMode.emit(this.selectedErrorDisplayMode);
  }

  public submitForm(): void {
    if (this._form) {
      if (
        this._form.displayErrorsMode === RfErrorDisplayModes.DIRTY ||
        this._form.displayErrorsMode === RfErrorDisplayModes.DIRTY_AND_TOUCHED
      ) {
        this._form.markAllAsDirty();
      }
      if (
        this._form.displayErrorsMode === RfErrorDisplayModes.TOUCHED ||
        this._form.displayErrorsMode === RfErrorDisplayModes.DIRTY_AND_TOUCHED
      ) {
        this._form?.markAllAsTouched();
      }
      if (this._form.displayErrorsMode === RfErrorDisplayModes.SUBMITTED) {
        this._form.submitted = true;
      }
      this.dialogService
        .openModal(this.modalDialogConfig, FormCustomModalComponent, {
          invalid: this._form?.invalid,
          raw: this.normalizeDayjs(this._form?.getRawValue()),
        })
        .pipe(takeUntil(this.$unsubscribe));
      console.log('Form info:', this._form?.getRawValue());
    }
  }

  public changeDisplayErrorsMode(event: Event): void {
    this.selectedErrorDisplayMode = (event.target as HTMLSelectElement).value as RfErrorDisplayModes;
    this._form?.changeDisplayErrorsMode(this.selectedErrorDisplayMode);
    this.changeErrorDisplayMode.emit(this.selectedErrorDisplayMode);
  }

  public setDebug(event: Event): void {
    const isEnabled: boolean = (event.target as HTMLInputElement).checked;
    this._form?.setDebug(isEnabled);
    this.changeErrorDisplayMode.emit(this.selectedErrorDisplayMode);
  }

  private normalizeDayjs(obj: Record<string, unknown>): Record<string, unknown> {
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        obj[key] = null;
      }
      const culture = this.getCulture(key);
      console.log(culture);
      const value = obj[key] as Record<string, unknown> | null;
      if (value?.['$d']) {
        obj[key] = this.getDate(value, culture);
      }
      if (value?.['startDate']) {
        obj[key] = {
          startDate: this.getDate(value['startDate'] as Record<string, unknown>, culture),
          endDate: this.getDate(value['endDate'] as Record<string, unknown>, culture),
        };
      }
    }
    return obj;
  }

  private getCulture(key: string): UserCulture | undefined {
    const rfComponent = (this._form?.get(key) as RfFormControl)?.rfComponent as
      | (RfBaseReactiveComponent & { culture?: UserCulture | (() => UserCulture | undefined) })
      | undefined;

    const cultureValue = rfComponent?.culture;
    if (typeof cultureValue === 'function') {
      return cultureValue();
    }

    return cultureValue;
  }

  private getDate(obj: Record<string, unknown>, culture?: UserCulture): string {
    const shortDateFormat: string = culture?.shortDateFormat || 'YYYY-MM-DD';
    return dayjs(obj['$d'] as Date).format(shortDateFormat);
  }

  public setSubmitted(submitted: boolean): void {
    if (this._form) {
      this._form.submitted = submitted;
    }
  }
}
