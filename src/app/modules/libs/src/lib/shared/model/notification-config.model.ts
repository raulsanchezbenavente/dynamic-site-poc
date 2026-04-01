import { AlertType } from '../enums';

import { ButtonLayout } from './button';

export interface NotificationConfigModel {
  message: string;
  title?: string;
  buttonPrimaryText?: string;
  buttonPrimaryUrl?: string;
  buttonPrimaryLayout?: ButtonLayout;
  buttonSecondaryText?: string;
  buttonSecondaryLayout?: ButtonLayout;
  alertType?: AlertType;
  allowMultiple?: boolean;
  buttonPrimaryCallBack?: () => void;
  buttonSecondaryCallBack?: () => void;
  onBlurCallback?: () => void;
}
