import {
  DropdownListComponent,
} from '@dcx/storybook/design-system';
import { DropdownLayoutType } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DropdownListComponent> = {
  title: 'Molecules/Dropdown/Dropdown List',
  component: DropdownListComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DropdownListComponent>;

const DROPDOWN_OPTIONS_STORY = [
  {
    isDefault: true,
    code: '1',
    name: 'Option mas larga de texto para pruebas 1',
    description: 'Descripción para opción 1',
    icon: { name: 'user' },
  },
  {
    code: '2',
    name: 'Option 2',
    description: 'Descripción para opción 2',
    icon: { name: 'user' },
  },
  {
    code: '3',
    isDisabled: true,
    name: 'Option 3 (disabled)',
    description: 'Descripción para opción 3',
    icon: { name: 'user' },
  },
  {
    code: '4',
    name: 'Option 4',
    description: 'Descripción para opción 4',
    icon: { name: 'user' },
  },
  {
    code: '5',
    name: 'Option 5',
    description: 'Descripción para opción 5',
    icon: { name: 'user' },
  },
];
const BASE_DROPDOWN_CONFIG_STORY = {
  dropdownModel: {
    isVisible: false,
    value: '5',
    config: {
      label: 'Select an option',
      layoutConfig: {
        layout: DropdownLayoutType.DEFAULT,
      },
    },
  },
  optionsListConfig: {
    options: DROPDOWN_OPTIONS_STORY,
    ariaAttributes: {
      ariaLabel: 'Language list',
    },
  },
};
const BASE_TRANSLATIONS_STORY = {
  'Common.A11y.IsSelected': 'Is selected',
};

// Dropdown options list layoutConfig
export const DROPDOWN_OPTION_LIST: Story = {
  name: 'Dropdown List',
  parameters: {
    docs: {
      description: {
        story:
          'The dropdown list component allows for the selection of options using buttons, radio buttons, or checkboxes.',
      },
    },
  },
  args: {
    config: {
      ...structuredClone(BASE_DROPDOWN_CONFIG_STORY),
    },
    translations: BASE_TRANSLATIONS_STORY,
  },
};

export const DROPDOWN_OPTION_LIST_ALWAYS_VISIBLE: Story = {
  name: 'Dropdown List - Always Visible',
  args: {
    config: {
      ...structuredClone(BASE_DROPDOWN_CONFIG_STORY),
      dropdownModel: {
        ...structuredClone(BASE_DROPDOWN_CONFIG_STORY.dropdownModel),
        config: {
          ...structuredClone(BASE_DROPDOWN_CONFIG_STORY.dropdownModel.config),
          layoutConfig: {
            ...structuredClone(BASE_DROPDOWN_CONFIG_STORY.dropdownModel.config.layoutConfig),
            isAlwaysVisible: true,
          },
        },
      },
    },
    translations: BASE_TRANSLATIONS_STORY,
  },
};
