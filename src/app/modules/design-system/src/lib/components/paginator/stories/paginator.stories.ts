import { PaginatorComponent } from '@dcx/storybook/design-system';
import type { ArgTypes, Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

interface PaginatorVariant {
  label: string;
  description: string;
  config: {
    currentPage: number;
    totalPages: number;
    pagesToShow: number;
  };
}

const POSITION_VARIANTS: ReadonlyArray<PaginatorVariant> = [
  {
    label: 'Start position',
    description: 'Previous disabled, no leading ellipsis.',
    config: { currentPage: 1, totalPages: 18, pagesToShow: 5 },
  },
  {
    label: 'Middle position',
    description: 'Both ellipses visible, page centered.',
    config: { currentPage: 9, totalPages: 18, pagesToShow: 5 },
  },
  {
    label: 'End position',
    description: 'Next disabled, jump-to-last visible.',
    config: { currentPage: 18, totalPages: 18, pagesToShow: 5 },
  },
];

const RESPONSIVE_VIEWPORTS = {
  desktopWide: {
    name: 'Desktop · 1024px',
    styles: { width: '96%', height: 'auto', padding: '2%' },
    type: 'desktop',
  },
  compactMobile: {
    name: 'Mobile · 414px',
    styles: { width: '414px', height: 'auto', padding: '20px' },
    type: 'mobile',
  },
} as const;

type ResponsiveViewportKey = keyof typeof RESPONSIVE_VIEWPORTS;

interface ResponsiveVariant extends PaginatorVariant {
  viewportKey: ResponsiveViewportKey;
}

const RESPONSIVE_VARIANTS: Record<'desktop' | 'compact', ResponsiveVariant> = {
  desktop: {
    label: 'Desktop window',
    description: 'Full variant with ellipses.',
    viewportKey: 'desktopWide',
    config: { currentPage: 6, totalPages: 12, pagesToShow: 5 },
  },
  compact: {
    label: 'Compact mobile window',
    description: 'Reduced set of 3 items at the responsive breakpoint.',
    viewportKey: 'compactMobile',
    config: { currentPage: 6, totalPages: 12, pagesToShow: 3 },
  },
};

const VARIANT_GRID_STYLES = 'display:flex; flex-direction: column; gap:32px; flex-wrap:wrap; align-items:flex-start;';
const VARIANT_CARD_STYLES = 'flex:1 1 100%; width: 100%;';
const VARIANT_TITLE_STYLES = 'margin:0 0 8px; font-size:16px; font-weight:600;';
const VARIANT_DESCRIPTION_STYLES = 'margin:0 0 16px; color:#4c5567; font-size:13px;';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PaginatorComponent> = {
  title: 'Atoms/Paginator',
  component: PaginatorComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Pagination'],
    i18n: {
      api: false,
      mock: {
        'Pagination.A11y.Navigation': 'Pagination navigation (mock)',
        'Pagination.A11y.Previous_Page': 'Go to previous page (mock)',
        'Pagination.A11y.First_Page': 'Go to page 1 (mock)',
        'Pagination.A11y.Go_To_Page': 'Go to page (mock)',
        'Pagination.A11y.Next_Page': 'Go to next page (mock)',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [PaginatorComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<PaginatorComponent>;
type PlaygroundStory = StoryObj<PaginatorComponent & PlaygroundArgs>;

interface PlaygroundArgs {
  currentPage: number;
  totalPages: number;
  pagesToShow: number;
}

const PLAYGROUND_DEFAULTS: PlaygroundArgs = {
  currentPage: 4,
  totalPages: 16,
  pagesToShow: 5,
};

export const PLAYGROUND: PlaygroundStory = {
  name: 'Playground',
  parameters: {
    layout: 'centered',
  },
  args: { ...PLAYGROUND_DEFAULTS },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      name: 'Current Page',
      description: 'Active page visible in the control.',
      table: {
        category: 'State',
        type: { summary: 'number' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.currentPage.toString() },
      },
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      name: 'Total Pages',
      description: 'Overall amount of pages to paginate.',
      table: {
        category: 'Content',
        type: { summary: 'number' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.totalPages.toString() },
      },
    },
    pagesToShow: {
      control: { type: 'number', min: 1, max: 7 },
      name: 'Pages To Show',
      description: 'Window length for visible page buttons.',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.pagesToShow.toString() },
      },
    },
    config: { table: { disable: true } },
    selectPageEmitter: { table: { disable: true } },
    isResponsive: { table: { disable: true } },
    firstNumberToShow: { table: { disable: true } },
    lastNumberToShow: { table: { disable: true } },
    items: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    onNext: { table: { disable: true } },
    onPrevious: { table: { disable: true } },
  } as ArgTypes,
  render: (args) => {
    const customArgs = args as unknown as PlaygroundArgs;

    return {
      props: {
        config: {
          currentPage: customArgs.currentPage,
          totalPages: customArgs.totalPages,
          pagesToShow: customArgs.pagesToShow,
        },
      },
      template: `<ds-paginator [config]="config"></ds-paginator>`,
    };
  },
};

export const POSITIONS: Story = {
  name: 'Selected Page Position',
  render: () => ({
    props: {
      variants: POSITION_VARIANTS,
    },
    template: `
      <div style="${VARIANT_GRID_STYLES}">
        <div *ngFor="let variant of variants" style="${VARIANT_CARD_STYLES}">
          <h4 style="${VARIANT_TITLE_STYLES}">{{ variant.label }}</h4>
          <p style="${VARIANT_DESCRIPTION_STYLES}">{{ variant.description }}</p>
          <ds-paginator [config]="variant.config"></ds-paginator>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and paginators to render
    let navs: HTMLElement[] = [];
    await waitFor(() => {
      navs = canvas.getAllByRole('navigation');
      expect(navs).toHaveLength(POSITION_VARIANTS.length);
    });
    const disabledButtons = canvasElement.querySelectorAll('button:disabled');
    expect(disabledButtons.length).toBeGreaterThan(0);
    const activePages = canvasElement.querySelectorAll('[aria-current="page"]');
    expect(activePages.length).toBe(POSITION_VARIANTS.length);
  },
};

export const RESPONSIVE_DESKTOP: Story = {
  name: 'Density (Desktop)',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: RESPONSIVE_VIEWPORTS,
      defaultViewport: RESPONSIVE_VARIANTS.desktop.viewportKey,
    },
  },
  render: () => ({
    props: {
      config: RESPONSIVE_VARIANTS.desktop.config,
    },
    template: `
      <div style="${VARIANT_CARD_STYLES}">
        <h4 style="${VARIANT_TITLE_STYLES}">${RESPONSIVE_VARIANTS.desktop.label}</h4>
        <p style="${VARIANT_DESCRIPTION_STYLES}">${RESPONSIVE_VARIANTS.desktop.description}</p>
        <ds-paginator [config]="config"></ds-paginator>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and paginator to render
    await waitFor(() => {
      expect(canvas.getAllByRole('navigation')).toHaveLength(1);
    });

    const ellipsis = canvasElement.querySelectorAll('.pagination_list_item_button--ellipsis');
    expect(ellipsis.length).toBeGreaterThan(0);
  },
};

export const RESPONSIVE_COMPACT: Story = {
  name: 'Density (Compact)',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: RESPONSIVE_VIEWPORTS,
      defaultViewport: RESPONSIVE_VARIANTS.compact.viewportKey,
    },
  },
  render: () => ({
    props: {
      config: RESPONSIVE_VARIANTS.compact.config,
    },
    template: `
      <div style="${VARIANT_CARD_STYLES}">
        <h4 style="${VARIANT_TITLE_STYLES}">${RESPONSIVE_VARIANTS.compact.label}</h4>
        <p style="${VARIANT_DESCRIPTION_STYLES}">${RESPONSIVE_VARIANTS.compact.description}</p>
        <ds-paginator [config]="config"></ds-paginator>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and paginator to render
    await waitFor(() => {
      expect(canvas.getAllByRole('navigation')).toHaveLength(1);
    });

    const ellipsis = canvasElement.querySelectorAll('.pagination_list_item_button--ellipsis');
    expect(ellipsis.length).toBe(0);
    const pageButtons = canvas.getAllByRole('button', { name: /Go to page/i });
    expect(pageButtons.length).toBeLessThanOrEqual(3);
  },
};
