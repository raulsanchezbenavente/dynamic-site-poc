import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AccessibleLinkDirective,
  ClickOutsideDirective,
  CurrencyFormatPipe,
  CurrencySymbolPipe,
  ExternalLinkPipe,
  GenerateIdPipe,
  KeydownSelectDirective,
  ModalKeyEventsDirective,
} from './shared';

export const SHARED_MODULES = [CommonModule, FormsModule, ReactiveFormsModule];

export const SHARED_PIPES = [CurrencyFormatPipe, CurrencySymbolPipe, ExternalLinkPipe, GenerateIdPipe];

export const SHARED_DIRECTIVES = [
  AccessibleLinkDirective,
  ClickOutsideDirective,
  KeydownSelectDirective,
  ModalKeyEventsDirective,
];
