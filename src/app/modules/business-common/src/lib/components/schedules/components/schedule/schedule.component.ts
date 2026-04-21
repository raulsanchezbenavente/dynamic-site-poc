import { Component, DestroyRef, inject, Input, OnChanges } from '@angular/core';
import { FormatDurationPipe, JourneyStatus, JourneyVM , CommonTranslationKeys } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CarrierMapperService } from '../../../../services/carrier-mapper/carrier-mapper.service';
import { ScheduleService, ScheduleTimeComparison } from '../../services/schedules.service';
import { CarrierNumbersComponent } from '../atoms/carrier-numbers/carrier-numbers.component';
import { CarrierNumbers } from '../atoms/carrier-numbers/models/carrier-numbers.model';
import { LegsDetailsComponent } from '../atoms/legs-details/legs-details.component';
import { LegsDetails } from '../atoms/legs-details/models/legs-details.config';
import { ScheduleExtraDayComponent } from '../atoms/schedule-extra-day/schedule-extra-day.component';
import { ScheduleGraphicLineComponent } from '../atoms/schedule-graphic-line/schedule-graphic-line.component';
import { TransportOperatedBy } from '../atoms/transport-operated-by/models/transport-operated-by.model';
import { TransportOperatedByComponent } from '../atoms/transport-operated-by/transport-operated-by.component';

import { CarriersDisplayMode } from './enums/carriers-display-mode.enum';
import { ScheduleConfig } from './models/schedule.config';
import { TranslationKeys } from '../../enums/translation-keys.enum';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./styles/schedule.style.scss'],
  host: {
    class: 'schedule',
  },
  imports: [
    TranslateModule,
    CarrierNumbersComponent,
    LegsDetailsComponent,
    ScheduleExtraDayComponent,
    ScheduleGraphicLineComponent,
    TransportOperatedByComponent,
    FormatDurationPipe,
  ],
  standalone: true,
})
export class ScheduleComponent implements OnChanges {
  @Input({ required: true }) public data!: JourneyVM;
  @Input({ required: true }) public config!: ScheduleConfig;

  public legsDetails!: LegsDetails;
  public carrierNumbers: CarrierNumbers[] = [];
  public operatingCarriers: TransportOperatedBy[] = [];
  public carriersDisplayMode = CarriersDisplayMode;
  public journeyStatus = JourneyStatus;
  public totalDaysOfJourney = 0;

  public departureTimes!: ScheduleTimeComparison;
  public arrivalTimes!: ScheduleTimeComparison;

  protected readonly translate = inject(TranslateService);
  protected readonly translationKeys = TranslationKeys;
  protected readonly commonTranslationKeys = CommonTranslationKeys;
  private readonly scheduleService = inject(ScheduleService);
  private readonly carrierMapper = inject(CarrierMapperService);
  private readonly destroyRef = inject(DestroyRef);

  public get carriersDisplayModeResolved(): CarriersDisplayMode {
    return this.config?.carriersDisplayMode ?? CarriersDisplayMode.OPERATED_BY;
  }

  public ngOnChanges(): void {
    if (this.data) {
      this.totalDaysOfJourney = this.scheduleService.getTotalDays(this.data);
      this.legsDetails = this.scheduleService.buildLegsDetails(this.data);
      this.carrierNumbers = this.data.segments.map((segment) => ({
        code: segment.transport.carrier.code,
        number: segment.transport.number,
      }));
      this.setOperatingCarriers();
      this.departureTimes = this.scheduleService.getDepartureTimeComparison(this.data);
      this.arrivalTimes = this.scheduleService.getArrivalTimeComparison(this.data);
    }
  }

  private setOperatingCarriers(): void {
    this.operatingCarriers = this.carrierMapper.getUniqueOperatingCarriers(this.data.segments).map((name) => ({
      name,
    }));
  }
}
