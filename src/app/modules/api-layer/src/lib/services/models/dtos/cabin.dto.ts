import { CabinDistribution } from './cabin-distribution.dto';

export interface Cabin {
  classType: string;
  distributions: CabinDistribution[];
}
