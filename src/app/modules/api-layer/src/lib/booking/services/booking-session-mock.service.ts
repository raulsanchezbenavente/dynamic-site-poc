import { Injectable } from '@angular/core';

import { Booking, BookingChangeStrategy, PaxCategoryType, ProductScopeType, Service, TransactionStatus } from '..';

/**
 * Service responsible for generating mock booking data for testing purposes.
 * Test cases controlled by URL parameter ?bookingCase=N:
 * - bookingCase=1: PENDING services for first journey (all passengers)
 * - bookingCase=2: CONFIRMED services for first journey (all passengers)
 * - bookingCase=3: PENDING services for second journey (all passengers) - if exists
 * - bookingCase=4: CONFIRMED services for second journey (all passengers) - if exists
 * - bookingCase=5: PENDING services for all journeys (all passengers)
 * - bookingCase=6: CONFIRMED services for all journeys (all passengers)
 * - bookingCase=7: CONFIRMED services for first journey + PENDING services for second journey
 * - bookingCase=8: PENDING services for first journey + CONFIRMED services for second journey
 * - No parameter (default): No mock services
 */
@Injectable({
  providedIn: 'root',
})
export class BookingSessionMockService {
  /**
   * Generates mock booking data based on URL parameter
   * @param booking Current booking from API
   * @returns Object with mock services and updated pricing, or null if no mock should be added
   */
  public generateMockBookingData(booking: Booking): { services: Service[]; pricing: Booking['pricing'] } | null {
    // Get test case from URL parameter ?bookingCase=N (default: no mock services)
    const urlParams = new URLSearchParams(window.location.search);
    const bookingCaseParam = urlParams.get('bookingCase');

    // No parameter: no mock services
    if (!bookingCaseParam) {
      return null;
    }

    const bookingCase = parseInt(bookingCaseParam, 10);

    // Generate mock services based on booking and test case
    const mockServices = this.generateMockServices(booking, bookingCase);

    // If no services generated, return null
    if (mockServices.length === 0) {
      return null;
    }

    // Generate pricing breakdown for PENDING services
    const updatedPricing = this.updatePricingWithMockServices(booking, mockServices);

    return {
      services: mockServices,
      pricing: updatedPricing,
    };
  }

  /**
   * Generates mock ASST services based on booking journeys, passengers, and test case
   * @param booking Current booking from API
   * @param bookingCase Test scenario (1-8)
   * @returns Array of mock Service objects
   */
  private generateMockServices(booking: Booking, bookingCase: number): Service[] {
    const mockServices: Service[] = [];

    // Get journeys from booking (max 2)
    const journeys = booking.journeys.slice(0, 2);

    // All passengers excluding infants
    const passengers = booking.pax.filter((pax) => pax.type.code !== PaxCategoryType.INFANT);

    // Case 7: Mixed status - CONFIRMED for first journey + PENDING for second journey
    if (bookingCase === 7 && journeys.length > 1) {
      // First journey - CONFIRMED
      for (const passenger of passengers) {
        const serviceId = this.generateServiceId(passenger.id, journeys[0].id);
        mockServices.push(this.createMockService(journeys[0], passenger, TransactionStatus.CONFIRMED, serviceId));
      }

      // Second journey - PENDING
      for (const passenger of passengers) {
        const serviceId = this.generateServiceId(passenger.id, journeys[1].id);
        mockServices.push(this.createMockService(journeys[1], passenger, TransactionStatus.PENDING, serviceId));
      }

      return mockServices;
    }

    // Case 8: Mixed status - PENDING for first journey + CONFIRMED for second journey
    if (bookingCase === 8 && journeys.length > 1) {
      // First journey - PENDING
      for (const passenger of passengers) {
        const serviceId = this.generateServiceId(passenger.id, journeys[0].id);
        mockServices.push(this.createMockService(journeys[0], passenger, TransactionStatus.PENDING, serviceId));
      }

      // Second journey - CONFIRMED
      for (const passenger of passengers) {
        const serviceId = this.generateServiceId(passenger.id, journeys[1].id);
        mockServices.push(this.createMockService(journeys[1], passenger, TransactionStatus.CONFIRMED, serviceId));
      }

      return mockServices;
    }

    // Determine which journeys and status based on test case
    let journeysToInclude: typeof journeys = [];
    let serviceStatus: TransactionStatus = TransactionStatus.PENDING;

    switch (bookingCase) {
      case 1:
        // PENDING services for first journey
        journeysToInclude = journeys.slice(0, 1);
        serviceStatus = TransactionStatus.PENDING;
        break;
      case 2:
        // CONFIRMED services for first journey
        journeysToInclude = journeys.slice(0, 1);
        serviceStatus = TransactionStatus.CONFIRMED;
        break;
      case 3:
        // PENDING services for second journey (if exists)
        journeysToInclude = journeys.length > 1 ? [journeys[1]] : [];
        serviceStatus = TransactionStatus.PENDING;
        break;
      case 4:
        // CONFIRMED services for second journey (if exists)
        journeysToInclude = journeys.length > 1 ? [journeys[1]] : [];
        serviceStatus = TransactionStatus.CONFIRMED;
        break;
      case 5:
        // PENDING services for all journeys
        journeysToInclude = journeys;
        serviceStatus = TransactionStatus.PENDING;
        break;
      case 6:
        // CONFIRMED services for all journeys
        journeysToInclude = journeys;
        serviceStatus = TransactionStatus.CONFIRMED;
        break;
      default:
        // Invalid case, no services
        return [];
    }

    // Generate mock service for each journey + passenger combination
    for (const journey of journeysToInclude) {
      for (const passenger of passengers) {
        const serviceId = this.generateServiceId(passenger.id, journey.id);
        mockServices.push(this.createMockService(journey, passenger, serviceStatus, serviceId));
      }
    }

    return mockServices;
  }

