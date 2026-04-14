import { type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { createSharedDecorators, sharedParameters } from '@dcx/ui/storybook-utils';

setCompodocJson(docJson);

const decorators = createSharedDecorators();

const preview: Preview = {
  decorators,
  parameters: {
    ...sharedParameters,
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
