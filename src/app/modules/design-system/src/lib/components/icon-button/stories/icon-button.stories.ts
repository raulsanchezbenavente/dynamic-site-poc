import { IconButtonComponent } from '@dcx/storybook/design-system';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { IconButtonConfig } from '../models/icon-button.model';

const META: Meta<IconButtonComponent> = {
  title: 'Atoms/Button (Icon Button)',
  component: IconButtonComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [IconButtonComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
  argTypes: {},
};

export default META;
type Story = StoryObj<IconButtonComponent>;

const VARIANT_WRAPPER_STYLES = 'display:flex; gap: 16px; flex-wrap: wrap; align-items: center;';

// Base configurations for reusability
const DEFAULT_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
};

const DISABLED_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  isDisabled: true,
};

const ARIA_DISABLED_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaDisabled: true,
    ariaLabel: 'Go home',
  },
};

const TOGGLE_CONFIG: IconButtonConfig = {
  icon: {
    name: 'heart',
  },
  ariaAttributes: {
    ariaLabel: 'Add to favorites',
    ariaPressed: false,
  },
};

const EXPANDABLE_CONFIG: IconButtonConfig = {
  icon: {
    name: 'chevron-down',
  },
  ariaAttributes: {
    ariaLabel: 'Expand section',
    ariaExpanded: false,
  },
};

const MENU_CONFIG: IconButtonConfig = {
  icon: {
    name: 'menu-justify',
  },
  ariaAttributes: {
    ariaLabel: 'Open menu',
    ariaHaspopup: 'menu',
    ariaExpanded: false,
  },
};

const SMALL_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    size: LayoutSize.SMALL,
  },
};

const MEDIUM_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    size: LayoutSize.MEDIUM,
  },
};

const LARGE_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    size: LayoutSize.LARGE,
  },
};

const ACTION_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    style: ButtonStyles.ACTION,
  },
};

const SECONDARY_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    style: ButtonStyles.SECONDARY,
  },
};

const INVERSE_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    style: ButtonStyles.INVERSE,
  },
};

const LINK_CONFIG: IconButtonConfig = {
  icon: {
    name: 'home',
  },
  ariaAttributes: {
    ariaLabel: 'Go home',
  },
  layout: {
    style: ButtonStyles.LINK,
  },
};

