import { LegVM } from './leg-vm.model';

export interface LegsVM {
  duration: string;
  stopsNumber: number;
  legs: LegVM[];
  tabIndex?: string;
}
