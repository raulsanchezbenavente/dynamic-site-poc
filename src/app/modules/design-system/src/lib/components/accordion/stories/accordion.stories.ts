import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { AccordionComponent } from '../accordion.component';

import { STORYBOOK_PROVIDERS } from './providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<AccordionComponent> = {
  title: 'Molecules/Accordion',
  component: AccordionComponent,
  parameters: {
    i18n: {
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      providers: STORYBOOK_PROVIDERS,
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default META;
type Story = StoryObj<AccordionComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
