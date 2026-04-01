import { Inject, Injectable } from '@angular/core';

import { SegmentWithSelectedPassengers } from '../../../api-models';
import { BUSINESS_CONFIG } from '../../../injection-tokens';
import { ISummarySelectedJourneysService } from '../../../interfaces';
import { Booking, BusinessConfig, IbeFlow } from '../../../model';
import { SessionDataVM, SessionStore } from '../../../session';

@Injectable({ providedIn: 'root' })
export class SummarySelectedJourneysService implements ISummarySelectedJourneysService {
  protected showInfoForSelectedFlights: boolean;

  constructor(
    protected sessionStore: SessionStore,
    @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig
  ) {
    this.showInfoForSelectedFlights = this.getValueForBusinessConfig();
  }

  public getSelectedJourneysToCheckIn(booking: Booking): string[] {
    const selectedJourneysToCheckIn: string[] = [];

    const selectedPassengers = this.getSelectedPassengers();

    if (!selectedPassengers?.length || !booking?.journeys) {
      return selectedJourneysToCheckIn;
    }

    for (const item of selectedPassengers) {
      const journey = booking.journeys.find((j) => j.segments.some((s) => s.id === item.segmentId));

      if (journey && !selectedJourneysToCheckIn.includes(journey.id)) {
        selectedJourneysToCheckIn.push(journey.id);
      }
    }

    return selectedJourneysToCheckIn;
  }

  public getSelectedPassengers(): SegmentWithSelectedPassengers[] {
    const session = this.getSession();
    return session?.selectedPassengers ? [...session.selectedPassengers] : [];
  }

  public getJourneysToRequest(): string[] {
    const sessionStore = this.getSession();
    if (sessionStore) {
      const journeyIds = this.showInfoForSelectedFlights
        ? this.getSelectedJourneysToCheckIn(sessionStore.booking)
        : sessionStore.booking.journeys.map((j) => j.id);
      return journeyIds;
    }
    return [];
  }

  protected getValueForBusinessConfig(): boolean {
    const sessionStore = this.getSession();
    if (sessionStore) {
      return (sessionStore.flow === IbeFlow.WCI &&
        this.businessConfig?.checkinBussinesConfiguration?.showInfoForSelectedFlight) as boolean;
    }
    return false;
  }

  private getSession(): SessionDataVM | undefined {
    return this.sessionStore.getSession().session ? this.sessionStore.getSession().session : undefined;
  }
}
