import { SafeHtml } from '@angular/platform-browser';

export type MonthAbbreviationConfig = {
  threshold: number;
  mask?: (data: SafeHtml) => SafeHtml;
};
