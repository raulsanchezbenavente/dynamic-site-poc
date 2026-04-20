import { StatusTagComponent, StatusTagStyles, StatusTagType } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { StatusTagConfig } from '../models/status-tag.config';
import { CommonTranslationKeys } from '@dcx/ui/libs';

const STATUS_CONFIGS: Record<StatusTagType, StatusTagConfig<StatusTagType>> = {
  [StatusTagType.DEFAULT]: {
    status: StatusTagType.DEFAULT,
    style: StatusTagStyles.DEFAULT,
    text: 'Default',
    icon: 'icon-default',
  },
  [StatusTagType.SUCCESS]: {
    status: StatusTagType.SUCCESS,
    style: StatusTagStyles.DEFAULT,
    text: 'Success',
    icon: 'icon-success',
  },
  [StatusTagType.WARNING]: {
    status: StatusTagType.WARNING,
    style: StatusTagStyles.DEFAULT,
    text: 'Warning',
    icon: 'icon-warning',
  },
  [StatusTagType.INFO]: {
    status: StatusTagType.INFO,
    style: StatusTagStyles.DEFAULT,
    text: 'Info',
  },
  [StatusTagType.ERROR]: {
    status: StatusTagType.ERROR,
    style: StatusTagStyles.DEFAULT,
    text: 'Error',
    icon: 'icon-error',
  },
  [StatusTagType.INACTIVE]: {
    status: StatusTagType.INACTIVE,
    style: StatusTagStyles.DEFAULT,
    text: 'Inactive',
    icon: 'icon-inactive',
  },
  [StatusTagType.PENDING]: {
    status: StatusTagType.PENDING,
    style: StatusTagStyles.DEFAULT,
    text: 'Pending',
    icon: 'icon-pending',
  },
  [StatusTagType.BLOCKED]: {
    status: StatusTagType.BLOCKED,
    style: StatusTagStyles.DEFAULT,
    text: 'Blocked',
    icon: 'icon-blocked',
  },
};

const STYLE_VARIANTS: StatusTagConfig<StatusTagType>[] = [
  {
    ...STATUS_CONFIGS[StatusTagType.SUCCESS],
    style: StatusTagStyles.DEFAULT,
    text: 'Default',
  },
  {
    ...STATUS_CONFIGS[StatusTagType.SUCCESS],
    style: StatusTagStyles.FILLED,
    text: 'Filled',
  },
  {
    ...STATUS_CONFIGS[StatusTagType.SUCCESS],
    style: StatusTagStyles.OUTLINE,
    text: 'Outline',
  },
  {
    ...STATUS_CONFIGS[StatusTagType.SUCCESS],
    style: StatusTagStyles.NO_ICON,
    text: 'No icon',
    icon: undefined,
  },
];

const META: Meta<StatusTagComponent> = {
  title: 'Atoms/Tags & Badge/Status Tag',
  component: StatusTagComponent,
  parameters: {
    i18nModules: ['Common.A11y'],
    i18n: {
      api: false,
      mock: {
        [CommonTranslationKeys.Common_A11y_Status_Icon_Default]: 'Default status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Success]: 'Success status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Warning]: 'Warning status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Info]: 'Info status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Error]: 'Error status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Inactive]: 'Inactive status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Pending]: 'Pending status icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Blocked]: 'Blocked status icon',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [StatusTagComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<StatusTagComponent>;

export const STATUS_TYPES: Story = {
  name: 'Status types',
  render: () => ({
    props: {
      items: Object.values(STATUS_CONFIGS),
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
        @for (item of items; track item.status) {
          <status-tag [config]="item" />
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const tags = canvasElement.querySelectorAll('status-tag');
    expect(tags).toHaveLength(8);

    // Verify each status type has correct CSS class
    const statusElements = Array.from(tags);
    expect(statusElements[0].querySelector('.status-tag--type-default')).toBeInTheDocument();
    expect(statusElements[1].querySelector('.status-tag--type-success')).toBeInTheDocument();
    expect(statusElements[2].querySelector('.status-tag--type-warning')).toBeInTheDocument();
  },
};

export const STYLES: Story = {
  name: 'Styles',
  render: () => ({
    props: {
      items: STYLE_VARIANTS,
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
        @for (item of items; track item.style) {
          <status-tag [config]="item" />
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const tags = canvasElement.querySelectorAll('status-tag');
    expect(tags).toHaveLength(4);

    // Verify style classes
    expect(tags[0].querySelector('.status-tag--style-default')).toBeInTheDocument();
    expect(tags[1].querySelector('.status-tag--style-filled')).toBeInTheDocument();
    expect(tags[2].querySelector('.status-tag--style-outline')).toBeInTheDocument();
    expect(tags[3].querySelector('.status-tag--no-icon')).toBeInTheDocument();
  },
};

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    status: StatusTagType.SUCCESS,
    text: 'Success',
    style: StatusTagStyles.DEFAULT,
    icon: 'icon-success',
  } as Record<string, unknown>,
  argTypes: {
    // Content
    status: {
      control: 'select',
      options: Object.values(StatusTagType),
      name: 'Status Type',
      description: 'The semantic status type that determines color and default icon',
      table: {
        category: 'Content',
        type: { summary: 'StatusTagType | string' },
        defaultValue: { summary: 'StatusTagType.DEFAULT' },
      },
    },
    text: {
      control: 'text',
      name: 'Text',
      description: 'The visible label text displayed in the tag',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    icon: {
      control: 'text',
      name: 'Icon',
      description: 'Optional icon class override. Leave empty to use default status icon',
      table: {
        category: 'Content',
        type: { summary: 'string | undefined' },
      },
    },

    // Appearance
    style: {
      control: 'select',
      options: Object.values(StatusTagStyles),
      name: 'Style',
      description: 'Visual style variant (default, filled, outline, no-icon)',
      table: {
        category: 'Appearance',
        type: { summary: 'StatusTagStyles' },
        defaultValue: { summary: 'StatusTagStyles.DEFAULT' },
      },
    },

    // Hide internal properties
    config: { table: { disable: true } },
    mergedConfig: { table: { disable: true } },
    styleClasses: { table: { disable: true } },
    iconAriaLabel: { table: { disable: true } },
    StatusTagStyles: { table: { disable: true } },
    translate: { table: { disable: true } },
    textHelper: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const CUSTOM_ARGS = args as unknown as {
      status: StatusTagType;
      text: string;
      style: StatusTagStyles;
      icon?: string;
    };

    return {
      props: {
        config: {
          status: CUSTOM_ARGS.status,
          text: CUSTOM_ARGS.text,
          style: CUSTOM_ARGS.style,
          icon: CUSTOM_ARGS.icon,
        },
      },
    };
  },
};
