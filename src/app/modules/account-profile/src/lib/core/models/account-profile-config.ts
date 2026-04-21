import { EnumStatusTag } from '@dcx/ui/design-system';
import { DialogModalsRepositoryModel } from '@dcx/ui/libs';

export interface AccountProfileConfig {
  culture: string;
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
