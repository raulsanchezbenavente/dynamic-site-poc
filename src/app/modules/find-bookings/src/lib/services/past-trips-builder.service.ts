import { inject, Injectable, signal } from '@angular/core';
import { JourneyLocation, JourneySchedule, JourneyStatus, SegmentVM, TransportType } from '@dcx/ui/libs';

import { BookingSegment, FindBookingsResponse, FlightStatus } from '../api-models/find-bookings-response.model';
import { PastTripCardVM } from '../components/past-trip-card/models/past-trip-card-vm.model';
import { IPastTripsBuilder } from '../interfaces/past-trips-builder.interface';
import { FindBookingsConfig } from '../models/find-bookings.config';

import { GetCarrierService } from './get-carriers.service';

@Injectable()
export class PastTripsBuilderService implements IPastTripsBuilder {
  private readonly findBookingsConfig = signal<FindBookingsConfig | null>(null);
  private readonly carrierService = inject(GetCarrierService);
  public getData(data: FindBookingsResponse, config: FindBookingsConfig): PastTripCardVM[] {
    if (!data.result?.data?.segments || data.result.data.segments.length === 0) {
      return [];
    }

    this.findBookingsConfig.set(config);

    const pastTripsCard: PastTripCardVM[] = data.result.data.segments
      .map((segment) => this.mapToPastTripCardVM(segment))
      .sort((a, b) => this.getDepartureRealTime(b.schedule) - this.getDepartureRealTime(a.schedule));

    pastTripsCard[0].totalRecords = pastTripsCard.length;
    return pastTripsCard;
  }

  private mapToPastTripCardVM(segment: BookingSegment): PastTripCardVM {
    const departureDate = new Date(segment.departureDate);
    const arrivalDate = new Date(segment.arrivalDate);
    const departureRealDate = new Date(segment.departureRealDate);
    const arrivalRealDate = new Date(segment.arrivalRealDate);

    return {
      origin: this.createLocation(segment.origin, segment.originTerminal),
      destination: this.createLocation(segment.destination, segment.destinationTerminal),
      schedule: this.createSchedule(departureDate, arrivalDate, departureRealDate, arrivalRealDate),
      segments: [this.createSegmentVM(segment)],
    };
  }

  private createLocation(iataCode: string, terminal: string): JourneyLocation {
    return {
      city: iataCode,
      iata: iataCode,
      country: '',
      terminal: terminal,
    };
  }

  private createSchedule(
    departureDate: Date,
    arrivalDate: Date,
    departureRealDate: Date,
    arrivalRealDate: Date
  ): JourneySchedule {
    return {
      std: departureDate,
      stdutc: departureDate,
      sta: arrivalDate,
      stautc: arrivalDate,
      etd: departureRealDate,
      etdutc: departureRealDate,
      eta: arrivalRealDate,
      etautc: arrivalRealDate,
    };
  }

  private createSegmentVM(segment: BookingSegment): SegmentVM {
    return {
      id: segment.recordLocator,
      origin: this.createLocation(segment.origin, segment.originTerminal),
      destination: this.createLocation(segment.destination, segment.destinationTerminal),
      schedule: this.createSchedule(
        new Date(segment.departureDate),
        new Date(segment.arrivalDate),
        new Date(segment.departureRealDate),
        new Date(segment.arrivalRealDate)
      ),
      legs: [this.createLegVM(segment)],
      duration: segment.duration,
      transport: {
        type: TransportType.PLANE,
        carrier: {
          code: segment.carrierCode,
          name: this.carrierService.getCarrierName(this.findBookingsConfig(), segment.carrierCode),
        },
        number: segment.transportNumber,
      },
      status: this.mapStatus(segment.segmentStatus),
    };
  }

  private createLegVM(segment: BookingSegment): any {
    return {
      origin: segment.origin,
      destination: segment.destination,
      duration: segment.duration,
      std: new Date(segment.departureDate),
      stdutc: new Date(segment.departureDate),
      sta: new Date(segment.arrivalDate),
      stautc: new Date(segment.arrivalDate),
      etd: new Date(segment.departureRealDate),
      etdutc: new Date(segment.departureRealDate),
      eta: new Date(segment.arrivalRealDate),
      etautc: new Date(segment.arrivalRealDate),
      transport: {
        type: TransportType.PLANE,
        carrier: {
          code: segment.carrierCode,
          name: this.carrierService.getCarrierName(this.findBookingsConfig(), segment.carrierCode),
        },
        number: segment.transportNumber,
      },
    };
  }

  private mapStatus(segmentStatus: FlightStatus): JourneyStatus | undefined {
    // Mapeo basado en bookingStatus
    switch (segmentStatus) {
      case FlightStatus.Confirmed:
        return JourneyStatus.CONFIRMED;
      case FlightStatus.Canceled:
        return JourneyStatus.CANCELLED;
      case FlightStatus.Delayed:
        return JourneyStatus.DELAYED;
      case FlightStatus.Diverted:
        return JourneyStatus.DIVERTED;
      default:
        return undefined;
    }
  }

  private getArrivalRealTime(schedule: { eta?: Date; sta?: Date }): number {
    const real = schedule?.eta instanceof Date ? schedule.eta.getTime() : undefined;
    const planned = schedule?.sta instanceof Date ? schedule.sta.getTime() : undefined;
    return real ?? planned ?? 0;
  }

  private getDepartureRealTime(schedule: { etd?: Date; std?: Date }): number {
    const real = schedule?.etd instanceof Date ? schedule.etd.getTime() : undefined;
    const planned = schedule?.std instanceof Date ? schedule.std.getTime() : undefined;
    return real ?? planned ?? 0;
  }
}
