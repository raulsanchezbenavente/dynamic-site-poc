import { ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { RfInputTextComponent } from '../../../../lib/components/rf-input-text/rf-input-text.component';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.provider';

import { FormStoreStoryComponent } from './form-store-story.component';

const META: Meta<FormStoreStoryComponent> = {
  title: 'Main/Reactive Forms/RfFormStore (Store Demo)',
  component: FormStoreStoryComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, RfInputTextComponent],
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
