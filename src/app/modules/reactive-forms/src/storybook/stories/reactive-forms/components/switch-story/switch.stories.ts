import { TranslateModule } from '@ngx-translate/core';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfSwitchComponent } from '../../../../../public-api';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { SwitchStoryComponent } from './switch-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfSwitchComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfSwitch',
  component: RfSwitchComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<switch-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        SwitchStoryComponent,
        RfSwitchComponent,
        FormValidationFeaturesComponent,
        HoverOpacityDirective,
        TranslateModule,
      ],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<SwitchStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
