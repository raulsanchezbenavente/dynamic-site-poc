export interface JourneyLocation {
  city: string;
  /**
   * Airpoirt IATA code
   */
  iata?: string;
  iataOperation?: string;
  terminal?: string;
  airportName?: string;
  country?: string;
}
