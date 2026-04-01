import { AssignSeatMode } from './enums/assign-seat-mode.enum';

export interface AssignSeatOption {
  code: AssignSeatMode;
  allowed: boolean;
  executedByDefault: boolean;
}
