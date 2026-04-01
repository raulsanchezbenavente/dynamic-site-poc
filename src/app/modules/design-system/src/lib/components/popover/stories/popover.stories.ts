import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import type { OffCanvasConfig, PopoverConfig } from '@dcx/storybook/design-system';
import { PopoverComponent, PopoverContentDirective, PopoverTriggerDirective } from '@dcx/storybook/design-system';
import { DsNgbTriggerEvent } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

interface PopoverStoryVariant {
  label: string;
  description: string;
  triggerLabel?: string;
  config: PopoverConfig;
  offCanvasConfig?: OffCanvasConfig;
  useCustomHandler?: boolean;
}

@Component({
  selector: 'storybook-popover-grid',
  template: `
    <div class="dcx-story-grid">
      <div
        *ngFor="let variant of variants; trackBy: trackByLabel"
        class="dcx-story-card">
        <h4 class="dcx-story-heading">{{ variant.label }}</h4>
        <p
          *ngIf="variant.description"
          class="dcx-story-description">
          {{ variant.description }}
        </p>
        <div class="dcx-story-meta">
          <div class="dcx-story-meta__item">
            <span class="dcx-story-meta__label">Mode</span>
            <span>{{ resolveModeLabel(variant) }}</span>
          </div>
          <div class="dcx-story-meta__item">
            <span class="dcx-story-meta__label">Placement</span>
            <span>{{ resolvePlacementLabel(variant) }}</span>
          </div>
          <div class="dcx-story-meta__item">
            <span class="dcx-story-meta__label">Trigger</span>
            <span>{{ resolveTriggerLabel(variant) }}</span>
          </div>
          <div class="dcx-story-meta__item">
            <span class="dcx-story-meta__label">ARIA-LABEL</span>
            <span>{{ resolveAriaLabel(variant) }}</span>
          </div>
        </div>
        <popover
          class="storybook-popover"
          [config]="variant.config"
          [offCanvasConfig]="resolveOffCanvasConfig(variant)"
          [customClickHandlerWhenHover]="variant.useCustomHandler ? handleHoverClick : undefined">
          <button
            *ngIf="!variant.config.iconTrigger"
            type="button"
            class="ds-button ds-btn-secondary"
            popoverTrigger>
            {{ variant.triggerLabel || 'Open popover' }}
          </button>
          <div
            popoverContent
            class="storybook-popover__content">
            <h5 class="ds-heading-05">{{ variant.config.popoverHeaderConfig?.title || 'Popover details' }}</h5>
            <p class="ds-body-02">
              Seat selection, baggage allowances, and support perks are summarized inside the panel so travelers can
              decide quickly.
            </p>
            <ul>
              <li>1 carry-on bag included</li>
              <li>Priority boarding upgrade</li>
              <li>Live chat assistance</li>
            </ul>
            <a
              href="#"
              class="ds-button ds-btn-link"
              >View fare rules</a
            >
          </div>
        </popover>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, PopoverComponent, PopoverTriggerDirective, PopoverContentDirective],
})
class StorybookPopoverGridComponent {
  @Input({ required: true }) public variants!: ReadonlyArray<PopoverStoryVariant>;

  public handleHoverClick(): void {
    alert('Custom hover handler fired');
  }

  public resolveOffCanvasConfig(variant: PopoverStoryVariant): OffCanvasConfig | undefined {
    if (variant.offCanvasConfig) {
      return variant.offCanvasConfig;
    }

    if (!variant.config.responsiveOffCanvas) {
      return undefined;
    }

    const fallbackTitle = variant.config.popoverHeaderConfig?.title ?? 'Popover';
    return {
      offCanvasHeaderConfig: {
        title: fallbackTitle,
      },
    };
  }

  public resolveModeLabel(variant: PopoverStoryVariant): string {
    return variant.config.responsiveOffCanvas ? 'Responsive (inline + drawer)' : 'Inline panel only';
  }

  public resolvePlacementLabel(variant: PopoverStoryVariant): string {
    const placement = variant.config.placement ?? 'bottom';
    return `${placement.charAt(0).toUpperCase()}${placement.slice(1)} alignment`;
  }

  public resolveTriggerLabel(variant: PopoverStoryVariant): string {
    const trigger = variant.config.triggers ?? DsNgbTriggerEvent.CLICK;
    switch (trigger) {
      case DsNgbTriggerEvent.HOVER:
        return 'Hover';
      case DsNgbTriggerEvent.HOVER_CLICK:
        return 'Hover + click';
      default:
        return 'Click';
    }
  }

  public resolveAriaLabel(variant: PopoverStoryVariant): string {
    if (variant.config.triggerAriaLabel) {
      return variant.config.triggerAriaLabel;
    }

    if (variant.config.iconTrigger) {
      return 'Required when using icon trigger';
    }

    return variant.triggerLabel ?? 'Inherits trigger text';
  }

  protected trackByLabel(_: number, variant: PopoverStoryVariant): string {
    return variant.label;
  }
}

const META: Meta<PopoverComponent> = {
  title: 'Atoms/Popover',
  component: PopoverComponent,
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: true,
      mock: {},
    },
  },
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [StorybookPopoverGridComponent, PopoverContentDirective, PopoverTriggerDirective],
      providers: STORYBOOK_PROVIDERS,
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default META;
type Story = StoryObj;
type PlaygroundStory = StoryObj<Record<string, unknown>>;

interface PlaygroundArgs {
  headerTitle: string;
  headerSubtitle: string;
  description: string;
  triggerLabel: string;
  triggerAriaLabel: string;
  iconTrigger: boolean;
  responsiveOffCanvas: boolean;
  placement: 'top' | 'bottom' | 'start' | 'end';
  triggers: DsNgbTriggerEvent;
}

const PLAYGROUND_DEFAULTS: PlaygroundArgs = {
  headerTitle: 'Fare Conditions',
  headerSubtitle: 'Included services overview',
  description: 'Carry-on, checked bag, seat selection, and support channel specifics appear here.',
  triggerLabel: 'Inspect fare details',
  triggerAriaLabel: 'Inspect fare details',
  iconTrigger: false,
  responsiveOffCanvas: true,
  placement: 'bottom',
  triggers: DsNgbTriggerEvent.CLICK,
};

export const PLAYGROUND: PlaygroundStory = {
  name: 'Playground',
  parameters: {
    layout: 'centered',
  },
  args: { ...PLAYGROUND_DEFAULTS },
  argTypes: {
    headerTitle: {
      control: 'text',
      name: 'Header Title',
      description: 'Primary heading rendered inside the popover and off-canvas header.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.headerTitle },
      },
    },
    headerSubtitle: {
      control: 'text',
      name: 'Header Subtitle',
      description: 'Optional subtitle shown below the primary heading.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.headerSubtitle },
      },
    },
    description: {
      control: 'text',
      name: 'Body Description',
      description: 'Demo text rendered inside the projected content area.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.description },
      },
    },
    triggerLabel: {
      control: 'text',
      name: 'Trigger Label',
      description: 'Text for the trigger button when iconTrigger is false.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.triggerLabel },
      },
    },
    triggerAriaLabel: {
      control: 'text',
      name: 'Trigger Aria Label',
      description: 'Screen-reader label used when only the icon trigger is visible.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.triggerAriaLabel },
      },
    },
    iconTrigger: {
      control: 'boolean',
      name: 'Icon Trigger',
      description: 'Shows the information icon instead of the projected trigger button.',
      table: {
        category: 'Appearance',
        type: { summary: 'boolean' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.iconTrigger.toString() },
      },
    },
    responsiveOffCanvas: {
      control: 'boolean',
      name: 'Responsive Off-Canvas',
      description: 'Switches to the drawer layout when below the breakpoint.',
      table: {
        category: 'Layout',
        type: { summary: 'boolean' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.responsiveOffCanvas.toString() },
      },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'start', 'end'],
      name: 'Placement',
      description: 'Attachment point for the inline popover.',
      table: {
        category: 'Layout',
        type: { summary: '"top" | "bottom" | "start" | "end"' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.placement },
      },
    },
    triggers: {
      control: 'select',
      options: Object.values(DsNgbTriggerEvent),
      name: 'Trigger Mode',
      description: 'Determines whether the popover opens on click, hover, or both.',
      table: {
        category: 'Behavior',
        type: { summary: 'DsNgbTriggerEvent' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.triggers },
      },
    },
    config: { table: { disable: true } },
    offCanvasConfig: { table: { disable: true } },
    variants: { table: { disable: true } },
    customClickHandlerWhenHover: { table: { disable: true } },
  },
  render: (args) => {
    const customArgs = args as unknown as PlaygroundArgs;

    const headerConfig = {
      title: customArgs.headerTitle,
      subtitle: customArgs.headerSubtitle,
    };

    const config: PopoverConfig = {
      popoverHeaderConfig: headerConfig,
      responsiveOffCanvas: customArgs.responsiveOffCanvas,
      iconTrigger: customArgs.iconTrigger,
      placement: customArgs.placement,
      triggerAriaLabel: customArgs.triggerAriaLabel,
      triggers: customArgs.triggers,
    };

    const offCanvasConfig: OffCanvasConfig | undefined = customArgs.responsiveOffCanvas
      ? {
          offCanvasHeaderConfig: headerConfig,
        }
      : undefined;

    return {
      props: {
        config,
        offCanvasConfig,
        description: customArgs.description,
        triggerLabel: customArgs.triggerLabel,
      },
      template: `
        <div style="display:flex; justify-content:center; padding:32px 0;">
          <popover
            [config]="config"
            [offCanvasConfig]="offCanvasConfig">
            <button
              *ngIf="!config.iconTrigger"
              type="button"
              class="ds-button ds-btn-secondary"
              popoverTrigger>
              {{ triggerLabel }}
            </button>
            <div popoverContent>
              <p class="ds-body-02">{{ description }}</p>
              <ul>
                <li>Carry-on allowance summary</li>
                <li>Seat selection policy</li>
                <li>Support channel availability</li>
              </ul>
            </div>
          </popover>
        </div>
      `,
    };
  },
};

const LAYOUT_VARIANTS: ReadonlyArray<PopoverStoryVariant> = [
  {
    label: 'Responsive layout',
    description: 'Switches to the off-canvas drawer below the popover breakpoint.',
    triggerLabel: 'Open responsive popover',
    config: {
      responsiveOffCanvas: true,
      placement: 'bottom',
      popoverHeaderConfig: {
        title: 'Plus fare benefits',
      },
    },
  },
  {
    label: 'Inline only',
    description: 'Forces the inline popover even when the viewport is narrow.',
    triggerLabel: 'Open inline popover',
    config: {
      responsiveOffCanvas: false,
      placement: 'bottom',
      popoverHeaderConfig: {
        title: 'Cabin policies',
      },
    },
  },
];

const TRIGGER_VARIANTS: ReadonlyArray<PopoverStoryVariant> = [
  {
    label: 'Icon trigger',
    description: 'Uses the built-in information glyph with an accessible aria-label.',
    config: {
      iconTrigger: true,
      responsiveOffCanvas: false,
      triggerAriaLabel: 'More cabin information',
      popoverHeaderConfig: {
        title: 'Cabin info',
      },
    },
  },
  {
    label: 'Hover trigger',
    description: 'Opens on hover but still supports keyboard activation and focus management.',
    triggerLabel: 'Hover to preview',
    config: {
      responsiveOffCanvas: false,
      triggers: DsNgbTriggerEvent.HOVER,
      popoverHeaderConfig: {
        title: 'Seat preview',
      },
    },
  },
  {
    label: 'Hover + click handler',
    description: 'Executes a custom handler before closing when triggered via hover.',
    triggerLabel: 'Run custom handler',
    config: {
      responsiveOffCanvas: false,
      triggers: DsNgbTriggerEvent.HOVER_CLICK,
      popoverHeaderConfig: {
        title: 'Ancillary upsell',
      },
    },
    useCustomHandler: true,
  },
];

const PLACEMENT_VARIANTS: ReadonlyArray<PopoverStoryVariant> = [
  {
    label: 'Start placement',
    description: 'Pins the popover near the start edge (left in LTR).',
    triggerLabel: 'Start aligned',
    config: {
      responsiveOffCanvas: false,
      placement: 'start',
      popoverHeaderConfig: {
        title: 'Boarding group info',
      },
    },
  },
  {
    label: 'Top placement',
    description: 'Displays the panel above the trigger.',
    triggerLabel: 'Top aligned',
    config: {
      responsiveOffCanvas: false,
      placement: 'top',
      popoverHeaderConfig: {
        title: 'Carry-on reminder',
      },
    },
  },
  {
    label: 'End placement',
    description: 'Anchors the popover to the end edge (right in LTR).',
    triggerLabel: 'End aligned',
    config: {
      responsiveOffCanvas: false,
      placement: 'end',
      popoverHeaderConfig: {
        title: 'Seat map tips',
      },
    },
  },
];

export const LAYOUTS: Story = {
  name: 'Responsive Layouts',
  render: () => ({
    props: {
      variants: LAYOUT_VARIANTS,
    },
    template: `
      <storybook-popover-grid [variants]="variants"></storybook-popover-grid>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and popovers to render
    await waitFor(() => {
      const popovers = canvasElement.querySelectorAll('popover');
      expect(popovers.length).toBe(LAYOUT_VARIANTS.length);
    });

    const triggers = canvas.getAllByRole('button', { name: /Open (responsive|inline) popover/i });
    await expect(triggers.length).toBe(LAYOUT_VARIANTS.length);
  },
};

export const TRIGGER_MODES: Story = {
  name: 'Trigger Modes',
  render: () => ({
    props: {
      variants: TRIGGER_VARIANTS,
    },
    template: `
      <storybook-popover-grid [variants]="variants"></storybook-popover-grid>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and trigger buttons to render
    await waitFor(() => {
      const hoverButton = canvas.getByRole('button', { name: /Hover to preview/i });
      expect(hoverButton).toBeInTheDocument();
    });

    const customHandlerButton = canvas.getByRole('button', { name: /Run custom handler/i });
    await expect(customHandlerButton).toBeInTheDocument();
    const iconTrigger = canvasElement.querySelector('[aria-label="More cabin information"]');
    expect(iconTrigger).not.toBeNull();
  },
};

export const PLACEMENTS: Story = {
  name: 'Placement Options',
  render: () => ({
    props: {
      variants: PLACEMENT_VARIANTS,
    },
    template: `
      <storybook-popover-grid [variants]="variants"></storybook-popover-grid>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and trigger buttons to render
    let triggers: HTMLElement[] = [];
    await waitFor(() => {
      triggers = canvas.getAllByRole('button', { name: /aligned/i });
      expect(triggers.length).toBe(PLACEMENT_VARIANTS.length);
    });
  },
};
