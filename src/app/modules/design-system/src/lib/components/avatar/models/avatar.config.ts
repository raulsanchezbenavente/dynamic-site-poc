import { IconConfig } from '@dcx/ui/libs';

import { AvatarSize } from '../enums/avatar-size.enum';

export interface AvatarConfig {
  avatarText: string;
  size?: AvatarSize;
  icon?: IconConfig;
  ariaLabel?: string;
}
