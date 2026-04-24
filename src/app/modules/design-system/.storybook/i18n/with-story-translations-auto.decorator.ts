import { DecoratorFunction } from 'storybook/internal/types';

import { withStoryTranslations } from './with-story-translations.decorator';

/** Reads `parameters.i18n` so each story can choose between API and mock dictionaries. */
export const withStoryTranslationsAuto: DecoratorFunction = (storyFn, context) => {
  const optsFromStory = context.parameters?.['i18n'];

  if (!optsFromStory) return storyFn();

  const normalized = {
    api: false,
    ...optsFromStory,
  };

  const run = withStoryTranslations(normalized);
  return run(storyFn, context);
};
