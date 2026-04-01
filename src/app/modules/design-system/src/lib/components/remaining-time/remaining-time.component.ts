import { Component, inject, Input, OnInit } from '@angular/core';
import { DurationFormatterService, TimeMeasureModel } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RemainingTimeConfig } from './models/remaining-time-config.model';

@Component({
  selector: 'remaining-time',
  templateUrl: './remaining-time.component.html',
  styleUrls: ['./styles/remaining-time.styles.scss'],
  imports: [TranslateModule],
  standalone: true,
})
export class RemainingTimeComponent implements OnInit {
  @Input({ required: true }) public timeMeasure!: TimeMeasureModel;
  @Input({ required: true }) public config!: RemainingTimeConfig;

  public remainingText = '';

  private readonly t = inject(TranslateService);
  private readonly durationFormatterService = inject(DurationFormatterService);

  public ngOnInit(): void {
    this.remainingText = this.buildRemainingTimeLong();
  }

  private buildRemainingTimeLong(): string {
    const d = Math.max(0, this.timeMeasure.days ?? 0);
    const h = Math.max(0, this.timeMeasure.hours ?? 0);
    const m = Math.max(0, this.timeMeasure.minutes ?? 0);
    const s = Math.max(0, this.timeMeasure.seconds ?? 0);

    let units: { days: number; hours: number; minutes: number; seconds: number };
    if (d >= 1) units = { days: d, hours: h, minutes: 0, seconds: 0 };
    else if (m >= 1) units = { days: 0, hours: h, minutes: m, seconds: 0 };
    else units = { days: 0, hours: h, minutes: 0, seconds: s };

    const format = (u: Partial<typeof units>): string =>
      this.durationFormatterService.format(
        { days: 0, hours: 0, minutes: 0, seconds: 0, ...u },
        { style: 'long', trimZeros: true }
      );

    const parts: string[] = [];
    if (units.days) parts.push(format({ days: units.days }));
    if (units.hours) parts.push(format({ hours: units.hours }));
    if (units.minutes) parts.push(format({ minutes: units.minutes }));
    if (units.seconds) parts.push(format({ seconds: units.seconds }));

    if (parts.length === 0) return '';

    const joinStyle = this.config.joinStyle ?? 'comma';

    let joined = '';
    if (joinStyle === 'comma') {
      joined = parts.join(', ');
    } else {
      const lang = this.t.getCurrentLang?.() ?? 'es';
      const listFormat = new Intl.ListFormat(lang, { type: 'conjunction' });
      joined = listFormat.format(parts);
    }

    return joined + '.';
  }
}
