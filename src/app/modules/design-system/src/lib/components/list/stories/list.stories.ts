import { ListComponent } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { ListAppearance } from '../enums/list-appearance.enum';

const META: Meta<ListComponent> = {
  title: 'Atoms/List',
  component: ListComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  // parameters: {
  //   i18nModules: ['Common'],
  // },
  decorators: [
    moduleMetadata({
      imports: [ListComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<ListComponent>;

const LIST_WRAPPER_STYLES = 'display:flex; flex-direction: column; gap: 16px; width: 100%; max-width: 520px;';

const DEFAULT_ITEMS = [
  {
    icon: {
      name: 'home',
    },
    content:
      'Ten en cuenta que la reclinación máxima de los asientos en Business Class puede variar según el tipo de avión.',
  },
  {
    icon: {
      name: 'home',
    },
    content:
      'Asiento Business Class, Business Class (Flatbed) o Premium (de acuerdo al tipo de avión que opera la ruta) están incluidos para la tarifa business con todos sus beneficios.',
  },
  {
    icon: {
      name: 'home',
    },
    content: 'Disabled. Asientos Plus: están incluidos y sujetos a disponibilidad comprando la tarifa flex.',
    isDisabled: true,
  },
  {
    icon: {
      name: 'camping',
    },
    content: 'En algunos de nuestros aviones solo contamos con asientos <strong>Economy</strong>.',
    cssClass: 'camping-stuff-class',
  },
];

const BULLET_ITEMS = [
  {
    content:
      'Ten en cuenta que la reclinación máxima de los asientos en Business Class puede variar según el tipo de avión.',
  },
  {
    content:
      'Asiento Business Class, Business Class (Flatbed) o Premium (de acuerdo al tipo de avión que opera la ruta) están incluidos para la tarifa business con todos sus beneficios.',
  },
  {
    content: 'Asientos Plus: están incluidos y sujetos a disponibilidad comprando la tarifa flex.',
  },
  {
    content: 'En algunos de nuestros aviones solo contamos con asientos <strong>Economy</strong>.',
  },
];

export const PLAYGROUND: Story = {
  name: 'Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    appearance: undefined,
    showIcons: true,
    disabledIndex: undefined,
    customClassIndex: undefined,
    ariaLabelledby: undefined,
    firstItemText: 'Arrive 90 minutes before departure.',
    secondItemText: 'Keep travel documents accessible.',
    thirdItemText: 'Upgrade perks depend on aircraft.',
    includeHtml: true,
  } as Record<string, unknown>,
  argTypes: {
    appearance: {
      control: 'radio',
      options: [undefined, ListAppearance.BULLET],
      name: 'Appearance',
      description: 'Switch between default (icon) and bullet style',
      table: {
        category: 'Layout',
        type: { summary: 'ListAppearance | undefined' },
      },
    },
    showIcons: {
      control: 'boolean',
      name: 'Show Icons',
      description: 'Toggle per-item icons (ignored for bullet appearance)',
      table: {
        category: 'Content',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    disabledIndex: {
      control: 'number',
      name: 'Disabled Item Index',
      description: 'Zero-based index to flag as disabled (leave blank for none)',
      table: {
        category: 'State',
        type: { summary: 'number | undefined' },
      },
    },
    customClassIndex: {
      control: 'number',
      name: 'Custom Class Index',
      description: 'Zero-based index that receives an example CSS class',
      table: {
        category: 'Appearance',
        type: { summary: 'number | undefined' },
      },
    },
    ariaLabelledby: {
      control: 'text',
      name: 'Aria Labelledby',
      description: 'Optional ID reference describing the list',
      table: {
        category: 'Accessibility',
        type: { summary: 'string | undefined' },
      },
    },
    firstItemText: {
      control: 'text',
      name: 'First Item',
      description: 'Content for the first item',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    secondItemText: {
      control: 'text',
      name: 'Second Item',
      description: 'Content for the second item',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    thirdItemText: {
      control: 'text',
      name: 'Third Item',
      description: 'Content for the third item',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    includeHtml: {
      control: 'boolean',
      name: 'Include HTML Highlight',
      description: 'Wrap the last item in <strong> tags',
      table: {
        category: 'Content',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    config: { table: { disable: true } },
    items: { table: { disable: true } },
    appearanceChange: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const PLAYGROUND_ARGS = args as unknown as {
      appearance?: ListAppearance;
      showIcons: boolean;
      disabledIndex?: number;
      customClassIndex?: number;
      ariaLabelledby?: string;
      firstItemText: string;
      secondItemText: string;
      thirdItemText: string;
      includeHtml: boolean;
    };

    const ITEMS = [
      PLAYGROUND_ARGS.firstItemText,
      PLAYGROUND_ARGS.secondItemText,
      PLAYGROUND_ARGS.thirdItemText,
      PLAYGROUND_ARGS.includeHtml
        ? 'Final reminder: <strong>Double-check baggage limits</strong>.'
        : 'Final reminder: Double-check baggage limits.',
    ].map((content, index) => ({
      content,
      ...(PLAYGROUND_ARGS.showIcons && PLAYGROUND_ARGS.appearance !== ListAppearance.BULLET
        ? { icon: { name: index % 2 === 0 ? 'information' : 'shield-check' } }
        : {}),
      ...(PLAYGROUND_ARGS.disabledIndex === index ? { isDisabled: true } : {}),
      ...(PLAYGROUND_ARGS.customClassIndex === index ? { cssClass: 'ds-list__item--custom' } : {}),
    }));

    return {
      template: `
        <div style="${LIST_WRAPPER_STYLES}">
          <ds-list [appearance]="appearance" [config]="config"></ds-list>
        </div>
      `,
      props: {
        appearance: PLAYGROUND_ARGS.appearance,
        config: {
          items: ITEMS,
          ariaAttributes: {
            ...(PLAYGROUND_ARGS.ariaLabelledby && { ariaLabelledby: PLAYGROUND_ARGS.ariaLabelledby }),
          },
        },
      },
    };
  },
};

export const DEFAULT_APPEARANCE: Story = {
  name: 'Default List',
  render: () => ({
    template: `
      <div style="${LIST_WRAPPER_STYLES}">
        <ds-list [config]="defaultConfig"></ds-list>
      </div>
    `,
    props: {
      defaultConfig: {
        items: DEFAULT_ITEMS,
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const LIST = await CANVAS.findByRole('list');
    const ITEMS = CANVAS.getAllByRole('listitem');

    await expect(ITEMS).toHaveLength(DEFAULT_ITEMS.length);
    await expect(ITEMS[2]).toHaveClass('is-disabled');
    await expect(LIST).toHaveClass('ds-list');
    await expect(ITEMS[3].innerHTML).toContain('<strong>Economy</strong>');
  },
};

export const BULLET_APPEARANCE: Story = {
  name: 'Bullet List',
  render: () => ({
    template: `
      <div style="${LIST_WRAPPER_STYLES}">
        <ds-list [appearance]="bullet" [config]="bulletConfig"></ds-list>
      </div>
    `,
    props: {
      bullet: ListAppearance.BULLET,
      bulletConfig: {
        items: BULLET_ITEMS,
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const ITEMS = await CANVAS.findAllByRole('listitem');

    await expect(ITEMS).toHaveLength(BULLET_ITEMS.length);
    await expect(ITEMS[0].textContent).toContain('Business Class');
    await expect(ITEMS[3].innerHTML).toContain('<strong>Economy</strong>');
  },
};
