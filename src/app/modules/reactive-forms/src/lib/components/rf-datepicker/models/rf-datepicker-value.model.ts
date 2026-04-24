import { ShortDate } from '../../../common/short-date.interface';

export type RfDatepickerRange = { startDate: ShortDate; endDate: ShortDate };

export type RfDatepickerValue = ShortDate | RfDatepickerRange | undefined;
