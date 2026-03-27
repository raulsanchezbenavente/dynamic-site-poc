import { SafeHtml } from '@angular/platform-browser';

export interface RfListOption {
  value: string;
  content: SafeHtml;
  disabled?: boolean;
  preferred?: boolean;
}
