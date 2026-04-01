export interface JourneyRequest {
  /**
   * FareId from selected fare of selected Journey
   */
  fareId: string;
  /**
   * JourneyId from selected journey
   */
  journeyId: string;
  /**
   * PromoCode from selected journey
   */
  promoCode?: string;
  /**
   * CorporateCode from selected journey
   */
  corporateCode?: string;
}
