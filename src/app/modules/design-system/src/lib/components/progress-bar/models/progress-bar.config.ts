import { AriaAttributes } from '@dcx/ui/libs';
export interface ProgressBarConfig {
  min: {
    label: string;
    value?: number;
  };
  max: {
    label: string;
    value?: number;
  };
  ariaAttributes: AriaAttributes;
  currentValue?: number;
}
