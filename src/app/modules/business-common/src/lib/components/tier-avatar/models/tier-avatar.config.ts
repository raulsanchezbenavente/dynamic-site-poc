import { AvatarSize } from '@dcx/ui/design-system';
import { IconConfig } from '@dcx/ui/libs';

export interface TierAvatarConfig {
  size?: AvatarSize;
  tierName?: string;
  mainColor?: string;
  darkerColor?: string;
  icon: IconConfig;
}
