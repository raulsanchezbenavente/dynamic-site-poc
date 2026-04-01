import { CommonModule } from '@angular/common';
import { CarouselComponent, CarouselItemDirective } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { CarouselConfig } from '../models/carousel.config';

const META: Meta<CarouselComponent> = {
  title: 'Atoms/Carousel',
  component: CarouselComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Carousel'],
    i18n: {
      api: true,
      mock: {
        'Carousel.Title': 'Screen reader title for carousel',
        'Common.Next': 'Next',
        'Common.Previous': 'Previous',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, CarouselComponent, CarouselItemDirective],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
  argTypes: {},
};

export default META;
type Story = StoryObj<CarouselComponent>;

const CAROUSEL_ITEM_STYLES = `
  .carousel-demo-item {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    font-family: sans-serif;
    font-size: 16px;
    border: 1px solid #ccc;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  }
`;

const STORY_LAYOUT_STYLES = `
  .carousel-story-grid {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .carousel-story-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .carousel-story-card h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .carousel-story-helper {
    font-size: 14px;
    color: #4f4f4f;
    margin: 0 0 12px;
  }
`;

const MOCK_ITEMS = [
  'Slide 1: Destinations',
  'Slide 2: Fare bundles',
  'Slide 3: Family seats',
  'Slide 4: Premium seat map',
  'Slide 5: Upgrade offers',
  'Slide 6: Partner deals',
  'Slide 7: Weekend escapes',
  'Slide 8: Tailored trips',
];

const BREAKPOINT_VARIANTS = [
  {
    label: 'XS focus (1 item, step 1)',
    config: {
      breakPointConfig: {
        XS: { visibleItems: 1, itemsToScroll: 1 },
        M: { visibleItems: 2, itemsToScroll: 1 },
        L: { visibleItems: 3, itemsToScroll: 2 },
        XL: { visibleItems: 3, itemsToScroll: 2 },
        XXL: { visibleItems: 3, itemsToScroll: 2 },
      },
    },
  },
  {
    label: 'Balanced desktop (4 items, step 2)',
    config: {
      breakPointConfig: {
        XS: { visibleItems: 1, itemsToScroll: 1 },
        S: { visibleItems: 2, itemsToScroll: 1 },
        M: { visibleItems: 3, itemsToScroll: 1 },
        L: { visibleItems: 4, itemsToScroll: 2, itemsMargin: 24 },
        XL: { visibleItems: 5, itemsToScroll: 3 },
        XXL: { visibleItems: 5, itemsToScroll: 3 },
      },
    },
  },
  {
    label: 'Dense XL view (6 items, step 3)',
    config: {
      breakPointConfig: {
        XS: { visibleItems: 1, itemsToScroll: 1 },
        M: { visibleItems: 3, itemsToScroll: 2 },
        L: { visibleItems: 3, itemsToScroll: 2 },
        XL: { visibleItems: 6, itemsToScroll: 3, itemsMargin: 8 },
        XXL: { visibleItems: 6, itemsToScroll: 3 },
      },
    },
  },
] satisfies Array<{ label: string; config: CarouselConfig }>;

const ARIA_CONFIG: CarouselConfig = {
  ariaAttributes: {
    ariaLabel: 'Deals for assistive tech',
  },
  prev: {
    ariaAttributes: {
      ariaLabel: 'Jump to earlier bundles',
    },
  },
  next: {
    ariaAttributes: {
      ariaLabel: 'Jump to later bundles',
    },
  },
  breakPointConfig: {
    XS: { visibleItems: 1, itemsToScroll: 1 },
    M: { visibleItems: 2, itemsToScroll: 1 },
    L: { visibleItems: 3, itemsToScroll: 1 },
  },
};

export const BREAKPOINT_DENSITY: Story = {
  name: 'Breakpoint density',
  render: () => ({
    template: `
      <div class="carousel-story-grid">
        <section
          class="carousel-story-card"
          *ngFor="let variant of breakpointVariants; trackBy: trackByLabel">
          <h4>{{ variant.label }}</h4>
          <ds-carousel [config]="variant.config">
            <div
              carouselItem
              class="carousel-demo-item"
              *ngFor="let item of items; trackBy: trackByLabel">
              {{ item }}
            </div>
          </ds-carousel>
        </section>
      </div>
    `,
    props: {
      breakpointVariants: BREAKPOINT_VARIANTS,
      items: MOCK_ITEMS,
      trackByLabel: (_: number, value: string | { label: string }) => (typeof value === 'string' ? value : value.label),
    },
    styles: [CAROUSEL_ITEM_STYLES, STORY_LAYOUT_STYLES],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to render
    await waitFor(() => {
      const regions = canvas.getAllByRole('region');
      expect(regions).toHaveLength(BREAKPOINT_VARIANTS.length);
    });

    await expect(canvas.getAllByText('Slide 3: Family seats')).toHaveLength(BREAKPOINT_VARIANTS.length);

    // Validate navigation buttons exist (avoid validating translated text which can cause flakiness)
    const buttons = canvas.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  },
};

export const ARIA_CUSTOMIZATION: Story = {
  name: 'ARIA customization',
  render: () => ({
    template: `
      <section class="carousel-story-card">
        <p class="carousel-story-helper">
          Screen readers hear: "{{ ariaConfig.ariaAttributes?.ariaLabel }}"
        </p>
        <ds-carousel [config]="ariaConfig">
          <div
            carouselItem
            class="carousel-demo-item"
            *ngFor="let item of items; trackBy: trackByLabel">
            {{ item }}
          </div>
        </ds-carousel>
      </section>
    `,
    props: {
      ariaConfig: ARIA_CONFIG,
      items: MOCK_ITEMS.slice(0, 5),
      trackByLabel: (_: number, value: string) => value,
    },
    styles: [CAROUSEL_ITEM_STYLES, STORY_LAYOUT_STYLES],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for content to render
    await waitFor(() => {
      // Validate custom ARIA label is applied (hardcoded, not translated)
      const region = canvas.getByRole('region', { name: 'Deals for assistive tech' });
      expect(region).toBeInTheDocument();
    });

    // Validate navigation buttons render (custom ARIA labels, not translated)
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Jump to later bundles' })).toBeInTheDocument();
    });
  },
};

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    itemCount: 8,
    visibleItemsXS: 1,
    visibleItemsM: 2,
    visibleItemsL: 3,
    visibleItemsXL: 4,
    itemsToScrollXS: 1,
    itemsToScrollM: 1,
    itemsToScrollL: 2,
    itemsToScrollXL: 2,
    itemsMarginXS: 16,
    itemsMarginM: 16,
    itemsMarginL: 16,
    itemsMarginXL: 24,
    carouselAriaLabel: 'Interactive carousel playground',
    nextAriaLabel: 'Next slide',
    prevAriaLabel: 'Previous slide',
  } as Record<string, unknown>,
  argTypes: {
    itemCount: {
      control: { type: 'number', min: 1, max: 20 },
      name: 'Number of Items',
      description: 'Total number of carousel items to display',
      table: {
        category: 'Content',
        type: { summary: 'number' },
        defaultValue: { summary: 8 },
      },
    },
    visibleItemsXS: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Visible Items (XS)',
      description: 'Number of visible items on XS breakpoint',
      table: {
        category: 'Breakpoints',
        type: { summary: 'number' },
        defaultValue: { summary: 1 },
      },
    },
    visibleItemsM: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Visible Items (M)',
      description: 'Number of visible items on M breakpoint',
      table: {
        category: 'Breakpoints',
        type: { summary: 'number' },
        defaultValue: { summary: 2 },
      },
    },
    visibleItemsL: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Visible Items (L)',
      description: 'Number of visible items on L breakpoint',
      table: {
        category: 'Breakpoints',
        type: { summary: 'number' },
        defaultValue: { summary: 3 },
      },
    },
    visibleItemsXL: {
      control: { type: 'number', min: 1, max: 8 },
      name: 'Visible Items (XL)',
      description: 'Number of visible items on XL breakpoint',
      table: {
        category: 'Breakpoints',
        type: { summary: 'number' },
        defaultValue: { summary: 4 },
      },
    },
    itemsToScrollXS: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Items to Scroll (XS)',
      description: 'Number of items to scroll per navigation action on XS',
      table: {
        category: 'Behavior',
        type: { summary: 'number' },
        defaultValue: { summary: 1 },
      },
    },
    itemsToScrollM: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Items to Scroll (M)',
      description: 'Number of items to scroll per navigation action on M',
      table: {
        category: 'Behavior',
        type: { summary: 'number' },
        defaultValue: { summary: 1 },
      },
    },
    itemsToScrollL: {
      control: { type: 'number', min: 1, max: 6 },
      name: 'Items to Scroll (L)',
      description: 'Number of items to scroll per navigation action on L',
      table: {
        category: 'Behavior',
        type: { summary: 'number' },
        defaultValue: { summary: 2 },
      },
    },
    itemsToScrollXL: {
      control: { type: 'number', min: 1, max: 8 },
      name: 'Items to Scroll (XL)',
      description: 'Number of items to scroll per navigation action on XL',
      table: {
        category: 'Behavior',
        type: { summary: 'number' },
        defaultValue: { summary: 2 },
      },
    },
    itemsMarginXS: {
      control: { type: 'number', min: 0, max: 48 },
      name: 'Items Margin (XS)',
      description: 'Horizontal gap between items in pixels on XS',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: 16 },
      },
    },
    itemsMarginM: {
      control: { type: 'number', min: 0, max: 48 },
      name: 'Items Margin (M)',
      description: 'Horizontal gap between items in pixels on M',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: 16 },
      },
    },
    itemsMarginL: {
      control: { type: 'number', min: 0, max: 48 },
      name: 'Items Margin (L)',
      description: 'Horizontal gap between items in pixels on L',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: 16 },
      },
    },
    itemsMarginXL: {
      control: { type: 'number', min: 0, max: 48 },
      name: 'Items Margin (XL)',
      description: 'Horizontal gap between items in pixels on XL',
      table: {
        category: 'Layout',
        type: { summary: 'number' },
        defaultValue: { summary: 24 },
      },
    },
    carouselAriaLabel: {
      control: 'text',
      name: 'Carousel ARIA Label',
      description: 'Accessible name for the carousel region',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
        defaultValue: { summary: 'Interactive carousel playground' },
      },
    },
    nextAriaLabel: {
      control: 'text',
      name: 'Next Button ARIA Label',
      description: 'Accessible name for the next navigation button',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
        defaultValue: { summary: 'Next slide' },
      },
    },
    prevAriaLabel: {
      control: 'text',
      name: 'Previous Button ARIA Label',
      description: 'Accessible name for the previous navigation button',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
        defaultValue: { summary: 'Previous slide' },
      },
    },
    // Hide internal properties
    config: { table: { disable: true } },
    trackRef: { table: { disable: true } },
    viewportRef: { table: { disable: true } },
    items: { table: { disable: true } },
    navigatePrev: { table: { disable: true } },
    navigateNext: { table: { disable: true } },
    totalCarouselItems: { table: { disable: true } },
    visibleItems: { table: { disable: true } },
    currentSlide: { table: { disable: true } },
    totalSlides: { table: { disable: true } },
    hasPrev: { table: { disable: true } },
    hasNext: { table: { disable: true } },
    transform: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    ngAfterViewInit: { table: { disable: true } },
    ngAfterContentInit: { table: { disable: true } },
    resetToFirstSlide: { table: { disable: true } },
    next: { table: { disable: true } },
    prev: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const CUSTOM_ARGS = args as unknown as {
      itemCount: number;
      visibleItemsXS: number;
      visibleItemsM: number;
      visibleItemsL: number;
      visibleItemsXL: number;
      itemsToScrollXS: number;
      itemsToScrollM: number;
      itemsToScrollL: number;
      itemsToScrollXL: number;
      itemsMarginXS: number;
      itemsMarginM: number;
      itemsMarginL: number;
      itemsMarginXL: number;
      carouselAriaLabel: string;
      nextAriaLabel: string;
      prevAriaLabel: string;
    };

    const GENERATED_ITEMS = Array.from({ length: CUSTOM_ARGS.itemCount }, (_, i) => `Item ${i + 1}`);

    const PLAYGROUND_CONFIG: CarouselConfig = {
      breakPointConfig: {
        XS: {
          visibleItems: CUSTOM_ARGS.visibleItemsXS,
          itemsToScroll: CUSTOM_ARGS.itemsToScrollXS,
          itemsMargin: CUSTOM_ARGS.itemsMarginXS,
        },
        M: {
          visibleItems: CUSTOM_ARGS.visibleItemsM,
          itemsToScroll: CUSTOM_ARGS.itemsToScrollM,
          itemsMargin: CUSTOM_ARGS.itemsMarginM,
        },
        L: {
          visibleItems: CUSTOM_ARGS.visibleItemsL,
          itemsToScroll: CUSTOM_ARGS.itemsToScrollL,
          itemsMargin: CUSTOM_ARGS.itemsMarginL,
        },
        XL: {
          visibleItems: CUSTOM_ARGS.visibleItemsXL,
          itemsToScroll: CUSTOM_ARGS.itemsToScrollXL,
          itemsMargin: CUSTOM_ARGS.itemsMarginXL,
        },
        XXL: {
          visibleItems: CUSTOM_ARGS.visibleItemsXL,
          itemsToScroll: CUSTOM_ARGS.itemsToScrollXL,
          itemsMargin: CUSTOM_ARGS.itemsMarginXL,
        },
      },
      ariaAttributes: {
        ariaLabel: CUSTOM_ARGS.carouselAriaLabel,
      },
      next: {
        ariaAttributes: {
          ariaLabel: CUSTOM_ARGS.nextAriaLabel,
        },
      },
      prev: {
        ariaAttributes: {
          ariaLabel: CUSTOM_ARGS.prevAriaLabel,
        },
      },
    };

    return {
      template: `
        <div style="width: 800px; max-width: 100%;">
          <ds-carousel [config]="config">
            <div
              carouselItem
              class="carousel-demo-item"
              *ngFor="let item of items; trackBy: trackByLabel">
              {{ item }}
            </div>
          </ds-carousel>
        </div>
      `,
      props: {
        config: PLAYGROUND_CONFIG,
        items: GENERATED_ITEMS,
        trackByLabel: (_: number, value: string) => value,
      },
      styles: [CAROUSEL_ITEM_STYLES],
    };
  },
};
