import type { AvatarConfig } from '@dcx/storybook/design-system';
import { AvatarComponent, AvatarSize } from '@dcx/storybook/design-system';
import type { IconConfig } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { TranslationKeys } from '../enums/translation-keys.enum';

const AVATAR_STACK_STYLES = 'display:flex; gap: 24px; flex-wrap: wrap; align-items: center;';

const ICON_BADGE_CONFIG: IconConfig = {
  name: 'user',
};

const SIZE_VARIANTS: ReadonlyArray<AvatarConfig> = [
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.SMALLEST,
  },
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.EXTRA_SMALL,
  },
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.SMALL,
  },
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.MEDIUM,
  },
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.LARGE,
  },
];

const CONTENT_VARIANTS: ReadonlyArray<AvatarConfig> = [
  {
    avatarText: 'SR',
    ariaLabel: 'Simon Ramirez',
    size: AvatarSize.LARGE,
  },
  {
    icon: ICON_BADGE_CONFIG,
    ariaLabel: 'Diamond loyalty icon',
    size: AvatarSize.LARGE,
    avatarText: '',
  },
];

const EDGE_CASE_VARIANTS: ReadonlyArray<AvatarConfig> = [
  {
    avatarText: '',
    ariaLabel: 'Fallback initials for missing value',
  },
  {
    avatarText: '-',
    ariaLabel: 'Default merge config example',
  },
];

type PlaygroundArgs = {
  avatarText: string;
  size: AvatarSize;
  ariaLabel: string;
  useIcon: boolean;
  iconName: string;
  iconAriaLabel: string;
};

const PLAYGROUND_DEFAULT_ARGS: PlaygroundArgs = {
  avatarText: 'SR',
  size: AvatarSize.MEDIUM,
  ariaLabel: 'Simon Ramirez',
  useIcon: false,
  iconName: 'star',
  iconAriaLabel: 'Diamond loyalty icon',
};

const META: Meta<AvatarComponent> = {
  title: 'Atoms/Avatar',
  component: AvatarComponent,
  parameters: {
    i18nModules: ['Avatar'],
    i18n: {
      api: false,
      mock: {
        [TranslationKeys.Avatar_NotApplicable_Text]: 'N/a',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AvatarComponent],
      providers: [...STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AvatarComponent>;

const RENDER_AVATARS = (configs: ReadonlyArray<AvatarConfig>): Story['render'] => {
  return () => ({
    component: AvatarComponent,
    template: `
      <div style="${AVATAR_STACK_STYLES}">
        @for (avatarConfig of configs; track avatarConfig.ariaLabel ?? avatarConfig.avatarText) {
          <avatar [config]="avatarConfig"></avatar>
        }
      </div>
    `,
    props: {
      configs,
    },
  });
};

export const SIZES: Story = {
  name: 'Avatar sizes',
  render: RENDER_AVATARS(SIZE_VARIANTS),
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('.avatar');

    expect(avatars).toHaveLength(SIZE_VARIANTS.length);
    expect(avatars[0]).toHaveClass('avatar--smallest');
    expect(avatars[1]).toHaveClass('avatar--extra-small');
    expect(avatars[2]).toHaveClass('avatar--small');
    expect(avatars[3]).toHaveClass('avatar--medium');
    expect(avatars[4]).toHaveClass('avatar--large');
  },
};

export const CONTENT_TYPES: Story = {
  name: 'Initials vs. icons',
  render: RENDER_AVATARS(CONTENT_VARIANTS),
  play: async ({ canvasElement }) => {
    const avatars = canvasElement.querySelectorAll('.avatar');
    const icons = canvasElement.querySelectorAll('.avatar-icon');

    expect(avatars).toHaveLength(CONTENT_VARIANTS.length);
    expect(icons).toHaveLength(1);
  },
};

export const EDGE_CASES: Story = {
  name: 'Fallback scenarios',
  render: RENDER_AVATARS(EDGE_CASE_VARIANTS),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatars = canvasElement.querySelectorAll('.avatar');

    expect(avatars).toHaveLength(EDGE_CASE_VARIANTS.length);
    expect(canvas.getByLabelText('Fallback initials for missing value')).toBeInTheDocument();
    expect(canvas.getByLabelText('Default merge config example')).toBeInTheDocument();
  },
};

function MAP_ARGS_TO_CONFIG(args: PlaygroundArgs): AvatarConfig {
  if (args.useIcon) {
    return {
      icon: {
        name: args.iconName,
        ariaAttributes: {
          ariaLabel: args.iconAriaLabel,
        },
      },
      ariaLabel: args.ariaLabel,
      size: args.size,
      avatarText: '',
    };
  }

  return {
    avatarText: args.avatarText,
    ariaLabel: args.ariaLabel,
    size: args.size,
  };
}

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'centered',
  },
  args: PLAYGROUND_DEFAULT_ARGS as Record<string, unknown>,
  argTypes: {
    avatarText: {
      control: 'text',
      name: 'Avatar text',
      description: 'Initials or fallback text rendered visually.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    ariaLabel: {
      control: 'text',
      name: 'ARIA label',
      description: 'Full name announced to screen readers.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    size: {
      control: 'select',
      options: Object.values(AvatarSize),
      name: 'Size',
      description: 'Choose between smallest, extra small, small, medium, or large.',
      table: {
        category: 'Layout',
        type: { summary: 'AvatarSize' },
      },
    },
    useIcon: {
      control: 'boolean',
      name: 'Use icon',
      description: 'Toggle between initials and an icon badge.',
      table: {
        category: 'Appearance',
        type: { summary: 'boolean' },
      },
    },
    iconName: {
      control: 'text',
      name: 'Icon name',
      description: 'Name of the ds-icon to render when Use icon is enabled.',
      table: {
        category: 'Appearance',
        type: { summary: 'string' },
      },
    },
    iconAriaLabel: {
      control: 'text',
      name: 'Icon aria label',
      description: 'ARIA label applied to the icon when it replaces initials.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    config: {
      table: { disable: true },
    },
    avatarSize: {
      table: { disable: true },
    },
    avatarInitials: {
      table: { disable: true },
    },
    internalInit: {
      table: { disable: true },
    },
    updateAvatarInitials: {
      table: { disable: true },
    },
    ngOnInit: {
      table: { disable: true },
    },
    ngOnChanges: {
      table: { disable: true },
    },
  } as Record<string, unknown>,
  render: (rawArgs) => {
    const args = rawArgs as unknown as PlaygroundArgs;
    const config = MAP_ARGS_TO_CONFIG(args);

    return {
      component: AvatarComponent,
      template: `
        <avatar [config]="config"></avatar>
      `,
      props: {
        config,
      },
    };
  },
};
