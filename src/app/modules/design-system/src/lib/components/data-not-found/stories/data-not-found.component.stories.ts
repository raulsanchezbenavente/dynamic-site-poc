import { DataNotFoundComponent, type DataNotFoundConfig, DsButtonComponent } from '@dcx/storybook/design-system';
import type { ButtonConfig, IconConfig } from '@dcx/ui/libs';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

const META: Meta<DataNotFoundComponent> = {
  title: 'Atoms/DataNotFound',
  component: DataNotFoundComponent,
  decorators: [
    moduleMetadata({
      imports: [DataNotFoundComponent, DsButtonComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DataNotFoundComponent>;

type PlaygroundControls = {
  text: string;
  secondaryText: string;
  includeSecondaryText: boolean;
  iconName: string;
  iconAriaLabel: string;
  useCustomIcon: boolean;
  includeStatusText: boolean;
  statusText: string;
};

const PLAYGROUND_DEFAULTS: PlaygroundControls = {
  text: 'We could not find matching trips.',
  secondaryText: 'Try adjusting filters or travel dates.',
  includeSecondaryText: true,
  iconName: 'airplane-cancel',
  iconAriaLabel: 'Empty search results',
  useCustomIcon: true,
  includeStatusText: false,
  statusText: 'Retrying search with relaxed filters.',
};

const STORY_GRID_STYLES = `
  .data-not-found-story-grid {
    display: grid;
    gap: 40px;
    grid-template-rows: repeat(auto-fit, minmax(auto, 1fr));
  }

  .data-not-found-story-card {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .data-not-found-story-card h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--dcx-text-strong, #1f2933);
  }

  .data-not-found-story-note {
    margin: 0;
    color: var(--dcx-text-muted, #4b5563);
    font-size: 0.85rem;
  }

  .data-not-found-story-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const PLAYGROUND_STYLES = `
  .data-not-found-playground {
    max-width: 720px;
    margin: auto;
    padding: 32px 24px;
  }
`;

const BASE_ICON: IconConfig = {
  name: 'airplane-cancel',
  ariaAttributes: {
    ariaLabel: 'Empty results icon',
  },
};

const TEXT_STATE_VARIANTS: Array<{ label: string; config: DataNotFoundConfig }> = [
  {
    label: 'Primary copy only',
    config: {
      text: 'We could not find matching trips today.',
    },
  },
  {
    label: 'Primary + secondary copy',
    config: {
      text: 'All upgrade bundles are unavailable.',
      secondaryText: 'Try selecting new dates or reducing the passenger count.',
      icon: BASE_ICON,
    },
  },
];

type ProjectionCta = { type: 'link'; label: string } | { type: 'button'; config: ButtonConfig };

const CONTENT_PROJECTION_VARIANTS: Array<{ label: string; config: DataNotFoundConfig; cta: ProjectionCta }> = [
  {
    label: 'Inline link',
    config: {
      text: 'Need different travel dates?',
      secondaryText: 'Project links to guide guests toward self-service tools.',
      icon: {
        name: 'calendar-week',
      },
    },
    cta: {
      type: 'button',
      config: {
        label: 'Modify search',
        layout: { size: 'small', style: 'primary' },
      } as ButtonConfig,
    },
  },
  {
    label: 'Action button',
    config: {
      text: 'We could not find flights with those details.',
      secondaryText: 'Double-check the passenger info or contact our call center for extra help.',
      icon: BASE_ICON,
    },
    cta: { type: 'link', label: 'Contact call center' },
  },
];

const TRACK_BY_LABEL = (_: number, value: { label: string }): string => value.label;

const buildConfigFromControls = (controls: PlaygroundControls): DataNotFoundConfig => {
  const config: DataNotFoundConfig = {
    text: controls.text.trim() || PLAYGROUND_DEFAULTS.text,
  };

  if (controls.includeSecondaryText) {
    config.secondaryText = controls.secondaryText.trim() || PLAYGROUND_DEFAULTS.secondaryText;
  }

  if (controls.useCustomIcon) {
    const iconName = controls.iconName.trim() || PLAYGROUND_DEFAULTS.iconName;
    config.icon = {
      name: iconName,
      ariaAttributes:
        controls.iconAriaLabel.trim().length > 0
          ? { ariaLabel: controls.iconAriaLabel.trim() }
          : { ariaLabel: PLAYGROUND_DEFAULTS.iconAriaLabel },
    } satisfies IconConfig;
  }

  if (controls.includeStatusText) {
    config.statusText = controls.statusText.trim() || PLAYGROUND_DEFAULTS.statusText;
  }

  return config;
};

export const PLAYGROUND: Story = {
  name: 'Playground',
  parameters: {
    layout: 'fullscreen',
  },
  args: { ...PLAYGROUND_DEFAULTS } as Record<string, unknown>,
  argTypes: {
    text: {
      control: 'text',
      name: 'Primary text',
      description: 'Main message shown to explain why data is missing.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    includeSecondaryText: {
      control: 'boolean',
      name: 'Show secondary text',
      description: 'Toggles the optional secondary guidance paragraph.',
      table: {
        category: 'Content',
        type: { summary: 'boolean' },
      },
    },
    secondaryText: {
      control: 'text',
      name: 'Secondary text',
      description: 'Extra guidance displayed beneath the primary copy.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
      if: { arg: 'includeSecondaryText' },
    },
    useCustomIcon: {
      control: 'boolean',
      name: 'Show icon',
      description: 'Toggles the illustrated icon block.',
      table: {
        category: 'Appearance',
        type: { summary: 'boolean' },
      },
    },
    iconName: {
      control: 'text',
      name: 'Icon name',
      description: 'Design System icon token to display.',
      table: {
        category: 'Appearance',
        type: { summary: 'string' },
      },
      if: { arg: 'useCustomIcon' },
    },
    iconAriaLabel: {
      control: 'text',
      name: 'Icon aria-label',
      description: 'Accessible text describing the icon when it conveys meaning.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
      if: { arg: 'useCustomIcon' },
    },
    includeStatusText: {
      control: 'boolean',
      name: 'Announce status text',
      description: 'Adds live-region copy for async updates.',
      table: {
        category: 'Accessibility',
        type: { summary: 'boolean' },
      },
    },
    statusText: {
      control: 'text',
      name: 'Status text',
      description: 'Message read by assistive tech to explain background work.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
      if: { arg: 'includeStatusText' },
    },
    config: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const controls = args as unknown as PlaygroundControls;
    const config = buildConfigFromControls(controls);

    return {
      props: {
        config,
      },
      template: `
        <div class="data-not-found-playground">
          <data-not-found [config]="config">
            <a href="#">Start new search</a>
          </data-not-found>
        </div>
      `,
      styles: [PLAYGROUND_STYLES],
    };
  },
};

export const TEXT_STATES: Story = {
  name: 'Copy hierarchy',
  render: () => ({
    template: `
      <div class="data-not-found-story-grid">
        <section
          class="data-not-found-story-card"
          *ngFor="let variant of textVariants; trackBy: trackByLabel">
          <h4>{{ variant.label }}</h4>
          <data-not-found [config]="variant.config"></data-not-found>
        </section>
      </div>
    `,
    props: {
      textVariants: TEXT_STATE_VARIANTS,
      trackByLabel: TRACK_BY_LABEL,
    },
    styles: [STORY_GRID_STYLES],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const renderedComponents = canvasElement.querySelectorAll('data-not-found');
    await expect(renderedComponents).toHaveLength(TEXT_STATE_VARIANTS.length);
    await expect(canvas.getByText('We could not find matching trips today.')).toBeInTheDocument();
    await expect(canvas.getByText('Try selecting new dates or reducing the passenger count.')).toBeInTheDocument();
  },
};

export const CONTENT_PROJECTION: Story = {
  name: 'Content projection',
  render: () => ({
    template: `
      <div class="data-not-found-story-grid">
        <section
          class="data-not-found-story-card"
          *ngFor="let variant of projectionVariants; trackBy: trackByLabel">
          <h4>{{ variant.label }}</h4>
          <data-not-found [config]="variant.config">
              <a
                *ngIf="variant.cta.type === 'link'"
                href="#">
                {{ variant.cta.label }}
              </a>
              <ds-button
                *ngIf="variant.cta.type === 'button'"
                [config]="variant.cta.config">
              </ds-button>
          </data-not-found>
        </section>
      </div>
    `,
    props: {
      projectionVariants: CONTENT_PROJECTION_VARIANTS,
      trackByLabel: TRACK_BY_LABEL,
    },
    styles: [STORY_GRID_STYLES],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Modify search' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Contact call center' })).toBeInTheDocument();
  },
};
