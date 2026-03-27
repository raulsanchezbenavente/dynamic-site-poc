import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfCheckboxComponent } from '../../../../../public-api';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { CheckboxStoryComponent } from './checkbox-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfCheckboxComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfCheckbox',
  component: RfCheckboxComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<checkbox-story />`,
  }),
  decorators: [
    moduleMetadata({
      imports: [CheckboxStoryComponent, RfCheckboxComponent, FormValidationFeaturesComponent, HoverOpacityDirective],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<CheckboxStoryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