  private generateServiceId(passengerId: string, journeyId: string): string {
    return `${passengerId}|${journeyId}`;
  }

  /**
   * Creates a single mock service
   */
  private createMockService(
    journey: Booking['journeys'][0],
    passenger: Booking['pax'][0],
    status: TransactionStatus,
    id: string
  ): Service {
    return {
      category: 'default',
      BookingChangeStrategy: BookingChangeStrategy.FREE,
      changeStrategy: 'Free',
      code: 'ASST',
      isChecked: false,
      differentialId: '',
      note: 'TRAVEL ASSISTANCE - Mock Service',
      paxId: passenger.id,
      referenceId: `MOCK_ASST_${id}`,
      scope: ProductScopeType.PER_PAX_JOURNEY,
      sellKey: journey.id,
      source: 'FR',
      status: status,
      type: 'MedicalInsurance',
      id: `MOCK_ASST_${id}`,
      priceAmount: 40000.0,
      expirationDate: null,
    };
  }

  /**
   * Updates booking pricing with mock services breakdown
   * Only includes PENDING services in the breakdown
   * @param booking Current booking from API
   * @param mockServices Generated mock services
   * @returns Updated BookingPricing
   */
  private updatePricingWithMockServices(booking: Booking, mockServices: Service[]): Booking['pricing'] {
    // Filter only PENDING services
    const pendingServices = mockServices.filter((service) => service.status === TransactionStatus.PENDING);

    // If no pending services, return original pricing
    if (pendingServices.length === 0) {
      return booking.pricing;
    }

    // Create PricedItem for each PENDING service
    const pricedItems = pendingServices.map((service) => ({
      totalAmount: service.priceAmount ?? 0,
      currency: booking.pricing?.currency ?? 'USD',
      referenceId: service.id,
    }));

    // Calculate total amount from pending services
    const pendingServicesTotal = pricedItems.reduce((sum, item) => sum + item.totalAmount, 0);

    // Get existing breakdown or create empty one
    const existingBreakdown = booking.pricing?.breakdown ?? {};

    // Get existing PER_PAX_JOURNEY items or empty array
    const existingPerPaxJourneyItems = existingBreakdown[ProductScopeType.PER_PAX_JOURNEY] ?? [];

    // Update breakdown with new pricing items
    const updatedBreakdown = {
      ...existingBreakdown,
      [ProductScopeType.PER_PAX_JOURNEY]: [...existingPerPaxJourneyItems, ...pricedItems],
    };

    // Calculate new totals
    const currentTotalAmount = booking.pricing?.totalAmount ?? 0;
    const currentBalanceDue = booking.pricing?.balanceDue ?? 0;
    const newTotalAmount = currentTotalAmount + pendingServicesTotal;
    const newBalanceDue = currentBalanceDue + pendingServicesTotal;

    return {
      ...booking.pricing,
      breakdown: updatedBreakdown,
      totalAmount: newTotalAmount,
      balanceDue: newBalanceDue,
      isBalanced: newBalanceDue === 0,
      currency: booking.pricing?.currency ?? 'USD',
    };
  }
}
