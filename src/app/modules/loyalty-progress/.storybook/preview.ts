import { type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { createSharedDecorators, sharedParameters, sharedInitialGlobals } from '@dcx/ui/storybook-utils';
import { withI18nAutoHost } from '@dcx/ui/storybook-i18n';
import { STORYBOOK_PROVIDERS } from '../src/lib/stories/providers/storybook.provider';

setCompodocJson(docJson);

const decorators = createSharedDecorators(
  STORYBOOK_PROVIDERS,
  [withI18nAutoHost]
);

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
  initialGlobals: sharedInitialGlobals,
};

export default preview;
