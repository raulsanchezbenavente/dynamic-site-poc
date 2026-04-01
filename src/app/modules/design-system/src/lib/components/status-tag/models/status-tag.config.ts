import { StatusTagStyles } from '../enums/status-tag-styles.enum';
import { StatusTagType } from '../enums/status-tag-type.enum';

export interface StatusTagConfig<StatusType = StatusTagType> {
  status: StatusType;
  style?: StatusTagStyles;
  text: string;
  icon?: string;
}
