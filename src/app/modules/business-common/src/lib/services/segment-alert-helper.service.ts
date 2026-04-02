import { Injectable } from '@angular/core';
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
}
