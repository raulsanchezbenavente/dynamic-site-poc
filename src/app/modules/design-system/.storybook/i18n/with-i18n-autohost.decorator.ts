import type { AngularRenderer } from '@storybook/angular';
import { DecoratorFunction } from 'storybook/internal/types';

import { I18nStoryHostComponent } from './i18n-story-host.component';

/**
 * Lazily wraps a story in <i18n-story-host> only if the story declares i18n.
 * Modules are read from `parameters.i18nModules` (string | string[]).
 *
 * Example per-story:
 *  export const MyStory = {
 *    parameters: { i18nModules: ['Common','Schedule'] }
 *  }
 */
export const withI18nAutoHost: DecoratorFunction<AngularRenderer> = (storyFn, context) => {
  const story = storyFn(context);

  // Detect whether this story actually requests i18n hosting
  const modsParam = context.parameters?.['i18nModules'];
  const hasI18n =
    (typeof modsParam === 'string' && modsParam.length > 0) || (Array.isArray(modsParam) && modsParam.length > 0);

  // No i18n requested → do nothing (no host, no directive)
  if (!hasI18n) {
    return story;
  }

  // Normalize to array for host input
  const modsArray = Array.isArray(modsParam) ? modsParam : [modsParam];
  const modsLiteral = JSON.stringify(modsArray);

  // Avoid double-wrapping if the story already uses the host explicitly
  const alreadyWrapped = typeof story.template === 'string' && story.template.includes('<i18n-story-host');

  // Ensure the host component is available
  const moduleMetadata = {
    ...(story.moduleMetadata || {}),
    imports: [...(story.moduleMetadata?.imports || []), I18nStoryHostComponent],
  };

  if (alreadyWrapped) {
    return { ...story, moduleMetadata };
  }

  // Wrap either the story's custom template or the auto <story/> projection
  const inner = story.template ?? '<story/>';
  const template = `
    <i18n-story-host [modules]='${modsLiteral}'>
      <ng-template #i18nStoryContent>
        ${inner}
      </ng-template>
    </i18n-story-host>
  `;

  return { ...story, template, moduleMetadata };
};
