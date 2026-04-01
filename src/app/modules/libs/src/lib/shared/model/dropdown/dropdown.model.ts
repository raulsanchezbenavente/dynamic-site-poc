import { DropdownConfig } from './dropdown-config.model';

export interface DropdownVM {
  config: DropdownConfig;
  /**
   * Logical value of the selected option (typically the code).
   * Used for form control bindings and backend communication.
   */
  value: string;
  /**
   * Display label shown in the UI for the selected option.
   * Typically derived from the selected option's `name`.
   */
  displayLabel?: string;
  /**
   * Whether the dropdown is currently visible (opened).
   * Defaults to false.
   */
  isVisible?: boolean;
}
