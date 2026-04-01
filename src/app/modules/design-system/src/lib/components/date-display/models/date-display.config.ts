import { Dayjs } from 'dayjs';

export interface DateDisplayConfig {
  date: Dayjs | Date;
  /**
   * When provided, component renders a single formatted string.
   */
  format?: string | null;
  /**
   * Specifies the culture used to format the month label according to the current language.
   */
  culture?: string;
}
