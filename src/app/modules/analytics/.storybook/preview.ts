import { type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { sharedPreviewConfig, sharedInitialGlobals } from '@dcx/ui/storybook-utils';

setCompodocJson(docJson);

const preview: Preview = {
  ...sharedPreviewConfig,
  parameters: {
    ...sharedPreviewConfig.parameters,
    options: {
      storySort: {
        method: 'alphabetical' as const,
        order: ['Overview', 'Guidelines', 'Atoms', 'Molecules', 'Organisms', 'Main'],
        locales: 'en-US',
      },
    },
  },
  initialGlobals: sharedInitialGlobals,
};

export default preview;
