import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Defines the output style for {@link DurationFormatterService.format}.
 *
 * @remarks
 * Each style represents a different visual or textual representation of the same duration.
 *
 * | Style   | Example (1d 2h 3m 4s) | Description |
 * |----------|-----------------------|--------------|
 * | `'tokens'` | `01d 02h 03m 04s` | Compact tokenized format with padding, used in UI labels. |
 * | `'short'`  | `1 d 2 h 3 m 4 s` | Short textual format, uses abbreviated labels without padding. |
 * | `'long'`   | `1 day 2 hours 3 minutes 4 seconds` | Full descriptive format, ideal for accessibility or tooltips. |
 * | `'clock'`  | `26:03` | Digital clock style (HH:mm[:ss]), days folded into hours. |
 */
export type DurationStyle = 'tokens' | 'short' | 'long' | 'clock';

/**
 * Options for {@link DurationFormatterService.format}.
 *
 * @property style - Output style. Defaults to `'tokens'`.
 * @property trimZeros - Whether to hide zero-value units (e.g., hide "0h" if no hours). Defaults to `true`.
 * @property padHours - Whether to pad hours to two digits (e.g., `01h` instead of `1h`). Defaults to `true` for `'tokens'` and `'clock'`.
 * @property padMinutes - Whether to pad minutes to two digits (e.g., `05m` instead of `5m`). Defaults to `false`.
 * @property includeSeconds - Whether to include seconds even when 0. Defaults to `false`.
 *
 * @example
 * ```ts
 * format.format('00:45:00', { style: 'tokens', trimZeros: true });
 * // → "45m"
 * ```
 */
export interface FormatDurationOptions {
  style?: DurationStyle; // default: 'tokens'
  trimZeros?: boolean; // default: true (hide 0d/0h/0m/0s)
  padHours?: boolean; // default: true in 'tokens'/'clock' (01h vs 1h)
  padMinutes?: boolean; // default: false (05m vs 5m)
  includeSeconds?: boolean; // default: false unless input has seconds
}

interface Units {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Utility service for formatting durations from different sources
 * (ASP.NET TimeSpan, "HH:mm[:ss]" strings, milliseconds, or unit objects)
 * into a localized human-readable format.
 *
 * @example
 * ```ts
 * const format = inject(DurationFormatterService);
 *
 * format.format('1.02:03:04', { style: 'tokens' });
 * // → "01d 02h 03m 04s"
 *
 * format.format('02:03', { style: 'long' });
 * // → "2 hours 3 minutes"
 *
 * format.format(5400000, { style: 'clock' });
 * // → "01:30"
 * ```
 *
 * @public
 */
@Injectable({ providedIn: 'root' })
export class DurationFormatterService {
  private readonly t = inject(TranslateService);
  private cachedLang = '';
  private labels!: {
    dShort: string;
    hShort: string;
    mShort: string;
    sShort: string;
    dLong: string;
    hLong: string;
    mLong: string;
    sLong: string;
  };

  /** Public API */
  public format(value: string | number | Partial<Units>, opts?: FormatDurationOptions): string {
    const units = this.parseToUnits(value);
    const options = this.withDefaults(units, opts);
    this.ensureLabels();

    switch (options.style) {
      case 'clock':
        return this.formatClock(units, options);
      case 'short':
        return this.formatLabeled(units, 'short', options);
      case 'long':
        return this.formatLabeled(units, 'long', options);
      default:
        return this.formatTokens(units, options); // 'tokens'
    }
  }

  // -------- Internals

  private withDefaults(u: Units, o?: FormatDurationOptions): Required<FormatDurationOptions> {
    const hasSeconds = u.seconds > 0;
    return {
      style: o?.style ?? 'tokens',
      trimZeros: o?.trimZeros ?? true,
      padHours: o?.padHours ?? (o?.style ? ['tokens', 'clock'].includes(o.style) : true),
      padMinutes: o?.padMinutes ?? false,
      includeSeconds: o?.includeSeconds ?? hasSeconds,
    };
  }

  private ensureLabels(): void {
    const lang = this.t.getCurrentLang?.() ?? (this.t as any).currentLang;
    if (lang === this.cachedLang && this.labels) return;

    // Short (d, h, min, s)
    const dShort = this.safeInstant('Common.ShortLabel_Days', 'd');
    const hShort = this.safeInstant('Common.ShortLabel_Hours', 'h');
    const mShort = this.safeInstant('Common.ShortLabel_Minutes', 'm');
    const sShort = this.safeInstant('Common.ShortLabel_Seconds', 's');

    // :Long (days, hours, minutes, seconds)
    const dLong = this.safeInstant('Common.LongLabel_Days', 'days');
    const hLong = this.safeInstant('Common.LongLabel_Hours', 'hours');
    const mLong = this.safeInstant('Common.LongLabel_Minutes', 'minutes');
    const sLong = this.safeInstant('Common.LongLabel_Seconds', 'seconds');

    this.labels = { dShort, hShort, mShort, sShort, dLong, hLong, mLong, sLong };
    this.cachedLang = lang;
  }

