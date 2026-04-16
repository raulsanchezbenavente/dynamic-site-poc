export interface AvailableOptionsState {
  availableOptions: AvailableOption[];
}

export interface AvailableOption {
  code: string;
  isDisabled: boolean;
}