export const SIZES: Story = {
  name: 'Sizes',
  render: () => ({
    component: IconButtonComponent,
    template: `
      <div style="${VARIANT_WRAPPER_STYLES}">
        <icon-button [config]="small"></icon-button>
        <icon-button [config]="medium"></icon-button>
        <icon-button [config]="large"></icon-button>
      </div>
    `,
    props: {
      small: SMALL_CONFIG,
      medium: MEDIUM_CONFIG,
      large: LARGE_CONFIG,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const BUTTONS = CANVAS.getAllByRole('button');

    // Verify all 3 size variants render
    await expect(BUTTONS).toHaveLength(3);

    // Verify all have aria-label
    await expect(BUTTONS[0]).toHaveAttribute('aria-label', 'Go home');
    await expect(BUTTONS[1]).toHaveAttribute('aria-label', 'Go home');
    await expect(BUTTONS[2]).toHaveAttribute('aria-label', 'Go home');
  },
};

export const STYLES: Story = {
  name: 'Styles',
  render: () => ({
    component: IconButtonComponent,
    template: `
      <div style="${VARIANT_WRAPPER_STYLES}">
        <icon-button [config]="action"></icon-button>
        <icon-button [config]="secondary"></icon-button>
        <icon-button [config]="inverse"></icon-button>
        <icon-button [config]="link"></icon-button>
      </div>
    `,
    props: {
      action: ACTION_CONFIG,
      secondary: SECONDARY_CONFIG,
      inverse: INVERSE_CONFIG,
      link: LINK_CONFIG,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const BUTTONS = CANVAS.getAllByRole('button');

    // Verify all 4 style variants render
    await expect(BUTTONS).toHaveLength(4);

    // Verify all are enabled and have aria-label
    for (const BUTTON of BUTTONS) {
      await expect(BUTTON).not.toHaveAttribute('disabled');
      await expect(BUTTON).toHaveAttribute('aria-label', 'Go home');
    }
  },
};

export const STATES: Story = {
  name: 'States',
  render: () => ({
    component: IconButtonComponent,
    template: `
      <div style="${VARIANT_WRAPPER_STYLES}">
        <icon-button [config]="defaultState"></icon-button>
        <icon-button [config]="disabled"></icon-button>
        <icon-button [config]="ariaDisabled"></icon-button>
        <icon-button [config]="toggle"></icon-button>
        <icon-button [config]="expandable"></icon-button>
        <icon-button [config]="menu"></icon-button>
      </div>
    `,
    props: {
      defaultState: DEFAULT_CONFIG,
      disabled: DISABLED_CONFIG,
      ariaDisabled: ARIA_DISABLED_CONFIG,
      toggle: TOGGLE_CONFIG,
      expandable: EXPANDABLE_CONFIG,
      menu: MENU_CONFIG,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);

    const BUTTONS = await CANVAS.findAllByRole('button', { hidden: true });

    // Verify all 6 ARIA state variants render
    await expect(BUTTONS).toHaveLength(6);

    // Verify default button
    await expect(BUTTONS[0]).toHaveAttribute('aria-label', 'Go home');
    await expect(BUTTONS[0]).not.toBeDisabled();

    // Verify disabled button
    await expect(BUTTONS[1]).toBeDisabled();

    // Verify aria-disabled button
    await expect(BUTTONS[2]).toHaveAttribute('aria-disabled', 'true');

    // Verify toggle button has aria-pressed
    await expect(BUTTONS[3]).toHaveAttribute('aria-label', 'Add to favorites');
    await expect(BUTTONS[3]).toHaveAttribute('aria-pressed', 'false');

    // Verify expandable button has aria-expanded
    await expect(BUTTONS[4]).toHaveAttribute('aria-label', 'Expand section');
    await expect(BUTTONS[4]).toHaveAttribute('aria-expanded', 'false');

    // Verify menu button has aria-haspopup and aria-expanded
    await expect(BUTTONS[5]).toHaveAttribute('aria-label', 'Open menu');
    await expect(BUTTONS[5]).toHaveAttribute('aria-haspopup', 'menu');
    await expect(BUTTONS[5]).toHaveAttribute('aria-expanded', 'false');
  },
};

export const INTERACTIVE_MENU: Story = {
  name: 'Interactive Menu Example',
  render: () => ({
    template: `
      <div style="position: relative; display: inline-block;">
        <icon-button
          [config]="menuButtonConfig"
          (clickEvent)="toggleMenu()">
        </icon-button>

        @if (isMenuOpen) {
          <div
            id="dropdown-menu"
            role="menu"
            style="
              position: absolute;
              top: 100%;
              left: 0;
              margin-top: 8px;
              background: white;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              min-width: 200px;
              z-index: 1000;
            ">
            <button
              role="menuitem"
              (click)="selectOption('Profile')"
              style="
                display: block;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
              ">
              Profile
            </button>
            <button
              role="menuitem"
              (click)="selectOption('Settings')"
              style="
                display: block;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
              ">
              Settings
            </button>
            <button
              role="menuitem"
              (click)="selectOption('Logout')"
              style="
                display: block;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
              ">
              Logout
            </button>
          </div>
        }
      </div>
    `,
    props: {
      isMenuOpen: false,
      menuButtonConfig: {
        icon: {
          name: 'menu-justify',
        },
        ariaAttributes: {
          ariaLabel: 'Open menu',
          ariaHaspopup: 'menu',
          ariaExpanded: false,
          ariaControls: 'dropdown-menu',
        },
      },
      toggleMenu(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SELF = this as any;
        SELF.isMenuOpen = !SELF.isMenuOpen;
        SELF.menuButtonConfig.ariaAttributes.ariaExpanded = SELF.isMenuOpen;
      },
      selectOption(option: string): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SELF = this as any;
        console.log('Selected:', option);
        SELF.isMenuOpen = false;
        SELF.menuButtonConfig.ariaAttributes.ariaExpanded = false;
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const USER = userEvent.setup();
    const MENU_BUTTON = await CANVAS.findByRole('button', { name: 'Open menu' });

    await expect(CANVAS.queryByRole('menu')).not.toBeInTheDocument();

    await USER.click(MENU_BUTTON);
    const MENU = await CANVAS.findByRole('menu');
    await expect(MENU_BUTTON).toHaveAttribute('aria-expanded', 'true');
    await expect(MENU).toBeInTheDocument();

    const PROFILE_OPTION = await CANVAS.findByRole('menuitem', { name: 'Profile' });
    await USER.click(PROFILE_OPTION);

    await expect(CANVAS.queryByRole('menu')).not.toBeInTheDocument();
    await expect(MENU_BUTTON).toHaveAttribute('aria-expanded', 'false');
  },
};

export const PLAYGROUND: Story = {
  name: '__ Playground  ',
  parameters: {
    layout: 'centered',
  },
  args: {
    iconName: 'home',
    ariaLabel: 'Go home',
    ariaControls: undefined,
    size: LayoutSize.MEDIUM,
    style: ButtonStyles.ACTION,
    disabled: false,
    ariaDisabled: false,
    ariaPressedControl: undefined,
    ariaExpandedControl: undefined,
    ariaHaspopupControl: undefined,
  } as Record<string, unknown>,
  argTypes: {
    iconName: {
      control: 'text',
      name: 'Icon Name',
      description: 'Glyph name provided by the design-system icon set',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    ariaLabel: {
      control: 'text',
      name: 'Aria Label',
      description: 'Required: Accessible label describing the button action',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    ariaControls: {
      control: 'text',
      name: 'Aria Controls',
      description: 'ID of the controlled element (used with ariaExpanded)',
      table: {
        category: 'Accessibility',
        type: { summary: 'string | undefined' },
      },
    },
    size: {
      control: 'radio',
      options: [LayoutSize.SMALL, LayoutSize.MEDIUM, LayoutSize.LARGE],
      name: 'Size',
      description: 'Button size variant',
      table: {
        category: 'Layout',
        type: { summary: 'LayoutSize' },
        defaultValue: { summary: 'MEDIUM' },
      },
    },
    style: {
      control: 'select',
      options: [ButtonStyles.ACTION, ButtonStyles.SECONDARY, ButtonStyles.INVERSE, ButtonStyles.LINK],
      name: 'Style',
      description: 'Button visual style',
      table: {
        category: 'Appearance',
        type: { summary: 'ButtonStyles' },
        defaultValue: { summary: 'ACTION' },
      },
    },
    disabled: {
      control: 'boolean',
      name: 'Disabled',
      description: 'Whether the button is disabled (removed from tab order)',
      table: {
        category: 'State',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    ariaDisabled: {
      control: 'boolean',
      name: 'Aria Disabled',
      description: 'Visually disabled but still focusable',
      table: {
        category: 'Accessibility',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    ariaPressedControl: {
      control: 'radio',
      options: [undefined, true, false],
      name: 'Aria Pressed',
      description: 'Toggle state (for buttons that turn on/off). Set to true or false to enable.',
      table: {
        category: 'Accessibility',
        type: { summary: 'boolean | undefined' },
      },
    },
    ariaExpandedControl: {
      control: 'radio',
      options: [undefined, true, false],
      name: 'Aria Expanded',
      description: 'Expandable state (for buttons that show/hide content). Set to true or false to enable.',
      table: {
        category: 'Accessibility',
        type: { summary: 'boolean | undefined' },
      },
    },
    ariaHaspopupControl: {
      control: 'select',
      options: [undefined, 'menu', 'dialog', 'listbox', 'tree', 'grid'],
      name: 'Aria Haspopup',
      description: 'Indicates the button opens a popup element',
      table: {
        category: 'Accessibility',
        type: { summary: 'string | undefined' },
      },
    },
    // Hide internal component properties
    config: { table: { disable: true } },
    clickEvent: { table: { disable: true } },
    resolvedConfig: { table: { disable: true } },
    ariaPressed: { table: { disable: true } },
    ariaExpanded: { table: { disable: true } },
    defaultConfig: { table: { disable: true } },
    mergeConfigsService: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    onClick: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const CUSTOM_ARGS = args as unknown as {
      iconName: string;
      ariaLabel: string;
      ariaControls?: string;
      size: LayoutSize;
      style: ButtonStyles;
      disabled: boolean;
      ariaDisabled: boolean;
      ariaPressedControl?: boolean;
      ariaExpandedControl?: boolean;
      ariaHaspopupControl?: string;
    };
    return {
      props: {
        config: {
          icon: {
            name: CUSTOM_ARGS.iconName,
          },
          ariaAttributes: {
            ariaLabel: CUSTOM_ARGS.ariaLabel,
            ...(CUSTOM_ARGS.ariaControls && { ariaControls: CUSTOM_ARGS.ariaControls }),
            ...(CUSTOM_ARGS.ariaDisabled && { ariaDisabled: true }),
            ...(CUSTOM_ARGS.ariaPressedControl !== undefined && { ariaPressed: CUSTOM_ARGS.ariaPressedControl }),
            ...(CUSTOM_ARGS.ariaExpandedControl !== undefined && { ariaExpanded: CUSTOM_ARGS.ariaExpandedControl }),
            ...(CUSTOM_ARGS.ariaHaspopupControl && { ariaHaspopup: CUSTOM_ARGS.ariaHaspopupControl }),
          },
          ...(CUSTOM_ARGS.disabled && { isDisabled: true }),
          layout: {
            size: CUSTOM_ARGS.size,
            style: CUSTOM_ARGS.style,
          },
        },
      },
    };
  },
};
