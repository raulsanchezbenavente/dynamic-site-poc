import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    'storybook-dark-mode',
    'storybook-addon-deep-controls',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {},
  staticDirs: [
    '../../../static',
    { from: '../assets/ui_plus/icons/webfonts/', to: '/icons' },
    { from: '../assets', to: '/assets' },
  ],
};
export default config;
