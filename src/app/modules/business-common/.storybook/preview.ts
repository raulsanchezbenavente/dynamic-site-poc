import { type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { sharedPreviewConfig, sharedInitialGlobals } from '@dcx/ui/storybook-utils';
import { withI18nAutoHost } from '@dcx/ui/storybook-i18n';

setCompodocJson(docJson);

const preview: Preview = {
  ...sharedPreviewConfig,
  // Add module-specific decorator
  decorators: [
    ...(Array.isArray(sharedPreviewConfig.decorators) ? sharedPreviewConfig.decorators : []),
    withI18nAutoHost,
  ],
  // Override storySort order to include 'Components'
  parameters: {
    ...sharedPreviewConfig.parameters,
    options: {
      storySort: {
        method: 'alphabetical' as const,
        includeNames: true,
        order: ['Overview', 'Guidelines', 'Components', 'Atoms', 'Molecules', 'Organisms', 'Main'],
        locales: 'en-US',
      },
    },
  },
  initialGlobals: sharedInitialGlobals,
};

export default preview;
