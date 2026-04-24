import { AlertPanelComponent, PriceCurrencyComponent } from '@dcx/storybook/design-system';
import { CommonTranslationKeys } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { AlertPanelType } from '../enums/alert-panel-type.enum';
import type { AlertPanelConfig } from '../models/alert-panel.config';

const PANEL_STACK_STYLES = 'display:flex; flex-direction: column; gap: 16px; width: 100%;';

const STATUS_VARIANTS: ReadonlyArray<AlertPanelConfig> = [
  {
    title: 'Check-In Completed',
    description: 'You have successfully checked in. Your <a href="#">boarding pass</a> is ready for download.',
    alertType: AlertPanelType.SUCCESS,
  },
  {
    title: 'Payment Declined',
    description: 'We were unable to process your payment. Please check your card details and try again.',
    alertType: AlertPanelType.ERROR,
  },
  {
    title: 'Travel Restrictions Update',
    description: 'Your destination updated its entry requirements. Review the latest guidelines before your trip.',
    alertType: AlertPanelType.INFO,
  },
  {
    title: 'Seat Selection Required',
    description: 'Please select a seat before completing your check-in to proceed.',
    alertType: AlertPanelType.WARNING,
  },
  {
    title: 'Online Check-In Unavailable',
    description: 'Online check-in is not available for your flight. Please check in at the airport counter.',
    alertType: AlertPanelType.NEUTRAL,
  },
];

type PlaygroundArgs = {
  title: string;
  description: string;
  alertType: AlertPanelType;
  ariaLabelledBy: string;
};

const PLAYGROUND_DEFAULT_ARGS: PlaygroundArgs = {
  title: 'Seat selection required',
  description: 'Please select a seat before completing your check-in to proceed.',
  alertType: AlertPanelType.WARNING,
  ariaLabelledBy: '',
};

