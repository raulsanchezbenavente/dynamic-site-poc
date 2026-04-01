import { InjectionToken } from '@angular/core';
import { HorizontalAlign } from '@dcx/ui/libs';

import { PanelAppearance } from '../enums/panel-appearance.enum';
import { PanelBaseConfig } from '../models/panel-base.config';

export const PANEL_CONFIG = new InjectionToken<PanelBaseConfig>('PANEL_CONFIG');

export const DEFAULT_CONFIG_PANEL: PanelBaseConfig = {
  appearance: PanelAppearance.DEFAULT,
  layoutConfig: {
    contentHorizontalAlign: HorizontalAlign.LEFT,
  },
};
