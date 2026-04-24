import { RfFilterType } from './filter.enum';

export interface RfOptionsFilter {
  enabled: boolean;
  placeholder?: string;
  type?: RfFilterType;
}
