import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Validators } from '@angular/forms';
import {
  DsButtonComponent,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import { ButtonConfig, SectionColors } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  AutocompleteTypes,
  FormBuilderConfig,
  GridBuilderComponent,
  GridBuilderLayout,
  RfErrorDisplayModes,
  RfFormBuilderComponent,
  RfFormBuilderFieldType,
} from 'reactive-forms';

import { AddBookingDto } from '../../api-models/find-bookings-response.model';

@Component({
  selector: 'add-upcoming-trips',
  templateUrl: './add-upcoming-trips.component.html',
  host: { class: 'add-upcoming-trips' },
  styleUrls: ['./styles/add-upcoming-trips.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    DsButtonComponent,
    PanelComponent,
    PanelContentDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
    PanelTitleDirective,
    RfFormBuilderComponent,
    GridBuilderComponent,
  ],
  standalone: true,
})
export class AddUpcomingTripsComponent implements OnInit {
  public submitForm = output<AddBookingDto>();
  public panelConfig!: PanelBaseConfig;
  public fields: WritableSignal<FormBuilderConfig> = signal({} as FormBuilderConfig);
  public formGridConfig = { appearance: GridBuilderLayout.INLINE, cols: 2 };
  public submitButtonConfig!: ButtonConfig;
  public bypassedConfig: FormBuilderConfig = {};
  public displayErrorMode: RfErrorDisplayModes = RfErrorDisplayModes.TOUCHED;

  public readonly addUpcomingTripsForm = viewChild<RfFormBuilderComponent>('addUpcomingTripsForm');
  public readonly elementRef = inject(ElementRef);

  private readonly bookingCodeFieldName: string = 'pnr';
  private readonly surnameFieldName: string = 'surname';
  private readonly bookingCodeFieldPattern: RegExp = /^[a-zA-Z0-9]*$/;
  private readonly surnameFieldPattern: RegExp = /^[a-zA-ZÀ-ÖØ-öø-ÿа-яА-ЯЁё`¨^\s]+$/;

  protected readonly translate = inject(TranslateService);

  public ngOnInit(): void {
    this.internalInit();
  }

  public send(): void {
    const formComponent = this.addUpcomingTripsForm();

    if (!formComponent?.form) {
      return;
    }

    if (!formComponent.form.valid) {
      formComponent.form.markAllAsTouched();
      formComponent.form.focusFirstInvalidField();
      return;
    }

    const formValues = formComponent.form.value as AddBookingDto;
    this.submitForm.emit(formValues);
  }

  private internalInit(): void {
    this.createReactiveForm();
    this.setPanelConfig();
  }

  private createReactiveForm(): void {
    this.setFieldsConfig();
    this.setButtonConfig();
  }

  protected setFieldsConfig(): void {
    this.fields.set({
      [this.bookingCodeFieldName]: {
        type: RfFormBuilderFieldType.INPUT,
        name: this.bookingCodeFieldName,
        autocomplete: AutocompleteTypes.ON,
        animatedLabel: this.translate.instant('FindBookings.AddUpcomingTrips.Form.BookingCode_Label'),
        hintMessages: this.translate.instant('FindBookings.AddUpcomingTrips.Form.BookingCode_Hint'),
        validators: [Validators.required, Validators.pattern(this.bookingCodeFieldPattern), Validators.minLength(6)],
        errorMessages: {
          required: this.translate.instant('FindBookings.AddUpcomingTrips.Form.BookingCode_RequiredMessage'),
          pattern: this.translate.instant('FindBookings.AddUpcomingTrips.Form.BookingCode_PatternMessage'),
          minlength: this.translate.instant('FindBookings.AddUpcomingTrips.Form.BookingCode_MinLengthMessage'),
        },
        leftIcon: 'new',
        maxLength: 6,
        inputPattern: this.bookingCodeFieldPattern,
      },
      [this.surnameFieldName]: {
        type: RfFormBuilderFieldType.INPUT,
        name: this.surnameFieldName,
        autocomplete: AutocompleteTypes.LAST_NAME,
        animatedLabel: this.translate.instant('FindBookings.AddUpcomingTrips.Form.Surname_Label'),
        hintMessages: this.translate.instant('FindBookings.AddUpcomingTrips.Form.Surname_Hint'),
        validators: [Validators.required, Validators.pattern(this.surnameFieldPattern)],
        errorMessages: {
          required: this.translate.instant('FindBookings.AddUpcomingTrips.Form.Surname_RequiredMessage'),
          pattern: this.translate.instant('FindBookings.AddUpcomingTrips.Form.Surname_PatternMessage'),
        },
        leftIcon: 'user',
        inputPattern: this.surnameFieldPattern,
        blurInputText: (value: string) => {
          const form = this.addUpcomingTripsForm()?.form;
          const newValue = value?.trim().replaceAll(/\s+/g, ' ');
          form?.get(this.surnameFieldName)?.setValue(newValue);
        },
      },
    });
  }

  protected setButtonConfig(): void {
    this.submitButtonConfig = {
      label: this.translate.instant('FindBookings.AddUpcomingTrips.Form.Button'),
    };
  }

  private setPanelConfig(): void {
    this.panelConfig = {
      title: this.translate.instant('FindBookings.AddUpcomingTrips.Title'),
      appearance: PanelAppearance.SHADOW,
      sectionsColors: SectionColors.OFFER,
    };
  }
}
