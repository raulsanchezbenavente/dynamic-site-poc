import { OptionsListComponent } from '@dcx/storybook/design-system';
import type { DictionaryType, OptionsListConfig } from '@dcx/ui/libs';
import { LinkTarget } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

interface VariantDefinition {
  label: string;
  description?: string;
  config: OptionsListConfig;
}

const BASE_TRANSLATIONS: DictionaryType = {};
const CLONE_CONFIG = (config: OptionsListConfig): OptionsListConfig => ({
  ...config,
  options: config.options.map((option) => ({
    ...option,
    link: option.link ? { ...option.link } : undefined,
    image: option.image ? { ...option.image } : undefined,
    icon: option.icon ? { ...option.icon } : undefined,
    ariaAttributes: option.ariaAttributes ? { ...option.ariaAttributes } : undefined,
  })),
  accessibilityConfig: config.accessibilityConfig ? { ...config.accessibilityConfig } : undefined,
  ariaAttributes: config.ariaAttributes ? { ...config.ariaAttributes } : undefined,
});

const BUILD_VARIANT_PROPS = (variantList: ReadonlyArray<VariantDefinition>): VariantDefinition[] => {
  return variantList.map((variant) => ({
    ...variant,
    config: CLONE_CONFIG(variant.config),
  }));
};

const SELECTION_MODE_CONFIG: OptionsListConfig = {
  ariaAttributes: { ariaLabel: 'Select an add-on service' },
  options: [
    {
      code: 'bags',
      name: 'Carry-on baggage',
      description: 'Includes one cabin piece',
      isDefault: true,
    },
    {
      code: 'seat',
      name: 'Seat with extra legroom',
      description: 'Rows 12-14',
      isSelected: true,
    },
    {
      code: 'meal',
      name: 'Warm meal voucher',
      description: 'Redeem onboard',
    },
    {
      code: 'priority',
      name: 'Priority boarding',
      description: 'Board early with group A',
      isDisabled: true,
    },
  ],
};

const MENU_MODE_CONFIG: OptionsListConfig = {
  mode: 'menu',
  ariaAttributes: { ariaLabel: 'Navigate trip tools' },
  options: [
    {
      code: 'summary',
      name: 'Trip summary',
      link: { url: '#summary', title: 'Jump to trip summary' },
      isSelected: true,
    },
    {
      code: 'passengers',
      name: 'Passengers',
      link: { url: '#passengers', title: 'Passenger list' },
    },
    {
      code: 'services',
      name: 'Services',
      link: { url: '#services', title: 'Purchased services' },
    },
    {
      code: 'help',
      name: 'Help center',
      link: { url: 'https://support.fly-example.com', title: 'Open help center', target: LinkTarget.BLANK },
      isDisabled: true,
    },
  ],
};

const CONTENT_LAYOUT_CONFIG: OptionsListConfig = {
  ariaAttributes: { ariaLabel: 'Content-rich option list' },
  options: [
    {
      code: 'text-desc',
      name: 'Window seat',
      description: 'Quiet row near the wing',
      isDefault: true,
    },
    {
      code: 'with-icon',
      name: 'Priority boarding',
      description: 'Includes lounge access token',
      icon: { name: 'user' },
    },
    {
      code: 'with-image',
      name: 'Panoramic row',
      description: 'Showcase seat photo with skyline view',
      image: { src: 'https://placehold.co/96x64', altText: 'Seat with window view' },
    },
    {
      code: 'link-card',
      name: 'Concierge services',
      description: 'External link to travel assistant',
      link: {
        url: 'https://support.fly-example.com/concierge',
        title: 'Open concierge info',
        target: LinkTarget.BLANK,
      },
    },
  ],
};

const STATE_SELECTION_CONFIG: OptionsListConfig = {
  ariaAttributes: { ariaLabel: 'Bundle states' },
  options: [
    {
      code: 'basic-bundle',
      name: 'Basic bundle',
      description: 'Seat + carry-on',
      isDefault: true,
    },
    {
      code: 'flex-bundle',
      name: 'Flex bundle',
      description: 'Seat + checked bag + changes',
      isSelected: true,
    },
    {
      code: 'lux-bundle',
      name: 'Lux bundle',
      description: 'Premium cabin upgrade',
      isDisabled: true,
    },
  ],
};

const STATE_MENU_CONFIG: OptionsListConfig = {
  mode: 'menu',
  ariaAttributes: { ariaLabel: 'Menu availability' },
  options: [
    {
      code: 'overview',
      name: 'Overview',
      link: { url: '#overview', title: 'Overview section' },
      isSelected: true,
    },
    {
      code: 'documents',
      name: 'Documents',
      link: { url: '#documents', title: 'Travel documents' },
    },
    {
      code: 'extras',
      name: 'Extras (coming soon)',
      link: { url: '#extras', title: 'Extras section' },
      isDisabled: true,
    },
  ],
};

const MODE_VARIANTS: ReadonlyArray<VariantDefinition> = [
  {
    label: 'Selection mode (listbox)',
    description:
      'Listbox semantics (role=listbox/option) for controlled selections. Rows stay as buttons but expose aria-selected instead of native radios.',
    config: SELECTION_MODE_CONFIG,
  },
  {
    label: 'Menu mode (navigation)',
    description:
      'Menu semantics (role=menu/menuitem) optimized for navigation. Links render actual <a> elements, highlighting aria-current when selected.',
    config: MENU_MODE_CONFIG,
  },
];

const CONTENT_LAYOUT_VARIANTS: ReadonlyArray<VariantDefinition> = [
  {
    label: 'Combined layouts',
    description: 'Single config showcasing helper text, icons, images, and external links together.',
    config: CONTENT_LAYOUT_CONFIG,
  },
];

