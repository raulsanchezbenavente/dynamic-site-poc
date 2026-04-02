import { AvatarSize } from '@dcx/ui/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import type { TierAvatarConfig } from '../models/tier-avatar.config';
import { TierAvatarComponent } from '../tier-avatar.component';

const META: Meta<TierAvatarComponent> = {
  title: 'Components/Loyalty/Tier Avatar',
  component: TierAvatarComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [TierAvatarComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<TierAvatarComponent>;

// Size configurations
const SIZE_CONFIGS: Record<string, TierAvatarConfig> = {
  SMALLEST: {
    size: AvatarSize.SMALLEST,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
  EXTRA_SMALL: {
    size: AvatarSize.EXTRA_SMALL,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
  SMALL: {
    size: AvatarSize.SMALL,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
  MEDIUM: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
  LARGE: {
    size: AvatarSize.LARGE,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
};

// Tier configurations
const TIER_CONFIGS: Record<string, TierAvatarConfig> = {
  SILVER: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.Silver',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Silver tier',
      },
    },
  },
  GOLD: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.Gold',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Gold tier',
      },
    },
  },
  DIAMOND: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.Diamond',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Diamond tier',
      },
    },
  },
  RED_PLUS: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.RedPlus',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles Red Plus tier',
      },
    },
  },
  LIFEMILES: {
    size: AvatarSize.MEDIUM,
    tierName: 'Loyalty.Tiers.Lifemiles',
    icon: {
      name: 'lifemiles',
      ariaAttributes: {
        ariaLabel: 'LifeMiles base tier',
      },
    },
  },
};

export const SIZES: Story = {
  name: 'Sizes',
  render: () => ({
    template: `
      <div class="dcx-story-grid" style="--dcx-story-grid-gap: 16px; --dcx-story-card-width:70px; --dcx-story-card-minwidth:70px">
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Smallest</h3>
          <p class="dcx-story-description">24px</p>
          <tier-avatar [config]="sizeSmallest" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Extra Small</h3>
          <p class="dcx-story-description">28px</p>
          <tier-avatar [config]="sizeExtraSmall" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Small</h3>
          <p class="dcx-story-description">34px</p>
          <tier-avatar [config]="sizeSmall" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Medium</h3>
          <p class="dcx-story-description">64px</p>
          <tier-avatar [config]="sizeMedium" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Large</h3>
          <p class="dcx-story-description">152px</p>
          <tier-avatar [config]="sizeLarge" />
        </div>
      </div>
    `,
    props: {
      sizeSmallest: SIZE_CONFIGS['SMALLEST'],
      sizeExtraSmall: SIZE_CONFIGS['EXTRA_SMALL'],
      sizeSmall: SIZE_CONFIGS['SMALL'],
      sizeMedium: SIZE_CONFIGS['MEDIUM'],
      sizeLarge: SIZE_CONFIGS['LARGE'],
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const AVATARS = CANVAS.getAllByRole('img', { hidden: true });
    await expect(AVATARS).toHaveLength(5);
  },
};

export const TIERS: Story = {
  name: 'Tiers',
  render: () => ({
    template: `
      <div class="dcx-story-grid" style="--dcx-story-grid-gap: 16px; --dcx-story-card-align-items: center; --dcx-story-card-width:70px; --dcx-story-card-minwidth:70px">
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Silver</h3>
          <tier-avatar [config]="tierSilver" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Gold</h3>
          <tier-avatar [config]="tierGold" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Diamond</h3>
          <tier-avatar [config]="tierDiamond" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">Red Plus</h3>
          <tier-avatar [config]="tierRedPlus" />
        </div>
        <div class="dcx-story-card">
          <h3 class="dcx-story-heading">LifeMiles</h3>
          <tier-avatar [config]="tierLifemiles" />
        </div>
      </div>
    `,
    props: {
      tierSilver: TIER_CONFIGS['SILVER'],
      tierGold: TIER_CONFIGS['GOLD'],
      tierDiamond: TIER_CONFIGS['DIAMOND'],
      tierRedPlus: TIER_CONFIGS['RED_PLUS'],
      tierLifemiles: TIER_CONFIGS['LIFEMILES'],
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const AVATARS = CANVAS.getAllByRole('img', { hidden: true });
    await expect(AVATARS).toHaveLength(5);
  },
};
