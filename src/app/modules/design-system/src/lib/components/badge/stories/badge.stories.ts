import { BadgeComponent } from '@dcx/storybook/design-system';
import type { IconConfig } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { BadgeConfig } from '../models/badge.config';

const DEFAULT_CONFIG: BadgeConfig = {
  text: 'Included',
};

const ICON_BADGE_CONFIG: BadgeConfig = {
  text: 'Best value',
  icon: {
    name: 'star',
  } as IconConfig,
};
const META: Meta<BadgeComponent> = {
  title: 'Atoms/Tags & Badge/Badge',
  component: BadgeComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [BadgeComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<BadgeComponent>;

const STACK_STYLES = `
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

export const PLAYGROUND: Story = {
  name: 'Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    text: 'Recommended',
    showIcon: true,
    iconName: 'tag',
  } as Record<string, unknown>,
  argTypes: {
    text: {
      control: 'text',
      name: 'Text',
      description: 'Badge label content',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    showIcon: {
      control: 'boolean',
      name: 'Show icon',
      description: 'Toggle decorative icon',
      table: {
        category: 'Icon',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    iconName: {
      control: 'text',
      name: 'Icon name',
      description: 'Icon registry name (ignored when Show icon is false)',
      table: {
        category: 'Icon',
        type: { summary: 'string' },
        defaultValue: { summary: 'tag' },
      },
    },
    config: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const customArgs = args as unknown as {
      text: string;
      showIcon: boolean;
      iconName: string;
    };

    const iconConfig: IconConfig | undefined =
      customArgs.showIcon && customArgs.iconName ? { name: customArgs.iconName } : undefined;

    return {
      props: {
        config: {
          text: customArgs.text,
          icon: iconConfig,
        },
      },
    };
  },
};

export const CONTENT_STYLES: Story = {
  name: 'Content styles',
  render: () => ({
    template: `
      <div style="${STACK_STYLES}">
        <badge [config]="textOnly"></badge>
        <badge [config]="withIcon"></badge>
      </div>
    `,
    props: {
      textOnly: DEFAULT_CONFIG,
      withIcon: ICON_BADGE_CONFIG,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badges = canvas.getAllByRole('presentation');

    await expect(badges).toHaveLength(2);
    await expect(canvas.getByText('Included')).toBeInTheDocument();
    await expect(canvas.getByText('Best value')).toBeInTheDocument();
  },
};
