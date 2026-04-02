import { Component, HostBinding, Input } from '@angular/core';
import { AvatarSize, IconComponent } from '@dcx/ui/design-system';

import { TierAvatarConfig } from './models/tier-avatar.config';

@Component({
  selector: 'tier-avatar',
  templateUrl: './tier-avatar.component.html',
  styleUrls: ['./styles/tier-avatar.styles.scss'],
  host: {
    class: 'tier-avatar',
    '[class.tier-avatar--smallest]': 'config.size === avatarSize.SMALLEST',
    '[class.tier-avatar--extra-small]': 'config.size === avatarSize.EXTRA_SMALL',
    '[class.tier-avatar--small]': 'config.size === avatarSize.SMALL',
    '[class.tier-avatar--medium]': 'config.size === avatarSize.MEDIUM',
    '[class.tier-avatar--large]': 'config.size === avatarSize.LARGE',
  },
  imports: [IconComponent],
  standalone: true,
})
export class TierAvatarComponent {
  public avatarSize = AvatarSize;

  private _config: TierAvatarConfig = {
    size: AvatarSize.EXTRA_SMALL,
    icon: {
      name: 'lifemiles',
    },
  };

  @HostBinding('style.--tier-avatar-gradient')
  public get tierGradient(): string | null {
    if (!this._config?.mainColor || !this._config?.darkerColor) {
      return null;
    }
    return `linear-gradient(90deg, ${this._config.mainColor} 0%, ${this._config.darkerColor} 100%)`;
  }

  @Input({ required: true })
  set config(value: TierAvatarConfig) {
    if (value === null || value === undefined) return;
    this._config = {
      tierName: value.tierName,
      mainColor: value.mainColor,
      darkerColor: value.darkerColor,
      size: value.size ?? AvatarSize.EXTRA_SMALL,
      icon: {
        ...value.icon,
        name: value.icon?.name ?? 'lifemiles',
      },
    };
  }

  get config(): TierAvatarConfig {
    return this._config;
  }
}
