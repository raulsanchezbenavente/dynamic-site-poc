import {
  ExpansionPanelComponent,
  PanelAppearance,
} from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { provideAnimations } from '@angular/platform-browser/animations';

const META: Meta<ExpansionPanelComponent> = {
  title: 'Molecules/ExpansionPanel',
  component: ExpansionPanelComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ExpansionPanelComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default META;
type Story = StoryObj<ExpansionPanelComponent>;

const RENDER_TEMPLATE = (args: ExpansionPanelComponent['config']) => ({
  props: { config: args },
  template: `
    <expansion-panel [config]="config">
      <p style="margin: 0">This is mock projected content inside the panel.</p>
    </expansion-panel>
  `,
});

export const START_COLLAPSED: Story = {
  name: 'Start collapsed',
  render: () =>
    RENDER_TEMPLATE({
      isCollapsible: true,
      isExpanded: false,
      panel: {
        appearance: PanelAppearance.SHADOW,
        title: 'Expansion panel',
        description: 'Description for Action Panel',
        icon: {
          name: 'email',
          ariaAttributes: {
            ariaLabel: 'email icon',
          },
        },
      },
    }),
};

export const START_OPENED: Story = {
  name: 'Start opened',
  render: () =>
    RENDER_TEMPLATE({
      isCollapsible: true,
      isExpanded: true,
      panel: {
        appearance: PanelAppearance.SHADOW,
        title: 'Expansion panel',
        description: 'Description for Action Panel',
        icon: {
          name: 'email',
          ariaAttributes: {
            ariaLabel: 'email icon',
          },
        },
      },
    }),
};
