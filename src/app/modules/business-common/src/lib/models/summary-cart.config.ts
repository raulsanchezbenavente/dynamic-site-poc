export interface SummaryCartConfig {
  toggleButton: Record<string, unknown>;
  details: SummaryCartDetailConfig;
}

export interface SummaryCartDetailConfig {
  journeys: {
    outbound?: SummaryCartItineraryConfig;
    inbound?: SummaryCartItineraryConfig;
  };
  summaryTypologyConfig: Record<string, unknown>;
  showCloseButton?: boolean;
}

export interface SummaryCartItineraryConfig {
  journey: Record<string, unknown>;
  fareTagConfig?: Record<string, unknown>;
}
