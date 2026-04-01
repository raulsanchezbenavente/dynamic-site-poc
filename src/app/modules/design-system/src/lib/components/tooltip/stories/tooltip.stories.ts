import { IconComponent, TooltipComponent } from '@dcx/storybook/design-system';
import { DsNgbTriggerEvent } from '@dcx/ui/libs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<TooltipComponent> = {
  title: 'Atoms/Tooltip',
  component: TooltipComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgbModule, TooltipComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<TooltipComponent>;

export const TOOLTIP_VARIATIONS: Story = {
  name: 'Tooltip Variations',
  args: {
    config: {
      triggerText: 'Why check-in is not available?',
      text: 'Online check-in is available exclusively within the 24-hour preceding the flight.',
      triggerEvent: DsNgbTriggerEvent.CLICK,
    },
  },
  render: () => ({
    template: `
      <h1 class="context-h2">Default Config</h1>
      <div style="display:flex; flex-wrap: wrap; gap: 16px;">
        Example of default tooltip config. <tooltip [config]="config"></tooltip>
      </div>

      <h1 class="context-h2">Icon Only</h1>
      Example of an icon only (info) tooltip<tooltip [config]="configIconOnly"></tooltip>
    `,
    props: {
      config: {
        ...TOOLTIP_VARIATIONS.args?.config,
      },
      configIconOnly: {
        ...TOOLTIP_VARIATIONS.args?.config,
        iconOnly: true,
      },
    },
  }),
};

export const TOOLTIP_PLACEMENTS: Story = {
  name: 'Tooltip Placements',
  render: () => ({
    template: `
      <div style="display:flex; align-items: center; flex-direction: column; padding: 60px; gap: 24px;">
        <div>
            <tooltip [config]="configTop"></tooltip>
        </div>
        <div>
            <tooltip [config]="configBottom"></tooltip>
        </div>
        <div>
            <tooltip [config]="configLeft"></tooltip>
        </div>
        <div>
            <tooltip [config]="configRight"></tooltip>
        </div>
        <div style="display: flex; align-items: center">
          Open tooltip on top right <tooltip [config]="configTopRight"></tooltip>
        </div>
        <div style="display: flex; align-items: center">
          Open tooltip on top left <tooltip [config]="configTopLeft"></tooltip>
        </div>
        <div style="display: flex; align-items: center">
          Open tooltip on bottom left <tooltip [config]="configBottomLeft"></tooltip>
        </div>
        <div style="display: flex; align-items: center">
          Open tooltip on bottom right <tooltip [config]="configBottomRight"></tooltip>
        </div>
      </div>
    `,
    props: {
      configTop: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on top',
        text: 'Have a great flight!',
        placement: 'top auto',
      },
      configBottom: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on bottom',
        text: 'Have a great flight!',
        placement: 'bottom auto',
      },
      configLeft: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on left (start)',
        text: 'Have a great flight!',
        placement: 'start auto',
      },
      configRight: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on right (end)',
        text: 'Have a great flight!',
        placement: 'end auto',
      },
      configTopRight: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on top right (end)',
        text: 'Have a great flight!',
        placement: 'top-end',
        iconOnly: true,
      },
      configTopLeft: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on top left (end)',
        text: 'Have a great flight!',
        placement: 'top-start',
        iconOnly: true,
      },
      configBottomRight: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on bottom right (end)',
        text: 'Have a great flight!',
        placement: 'bottom-end',
        iconOnly: true,
      },
      configBottomLeft: {
        triggerEvent: DsNgbTriggerEvent.CLICK,
        triggerText: 'Open tooltip on bottom left (end)',
        text: 'Have a great flight!',
        placement: 'bottom-start',
        iconOnly: true,
      },
    },
  }),
};
