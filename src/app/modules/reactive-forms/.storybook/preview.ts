import '@angular/localize/init';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { applicationConfig, type Preview } from '@storybook/angular';
import docJson from '../documentation.json';
import { STORYBOOK_ENVIRONMENT_PROVIDERS } from '../src/storybook/providers/storybook.provider';

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: STORYBOOK_ENVIRONMENT_PROVIDERS,
    }),
  ],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical' as const,
        order: ['Overview', 'Guidelines', 'Atoms', 'Molecules', 'Organisms', 'Main'],
        locales: 'en-US',
      },
    },
  },
};

export default preview;
