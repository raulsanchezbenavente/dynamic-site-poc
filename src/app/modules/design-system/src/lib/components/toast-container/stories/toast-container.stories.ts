import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { ToastContainerStoryHostComponent } from '../../toast/stories/toast-container.story-host.component';

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
    i18nModules: ['Common.Close', 'Common.A11y.Status_Icon'],
    i18n: {
      mock: {
        'Common.Close': 'Close',
        'Common.A11y.Status_Icon.Success': 'Success',
        'Common.A11y.Status_Icon.Error': 'Error',
        'Common.A11y.Status_Icon.Info': 'Information',
        'Common.A11y.Status_Icon.Warning': 'Warning',
      },
    },
  },
};

export default META;
type Story = StoryObj<ToastContainerStoryHostComponent>;

export const CONTAINER_SLOTS: Story = {
  name: 'Container Slots',
};
