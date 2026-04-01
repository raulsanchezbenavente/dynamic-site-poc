import { inject, Pipe, PipeTransform } from '@angular/core';

import { DurationFormatterService, FormatDurationOptions } from '../services/duration-formatter.service';

/**
 * Angular pipe that wraps {@link DurationFormatterService.format}.
 *
 * Converts a duration (string, number, or object) into a localized formatted string.
 *
 * @usageNotes
 * Use it in templates to display durations consistently across the UI.
 *
 * @example
 * ```html
 * {{ '1.02:03:04' | formatDuration:{ style: 'tokens' } }}
 * <!-- → 01d 02h 03m 04s -->
 *
 * {{ '02:03' | formatDuration:{ style: 'long' } }}
 * <!-- → 2 hours 3 minutes -->
 * ```
 */
@Pipe({
  name: 'formatDuration',
  standalone: true,
})
export class FormatDurationPipe implements PipeTransform {
  private readonly durationFormatterService = inject(DurationFormatterService);

  public transform(value: string | number | object, options?: FormatDurationOptions): string {
    const resolved = options ?? { style: 'tokens', trimZeros: true, padHours: false, padMinutes: false, includeSeconds: false };
    return this.durationFormatterService.format(value as any, resolved);
  }
}
