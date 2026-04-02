import { SummaryTypologyBuilderConfig } from '@dcx/ui/libs';

import { SummaryCartItineraryConfig } from '../../summary-cart-itinerary/models/summary-car-itinerary.config';

export interface SummaryCartDetailConfig {
  journeys: {
    outbound?: SummaryCartItineraryConfig;
    inbound?: SummaryCartItineraryConfig;
  };
  summaryTypologyConfig: SummaryTypologyBuilderConfig;
  showCloseButton?: boolean;
}
