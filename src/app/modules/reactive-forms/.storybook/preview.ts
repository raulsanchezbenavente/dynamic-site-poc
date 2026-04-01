import { type Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import '@angular/localize/init';
import { STORYBOOK_ENVIRONMENT_PROVIDERS } from '../src/storybook/providers/storybook.provider';
import { sharedPreviewConfig, sharedInitialGlobals } from '@dcx/ui/storybook-utils';

setCompodocJson(docJson);

const preview: Preview = {
  ...sharedPreviewConfig,
  decorators: [
    ...(Array.isArray(sharedPreviewConfig.decorators) ? sharedPreviewConfig.decorators : []),
    applicationConfig({
      providers: STORYBOOK_ENVIRONMENT_PROVIDERS,
    }),
  ],
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
