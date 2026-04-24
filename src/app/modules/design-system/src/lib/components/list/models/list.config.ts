import { AriaAttributes } from '@dcx/ui/libs';

import { ListItem } from './list-item.model';

export interface ListConfig {
  items: ListItem[];
  ariaAttributes?: AriaAttributes;
}
