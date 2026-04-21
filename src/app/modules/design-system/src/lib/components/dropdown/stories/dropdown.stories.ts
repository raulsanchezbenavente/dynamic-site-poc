import { DropdownComponent } from '@dcx/storybook/design-system';
import { CommonTranslationKeys, DropdownLayoutType } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DropdownComponent> = {
  title: 'Molecules/Dropdown/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [DropdownComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

const DEFAULT_DROPDOWN_STORIE_TEMPLATE = `
  <dropdown [model]="model" [initiallyOpen]="initiallyOpen" [translations]="translations">
    <div>
      Here goes dropddown project content
    </div>
  </dropdown>
`;

export default META;
type Story = StoryObj<DropdownComponent>;

export const DEFAULT_LAYOUT: Story = {
  name: 'Layout: Default',
  parameters: {
    docs: {
      description: {
        story:
          'The dropdown component acts solely as a trigger, with the content of the popover inside being determined by content projection.',
      },
    },
  },
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    model: {
      config: {
        label: 'Order by',
        closeOnSelection: true,
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.DEFAULT,
        },
      },
      value: '',
      isVisible: true,
    },
  },
};

export const DEFAULT_LAYOUT_WHIT_ICON_INITIALLY_OPEN: Story = {
  name: 'Layout: Default - Initially Open and With Icon',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    initiallyOpen: true,
    model: {
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Order by (initially opened)',
        icon: {
          name: 'filters',
          ariaAttributes: {
            ariaLabel: 'testing icon aria label',
          },
        },
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.DEFAULT,
        },
      },
      value: '',
      isVisible: true,
    },
  },
};

export const PILLS_LAYOUT: Story = {
  name: 'Layout: Pills',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    model: {
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Stops',
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.PILLS,
        },
      },
      value: '',
      isVisible: true,
    },
  },
};
export const PILLS_LAYOUT_WITH_ICON: Story = {
  name: 'Layout: Pills - With Icon',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    model: {
      isVisible: true,
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Stops',
        icon: {
          name: 'stop',
          ariaAttributes: {
            ariaLabel: 'testing icon aria label',
          },
        },
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.PILLS,
        },
      },
      value: '',
    },
  },
};
export const PILLS_LAYOUT_WITH_ICON_SELECTED: Story = {
  name: 'Pills Layout With Icon Selected',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    model: {
      isVisible: true,
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Stops',
        icon: {
          name: 'stop',
          ariaAttributes: {
            ariaLabel: 'testing icon aria label',
          },
        },
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.PILLS,
        },
      },
      value: 'Direct',
    },
  },
};

export const SQUEARE_LAYOUT: Story = {
  name: 'Layout: Square',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    model: {
      isVisible: true,
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Manage my booking',
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.SQUARE,
        },
      },
      value: '',
    },
  },
};
export const SQUEARE_LAYOUT_WITH_ICON: Story = {
  name: 'Layout: Square - With Icon',
  render: (args) => ({
    props: { ...args },
    template: DEFAULT_DROPDOWN_STORIE_TEMPLATE,
  }),
  args: {
    ...DEFAULT_LAYOUT.args,
    model: {
      isVisible: true,
      ...DEFAULT_LAYOUT.args!.model,
      config: {
        ...DEFAULT_LAYOUT.args!.model!.config,
        label: 'Manage my booking',
        icon: {
          name: 'flight-takeoff',
          ariaAttributes: {
            ariaLabel: 'testing icon aria label',
          },
        },
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.SQUARE,
        },
      },
      value: '',
    },
  },
};