  private safeInstant(key: string, fallback: string): string {
    try {
      const v = this.t.instant(key);
      return typeof v === 'string' && v !== key ? v : fallback;
    } catch {
      return fallback;
    }
  }

  private parseToUnits(input: string | number | Partial<Units>): Units {
    if (typeof input === 'number' && Number.isFinite(input)) {
      // Interpret as milliseconds
      const totalSeconds = Math.max(0, Math.floor(input / 1000));
      return this.fromTotalSeconds(totalSeconds);
    }

    if (typeof input === 'object') {
      const d = input.days ?? 0,
        h = input.hours ?? 0,
        m = input.minutes ?? 0,
        s = input.seconds ?? 0;
      return this.normalize({ days: d, hours: h, minutes: m, seconds: s });
    }

    const s = String(input).trim();
    // ASP.NET TimeSpan e.g. "1.02:03:04" (d.hh:mm:ss) or "02:03:04" or "02:03"
    const asp = /^(\d+)\.(\d{1,2}):([0-5]\d):([0-5]\d)$/.exec(s);
    if (asp) {
      const days = +asp[1],
        hours = +asp[2],
        minutes = +asp[3],
        seconds = +asp[4];
      return this.normalize({ days, hours, minutes, seconds });
    }

    const hms = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/.exec(s);
    if (hms) {
      const hours = +hms[1],
        minutes = +hms[2],
        seconds = hms[3] ? +hms[3] : 0;
      return this.normalize({ days: 0, hours, minutes, seconds });
    }

    // Fallback: 0
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  private normalize(u: Units): Units {
    const total = ((u.days * 24 + u.hours) * 60 + u.minutes) * 60 + u.seconds;
    return this.fromTotalSeconds(total);
  }

  private fromTotalSeconds(totalSeconds: number): Units {
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds -= days * 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    return { days, hours, minutes, seconds };
  }

  private formatTokens(u: Units, o: Required<FormatDurationOptions>): string {
    // Example: "01h 50min" (tokens/short labels, padded hours)
    const L = this.labels;
    const parts: string[] = [];
    if (!o.trimZeros || u.days) parts.push(`${u.days}${L.dShort}`);
    const hh = o.padHours ? String(u.hours).padStart(2, '0') : String(u.hours);
    if (!o.trimZeros || u.hours) parts.push(`${hh}${L.hShort}`);
    const mm = o.padMinutes ? String(u.minutes).padStart(2, '0') : String(u.minutes);
    if (!o.trimZeros || u.minutes) parts.push(`${mm}${L.mShort}`);
    if (o.includeSeconds && (!o.trimZeros || u.seconds)) {
      const ss = String(u.seconds).padStart(2, '0');
      parts.push(`${ss}${L.sShort}`);
    }
    return parts.join(' ').trim();
  }

  private formatLabeled(u: Units, kind: 'short' | 'long', o: Required<FormatDurationOptions>): string {
    const L = this.labels;
    const parts: string[] = [];
    const label = (n: number, short: string, long: string): string => {
      if (kind === 'short') return short;
      return n === 1 ? long.replace(/s$/, '') : long;
    };

    if (!o.trimZeros || u.days) parts.push(`${u.days} ${label(u.days, L.dShort, L.dLong)}`);
    if (!o.trimZeros || u.hours) parts.push(`${u.hours} ${label(u.hours, L.hShort, L.hLong)}`);
    if (!o.trimZeros || u.minutes) parts.push(`${u.minutes} ${label(u.minutes, L.mShort, L.mLong)}`);
    if (o.includeSeconds && (!o.trimZeros || u.seconds))
      parts.push(`${u.seconds} ${label(u.seconds, L.sShort, L.sLong)}`);

    return parts.join(' ').trim();
  }

  private formatClock(u: Units, o: Required<FormatDurationOptions>): string {
    // Example: "01:50" or "25:10" (days folded into hours)
    const hoursTotal = u.days * 24 + u.hours;
    const hh = o.padHours ? String(hoursTotal).padStart(2, '0') : String(hoursTotal);
    const mm = String(u.minutes).padStart(2, '0');
    const base = `${hh}:${mm}`;
    if (o.includeSeconds) {
      const ss = String(u.seconds).padStart(2, '0');
      return `${base}:${ss}`;
    }
    return base;
  }
}
