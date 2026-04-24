import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfPrefixPhoneComponent } from '../../../../../public-api';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';

import { PrefixPhoneDefaultDirective } from './configDirectives/prefix-phone-default.directive';
import { PrefixPhoneStoryComponent } from './prefix-phone-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfPrefixPhoneComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfPrefixPhone',
  component: RfPrefixPhoneComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<prefix-phone-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        PrefixPhoneStoryComponent,
        RfPrefixPhoneComponent,
        FormValidationFeaturesComponent,
        HoverOpacityDirective,
        PrefixPhoneDefaultDirective,
      ],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<PrefixPhoneStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
