import { SearchSummaryDates } from './search-summary-dates.model';
import { SearchSummaryPaxs } from './search-summary-pax.model';

export interface SearchSummaryVM {
  route: {
    origin: string;
    destination: string;
  };
  dates: SearchSummaryDates;
  passengers: SearchSummaryPaxs[];
}
