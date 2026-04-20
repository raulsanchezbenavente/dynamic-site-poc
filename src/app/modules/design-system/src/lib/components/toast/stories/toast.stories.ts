import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { ToastStatus } from '../enums/toast-status.enum';
import type { Toast } from '../models/toast.model';
import { ToastComponent } from '../toast.component';
import { CommonTranslationKeys } from '@dcx/ui/libs';

const SUCCESS_CONFIG: Toast = {
  status: ToastStatus.SUCCESS,
  message: 'This is a success message.',
  autohide: false,
};

const INFO_CONFIG: Toast = {
  status: ToastStatus.INFO,
  message: 'This is an info message.',
  autohide: false,
};

const WARNING_CONFIG: Toast = {
  status: ToastStatus.WARNING,
  message: 'Your session will expire in 5 minutes. Please save your changes to avoid losing any unsaved information.',
  autohide: false,
};

const ERROR_CONFIG: Toast = {
  status: ToastStatus.ERROR,
  message: 'Sorry, payment could not be processed.',
  autohide: false,
};

const META: Meta<ToastComponent> = {
  title: 'Atoms/Toast/Toast',
  component: ToastComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
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
  decorators: [
    moduleMetadata({
      imports: [ToastComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
  argTypes: {
    config: { table: { disable: true } },
    toast: { table: { disable: true } },
    toastRef: { table: { disable: true } },
    hidden: { table: { disable: true } },
    iconConfig: { table: { disable: true } },
    closeIconButtonConfig: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    onHidden: { table: { disable: true } },
    onClose: { table: { disable: true } },
    open: { table: { disable: true } },
    close: { table: { disable: true } },
  },
};

export default META;
type Story = StoryObj<ToastComponent>;

export const STATUS: Story = {
  name: 'Status',
  render: () => ({
    template: `
      <div class="dcx-story-grid dcx-story-grid--rows" style="--dcx-story-grid-gap: 0; --dcx-story-card-rows-padding-bottom: 36px; --dcx-story-card-border: none;" >
        <div class="dcx-story-card" style="width: 100%;">
          <h3 class="dcx-story-heading">Success</h3>
          <p class="dcx-story-description">Confirms successful completion of an action.</p>
          <toast [config]="success" />
        </div>
        <div class="dcx-story-card" style="width: 100%;">
          <h3 class="dcx-story-heading">Info</h3>
          <p class="dcx-story-description">Provides neutral information or updates.</p>
          <toast [config]="info" />
        </div>
        <div class="dcx-story-card" style="width: 100%;">
          <h3 class="dcx-story-heading">Warning</h3>
          <p class="dcx-story-description">Alerts users to potential issues that need attention.</p>
          <toast [config]="warning" />
        </div>
        <div class="dcx-story-card" style="width: 100%;">
          <h3 class="dcx-story-heading">Error</h3>
          <p class="dcx-story-description">Indicates failed operations or critical problems.</p>
          <toast [config]="error" />
        </div>
      </div>
    `,
    props: {
      success: SUCCESS_CONFIG,
      info: INFO_CONFIG,
      warning: WARNING_CONFIG,
      error: ERROR_CONFIG,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);

    let TOASTS: HTMLElement[] = [];
    await waitFor(() => {
      TOASTS = CANVAS.getAllByRole('alert');
      expect(TOASTS).toHaveLength(4);
    });

    await expect(TOASTS[0]).toHaveClass('toast--success');
    await expect(TOASTS[1]).toHaveClass('toast--info');
    await expect(TOASTS[2]).toHaveClass('toast--warning');
    await expect(TOASTS[3]).toHaveClass('toast--error');
  },
};

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    message: 'Your changes have been saved successfully.',
    status: ToastStatus.SUCCESS,
    delay: 6000,
    autohide: false,
  } as Record<string, unknown>,
  argTypes: {
    message: {
      control: 'text',
      name: 'Message',
      description: 'The notification text displayed in the toast',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    status: {
      control: 'select',
      options: [ToastStatus.SUCCESS, ToastStatus.INFO, ToastStatus.WARNING, ToastStatus.ERROR],
      name: 'Status',
      description: 'The type of notification (success, info, warning, error)',
      table: {
        category: 'Appearance',
        type: { summary: 'ToastStatus' },
      },
    },
    delay: {
      control: { type: 'number', min: 0, step: 1000 },
      name: 'Delay',
      description: 'Auto-hide delay in milliseconds',
      table: {
        category: 'Behavior',
        type: { summary: 'number' },
        defaultValue: { summary: '6000' },
      },
    },
    autohide: {
      control: 'boolean',
      name: 'Auto Hide',
      description: 'Whether the toast automatically hides after the delay',
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  } as Record<string, unknown>,
  render: (args) => {
    const CUSTOM_ARGS = args as unknown as {
      message: string;
      status: ToastStatus;
      delay?: number;
      autohide?: boolean;
    };
    return {
      props: {
        config: {
          message: CUSTOM_ARGS.message,
          status: CUSTOM_ARGS.status,
          delay: CUSTOM_ARGS.delay,
          autohide: CUSTOM_ARGS.autohide,
        },
      },
    };
  },
};
