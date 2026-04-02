import { Component, inject, Input, OnChanges } from '@angular/core';
import { FormatDurationPipe, JourneyVM } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  CarrierNumbers,
  CarriersDisplayMode,
  LegsDetails,
  ScheduleConfig,
  ScheduleService,
  ScheduleTimeComparison,
} from '../../../../schedules';
import { CarrierNumbersComponent } from '../../../../schedules/components/atoms/carrier-numbers/carrier-numbers.component';
import { LegsDetailsComponent } from '../../../../schedules/components/atoms/legs-details/legs-details.component';
import { ScheduleExtraDayComponent } from '../../../../schedules/components/atoms/schedule-extra-day/schedule-extra-day.component';
import { ScheduleGraphicLineComponent } from '../../../../schedules/components/atoms/schedule-graphic-line/schedule-graphic-line.component';

@Component({
  selector: 'summary-cart-schedule',
  templateUrl: './summary-cart-schedule.component.html',
  styleUrls: ['./styles/summary-cart-schedule.style.scss'],
  host: {
    class: 'summary-cart-schedule',
  },
  imports: [
    TranslateModule,
    CarrierNumbersComponent,
    LegsDetailsComponent,
    ScheduleExtraDayComponent,
    ScheduleGraphicLineComponent,
    FormatDurationPipe,
  ],
  standalone: true,
})
export class SummaryCartScheduleComponent implements OnChanges {
  @Input({ required: true }) public data!: JourneyVM;
  @Input({ required: true }) public config!: ScheduleConfig;

  public legsDetails!: LegsDetails;
  public carrierNumbers: CarrierNumbers[] = [];
  public carriersDisplayMode = CarriersDisplayMode;
  public totalDaysOfJourney = 0;

  public departureTime!: ScheduleTimeComparison;
  public arrivalTime!: ScheduleTimeComparison;

  protected readonly translate = inject(TranslateService);
  private readonly scheduleService = inject(ScheduleService);

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
      this.departureTime = this.scheduleService.getDepartureTimeComparison(this.data);
      this.arrivalTime = this.scheduleService.getArrivalTimeComparison(this.data);
    }
  }
}
