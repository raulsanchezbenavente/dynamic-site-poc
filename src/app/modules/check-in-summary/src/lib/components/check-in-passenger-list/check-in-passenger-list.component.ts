import { NgClass, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaxSegmentCheckinStatus } from '@dcx/ui/api-layer';
import {
  BoardingPassOffCanvasComponent,
  BoardingPassProxyService,
  CheckInCommonTranslationKeys,
  CheckInPassengersListBaseComponent,
  CheckInSummaryPassengerVM,
} from '@dcx/ui/business-common';
import { DsButtonComponent } from '@dcx/ui/design-system';
import { CommonTranslationKeys } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_SHOW_ERRORS_MODE, RfCheckboxComponent, RfFormControl, RfFormGroup } from 'reactive-forms';
import { skip } from 'rxjs';

import { CheckInPassenger } from '../../models/check-in-passenger.model';
import { TranslationKeys } from '../../enums/translations-keys.enum';

@Component({
  selector: 'check-in-passenger-list',
  templateUrl: './check-in-passenger-list.component.html',
  styleUrls: ['./styles/check-in-passenger-list.styles.scss'],
  host: {
    class: 'wci-pax-list',
  },
  providers: [BoardingPassProxyService],
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    BoardingPassOffCanvasComponent,
    NgClass,
    TitleCasePipe,
    // shared components
    RfCheckboxComponent,
    DsButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInPassengerListComponent extends CheckInPassengersListBaseComponent implements OnInit {
  public segmentIdentifier = input<string>();
  public passengersFields = input.required({
    transform: (value: CheckInPassenger[]) => this.updateCheckInStatus(value),
  });

  public changeCheckBoxStatus = output<{ changeValue: boolean; value: string }>();
  public checkedPassengers = output<string[]>();

  public passengerCheckInStatus = PaxSegmentCheckinStatus;
  public passengerSummaryList: CheckInSummaryPassengerVM[] = [];
  public checkInForm!: RfFormGroup;
  public passengerField: { [key: string]: CheckInPassenger } = {};

  protected readonly translateKeys = { ...CheckInCommonTranslationKeys, ...TranslationKeys, ...CommonTranslationKeys } as const;

  public createSegmentform(): void {
    this.checkInForm = new RfFormGroup(
      'CheckInForm',
      {
        [this.journeyId()]: new RfFormControl([]),
      },
      null,
      null,
      DEFAULT_SHOW_ERRORS_MODE
    );
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.createSegmentform();
    this.checkInForm
      .get(this.journeyId())
      ?.valueChanges.pipe(skip(1))
      .subscribe((value: string[]) => {
        this.changeCheckBoxStatus.emit({
          changeValue: this.passengersFields().length === value.length,
          value: this.journeyId(),
        });
        this.emitCheckedPassengers(value);
      });
    this.setPassengerField();
  }

  /** Returns true if passenger has at least one assigned seat */
  public hasAnySeatAssigned(passenger: CheckInSummaryPassengerVM): boolean {
    return (passenger.seats ?? []).some((s) => !!s && s.trim() !== '');
  }

  private emitCheckedPassengers(data: string[]): void {
    data = data.map((id: string) => {
      const passenger = this.passengers().find((passenger) => id.includes(passenger.id));
      if (passenger) {
        return id.replace(passenger.id, passenger.referenceId);
      }
      return id;
    });
    this.checkedPassengers.emit(data);
  }

  private updateCheckInStatus(checkInPassenger: CheckInPassenger[]): CheckInPassenger[] {
    const allChecked = checkInPassenger.every((item: CheckInPassenger) => item.value);

    // Guard: checkInForm, passengers and journeyId might not be initialized during transform
    if (this.checkInForm && this.passengers && this.journeyId) {
      const journeyId = this.journeyId();
      const passengers = this.passengers();

      if (allChecked && journeyId && passengers) {
        const checkedValues = checkInPassenger
          .filter((item) => item.value)
          .map((item) => {
            const passenger = passengers.find((p) => item.id.includes(p.id));
            const segmentId = journeyId;

            if (passenger?.detail) {
              return `${passenger.id} ${segmentId} ${passenger.detail.split('-')[1]}`;
            }
            return `${passenger?.id || item.id} ${segmentId}`;
          });

        this.checkInForm.get(journeyId)?.setValue(checkedValues);
      } else if (journeyId) {
        this.checkInForm.get(journeyId)?.setValue([]);
      }
    }

    return checkInPassenger;
  }

  private setPassengerField(): void {
    for (const paxField of this.passengersFields()) {
      if (paxField.label) {
        this.passengerField[paxField.id] = paxField;
      }
    }
  }
}