const META: Meta<AlertPanelComponent> = {
  title: 'Atoms/Alert Panel',
  component: AlertPanelComponent,
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: false,
      mock: {
        [CommonTranslationKeys.Common_A11y_Status_Icon_Warning]: 'Warning icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Success]: 'Success icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Error]: 'Error icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Info]: 'Info icon',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Disabled]: 'Disabled icon',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AlertPanelComponent, PriceCurrencyComponent],
      providers: [...STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AlertPanelComponent>;

const renderVariants = (variants: ReadonlyArray<AlertPanelConfig>, content?: string): Story['render'] => {
  return () => ({
    component: AlertPanelComponent,
    template: `
      <div style="${PANEL_STACK_STYLES}">
        @for (variant of variants; track variant.title) {
          <alert-panel [config]="variant">
            ${content ?? ''}
          </alert-panel>
        }
      </div>
    `,
    props: {
      variants,
    },
  });
};

export const STATUSES: Story = {
  name: 'Alert statuses',
  render: renderVariants(STATUS_VARIANTS),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for translations to load and panels to render
    let panels: HTMLElement[] = [];
    await waitFor(() => {
      panels = canvas.getAllByRole('alert');
      expect(panels).toHaveLength(STATUS_VARIANTS.length);
    });
    // Verify correct CSS classes for reordered statuses: Success, Error, Info, Warning, Neutral
    await expect(panels[0]).toHaveClass('alert-panel-type--success');
    await expect(panels[1]).toHaveClass('alert-panel-type--error');
    await expect(panels[2]).toHaveClass('alert-panel-type--info');
    await expect(panels[3]).toHaveClass('alert-panel-type--warning');
    await expect(panels[4]).toHaveClass('alert-panel-type--neutral');
  },
};

export const CONTENT_VARIANTS: Story = {
  name: 'Content variants',
  render: () => ({
    component: AlertPanelComponent,
    template: `
      <div style="${PANEL_STACK_STYLES}">
        <alert-panel [config]="titleOnly"></alert-panel>
        <alert-panel [config]="descriptionOnly"></alert-panel>
        <alert-panel [config]="withProjectedContent">
          <div style="display: flex; gap: 2px; align-items: center;">
            <span>Choose your preferred seat from the available options, starting with:</span>
            <price-currency [price]="25" [currency]="'EUR'" />
          </div>
          <div>Example, use of content projection (price-currency)</div>
        </alert-panel>
      </div>
    `,
    props: {
      titleOnly: {
        title: 'Online Check-In Unavailable',
      },
      descriptionOnly: {
        description:
          'Si hay una diferencia entre la información registrada y la enviada en el archivo adjunto, deberás actualizar el documento antes de finalizar el proceso. Esta validación puede tardar unos minutos.',
      },
      withProjectedContent: {
        title: 'Seat Selection',
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for panels to render
    let panels: HTMLElement[] = [];
    await waitFor(() => {
      panels = canvas.getAllByRole('alert');
      expect(panels).toHaveLength(3);
    });

    // Verify neutral type is applied by default to all panels
    await expect(panels[0]).toHaveClass('alert-panel-type--neutral');
    await expect(panels[1]).toHaveClass('alert-panel-type--neutral');
    await expect(panels[2]).toHaveClass('alert-panel-type--neutral');
  },
};

export const WITH_CUSTOM_ID: Story = {
  name: 'With custom ID',
  render: () => ({
    component: AlertPanelComponent,
    template: `
      <div style="max-width: 560px; display: flex; flex-direction: column; gap: 54px;">
        <div>
          <p style="margin-bottom: 12px;">
            <strong>Example:</strong> Parent controls the ID for accessibility linking.
          </p>
          <alert-panel
            [id]="'customAlertId'"
            [config]="{
              title: 'Important Notice',
              description: 'This alert has a custom ID that can be referenced by other elements.',
              alertType: 'warning'
            }">
          </alert-panel>
          <div aria-labelledby="customAlertId" style="color: #666; margin-top: 8px; padding: 16px; border: 2px dashed #ccc; border-radius: 4px;">
              This container is labeled by the alert panel below using <code>aria-labelledby="customAlertId"</code>
          </div>
        </div>

        <div>
          <p style="margin-bottom: 12px;">
            <strong>Without ID:</strong> Alert panel without custom ID.
          </p>
          <alert-panel
            [config]="{
              title: 'Standard Alert',
              description: 'This alert does not have a custom ID.',
              alertType: 'info'
            }">
          </alert-panel>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for panels to render
    let panels: HTMLElement[] = [];
    await waitFor(() => {
      panels = canvas.getAllByRole('alert');
      expect(panels).toHaveLength(2);
    });

    // Verify first panel has custom ID
    await expect(panels[0]).toHaveAttribute('id', 'customAlertId');

    // Verify aria-labelledby references the custom ID
    const labeledContainer = canvasElement.querySelector('[aria-labelledby="customAlertId"]');
    await expect(labeledContainer).toBeTruthy();

    // Verify second panel has no ID
    await expect(panels[1]).not.toHaveAttribute('id');
  },
};

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'centered',
  },
  args: PLAYGROUND_DEFAULT_ARGS as Record<string, unknown>,
  argTypes: {
    title: {
      control: 'text',
      name: 'Title',
      description: 'Heading displayed at the top of the alert panel.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    description: {
      control: 'text',
      name: 'Description',
      description: 'Body copy rendered below the title. HTML is supported.',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    alertType: {
      control: 'select',
      options: Object.values(AlertPanelType),
      name: 'Alert type',
      description: 'Semantic status that drives iconography and colors.',
      table: {
        category: 'Appearance',
        type: { summary: 'AlertPanelType' },
      },
    },
    ariaLabelledBy: {
      control: 'text',
      name: 'ARIA labelledby',
      description: 'Reference ID if another element labels the alert.',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    config: {
      table: { disable: true },
    },
    alertPanelId: {
      table: { disable: true },
    },
    internalInit: {
      table: { disable: true },
    },
    ngOnInit: {
      table: { disable: true },
    },
    initDefaultConfiguration: {
      table: { disable: true },
    },
  } as Record<string, unknown>,
  render: (rawArgs) => {
    const args = rawArgs as unknown as PlaygroundArgs;
    const config = mapArgsToConfig(args);

    return {
      component: AlertPanelComponent,
      template: `
        <div style="max-width: 560px;">
          <alert-panel [config]="config"></alert-panel>
        </div>
      `,
      props: {
        config,
      },
    };
  },
};

function mapArgsToConfig(args: PlaygroundArgs): AlertPanelConfig {
  const mappedConfig: AlertPanelConfig = {
    title: args.title,
    description: args.description,
    alertType: args.alertType,
  };

  if (args.ariaLabelledBy) {
    mappedConfig.ariaAttributes = {
      ariaLabelledBy: args.ariaLabelledBy,
    };
  }

  return mappedConfig;
}
