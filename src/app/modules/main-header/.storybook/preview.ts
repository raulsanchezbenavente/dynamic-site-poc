import { type Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { createSharedDecorators, sharedParameters, sharedInitialGlobals } from '@dcx/ui/storybook-utils';
import { withI18nAutoHost } from '@dcx/ui/storybook-i18n';
import { AuthService } from '@dcx/ui/libs';
import { AUTH_STORYBOOK_PROVIDERS, StorybookAuthServiceMock } from '@dcx/ui/storybook-session';
import { STORYBOOK_PROVIDERS } from '../src/lib/stories/providers/storybook.providers';

setCompodocJson(docJson);

const decorators = createSharedDecorators(
  [
    ...STORYBOOK_PROVIDERS,
    ...AUTH_STORYBOOK_PROVIDERS,
    { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 0 }) },
  ],
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