const STATE_MATRIX_VARIANTS: ReadonlyArray<VariantDefinition> = [
  {
    label: 'Selection states',
    description: 'Shows default, selected, and disabled rows in listbox mode.',
    config: STATE_SELECTION_CONFIG,
  },
  {
    label: 'Menu states',
    description: 'Highlights selected navigation item plus disabled destinations.',
    config: STATE_MENU_CONFIG,
  },
];

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<OptionsListComponent> = {
  title: 'Atoms/OptionsList',
  component: OptionsListComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common.A11y'],
    i18n: {
      api: false,
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [OptionsListComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<OptionsListComponent>;

export const MODES: Story = {
  name: 'List Roles (a11y)',
  render: () => ({
    props: {
      translations: BASE_TRANSLATIONS,
      variants: BUILD_VARIANT_PROPS(MODE_VARIANTS),
    },
    template: `
      <div class="dcx-story-grid">
        <div *ngFor="let variant of variants" class="dcx-story-card">
          <h4 class="dcx-story-heading">{{ variant.label }}</h4>
          <p *ngIf="variant.description" class="dcx-story-description">{{ variant.description }}</p>
          <div class="dcx-story-meta">
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">Mode</span>
              <span>{{ variant.config.mode ?? 'selection (implicit)' }}</span>
            </div>
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">Roles</span>
              <span>{{ variant.config.mode === 'menu' ? 'menu / menuitem' : 'listbox / option' }}</span>
            </div>
            <div *ngIf="variant.config.ariaAttributes?.ariaLabel" class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">ARIA-LABEL</span>
              <span>{{ variant.config.ariaAttributes?.ariaLabel }}</span>
            </div>
          </div>
          <options-list [config]="variant.config" [translations]="translations"></options-list>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and options lists to render
    await waitFor(() => {
      expect(canvas.getAllByRole('listbox')).toHaveLength(1);
      expect(canvas.getAllByRole('menu')).toHaveLength(1);
    });
    await expect(canvas.getAllByRole('option')).toHaveLength(SELECTION_MODE_CONFIG.options.length);
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(MENU_MODE_CONFIG.options.length);
    const firstMenuItem = canvas.getAllByRole('menuitem')[0];
    await expect(firstMenuItem).toHaveAttribute('aria-current', 'page');
  },
};

export const CONTENT_LAYOUTS: Story = {
  name: 'Content Layouts',
  render: () => ({
    props: {
      translations: BASE_TRANSLATIONS,
      variants: BUILD_VARIANT_PROPS(CONTENT_LAYOUT_VARIANTS),
    },
    template: `
      <div class="dcx-story-grid">
        <div *ngFor="let variant of variants" class="dcx-story-card">
          <h4 class="dcx-story-heading">{{ variant.label }}</h4>
          <p *ngIf="variant.description" class="dcx-story-description">{{ variant.description }}</p>
          <div class="dcx-story-meta">
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">Mode</span>
              <span>{{ variant.config.mode ?? 'selection (implicit)' }}</span>
            </div>
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">ARIA-LABEL</span>
              <span>{{ variant.config.ariaAttributes?.ariaLabel ?? 'Not provided' }}</span>
            </div>
          </div>
          <options-list [config]="variant.config" [translations]="translations"></options-list>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and content to render
    await waitFor(() => {
      expect(canvas.getByText('Priority boarding')).toBeInTheDocument();
    });

    const descriptions = canvasElement.querySelectorAll('.ds-options-list_item_option_content_description');
    expect(descriptions.length).toBeGreaterThan(0);
    const iconElements = canvasElement.querySelectorAll('.ds-icon');
    expect(iconElements.length).toBeGreaterThan(0);
    const imageElements = canvasElement.querySelectorAll('.ds-options-list_item_option_image');
    expect(imageElements.length).toBeGreaterThan(0);
  },
};

export const STATES: Story = {
  name: 'States',
  render: () => ({
    props: {
      translations: BASE_TRANSLATIONS,
      variants: BUILD_VARIANT_PROPS(STATE_MATRIX_VARIANTS),
    },
    template: `
      <div class="dcx-story-grid">
        <div *ngFor="let variant of variants" class="dcx-story-card">
          <h4 class="dcx-story-heading">{{ variant.label }}</h4>
          <p *ngIf="variant.description" class="dcx-story-description">{{ variant.description }}</p>
          <div class="dcx-story-meta">
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">Mode</span>
              <span>{{ variant.config.mode ?? 'selection (implicit)' }}</span>
            </div>
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">Roles</span>
              <span>{{ variant.config.mode === 'menu' ? 'menu / menuitem' : 'listbox / option' }}</span>
            </div>
          </div>
          <options-list [config]="variant.config" [translations]="translations"></options-list>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and options lists to render
    await waitFor(() => {
      expect(
        canvas.getByRole('listbox', { name: STATE_SELECTION_CONFIG.ariaAttributes?.ariaLabel as string })
      ).toBeInTheDocument();
    });

    await expect(
      canvas.getByRole('menu', { name: STATE_MENU_CONFIG.ariaAttributes?.ariaLabel as string })
    ).toBeInTheDocument();
    const selectedItems = canvasElement.querySelectorAll('[aria-selected="true"]');
    expect(selectedItems.length).toBeGreaterThan(0);
    const disabledItems = canvasElement.querySelectorAll('[aria-disabled="true"]');
    expect(disabledItems.length).toBeGreaterThan(0);
    const highlightedRows = canvasElement.querySelectorAll('.ds-options-list_item--selected');
    expect(highlightedRows.length).toBeGreaterThan(0);
  },
};
