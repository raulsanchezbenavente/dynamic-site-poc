import { StatusTagType } from '../../status-tag/enums/status-tag-type.enum';
import { DescriptionListItemData } from './description-list-data.model';

export interface DescriptionListStatusData extends DescriptionListItemData {
  statusType: StatusTagType;
  text: string;
}
