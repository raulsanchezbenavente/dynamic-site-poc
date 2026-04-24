import { InjectionToken } from '@angular/core';

import { AvatarSize } from '../enums/avatar-size.enum';
import { AvatarConfig } from '../models/avatar.config';

export const AVATAR_CONFIG = new InjectionToken<AvatarConfig>('AVATAR_CONFIG');

export const DEFAULT_CONFIG_AVATAR: AvatarConfig = {
  avatarText: '-',
  size: AvatarSize.MEDIUM,
};
