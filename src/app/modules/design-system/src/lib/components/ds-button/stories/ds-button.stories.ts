import { DsButtonComponent, PriceCurrencyComponent } from '@dcx/storybook/design-system';
import { ButtonStyles, HorizontalAlign, LayoutSize } from '@dcx/ui/libs';

import { ButtonRenderAs } from '../enums/button-render-as.enum';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DsButtonComponent> = {
  title: 'Atoms/Button',
  component: DsButtonComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [NgbDropdownModule, DsButtonComponent, PriceCurrencyComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
  argTypes: {},
};

export default META;
type Story = StoryObj<DsButtonComponent>;

const DISABLED_CONFIG = {
  label: 'Disabled',
  isDisabled: true,
};

const ARIA_DISABLED_CONFIG = {
  label: 'Aria-disabled',
  ariaAttributes: {
    ariaDisabled: true,
  },
};

// styles and states
const ACTION = {
  label: 'Action',
  layout: {
    style: ButtonStyles.ACTION,
  },
};
const ACTION_LOADING = {
  ...ACTION,
  loadingLabel: 'Action loading',
  isLoading: true,
};
const SIZE_SMALL = {
  ...ACTION,
  label: 'Small',
  layout: {
    style: ButtonStyles.ACTION,
    size: LayoutSize.SMALL,
  },
};
const SIZE_MEDIUM = {
  label: 'Medium',
};
const ACTION_DISABLED = {
  ...ACTION,
  ...DISABLED_CONFIG,
};
const ACTION_ARIA_DISABLED = {
  ...ACTION,
  ...ARIA_DISABLED_CONFIG,
};
const SECONDARY = {
  label: 'Secondary',
  layout: {
    style: ButtonStyles.SECONDARY,
  },
};

const INVERSE = {
  label: 'Inverse',
  layout: {
    style: ButtonStyles.INVERSE,
  },
};

const LINK = {
  label: 'Link',
  layout: {
    style: ButtonStyles.LINK,
  },
};

export const SIZES: Story = {
  name: 'Sizes',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display:flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <ds-button [config]="small"></ds-button>
        <ds-button [config]="medium"></ds-button>
      </div>
    `,
    props: {
      small: SIZE_SMALL,
      medium: SIZE_MEDIUM,
      large: { ...ACTION, label: 'Action', layout: { ...ACTION.layout, size: LayoutSize.LARGE } },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    // Verify we have 2 size variants displayed
    await expect(buttons).toHaveLength(2);

    // Verify size labels match documentation
    await expect(canvas.getByText('Small')).toBeInTheDocument();
    await expect(canvas.getByText('Medium')).toBeInTheDocument();

    // Verify size classes are applied correctly
    await expect(buttons[0]).toHaveClass('ds-btn-small');
    await expect(buttons[1]).toHaveClass('ds-btn-medium');
  },
};

export const APPEARANCES: Story = {
  name: 'Appearances',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display:flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <ds-button [config]="action"></ds-button>
        <ds-button [config]="secondary"></ds-button>
        <ds-button [config]="inverse"></ds-button>
        <ds-button [config]="link"></ds-button>
      </div>
    `,
    props: {
      action: ACTION,
      secondary: SECONDARY,
      inverse: INVERSE,
      link: LINK,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    // Verify we have 4 appearance variants
    await expect(buttons).toHaveLength(4);

    // Verify button labels match documentation
    await expect(canvas.getByText('Action')).toBeInTheDocument();
    await expect(canvas.getByText('Secondary')).toBeInTheDocument();
    await expect(canvas.getByText('Inverse')).toBeInTheDocument();
    await expect(canvas.getByText('Link')).toBeInTheDocument();

    // Verify appearance classes are applied correctly
    await expect(buttons[0]).toHaveClass('ds-btn-action');
    await expect(buttons[1]).toHaveClass('ds-btn-secondary');
    await expect(buttons[2]).toHaveClass('ds-btn-inverse');
    await expect(buttons[3]).toHaveClass('ds-btn-link');
  },
};

export const STATES: Story = {
  name: 'States',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display:flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <ds-button [config]="disabled"></ds-button>
        <ds-button [config]="ariaDisabled"></ds-button>
        <ds-button [config]="loading"></ds-button>
      </div>
    `,
    props: {
      disabled: ACTION_DISABLED,
      ariaDisabled: ACTION_ARIA_DISABLED,
      loading: ACTION_LOADING,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    // Verify we have 3 state variants
    await expect(buttons).toHaveLength(3);

    // Verify first button (disabled) has disabled attribute
    await expect(buttons[0]).toBeDisabled();
    await expect(buttons[0]).toHaveTextContent('Disabled');

    // Verify second button (aria-disabled) has aria-disabled but is NOT disabled
    await expect(buttons[1]).toHaveAttribute('aria-disabled', 'true');
    await expect(buttons[1]).not.toBeDisabled();
    await expect(buttons[1]).toHaveTextContent('Aria-disabled');

    // Verify third button is loading state
    await expect(buttons[2]).toHaveTextContent('Action loading');
  },
};

export const ICON_POSITIONS: Story = {
  name: 'Icon Positions',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display:flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <ds-button [config]="iconLeft"></ds-button>
        <ds-button [config]="iconRight"></ds-button>
      </div>
    `,
    props: {
      iconLeft: {
        label: 'Icon Left',
        icon: {
          name: 'home',
          position: HorizontalAlign.LEFT,
        },
        layout: {
          style: ButtonStyles.ACTION,
        },
      },
      iconRight: {
        label: 'Icon Right',
        icon: {
          name: 'home',
          position: HorizontalAlign.RIGHT,
        },
        layout: {
          style: ButtonStyles.ACTION,
        },
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    // Verify we have 2 icon position variants
    await expect(buttons).toHaveLength(2);

    // Verify labels match documentation
    await expect(canvas.getByText('Icon Left')).toBeInTheDocument();
    await expect(canvas.getByText('Icon Right')).toBeInTheDocument();

    // Verify icons are present (icon component renders inside button)
    const button1Icon = buttons[0].querySelector('icon');
    const button2Icon = buttons[1].querySelector('icon');
    await expect(button1Icon).toBeInTheDocument();
    await expect(button2Icon).toBeInTheDocument();
  },
};

export const HAS_CONTENT_PROJECTION: Story = {
  name: 'Has Content Projection',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <ds-button [config]="action">
        <price-currency [price]="29.99" [currency]="'EUR'" [prefixText]= "'From'"></price-currency>
      </ds-button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button is rendered
    await expect(button).toBeInTheDocument();

    // Verify button accepts and renders projected content
    // In this example, we project a price-currency component
    // but content projection works with any HTML/components
    const hasProjectedContent = button.querySelector('price-currency') !== null;
    await expect(hasProjectedContent).toBe(true);
  },
};

export const RENDER_AS: Story = {
  name: 'Render As',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display:flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <ds-button [config]="asButton"></ds-button>
        <ds-button [config]="asDiv"></ds-button>
        <ds-button [config]="asAnchor"></ds-button>
      </div>
    `,
    props: {
      asButton: {
        label: 'Renders <button>',
        layout: { style: ButtonStyles.ACTION },
      },
      asDiv: {
        label: 'Renders <div>',
        layout: { style: ButtonStyles.ACTION },
        renderAs: ButtonRenderAs.DIV,
      },
      asAnchor: {
        label: 'Renders <a>',
        layout: { style: ButtonStyles.SECONDARY },
        renderAs: ButtonRenderAs.ANCHOR,
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the <button> element
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(1);
    await expect(buttons[0].tagName).toBe('BUTTON');

    // Verify the <div> element (no role, purely visual)
    const divButton = canvasElement.querySelector('div.ds-button');
    await expect(divButton).toBeInTheDocument();
    await expect(divButton!.tagName).toBe('DIV');
    await expect(divButton!.getAttribute('role')).toBeNull();
    await expect(divButton!.getAttribute('tabindex')).toBeNull();

    // Verify the <a> element
    const anchor = canvasElement.querySelector('a.ds-button');
    await expect(anchor).toBeInTheDocument();
    await expect(anchor!.tagName).toBe('A');
  },
};

export const STRETCHED_HIT_AREA: Story = {
  name: 'Stretched Hit Area (Card pattern)',
  render: () => ({
    component: DsButtonComponent,
    template: `
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <!-- Card with native <button> + stretched-hit-area -->
        <div
          class="stretched-hit-area"
          style="position: relative; border: 1px solid #ccc; border-radius: 8px; padding: 16px; width: 320px; cursor: pointer; transition: box-shadow .15s;"
          onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,.12)'"
          onmouseout="this.style.boxShadow='none'">
          <h3 style="margin: 0 0 8px;">Service card</h3>
          <p style="margin: 0 0 12px; font-size: 14px; color: #555;">The entire card is clickable via the button below.</p>
          <ds-button [config]="cardButton" (buttonClicked)="onCardClick()"></ds-button>
          <span id="click-count-1" style="position: absolute; top: 8px; right: 8px; background: #e30613; color: #fff; font-size: 12px; font-weight: 600; border-radius: 12px; padding: 2px 8px;">
            Clicks: {{ clickCount1 }}
          </span>
        </div>

        <!-- Card with renderAs div (button lives outside, e.g. parent is the interactive element) -->
        <button
          type="button"
          style="appearance: none; background: none; border: 1px solid #ccc; border-radius: 8px; padding: 16px; width: 320px; cursor: pointer; text-align: left; font: inherit; color: inherit; position: relative; transition: box-shadow .15s;"
          onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,.12)'"
          onmouseout="this.style.boxShadow='none'"
          (click)="onParentCardClick()">
          <h3 style="margin: 0 0 8px;">Card as &lt;button&gt;</h3>
          <p style="margin: 0 0 12px; font-size: 14px; color: #555;">Parent is the interactive element; inner ds-button is visual-only.</p>
          <ds-button [config]="cardDivButton"></ds-button>
          <span id="click-count-2" style="position: absolute; top: 8px; right: 8px; background: #e30613; color: #fff; font-size: 12px; font-weight: 600; border-radius: 12px; padding: 2px 8px;">
            Clicks: {{ clickCount2 }}
          </span>
        </button>
      </div>
    `,
    props: {
      cardButton: {
        label: 'Select',
        layout: { style: ButtonStyles.ACTION, size: LayoutSize.SMALL },
      },
      cardDivButton: {
        label: 'Select',
        layout: { style: ButtonStyles.ACTION, size: LayoutSize.SMALL },
        renderAs: ButtonRenderAs.DIV,
      },
      clickCount1: 0,
      clickCount2: 0,
      onCardClick: function (): void {
        const self = this as Record<string, number>;
        self['clickCount1']++;
        console.log('[Stretched hit area] clicked:', self['clickCount1']);
      },
      onParentCardClick: function (): void {
        const self = this as Record<string, number>;
        self['clickCount2']++;
        console.log('[Card as <button>] clicked:', self['clickCount2']);
      },
    },
  }),
  play: async ({ canvasElement }) => {
    // First card: real <button> with stretched-hit-area class on container
    const stretchedContainer = canvasElement.querySelector('.stretched-hit-area');
    await expect(stretchedContainer).toBeInTheDocument();
    const realButton = stretchedContainer!.querySelector('button.ds-button');
    await expect(realButton).toBeInTheDocument();

    // Second card: parent <button> wraps visual-only <div>
    const divButton = canvasElement.querySelector('div.ds-button');
    await expect(divButton).toBeInTheDocument();
    await expect(divButton!.getAttribute('role')).toBeNull();
  },
};

export const PLAYGROUND: Story = {
  name: '__ Playground  ',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Button',
    appearance: ButtonStyles.ACTION,
    size: LayoutSize.MEDIUM,
    iconName: '',
    iconPosition: HorizontalAlign.LEFT,
    disabled: false,
    loading: false,
  } as Record<string, unknown>,
  argTypes: {
    label: {
      control: 'text',
      name: 'Label',
      description: 'Button text content',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    appearance: {
      control: 'select',
      options: Object.values(ButtonStyles),
      name: 'Appearance',
      description: 'Visual style variant',
      table: {
        category: 'Appearance',
        type: { summary: 'ButtonStyles' },
        defaultValue: { summary: 'ACTION' },
      },
    },
    size: {
      control: 'radio',
      options: Object.values(LayoutSize),
      name: 'Size',
      description: 'Button size',
      table: {
        category: 'Layout',
        type: { summary: 'LayoutSize' },
        defaultValue: { summary: 'MEDIUM' },
      },
    },
    iconName: {
      control: 'text',
      name: 'Icon Name',
      description: 'Icon name (e.g., "home", "cart"). Leave empty for no icon.',
      table: {
        category: 'Icon',
        type: { summary: 'string' },
      },
    },
    iconPosition: {
      control: 'radio',
      options: [HorizontalAlign.LEFT, HorizontalAlign.RIGHT],
      name: 'Icon Position',
      description: 'Position of the icon relative to label',
      table: {
        category: 'Icon',
        type: { summary: 'HorizontalAlign' },
        defaultValue: { summary: 'LEFT' },
      },
    },
    disabled: {
      control: 'boolean',
      name: 'Disabled',
      description: 'Native disabled attribute (removes from focus)',
      table: {
        category: 'State',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      name: 'Loading',
      description: 'Shows loading indicator',
      table: {
        category: 'State',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    // Hide all component properties
    config: { table: { disable: true } },
    input: { table: { disable: true } },
    buttonClicked: { table: { disable: true } },
    ariaPressed: { table: { disable: true } },
    ariaExpanded: { table: { disable: true } },
    isAriaDisabled: { table: { disable: true } },
    getLabel: { table: { disable: true } },
    resolvedExpanded: { table: { disable: true } },
    resolveRenderAs: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    onClick: { table: { disable: true } },
    focus: { table: { disable: true } },
    _internalExpanded: { table: { disable: true } },
    initDefaultConfiguration: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const customArgs = args as unknown as {
      label: string;
      appearance: ButtonStyles;
      size: LayoutSize;
      iconName: string;
      iconPosition: HorizontalAlign;
      disabled: boolean;
      loading: boolean;
    };
    return {
      props: {
        config: {
          label: customArgs.label,
          layout: {
            style: customArgs.appearance,
            size: customArgs.size,
          },
          ...(customArgs.iconName && {
            icon: {
              name: customArgs.iconName,
              position: customArgs.iconPosition,
            },
          }),
          isDisabled: customArgs.disabled,
          isLoading: customArgs.loading,
        },
      },
    };
  },
};
