import { IconConfig } from '@dcx/ui/libs';

export interface ListItem {
  content: string;
  code?: string;
  icon?: IconConfig;
  cssClass?: string;
  isDisabled?: boolean;
}
