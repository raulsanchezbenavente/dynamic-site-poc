import { DialogModalsRepositoryModel, LinkModel } from '@dcx/ui/libs';

import { AuthAccountMenuOptionsConfig } from '../../authenticated-account-menu';

export interface AuthButtonData {
  redirectUrlAfterLogin: LinkModel;
  redirectUrlAfterLogout: LinkModel;
  authenticatedAccountMenuConfig: AuthAccountMenuOptionsConfig;
  dialogModalsRepository: DialogModalsRepositoryModel;
}
