import { AriaAttributes, IconConfig, SectionColors } from '@dcx/ui/libs';

import { PanelAppearance } from '../enums/panel-appearance.enum';

import { PanelLayoutConfig } from './panel-layout.config';

/**
 * Base configuration for the PanelComponent.
 *
 * Visual elements like title, description, and icon are declared here
 * for consistency and ease of use by parent components.
 *
 * These fields are not rendered automatically by the PanelComponent itself.
 * Instead, the parent should project content via:
 * <h2 panelTitle>, <div panelDescription>, and <span panelIcon>.
 */
export interface PanelBaseConfig {
  appearance?: PanelAppearance;
  ariaAttributes?: AriaAttributes;
  layoutConfig?: PanelLayoutConfig;
  sectionsColors?: SectionColors;
  title?: string;
  description?: string;
  icon?: IconConfig;
}
