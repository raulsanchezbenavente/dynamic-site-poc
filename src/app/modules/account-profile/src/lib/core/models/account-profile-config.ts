import { EnumStatusTag } from '@dcx/ui/design-system';
import { DialogModalsRepositoryModel, DictionaryType } from '@dcx/ui/libs';

export interface AccountProfileConfig {
  culture: string;
  translations: DictionaryType;
  statusTags: EnumStatusTag[];
  personalFormConfig: {
    title: string;
    description: string;
  };
  documentsFormConfig: {
    title: string;
    description: string;
  };
  companionsFormConfig: {
    title: string;
    description: string;
  };
  sessionDialogModalsRepository: DialogModalsRepositoryModel;
  accountProfileDialogModalsRepository: DialogModalsRepositoryModel;
}
