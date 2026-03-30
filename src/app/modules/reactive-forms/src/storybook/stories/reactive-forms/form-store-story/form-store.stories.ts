import { ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../lib/standalone-imports';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.provider';

import { FormStoreStoryComponent } from './form-store-story.component';

const META: Meta<FormStoreStoryComponent> = {
  title: 'Main/Reactive Forms/RfFormStore (Store Demo)',
  component: FormStoreStoryComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
};

export default META;
type Story = StoryObj<FormStoreStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
