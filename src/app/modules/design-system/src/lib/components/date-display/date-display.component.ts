import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CultureServiceEx } from '@dcx/ui/libs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { DateDisplayConfig } from './models/date-display.config';

/**
 * Displays dates in a user-friendly format.
 * Provide the `date` input with the date value you want to format.
 */
@Component({
  selector: 'date-display',
  templateUrl: './date-display.component.html',
  styleUrls: ['./styles/date-display.styles.scss'],
  host: { class: 'ds-date-display' },
  encapsulation: ViewEncapsulation.None,
  imports: [],
  standalone: true,
})
export class DateDisplayComponent implements OnInit {
  @Input({ required: true }) public config!: DateDisplayConfig;
  protected readonly defaultFormat = 'EEE. d MMM. y';
  private readonly cultureServiceEx = inject(CultureServiceEx);

  public get formatToUse(): string {
    return this.config.format ?? this.defaultFormat;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  /**
   * Formats a date using dayjs while keeping inputs flexible (native Date or Dayjs).
   *
   * Behavior:
   * - Locale: maps BCP-47 tags from CultureServiceEx (e.g. "es-ES") to dayjs base locales ("es").
   * - Tokens: accepts Angular/CLDR-like patterns (e.g. "EEE. d MMM. y") and maps them to dayjs.
   * - Output: capitalizes the first character for sentence-style presentation.
   *
   * @param date   Native Date or a dayjs instance to format.
   * @param format Angular/CLDR-like format pattern (e.g., "EEE. d MMM. y").
   * @returns      Formatted, localized string.
   */
  public parseDate(date: Date | dayjs.Dayjs, format: string): string {
    const dj = date instanceof Date ? dayjs.utc(date) : date;
    const mapped = this.mapFormatToDayjs(format);

    const rawCulture = this.cultureServiceEx.getCulture?.() ?? this.config.culture ?? 'en';
    const locale = String(rawCulture).toLowerCase().split('-')[0];

    const parsed = dj.locale(locale).format(mapped);
    return parsed.charAt(0).toUpperCase() + parsed.slice(1);
  }

  protected internalInit(): void {
    if (!this.config.format) {
      this.config.format = this.defaultFormat;
    }
  }

  /**
   * Minimal, safe token mapping from Angular/CLDR-like patterns to dayjs tokens.
   * Extend cautiously to avoid over-greedy replacements.
   *
   * Examples:
   * - "EEEE" -> "dddd" (weekday full), "EEE" -> "ddd" (weekday short)
   * - "y"    -> "YYYY", "dd" -> "DD", "d" -> "D"
   *
   * @param fmt Pattern using Angular/CLDR-like tokens.
   * @returns   dayjs-compatible pattern string.
   */
  private mapFormatToDayjs(fmt: string): string {
    return (
      fmt
        .replace('EEEE', 'dddd')
        .replace('EEE', 'ddd')
        .replaceAll(/\byyyy\b/g, 'YYYY')
        .replaceAll(/\by\b/g, 'YYYY')
        .replaceAll(/\bdd\b/g, 'DD')
        .replaceAll(/\bd\b/g, 'D')
        // opcionales (por si usas MMM/M):
        .replaceAll(/\bMMMM\b/g, 'MMMM')
        .replaceAll(/\bMMM\b/g, 'MMM')
        .replaceAll(/\bMM\b/g, 'MM')
        .replaceAll(/\bM\b/g, 'M')
    );
  }
}
