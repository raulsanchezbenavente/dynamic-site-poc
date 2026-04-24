import { InjectionToken } from '@angular/core';
import { DsNgbTriggerEvent, TooltipConfig } from '@dcx/ui/libs';

export const TOOLTIP_CONFIG = new InjectionToken<TooltipConfig>('TOOLTIP_CONFIG');

export const DEFAULT_CONFIG_TOOLTIP: TooltipConfig = {
  isVisible: true,
  triggerText: 'Click for more info',
  text: 'Tooltip trigger text',
  hiddenTriggerText: false,
  triggerEvent: DsNgbTriggerEvent.HOVER,
  placement: 'auto',
  container: 'body',
  isDisabled: false,
  iconOnly: false,
};
