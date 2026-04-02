import { ChangeDetectorRef, Component, computed, inject, input, OnInit } from '@angular/core';
import { DateDisplayComponent, DateDisplayConfig } from '@dcx/ui/design-system';
import { CultureServiceEx, JourneyStatus, JourneyVM } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { JourneyStatusComponent } from '../journey-status-tag/journey-status-tag.component';
import { ScheduleComponent } from '../schedules/components/schedule/schedule.component';

import { JourneyScheduleConfig } from './models/journey-schedule.config';

@Component({
  selector: 'journey-schedule',
  templateUrl: './journey-schedule.component.html',
  styleUrls: ['./styles/journey-schedule.styles.scss'],
  host: {
    class: 'journey-schedule',
    '[class.journey-schedule--type-return]': 'isReturnType()',
  },
  imports: [TranslateModule, JourneyStatusComponent, ScheduleComponent, DateDisplayComponent],
  standalone: true,
})
export class JourneyScheduleComponent implements OnInit {
  public data = input.required<JourneyVM>();
  public config = input.required<JourneyScheduleConfig>();
  public journeyStatus = JourneyStatus;

  public journeyDateConfig!: DateDisplayConfig;

  protected readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cultureServiceEx = inject(CultureServiceEx);  

  protected readonly isReturnType = computed(() => this.data()?.journeyType === 'return');

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    this.setJourneyDateConfig();
  }

  private setJourneyDateConfig(): void {
    const realDate = this.data().schedule.etd || this.data().schedule.std;
    this.journeyDateConfig = {
      date: dayjs(realDate),
      format: 'dddd, ' + this.cultureServiceEx.getUserCulture().longDateFormat,
    };
    this.cdr.markForCheck();
  }
}
