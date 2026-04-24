import { AriaAttributes } from '@dcx/ui/libs';

import { DescriptionListLayoutType } from '../enums/description-list-layout-type.enum';

import { DescriptionListItem } from './description-list-options.config';

export interface DescriptionList {
  options: DescriptionListItem[];
  ariaAttributes?: AriaAttributes;
  layout?: DescriptionListLayoutType;
}
