import { AccountPassengerList } from './account-passenger-container/account-passenger-list.model';
import { AccountPassengerSelected } from './account-passenger-selected.model';

export interface AccountProfileStatus {
  accountPassengerSelected?: AccountPassengerSelected[];
  accountPassengerList?: AccountPassengerList[];
}
