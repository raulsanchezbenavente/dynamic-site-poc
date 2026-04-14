import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import { type Meta, type StoryObj } from '@storybook/angular';

import { AccountProfileComponent } from '../account-profile.component';

// ===== Story Meta =====
// IMPORTANTE: NO usar decorators aquí
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
        'AccountProfile.PersonalForm.Alert_Saved_Message': 'Guardado (mock)',
        'Common.OK': 'OK',
        'AccountProfile.Error.Title': 'Error',
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
