import { Dayjs } from 'dayjs';

export type RfDatepickerRange = { startDate: Dayjs; endDate: Dayjs };

export type RfDatepickerValue = Dayjs | RfDatepickerRange | undefined;
