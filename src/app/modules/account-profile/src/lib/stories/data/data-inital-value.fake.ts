import { EnumStatusTag } from '@dcx/ui/design-system';

import type { AccountProfileConfig } from '../../core/models/account-profile-config';
import { TranslationKeys } from '../../enums/translation-keys.enum';

export const DATA_INITIAL_VALUE: AccountProfileConfig = {
  culture: 'en',
  statusTags: [EnumStatusTag.COMPLETE, EnumStatusTag.INCOMPLETE],
  personalFormConfig: {
    title: TranslationKeys.AccountProfile_Title,
    description: TranslationKeys.AccountProfile_Description,
  },
  documentsFormConfig: {
    title: TranslationKeys.AccountProfile_DocumentsForm_MainDocument_Title,
    description: TranslationKeys.AccountProfile_DocumentsForm_Description,
  },
  companionsFormConfig: {
    title: TranslationKeys.AccountProfile_CompanionsForm_Title,
    description: TranslationKeys.AccountProfile_CompanionsForm_Description,
  },
  sessionDialogModalsRepository: {} as any,
  accountProfileDialogModalsRepository: {} as any,
};
