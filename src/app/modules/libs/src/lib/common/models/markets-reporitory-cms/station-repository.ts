import { Location } from './location';

export interface StationRepository extends Location {
  isExternalStation: boolean;
}
