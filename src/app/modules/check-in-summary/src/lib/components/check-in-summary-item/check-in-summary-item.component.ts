import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { PaxSegmentCheckinStatus } from '@dcx/ui/api-layer';
import {
  CarriersDisplayMode,
  CheckInCommonTranslationKeys,
  CheckInSummaryItemConfig,
  CheckInSummaryJourneyVM,
  CheckInSummaryPassengerVM,
  JourneyScheduleComponent,
  JourneyScheduleConfig,
  mapBlockedReasonTranslation,
  SegmentAlertHelperService,
} from '@dcx/ui/business-common';
import {
  AlertPanelComponent,
  AlertPanelConfig,
  AlertPanelType,
  ListAppearance,
  ListComponent,
  ListConfig,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  RemainingTimeComponent,
  RemainingTimeConfig,
} from '@dcx/ui/design-system';
import { EnumStorageKey, JourneyVM, SelectedPassengersByJourney, StorageService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RfCheckboxComponent } from 'reactive-forms';

import { TranslationKeys } from '../../enums/translations-keys.enum';
import { CheckInPassenger } from '../../models/check-in-passenger.model';
import { CheckInPassengerListComponent } from '../check-in-passenger-list/check-in-passenger-list.component';

import { CheckboxPassenger } from './models/checkbox-passenger.model';

