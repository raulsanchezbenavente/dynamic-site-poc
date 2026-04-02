import { LegsVM } from '@dcx/ui/libs';

export interface LegsDetails {
  model: LegsVM;
  /**
   * This property is used to determine whether the stopover information should be displayed for this leg. It is set to true by default, but can be set to false if the leg does not have any stopovers or if the stopover information is not relevant for this leg.
   */
  showStopoverInfo?: boolean;
}
