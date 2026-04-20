import { create } from '@storybook/theming/create';
const logoUrl = '/assets/ui_plus/imgs/logos/avianca-logo.svg';

export default create({
  // Typography
  fontBase: '"Red Hat Display", Arial, Helvetica, sans-serif',
  fontCode: 'monospace',

  // Brand
  brandTitle: 'Avianca Design System',
  brandUrl: 'https://www.avianca.es',
  brandImage: logoUrl,
  brandTarget: '_blank',

  // Colors
  colorPrimary: '#1B1B1B',
  colorSecondary: '#1B1B1B',

  // UI
  appBg: '#f3f3f3',
  appContentBg: '#f3f3f3',
  appBorderColor: '#dddddd',
  appBorderRadius: 4,

  // Text colors
  textColor: '#1B1B1B',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#888888',
  barSelectedColor: '#111111',
  barHoverColor: '#000',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#111111',
  inputTextColor: '#111111',
  inputBorderRadius: 2,
});
