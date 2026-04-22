import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import { CommonTranslationKeys } from '@dcx/ui/libs';
import { type Meta, type StoryObj } from '@storybook/angular';

import { AccountProfileComponent } from '../account-profile.component';
import { TranslationKeys } from '../enums/translation-keys.enum';

// Todos los providers van al preview.ts para evitar conflictos con withStoryTranslationsAuto
const META: Meta<AccountProfileComponent> = {
  title: 'Main/Account Profile (Personal Data)',
  component: AccountProfileComponent,
  tags: ['autodocs'],
  render: (args): { props: Record<string, unknown> } => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {},
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['AccountProfile'],
    i18n: {
      mock: {
        [TranslationKeys.AccountProfile_PersonalForm_Alert_Saved_Message]: 'Guardado (mock)',
        [CommonTranslationKeys.Common_OK]: 'OK',
        [TranslationKeys.AccountProfile_Error_Title]: 'Error',
      },
    },
  },
};

export default META;

type Story = StoryObj<AccountProfileComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
