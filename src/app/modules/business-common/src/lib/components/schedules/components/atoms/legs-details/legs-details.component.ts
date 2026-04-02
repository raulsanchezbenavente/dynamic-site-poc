import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import {
  PopoverComponent,
  PopoverConfig,
  PopoverContentDirective,
  PopoverTriggerDirective,
} from '@dcx/ui/design-system';
import { dateHelper, DsNgbTriggerEvent, FormatDurationPipe } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LegsDetails } from './models/legs-details.config';

/**
 * JourneyLegsInformation Component
 * Control to show fare info and select it.
 */
@Component({
  selector: 'legs-details',
  templateUrl: './legs-details.component.html',
  styleUrls: ['./styles/legs-details.styles.scss'],
  host: {
    class: 'legs-details',
  },
  imports: [
    TranslateModule,
    PopoverComponent,
    PopoverContentDirective,
    PopoverTriggerDirective,
    DatePipe,
    FormatDurationPipe,
  ],
  standalone: true,
})
export class LegsDetailsComponent implements OnInit {
  @Input({ required: true }) public data!: LegsDetails;
  @Input() public showTotalDuration = true;
  @Input() public popoverConfigOverride?: Partial<PopoverConfig>;

  public stopDurations: string[] = [];
  public stopOvers: boolean[] = [];
  public popoverConfig!: PopoverConfig;

  protected readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.setPopoverConfig();
    this.buildStopDurationsAndOvers();
  }

  private setPopoverConfig(): void {
    const defaultConfig: PopoverConfig = {
      popoverHeaderConfig: {
        title: this.translateService.instant('Schedule.Connection_Title'),
      },
      placement: 'bottom',
      customClass: 'popover-journey-details',
      triggers: DsNgbTriggerEvent.CLICK,
      autoClose: 'outside',
      responsiveOffCanvas: true,
    };

    this.popoverConfig = {
      ...defaultConfig,
      ...this.popoverConfigOverride,
      popoverHeaderConfig: {
        ...defaultConfig.popoverHeaderConfig,
        ...this.popoverConfigOverride?.popoverHeaderConfig,
      },
    };
    this.cdr.markForCheck();
  }

  private buildStopDurationsAndOvers(): void {
    this.stopDurations = this.buildStopDurations();
    this.stopOvers = this.buildStopOvers();
  }

  private buildStopDurations(): string[] {
    return this.data.model.legs.map((leg, index) => {
      const next = this.data.model.legs[index + 1];
      if (!next) return '';

      const diff = dateHelper.dateDiff(leg.stautc, next.stdutc);
      if (diff.hours < 0 || diff.minutes < 0) return '';

      return dateHelper.convertToTimespan(diff.hours, diff.minutes, 0);
    });
  }

  private buildStopOvers(): boolean[] {
    return this.data.model.legs.map((leg, index) => {
      const next = this.data.model.legs[index + 1];
      if (!next) return false;

      return leg.transport.carrier.code === next.transport.carrier.code;
    });
  }
}
