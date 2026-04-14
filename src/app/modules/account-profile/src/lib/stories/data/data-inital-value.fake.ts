import { EnumStatusTag } from '@dcx/ui/design-system';
import { COMMON_TRANSLATIONS } from '@dcx/ui/mock-repository';

import type { AccountProfileConfig } from '../../core/models/account-profile-config';

export const DATA_INITIAL_VALUE: AccountProfileConfig = {
  culture: 'en',
  translations: {
    ...COMMON_TRANSLATIONS,
  },
  statusTags: [EnumStatusTag.COMPLETE, EnumStatusTag.INCOMPLETE],
  personalFormConfig: {
    title: 'AccountProfile.Title',
    description: 'AccountProfile.Description',
  },
  documentsFormConfig: {
    title: 'AccountProfile.DocumentsForm.MainDocument_Title',
    description: 'AccountProfile.DocumentsForm.Description',
  },
  companionsFormConfig: {
    title: 'AccountProfile.CompanionsForm.Title',
    description: 'AccountProfile.CompanionsForm.Description',
  },
  dialogModalsRepository: {
    modalDialogExceptions: [],
  },
};
