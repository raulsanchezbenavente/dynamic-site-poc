/**
 * Enumeration representing the standardized Trip Type values exposed to the Analytics Data Layer.
 * These values correspond to the expected schema for the 'trip_type' property in GTM/GA4 events.
 * They are derived by mapping the internal application `TripTypeCode`.
 */
export enum AnalyticsTripType {
  MC = 'Multi City',
  OW = 'One Way',
  RT = 'Round Trip',
}
