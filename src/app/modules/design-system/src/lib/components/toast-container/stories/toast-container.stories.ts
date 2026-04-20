import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { ToastContainerStoryHostComponent } from '../../toast/stories/toast-container.story-host.component';
import { CommonTranslationKeys } from '@dcx/ui/libs';

const META: Meta<ToastContainerStoryHostComponent> = {
  title: 'Atoms/Toast/Toast Container',
  component: ToastContainerStoryHostComponent,
  decorators: [
    moduleMetadata({
      imports: [ToastContainerStoryHostComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
  render: (args) => ({ props: { ...args } }),
  parameters: {
    controls: { hideNoControlsWarning: true },
    i18nModules: [CommonTranslationKeys.Common_Close, 'Common.A11y.Status_Icon'],
    i18n: {
      mock: {
        [CommonTranslationKeys.Common_Close]: 'Close',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Success]: 'Success',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Error]: 'Error',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Info]: 'Information',
        [CommonTranslationKeys.Common_A11y_Status_Icon_Warning]: 'Warning',
      },
    },
  },
};

export default META;
type Story = StoryObj<ToastContainerStoryHostComponent>;

export const CONTAINER_SLOTS: Story = {
  name: 'Container Slots',
};
