import { InjectionToken } from '@angular/core';
import { HorizontalAlign } from '@dcx/ui/libs';

import { ExpansionPanelConfig } from '../models/expansion-panel.config';
import { PanelAppearance } from '../../panel/enums/panel-appearance.enum';

export const EXPANSION_PANEL_CONFIG = new InjectionToken<ExpansionPanelConfig>('EXPANSION_PANEL_CONFIG');

export const DEFAULT_CONFIG_EXPANSION_PANEL: ExpansionPanelConfig = {
  isCollapsible: true,
  isExpanded: false,
  panel: {
    appearance: PanelAppearance.SHADOW,
    layoutConfig: {
      contentHorizontalAlign: HorizontalAlign.LEFT,
    },
  },
};
