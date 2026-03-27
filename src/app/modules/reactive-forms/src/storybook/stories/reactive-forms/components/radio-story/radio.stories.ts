import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfRadioComponent } from '../../../../../lib/components/rf-radio/rf-radio.component';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { RadioStoryComponent } from './radio-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfRadioComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfRadio',
  component: RfRadioComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<radio-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [RadioStoryComponent, RfReactiveFormsModule, FormValidationFeaturesComponent, HoverOpacityDirective],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<RadioStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
