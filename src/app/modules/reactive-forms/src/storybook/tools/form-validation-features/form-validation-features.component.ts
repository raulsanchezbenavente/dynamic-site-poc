import { NgClass } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, input, OnInit, output, viewChild } from '@angular/core';
import { ModalDialogConfig, ModalDialogService, ModalDialogSize } from '@dcx/ui/design-system';
import { ButtonStyles, LayoutSize, UserCulture } from '@dcx/ui/libs';
import dayjs from 'dayjs';
import { RfBaseReactiveComponent, RfFormControl } from 'reactive-forms';
import { Subject, takeUntil } from 'rxjs';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
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
  private $unsubscribe: Subject<void> = new Subject<void>();
  private dialogService: ModalDialogService = inject(ModalDialogService);

  constructor() {}

  private readonly registerEffect = effect(() => {
    if (this.form() instanceof RfFormBuilderComponent) {
      this._formBuilder = this.form() as RfFormBuilderComponent;
      this._form = this._formBuilder?.form as RfFormGroup;
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

  private normalizeDayjs(obj: Record<string, any>): Record<string, any> {
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        obj[key] = null;
      }
      const culture = this.getCulture(key);
      console.log(culture);
      if (obj[key] && obj[key]['$d']) {
        obj[key] = this.getDate(obj[key], culture);
      }
      if (obj[key] && obj[key]['startDate']) {
        obj[key] = {
          startDate: this.getDate(obj[key]['startDate'], culture),
          endDate: this.getDate(obj[key]['endDate'], culture),
        };
      }
    }
    return obj;
  }

  private getCulture(key: string): UserCulture | undefined {
    const component = (this._form?.get(key) as RfFormControl)?.rfComponent;
    const single = Array.isArray(component) ? component[0] : component;
    return (single as RfBaseReactiveComponent)?.culture?.();
  }

  private getDate(obj: any, culture?: UserCulture): string {
    const shortDateFormat: string = culture?.shortDateFormat || 'YYYY-MM-DD';
    return dayjs(obj['$d']).format(shortDateFormat);
  }

  public setSubmitted(submitted: boolean): void {
    if (this._form) {
      this._form.submitted = submitted;
    }
  }
}
