import { Injectable } from '@angular/core';
import { BoardingPassEligibilityStatus } from '@dcx/ui/api-layer';
import { AlertPanelConfig, AlertPanelType } from '@dcx/ui/design-system';
import { PaxSegmentCheckinStatus } from '@dcx/ui/libs';

import { CheckInSummaryPassengerVM } from '../components/check-in-summary/models/check-in-summary-passenger-vm.model';

@Injectable({
  providedIn: 'root',
})
export class SegmentAlertHelperService {
  public hasStandbyOrOverbookingForSegment(passengers: CheckInSummaryPassengerVM[], segmentId: string): boolean {
    return passengers.some((passenger) =>
      passenger.segmentsInfo?.some(
        (segmentInfo) =>
          segmentInfo.segmentId === segmentId &&
          (segmentInfo.status === PaxSegmentCheckinStatus.STAND_BY ||
            segmentInfo.status === PaxSegmentCheckinStatus.OVERBOOKED)
      )
    );
  }

  public hasStandbyForSegment(passengers: CheckInSummaryPassengerVM[], segmentId: string): boolean {
    return passengers.some((passenger) =>
      passenger.segmentsInfo?.some(
        (segmentInfo) => segmentInfo.segmentId === segmentId && segmentInfo.status === PaxSegmentCheckinStatus.STAND_BY
      )
    );
  }

  public hasOverbookingForSegment(passengers: CheckInSummaryPassengerVM[], segmentId: string): boolean {
    return passengers.some((passenger) =>
      passenger.segmentsInfo?.some(
        (segmentInfo) =>
          segmentInfo.segmentId === segmentId && segmentInfo.status === PaxSegmentCheckinStatus.OVERBOOKED
      )
    );
  }

  public getSegmentAlertStatus(
    passengers: CheckInSummaryPassengerVM[],
    segmentId: string
  ): PaxSegmentCheckinStatus.STAND_BY | PaxSegmentCheckinStatus.OVERBOOKED | null {
    const hasStandby = this.hasStandbyForSegment(passengers, segmentId);
    const hasOverbooking = this.hasOverbookingForSegment(passengers, segmentId);

    if (hasStandby) {
      return PaxSegmentCheckinStatus.STAND_BY;
    }
    if (hasOverbooking) {
      return PaxSegmentCheckinStatus.OVERBOOKED;
    }
    return null;
  }

  public isBoardingPassBlockedForSegment(passenger: CheckInSummaryPassengerVM, segmentId: string): boolean {
    const passengerSegmentInfo = passenger.segmentsInfo?.find((segment) => segment.segmentId === segmentId);

    return (
      !!passengerSegmentInfo?.boardingPassEligibility?.boardingPassEligibilityStatus &&
      passengerSegmentInfo.boardingPassEligibility.boardingPassEligibilityStatus !==
        BoardingPassEligibilityStatus.ELIGIBLE
    );
  }

  public getBlockedBoardingPassMessagesForSegment(
    passengers: CheckInSummaryPassengerVM[],
    segmentId: string,
    fallbackMessage: string,
    mapBlockedReasonToMessage: (reason: string) => string
  ): string[] {
    const messagesSet = new Set<string>();

    for (const passenger of passengers) {
      const passengerSegmentInfo = passenger.segmentsInfo?.find((segment) => segment.segmentId === segmentId);

      if (!passengerSegmentInfo || !this.isBoardingPassBlockedForSegment(passenger, segmentId)) {
        continue;
      }

      const reasons = passengerSegmentInfo.boardingPassEligibility?.reasons ?? [];
      const resolvedMessages = reasons.length
        ? reasons.map((reason) => mapBlockedReasonToMessage(reason))
        : [fallbackMessage];

      for (const message of resolvedMessages) {
        messagesSet.add(message);
      }
    }

    return Array.from(messagesSet);
  }

  public buildBlockedBoardingPassAlertConfigForSegment(
    passengers: CheckInSummaryPassengerVM[],
    segmentId: string,
    blockedTitle: string,
    fallbackMessage: string,
    mapBlockedReasonToMessage: (reason: string) => string
  ): { config: Partial<AlertPanelConfig>; messages: string[] } | null {
    const messages = this.getBlockedBoardingPassMessagesForSegment(
      passengers,
      segmentId,
      fallbackMessage,
      mapBlockedReasonToMessage
    );

    if (!messages.length) {
      return null;
    }

    return {
      config: {
        alertType: AlertPanelType.WARNING,
        title: blockedTitle,
      },
      messages,
    };
  }
}
