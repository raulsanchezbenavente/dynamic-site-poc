import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnChanges } from '@angular/core';
import { FormatDurationPipe, JourneyVM } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { ScheduleService } from '../../services/schedules.service';
import { LegsDetailsComponent } from '../atoms/legs-details/legs-details.component';
import { LegsDetails } from '../atoms/legs-details/models/legs-details.config';
import { ScheduleExtraDayComponent } from '../atoms/schedule-extra-day/schedule-extra-day.component';
import { ScheduleGraphicLineComponent } from '../atoms/schedule-graphic-line/schedule-graphic-line.component';

@Component({
  selector: 'selection-schedule',
  templateUrl: './selection-schedule.component.html',
  styleUrls: ['./styles/selection-schedule.style.scss'],
  host: {
    class: 'selection-schedule',
  },
  imports: [
    LegsDetailsComponent,
    ScheduleExtraDayComponent,
    ScheduleGraphicLineComponent,
    DatePipe,
    FormatDurationPipe,
  ],
  standalone: true,
})
export class SelectionScheduleComponent implements OnChanges {
  @Input({ required: true }) public data!: JourneyVM;

  public legsDetails!: LegsDetails;
  public totalDaysOfJourney = 0;

  protected readonly translate = inject(TranslateService);

  constructor(private readonly scheduleService: ScheduleService) {}

  public ngOnChanges(): void {
    if (this.data) {
      this.totalDaysOfJourney = this.scheduleService.getTotalDays(this.data);
      this.legsDetails = this.scheduleService.buildLegsDetails(this.data);
    }
  }
}
