import { OptionsList } from '@dcx/ui/libs';

export interface CurrencyListVM {
  label: string;
  value: string;
  options: OptionsList[];
  selectedOption: OptionsList;
  isEnabled: boolean;
}
