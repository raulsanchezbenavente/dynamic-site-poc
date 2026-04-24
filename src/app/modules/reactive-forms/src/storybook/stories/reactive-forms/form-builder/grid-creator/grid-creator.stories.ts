import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfFormBuilderComponent } from '../../../../../lib/form-builder/rf-form-builder/rf-form-builder.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { GridCreatorStoryComponent } from './grid-creator-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<GridCreatorStoryComponent> = {
  title: 'Main/Reactive Forms/Form & Grid Builders/Form Builder (Dynamic Content)',
  component: GridCreatorStoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<grid-creator-story [columns]="columns" />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        GridCreatorStoryComponent,
        FormValidationFeaturesComponent,
        HoverOpacityDirective,
        RfFormBuilderComponent,
      ],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<GridCreatorStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    columns: 2,
  },
};
