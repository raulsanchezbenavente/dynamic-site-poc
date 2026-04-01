import { InjectionToken } from '@angular/core';
import { DsNgbTriggerEvent } from '@dcx/ui/libs';

import { PopoverConfig } from '../models/popover.config';

export const POPOVER_CONFIG = new InjectionToken<PopoverConfig>('POPOVER_CONFIG');

export const DEFAULT_CONFIG_POPOVER: PopoverConfig = {
  popoverHeaderConfig: {
    title: 'Setting a header title is obligatory',
  },
  placement: 'top auto',
  container: 'body',
  triggers: DsNgbTriggerEvent.CLICK,
  openDelay: 100,
  closeDelay: 100,
  autoClose: 'outside',
  responsiveOffCanvas: true,
};
