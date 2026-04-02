import { inject, Injectable } from '@angular/core';
import {
  Booking,
  CultureServiceEx,
  EnumStorageKey,
  KeycloakAuthService,
  LoggerService,
  PaxSegmentCheckinStatus,
  StorageService,
} from '@dcx/ui/libs';
import { Observable, of, tap } from 'rxjs';

import { BOOKING_PROXY_SERVICE, SegmentPaxCheckin, SendCheckinRequest } from '../../proxies';
import { CheckInEmailStateService } from '../check-in-email-state.service';

@Injectable()
export class SendCheckInService {
  private readonly bookingProxyService = inject(BOOKING_PROXY_SERVICE);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly keycloakAuthService = inject(KeycloakAuthService);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);
  private readonly checkInEmailStateService = inject(CheckInEmailStateService);

  public send(booking: Booking): Observable<void> {
    const selectedPassengersByJourney = this.getSelectedPassengersByJourney();

    if (!this.checkInEmailStateService.isEmailPending()) {
      return of(undefined);
    }

    if (!selectedPassengersByJourney || Object.keys(selectedPassengersByJourney).length === 0) {
      this.logger.warn('SendCheckInService', 'No selected passengers found for check-in');
      return of(undefined);
    }

    const segmentsPaxCheckin = this.buildSegmentsPaxCheckin(booking, selectedPassengersByJourney);

    if (segmentsPaxCheckin.length === 0) {
      this.logger.warn('SendCheckInService', 'No passengers with completed check-in found');
      return of(undefined);
    }

    const request = this.buildCheckinRequest(segmentsPaxCheckin);
    this.logger.info('SendCheckInService', 'Sending check-in request', request);

    return this.bookingProxyService.sendCheckin(request).pipe(
      tap(() => {
        this.checkInEmailStateService.clearEmailPending();
      })
    );
  }

  private getSelectedPassengersByJourney(): Record<string, string[]> {
    return this.storageService.getSessionStorage(EnumStorageKey.SelectedPassengersByJourney) || {};
  }

  private buildSegmentsPaxCheckin(
    booking: Booking,
    selectedPassengersByJourney: Record<string, string[]>
  ): SegmentPaxCheckin[] {
    const culture = this.cultureServiceEx.getLanguageAndRegion() || 'en-US';
    const segmentsPaxCheckin: SegmentPaxCheckin[] = [];

    Object.entries(selectedPassengersByJourney).forEach(([journeyId, selectedPaxReferenceIds]) => {
      const journey = booking.journeys?.find((j) => j.id === journeyId);

      if (!journey?.segments) {
        return;
      }

      journey.segments.forEach((segment) => {
        const checkedInPaxIds = this.getCheckedInPaxIds(booking, segment.id, selectedPaxReferenceIds);

        if (checkedInPaxIds.length > 0) {
          segmentsPaxCheckin.push({
            segmentId: segment.id ?? '',
            pax: checkedInPaxIds,
            isExternalCheckInProcess: false,
            culture,
          });
        }
      });
    });

    return segmentsPaxCheckin;
  }

  private getCheckedInPaxIds(booking: Booking, segmentId: string | undefined, paxReferenceIds: string[]): string[] {
    return paxReferenceIds
      .map((paxReferenceId) => {
        const passenger = booking.pax?.find((p) => p.referenceId === paxReferenceId);

        if (!passenger) {
          return null;
        }

        const segmentInfo = passenger.segmentsInfo?.find((si) => si.segmentId === segmentId);

        return segmentInfo?.status === PaxSegmentCheckinStatus.CHECKED_IN ||
          segmentInfo?.status === PaxSegmentCheckinStatus.STAND_BY
          ? passenger.id
          : null;
      })
      .filter((id): id is string => id !== null);
  }

  private buildCheckinRequest(segmentsPaxCheckin: SegmentPaxCheckin[]): SendCheckinRequest {
    return {
      authenticationToken: this.keycloakAuthService.getTokenSync() || '',
      segmentsPaxCheckin,
    };
  }
}
