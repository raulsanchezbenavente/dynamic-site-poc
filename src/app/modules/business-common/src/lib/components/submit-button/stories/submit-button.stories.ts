
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { ActionType } from '../enums/action-type.enum';
import { SubmitButtonRedirectType } from '../enums/submit-button-redirect-type.enum';
import { SubmitButtonComponent } from '../submit-button.component';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<SubmitButtonComponent> = {
  title: 'Components/Submit Button',
  component: SubmitButtonComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [SubmitButtonComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SubmitButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      label: 'Next',
      redirectType: SubmitButtonRedirectType.EXTERNAL,
      submitType: ActionType.NONE,
      redirectUrl: 'https://www.example.com',
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.PRIMARY,
      }
    },
  },
};

export const INTERNAL_REDIRECT: Story = {
  name: 'SubmitAll - Internal',
  args: {
    config: {
      label: 'next',
      redirectType: SubmitButtonRedirectType.INTERNAL,
      redirectUrl: 'test',
      submitType: ActionType.ALL,
      submitOrder: [],
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.SECONDARY,
      }
    },
  },
};

export const EXTERNAL_REDIRECT: Story = {
  name: 'SubmitAll - External',
  args: {
    config: {
      label: 'next',
      redirectType: SubmitButtonRedirectType.EXTERNAL,
      redirectUrl: 'https://www.google.com',
      submitType: ActionType.ALL,
      submitOrder: [],
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.SECONDARY,
      }
    },
  },
};

export const ONLY_REDIRECT_EXTERNAL: Story = {
  name: 'OnlyRedirect - External',
  args: {
    config: DEFAULT.args!.config!,
  },
};

export const ONLY_REDIRECT_INTERNAL: Story = {
  name: 'OnlyRedirect - Internal',
  args: {
    config: {
      ...DEFAULT.args!.config!,
      redirectUrl: '/?path=/docs/components-submit-button--docs',
      redirectType: SubmitButtonRedirectType.INTERNAL,
    },
  },
};
