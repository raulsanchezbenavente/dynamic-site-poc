import { LoyaltyStatusVm } from './loyalty-status-vm.model';

export interface LoyaltyStatusOverviewVM {
  current: LoyaltyStatusVm;
  next?: LoyaltyStatusVm;
}