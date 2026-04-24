import { LoyaltyProgressCardVM } from '../models/loyalty-progress-card-vm.model';

export interface LoyaltyProgressBuilderInterface {
  getData(): LoyaltyProgressCardVM[];
}
