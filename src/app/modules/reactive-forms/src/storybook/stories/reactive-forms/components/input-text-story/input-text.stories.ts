import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfInputTextComponent } from '../../../../../public-api';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { InputTextStoryComponent } from './input-text-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfInputTextComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfInputText',
  component: RfInputTextComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<input-text-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [RfInputTextComponent, InputTextStoryComponent, FormValidationFeaturesComponent, HoverOpacityDirective],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<InputTextStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
