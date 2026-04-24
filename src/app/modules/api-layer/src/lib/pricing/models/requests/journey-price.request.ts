import { AvailabilityRequestType } from '../dtos/enums/availability-request-type.enum';
import { FilterType } from '../dtos/enums/filter-type.enum';
import { DateRange } from '../dtos/journeys/date-range.dto';
import { PricingPointOfSale } from '../dtos/journeys/pricing-point-of-sale.dto';

export interface JourneyPriceRequest {
  id: string;
  origin: string;
  destination: string;
  currency: string;
  promoCode: string;
  corporateCode: string;
  numberRegisters: number;
  pointOfSale: PricingPointOfSale;
  details: Record<AvailabilityRequestType, DateRange[]>;
  pax: Record<string, number>;
  filters: Record<FilterType, string[]>;
  culture: string;
}
