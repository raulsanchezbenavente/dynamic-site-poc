import { addons } from '@storybook/manager-api';
import nsStorybookTheme from './ns-storybook-theme';

addons.setConfig({
  theme: nsStorybookTheme,
});