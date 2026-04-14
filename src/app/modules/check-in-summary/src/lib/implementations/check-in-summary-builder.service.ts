import { inject, Injectable } from '@angular/core';
import { PaxCategoryType, PaxSegmentCheckinStatus, PaxSegmentInfo, SegmentCheckIn } from '@dcx/ui/api-layer';
import {
  CarrierMapperService,
  CheckInSummaryJourneyVM,
  CheckInSummaryPassengerVM,
  JourneyEnricherService,
  SegmentsStatusByJourney,
} from '@dcx/ui/business-common';
import {
  Booking,
  CarrierVM,
  dateHelper,
  JourneyVM,
  PaxSegmentsInfo,
  SegmentVM,
  TextHelperService,
  TimeMeasureModel,
} from '@dcx/ui/libs';

import { ICheckInSummaryBuilder } from '../interfaces/check-in-summary-builder.interface';
import { CheckInSummaryBuilderData } from '../models/check-in-summary-builder-data.model';

/**
 * Builds the view model for the Check-in Summary.
 * Maps API Booking/Journey into UI VMs and enriches with schedule, check-in status and passengers.
 */
@Injectable()
export class CheckInSummaryBuilderService implements ICheckInSummaryBuilder {
  private booking!: Booking;
  private segmentsStatus!: SegmentsStatusByJourney[];
  private segmentsCheckInStatus!: SegmentCheckIn[];
  private carriers: CarrierVM[] = [];

  private readonly textHelper = inject(TextHelperService);
  private readonly journeyEnricherService = inject(JourneyEnricherService);
  private readonly carrierMapper = inject(CarrierMapperService);

  /**
   * Builds the summary model for all journeys in the booking.
   * @param data Aggregated input: booking, per-journey segment statuses, and segment check-in statuses.
   * @returns Journeys prepared for UI consumption.
   */
  public buildCheckInSummaryModel(data: CheckInSummaryBuilderData): CheckInSummaryJourneyVM[] {
    this.booking = data.booking;
    this.segmentsCheckInStatus = data.paxSegmentCheckInStatus;
    this.segmentsStatus = data.segmentsStatusByJourney;
    this.carriers = data.carriers || [];
    const mappedJourneys = this.mapCheckInSummaryJourneys();
    return mappedJourneys;
  }

  /**
   * Maps each booking journey into an enriched summary VM (schedule, passengers, status, type, check-in info).
   */
  private mapCheckInSummaryJourneys(): CheckInSummaryJourneyVM[] {
    return this.journeyEnricherService
      .enrichJourneysWithStatus(this.booking.journeys, this.segmentsStatus)
      .map((journey: JourneyVM) => {
        if (this.carriers.length) {
          journey.segments = this.carrierMapper.mapCarrierNamesInSegments(journey.segments, this.carriers);
        }
        const mappedPassengers = this.mapPassengersWithCheckInStatus(journey);

        const mappedJourney = {
          ...journey,
          passengers: mappedPassengers,
        } as CheckInSummaryJourneyVM;
        this.evaluateCheckInStatusPerJourney(mappedJourney);
        return mappedJourney;
      });
  }

  /**
   * Maps booking passengers (excluding infants) to passenger view models, enriching with infant dependency detail.
   * Also assigns seats per passenger across journey segments.
   */
  private mapPassengers(journeySegments: SegmentVM[]): CheckInSummaryPassengerVM[] {
    return this.booking.pax
      .filter((pax) => pax.type.category !== PaxCategoryType.INFANT)
      .map((passenger): CheckInSummaryPassengerVM => {
        let detail = '';
        const dependentId = passenger.dependentPaxes?.[0];
        if (dependentId) {
          const infant = this.booking.pax.find(
            (p) => p.id === dependentId && p.type.category === PaxCategoryType.INFANT
          );
          if (infant) {
            detail = `${infant.name.first} ${infant.name.last}-${infant.referenceId}`;
          }
        }

        return {
          id: passenger.id,
          detail,
          name: this.textHelper.formatPassengerName(`${passenger.name.first} ${passenger.name.last}`),
          lifemilesNumber: passenger.loyaltyNumbers?.[0]?.loyaltyNumber ?? '',
          status: passenger.status as unknown as PaxSegmentCheckinStatus,
          referenceId: passenger.referenceId ?? '',
          seats: this.getPassengerSeat(passenger.segmentsInfo ?? [], journeySegments),
          segmentsInfo: passenger.segmentsInfo as PaxSegmentInfo[],
        };
      });
  }

  /**
   * Sets check-in availability and remaining time based on the first segment’s check-in status.
   */
  private evaluateCheckInStatusPerJourney(journey: CheckInSummaryJourneyVM): void {
    const firstJourneySegment = journey.segments?.[0];
    if (!firstJourneySegment) {
      return;
    }
    const segmentStatus = this.segmentsCheckInStatus.find((segment) => segment.segmentId === firstJourneySegment.id);
    const isCheckInAvailable = segmentStatus ? segmentStatus.status === 'Open' : false;
    if (segmentStatus?.hoursToCheckin && segmentStatus.hoursToCheckin > 0 && !isCheckInAvailable) {
      journey.remainingTimeToCheckIn = dateHelper.convertHoursToFullTime(
        segmentStatus.hoursToCheckin
      ) as TimeMeasureModel;
    }
    journey.isCheckInAvailable = isCheckInAvailable;
  }

  /**
   * Applies per-pax check-in status from the first segment; falls back to base status when missing.
   */
  private mapPassengersWithCheckInStatus(journey: JourneyVM): CheckInSummaryPassengerVM[] {
    const basePassengers = this.mapPassengers(journey.segments);
    const firstSegment = journey.segments?.[0];
    if (!firstSegment) {
      return basePassengers;
    }
    const segmentCheckInStatus = this.segmentsCheckInStatus.find((segment) => segment.segmentId === firstSegment.id);
    if (!segmentCheckInStatus) {
      return basePassengers;
    }
    return basePassengers.map((passenger) => {
      const paxStatus = segmentCheckInStatus.pax.find((pax) => pax.paxId === passenger.id);
      return {
        ...passenger,
        status: paxStatus ? paxStatus.status : passenger.status,
        canDownloadBoardingPass: paxStatus?.canDownloadBoardingPass ?? false,
      };
    });
  }

  /**
   * Collects seat assignments for a passenger restricted to the journey’s segments.
   * @returns Array of seat identifiers; empty when none.
   */
  private getPassengerSeat(paxSegments: PaxSegmentsInfo[], journeySegments: SegmentVM[]): string[] {
    const seats = paxSegments
      .filter((paxSegment) => {
        return journeySegments.some((journeySegment) => journeySegment.id === paxSegment.segmentId);
      })
      .map((paxSegment) => paxSegment.seat);
    return seats.length > 0 ? seats : [];
  }
}
