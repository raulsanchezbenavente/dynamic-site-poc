import type { StorybookConfig } from '@storybook/angular';
const config: StorybookConfig = {
  stories: [
    '../src/storybook/Introduction.mdx',
    '../src/storybook/Changelog.mdx',
    '../src/storybook/stories/reactive-forms/components/abstract/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/checkbox-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/datepicker-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/input-datepicker-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/input-text-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/list-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/prefix-phone-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/radio-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/select-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/select-date-picker-story/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybook/stories/reactive-forms/components/switch-story/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: [{ from: '../../design-system/assets/', to: '/assets' }],
};
export default config;
