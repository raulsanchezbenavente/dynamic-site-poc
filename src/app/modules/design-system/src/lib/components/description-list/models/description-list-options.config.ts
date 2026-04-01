import { IconConfig, TooltipConfig } from '@dcx/ui/libs';

import { DescriptionListOptionType } from '../enums/description-list-option-type.enum';

import { DescriptionListItemData } from './description-list-data.model';

export interface DescriptionListItem {
  term: string;
  type: DescriptionListOptionType;
  description: DescriptionListItemData;
  iconConfig?: IconConfig;
  tooltipConfig?: TooltipConfig;
}
