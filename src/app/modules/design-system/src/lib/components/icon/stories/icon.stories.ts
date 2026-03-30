import { IconComponent } from '@dcx/storybook/design-system';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import ICON_NAMES from '../../../../../assets/ui_plus/icons/webfonts/icons.json';

const ALL_ICON_NAMES: ReadonlyArray<string> = ICON_NAMES as ReadonlyArray<string>;

const META: Meta<IconComponent> = {
  title: 'Atoms/Icon',
  component: IconComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [IconComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default META;
type Story = StoryObj<IconComponent>;

export const ALL_ICONS: Story = {
  name: 'All Icons',
  parameters: {
    layout: 'padded',
    options: {
      showPanel: false,
    },
    previewTabs: {
      'storybook/actions/panel': {
        hidden: true,
      },
      'storybook/interactions/panel': {
        hidden: true,
      },
      'storybook/a11y/panel': {
        hidden: true,
      },
    },
    controls: {
      disable: true,
    },
    actions: {
      disable: true,
    },
    a11y: {
      disable: true,
    },
    interactions: {
      disable: true,
    },
  },
  render: () => ({
    props: {
      allIconNames: ALL_ICON_NAMES,
      query: '',
      getSearchValue: (event: Event): string => {
        const input = event.target as HTMLInputElement | null;
        return input?.value.trim().toLowerCase() ?? '';
      },
      getFilteredIconNames: (iconNames: ReadonlyArray<string>, query: string): ReadonlyArray<string> => {
        if (query === '') {
          return iconNames;
        }

        return iconNames.filter((iconName) => iconName.includes(query));
      },
      getAriaLabel: (iconName: string): string => `icon-${iconName}`,
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 940px; width: 100%; margin: 0 auto; --icon-fontsize: 32px;">
        <h1 style="margin: 0;">All Icons</h1>

        <label style="display: flex; flex-direction: column; gap: 8px;">
          <span>Search icon</span>
          <input
            type="search"
            placeholder="Search icon"
            (input)="query = getSearchValue($event)"
            style="padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px;"
          />
        </label>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 32px;">
          @for (iconName of getFilteredIconNames(allIconNames, query); track iconName) {
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 72px;">
              <icon [config]="{ name: iconName, ariaAttributes: { ariaLabel: getAriaLabel(iconName) } }"></icon>
              <span style="font-size: 12px; text-align: center;">icon-{{ iconName }}</span>
            </div>
          }
        </div>

        @if (getFilteredIconNames(allIconNames, query).length === 0) {
          <span>No icons found</span>
        }
      </div>
    `,
  }),
};
