import { JsonPipe } from '@angular/common';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { GridBuilderComponent } from '../../../../../lib';
import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { SummaryBuilderStoryComponent } from './summary-builder-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<SummaryBuilderStoryComponent> = {
  title: 'Main/Reactive Forms/Form Summary/Using DsSummaryBuilder',
  component: SummaryBuilderStoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<summary-builder-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        SummaryBuilderStoryComponent,
        FormValidationFeaturesComponent,
        HoverOpacityDirective,
        RfFormBuilderComponent,
        GridBuilderComponent,
        JsonPipe,
      ],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SummaryBuilderStoryComponent>;

export const DEFAULT: Story = {
  name: 'Custom Templates',
  args: {},
};
