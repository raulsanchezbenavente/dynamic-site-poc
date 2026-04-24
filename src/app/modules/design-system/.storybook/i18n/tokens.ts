import { InjectionToken } from '@angular/core';

export type StoryDictionary = Record<string, string>;

export const STORY_DICTIONARY = new InjectionToken<StoryDictionary>('STORY_DICTIONARY');
export const TRANSLATION_BASE_URL = new InjectionToken<string>('TRANSLATION_BASE_URL');
