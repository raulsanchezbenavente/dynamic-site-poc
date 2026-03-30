import { AriaAttributes } from '@dcx/ui/libs';

import { AlertPanelType } from '../enums/alert-panel-type.enum';

export interface AlertPanelConfig {
  title?: string;
  description?: string;
  alertType?: AlertPanelType;
  ariaAttributes?: AriaAttributes;
}
