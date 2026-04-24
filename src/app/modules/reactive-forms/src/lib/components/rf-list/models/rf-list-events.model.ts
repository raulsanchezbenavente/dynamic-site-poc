import { RfListOption } from './rf-list-option.model';

export interface RfListSelectEvent {
  option: RfListOption;
  nativeEvent: MouseEvent;
}
