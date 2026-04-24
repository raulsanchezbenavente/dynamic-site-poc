import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { type Preview } from '@storybook/angular';
import { themes } from '@storybook/theming';

import '@angular/localize/init';
import { sharedPreviewConfig, sharedInitialGlobals, registerAllLocales } from '@dcx/ui/storybook-utils';
import { withI18nAutoHost } from '@dcx/ui/storybook-i18n';

registerAllLocales();
setCompodocJson(docJson);

const preview: Preview = {
  ...sharedPreviewConfig,
  // Add design-system specific decorator
  decorators: [
    ...(Array.isArray(sharedPreviewConfig.decorators) ? sharedPreviewConfig.decorators : []),
    withI18nAutoHost,
  ],
  // Extend shared parameters with design-system specific config
  parameters: {
    ...sharedPreviewConfig.parameters,
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.light },
      stylePreview: true,
      darkClass: 'dark',
    },
    options: {
      storySort: {
        method: 'alphabetical' as const,
        includeNames: true,
        order: ['Start', 'Overview', 'Guidelines', 'Atoms', 'Molecules', 'Organisms', 'Main'],
        locales: 'en-US',
      },
    },
  },
  initialGlobals: sharedInitialGlobals,
};

export default preview;
