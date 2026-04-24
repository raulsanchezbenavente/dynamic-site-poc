import { PriceRange } from './price-range.model';

export interface RangeSliderConfig extends PriceRange {
  maxValueSelected: number;
  selectedPercentage: number;
  /**
   * The 'step' property determines the increment value when adjusting the slider position.
   * It controls how much the slider's value changes with each step or interaction.
   */
  steps: number;
  label: string;
  id: string;
  isDisabled: boolean;
  hasMinValue: boolean;
  currency: string;
  currencySymbol: string;
}