@Component({
  selector: 'check-in-summary-item',
  templateUrl: './check-in-summary-item.component.html',
  styleUrls: ['./styles/check-in-summary-item.styles.scss'],
  host: {
    class: 'checkin-summary-item',
    '[class.checkin-summary-item--not-available]': '!isCheckInAvailable',
  },
  imports: [
    TranslateModule,
    CheckInPassengerListComponent,
    ListComponent,
    PanelComponent,
    PanelContentDirective,
    JourneyScheduleComponent,
    AlertPanelComponent,
    RemainingTimeComponent,
    RfCheckboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInSummaryItemComponent implements OnInit {
  public config = input.required<CheckInSummaryItemConfig>();
  public data = input.required<CheckInSummaryJourneyVM>();

  public checkedPassengers = output<SelectedPassengersByJourney>();

  public passengerListElement = viewChildren('allPassenger', { read: RfCheckboxComponent });

  public showCheckBoxElements = signal<CheckInSummaryPassengerVM[]>([]);
  public showAlertMessage = signal(false);
  public summaryItemPanelConfig = signal<PanelBaseConfig>({
    appearance: PanelAppearance.SHADOW,
  });

  public selectAllChecked: boolean = false;
  public scheduleConfig!: JourneyScheduleConfig;
  public journeyDataConfig!: JourneyVM;
  public isCheckInAvailable!: boolean;
  public passengersCheckboxModel: CheckboxPassenger[] = [];
  public passengersFields: CheckInPassenger[] = [];

  public shouldShowSelectAllCheckbox = computed(() => {
    const totalPassengers = this.data().passengers.length;
    const availablePassengers = this.showCheckBoxElements().length;
    return totalPassengers >= 2 && availablePassengers >= 1;
  });

  public hasCheckedPassengers = computed(() => {
    return this.data().passengers.some((passenger) => passenger.status === PaxSegmentCheckinStatus.CHECKED_IN);
  });

  public mainSegmentId = computed(() => {
    const segments = this.data().segments;
    const segmentWithIssue = segments.find((s) => this.hasStandbyOrOverbookingForSegment(s.id));
    return segmentWithIssue?.id ?? segments[0]?.id;
  });

  public alertPanelConfig!: AlertPanelConfig;
  public alertPanelConfigStandByStatus!: AlertPanelConfig;
  public remainingTimeConfig!: RemainingTimeConfig;

  public blockedBpMessagesListAppearance: ListAppearance = ListAppearance.BULLET;
  public blockedBpAlertPanelId = 'bPBlockedTitleId';

  protected readonly translateKeys = { ...CheckInCommonTranslationKeys, ...TranslationKeys } as const;

  private readonly translate = inject(TranslateService);
  private readonly storageService = inject(StorageService);
  private readonly segmentAlertHelper = inject(SegmentAlertHelperService);

  public ngOnInit(): void {
    this.internalInit();
  }

  public hasStandbyOrOverbookingForSegment(segmentId: string): boolean {
    return this.segmentAlertHelper.hasStandbyOrOverbookingForSegment(this.data().passengers, segmentId);
  }

  public allPassengersAreCheckedForSegment(segmentId: string): boolean {
    const passengersInSegment = this.data().passengers.filter((passenger) =>
      passenger.segmentsInfo?.some((segmentInfo) => segmentInfo.segmentId === segmentId)
    );
    return passengersInSegment.every(
      (pax) =>
        pax.status === PaxSegmentCheckinStatus.CHECKED_IN ||
        pax.status === PaxSegmentCheckinStatus.OVERBOOKED ||
        pax.status === PaxSegmentCheckinStatus.STAND_BY
    );
  }

  public getAlertPanelConfigForSegment(segmentId: string): AlertPanelConfig | null {
    const alertStatus = this.segmentAlertHelper.getSegmentAlertStatus(this.data().passengers, segmentId);

    if (!alertStatus) {
      return null;
    }

    const isStandby = alertStatus === PaxSegmentCheckinStatus.STAND_BY;
    const isOcaEnabled = this.storageService.getSessionStorage(EnumStorageKey.IsOcaEnabled);
    const shouldShowOcaAlert = isOcaEnabled && isStandby;

    return {
      title: shouldShowOcaAlert
        ? this.translate.instant(CheckInCommonTranslationKeys.CheckIn_Alert_Oca_Title)
        : this.translate.instant(CheckInCommonTranslationKeys.CheckIn_Alert_Overbooking_Title),
      description: shouldShowOcaAlert
        ? this.translate.instant(CheckInCommonTranslationKeys.CheckIn_Alert_Oca_Description)
        : undefined,
      alertType: AlertPanelType.WARNING,
    };
  }

  public getSegmentAlertConfig(): AlertPanelConfig | null {
    const segmentWithAlert = this.data().segments.find((segment) => this.shouldShowAlertForSegment(segment.id));

    return segmentWithAlert ? this.getAlertPanelConfigForSegment(segmentWithAlert.id) : null;
  }

  public getBpBlockedConfigForHome(
    passengers: CheckInSummaryPassengerVM[]
  ): { config: Partial<AlertPanelConfig>; messages: string[] } | null {
    const segmentId = this.data().segments.find((segment) =>
      passengers.some((passenger) => this.segmentAlertHelper.isBoardingPassBlockedForSegment(passenger, segment.id))
    )?.id;

    if (!segmentId) {
      return null;
    }

    const checkedInPassengersForSegment = passengers.filter(
      (passenger) =>
        passenger.segmentsInfo?.some(
          (segment) => segment.segmentId === segmentId && segment.status === PaxSegmentCheckinStatus.CHECKED_IN
        ) ?? false
    );

    if (!checkedInPassengersForSegment.length) {
      return null;
    }

    const fallback = this.translate.instant(CheckInCommonTranslationKeys.CheckIn_BoardingPass_Blocked_Default);
    const blockedTitle = this.translate.instant(CheckInCommonTranslationKeys.CheckIn_BoardingPass_Blocked_Title);

    return this.segmentAlertHelper.buildBlockedBoardingPassAlertConfigForSegment(
      checkedInPassengersForSegment,
      segmentId,
      blockedTitle,
      fallback,
      (reason) => mapBlockedReasonTranslation(reason, fallback, (key) => this.translate.instant(key))
    );
  }

  private shouldShowAlertForSegment(segmentId: string): boolean {
    return this.hasStandbyOrOverbookingForSegment(segmentId) && this.allPassengersAreCheckedForSegment(segmentId);
  }

  private internalInit(): void {
    this.handleCheckInAvailable();
    this.setJourneyScheduleData();
    this.setScheduleConfig();
    this.setAlertPanelConfig();
    this.setRemainingTimeConfig();
    this.handlePassengersForm();
  }

  public onSelectAllPassengersChanged(event: boolean): void {
    this.selectAllChecked = event;
    this.showAlertMessage.set(true);
    setTimeout(() => {
      this.showAlertMessage.set(false);
    }, 1000);
    const newPassengerList: CheckInPassenger[] = [];
    const isChecked = event;
    for (let index = 0; index < this.passengersCheckboxModel.length; index++) {
      const model = this.passengersCheckboxModel[index];
      newPassengerList.push({
        id: this.getAllowedPassengers()[index].id + ' ' + this.data().id,
        label: model.label,
        value: isChecked ? this.getAllowedPassengers()[index].id + ' ' + this.data().id : '',
      });
    }
    this.passengersFields = newPassengerList;
  }

  public onChangeCheckBoxStatus(valueEvent: { changeValue: boolean; value: string }): void {
    for (const element of this.passengerListElement()) {
      if (element.autoId?.endsWith(valueEvent.value)) {
        if (valueEvent.changeValue) {
          element.getFormControl()?.setValue([valueEvent.value]);
          return;
        }
        element.getFormControl()?.setValue([]);
      }
    }
  }

  public onCheckedPassengers(values: string[]): void {
    const checkedPassengers: Record<string, string[]> = {};
    checkedPassengers[this.data().id] = [];
    for (const passengerId of values) {
      checkedPassengers[this.data().id].push(passengerId.split(' ')[0]);
      if (passengerId.split(' ')[2]) {
        checkedPassengers[this.data().id].push(passengerId.split(' ')[2]);
      }
    }
    this.checkedPassengers.emit(checkedPassengers);
  }

  private handleCheckInAvailable(): void {
    this.showCheckBoxElements.set(
      this.data().passengers.filter((passenger) => passenger.status === PaxSegmentCheckinStatus.ALLOWED)
    );
    this.isCheckInAvailable = this.data().isCheckInAvailable;
    if (!this.isCheckInAvailable) {
      this.summaryItemPanelConfig.set({
        appearance: PanelAppearance.BORDER,
      });
    }
  }

  private getAllowedPassengers(): CheckInSummaryPassengerVM[] {
    return this.data().passengers.filter(
      (passenger: CheckInSummaryPassengerVM) => passenger.status === PaxSegmentCheckinStatus.ALLOWED
    );
  }

  private handlePassengersForm(): void {
    for (const passenger of this.getAllowedPassengers()) {
      this.passengersCheckboxModel.push({
        label: passenger.name,
        id: passenger.id,
        value: passenger.status === PaxSegmentCheckinStatus.ALLOWED ? passenger.id : '',
      });
    }
    for (const [index, model] of this.passengersCheckboxModel.entries()) {
      this.passengersFields.push({
        label: model.label,
        value: false,
        id: this.getAllowedPassengers()[index].id,
      });
    }
  }

  private setAlertPanelConfig(): void {
    const hasRemainingTime = !!this.data()?.remainingTimeToCheckIn && this.config().showRemainingTime;
    const fallbackTitle = this.translate.instant(TranslationKeys.CheckIn_CheckInNotAvailable);

    if (this.data().passengers.some((passenger) => passenger.status === PaxSegmentCheckinStatus.NOT_ALLOWED)) {
      this.alertPanelConfig = {
        title: this.translate.instant(TranslationKeys.CheckIn_AirportCounter_SeatAvailability_Alert),
        alertType: AlertPanelType.WARNING,
        ariaAttributes: {
          ariaLabelledBy: this.journeyDataConfig.id,
        },
      };
    }

    if (!this.isCheckInAvailable) {
      this.alertPanelConfig = {
        title: hasRemainingTime ? '' : fallbackTitle,
        alertType: AlertPanelType.NEUTRAL,
        ariaAttributes: {
          ariaLabelledBy: this.journeyDataConfig.id,
        },
      };
    }
  }

  private setScheduleConfig(): void {
    this.scheduleConfig = {
      scheduleConfig: {
        carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
      },
    };
  }

  private setJourneyScheduleData(): void {
    const dataJourneyVM = this.data() as JourneyVM;
    this.journeyDataConfig = dataJourneyVM;
  }

  private setRemainingTimeConfig(): void {
    this.remainingTimeConfig = {
      labelDictionaryKey: 'CheckIn',
      joinStyle: 'conjunction',
    };
  }

  public blockedBpMessagesListConfig = computed<ListConfig>(() => {
    const data = this.getBpBlockedConfigForHome(this.data().passengers);

    const items =
      data?.messages.map((message) => ({
        content: message,
      })) ?? [];

    return {
      items,
      ariaAttributes: {
        ariaDescribedBy: this.blockedBpAlertPanelId,
      },
    };
  });
}
