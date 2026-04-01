import { SummaryTypologyTemplate } from '../../enums';
import { Booking } from '../booking';
import { DictionaryType } from '../dictionary-type';
import { ScheduleSelection } from '../schedule-selector';

import { SellTypeOfService } from './sell-type-of-service-vm.model';

export class SummaryTypologyBuilderConfig {
  public useTypologyItem!: boolean;
  public translations!: DictionaryType;
  public useStaticDetails!: boolean; // to be deprecated replaced by isCollapsible
  public isCollapsible!: boolean; // replaces useStaticDetails
  public scheduleSelection?: ScheduleSelection;
  public showPaxGroup?: boolean;
  public servicesCodesToMerge?: string[];
  public excludeChargesCode?: string[];
  public sellTypePerServices?: SellTypeOfService[];
  public bookingSellTypeServices!: string[];
  public displayPriceItemConcepts!: boolean;
  public chargesCodesToMerge?: string[];
  public booking!: Booking;
  public bundleCodes?: string[] = [];
  public summaryScopeView!: SummaryTypologyTemplate;
  public showInfoForSelectedFlight!: boolean;
  public voucherMask!: string;
}
