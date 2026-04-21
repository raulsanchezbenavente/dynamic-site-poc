import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationKeys } from '../../../enums/translation-keys.enum';

@Component({
  selector: 'schedule-extra-day',
  templateUrl: './schedule-extra-day.component.html',
  styleUrls: ['./styles/schedule-extra-day.styles.scss'],
  host: { class: 'schedule-extra-day' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ScheduleExtraDayComponent {
  public totalDays = input.required<number>();

  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // Label visual (+N day(s))
  public readonly label = computed(() => {
    const days = this.totalDays();
    if (days < 1) return '';
    const unit =
      days === 1
        ? this.translate.instant(TranslationKeys.Schedule_ExtraDay_Day_Label)
        : this.translate.instant(TranslationKeys.Schedule_ExtraDay_Days_Label);
    return `+${days} ${unit}`;
  });

  // Aria-label for screen readers
  public readonly ariaLabel = computed(() => {
    const days = this.totalDays();
    if (days < 1) return '';
    if (days === 1) {
      return this.translate.instant(TranslationKeys.Schedule_ExtraDay_Arrival_NextDay);
    }
    return this.translate.instant(TranslationKeys.Schedule_ExtraDay_Arrival_NDaysLater, { count: days });
  });
}
