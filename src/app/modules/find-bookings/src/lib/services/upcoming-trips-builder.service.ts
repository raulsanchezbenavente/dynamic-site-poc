import { inject, Injectable, signal } from '@angular/core';
import {
  AuthenticationStorageService,
  AuthenticationTokenData,
  CultureServiceEx,
  JourneyLocation,
  JourneySchedule,
  JourneyStatus,
  JourneyVM,
  PointOfSaleService,
  SegmentVM,
  TextHelperService,
  TransportType,
} from '@dcx/ui/libs';

import { BookingSegment, FindBookingsResponse, FlightStatus } from '../api-models/find-bookings-response.model';
import { ManageBookingCardVM } from '../components/manage-booking-card/models/manage-booking-card-vm.model';
import { IUpcomingTripsBuilder } from '../interfaces/upcoming-trips-builder.interface';
import { FindBookingsConfig } from '../models/find-bookings.config';

import { GetCarrierService } from './get-carriers.service';

@Injectable()
export class UpcomingTripsBuilderService implements IUpcomingTripsBuilder {
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly authenticationStorageService = inject(AuthenticationStorageService);
  private readonly posService = inject(PointOfSaleService);
  private readonly carrierService = inject(GetCarrierService);
  private readonly textHelperService = inject(TextHelperService);
  private readonly findBookingsConfig = signal<FindBookingsConfig | null>(null);

  public getData(data: FindBookingsResponse, config: FindBookingsConfig): ManageBookingCardVM[] {
    if (!data.result?.data?.segments || data.result.data.segments.length === 0) {
      return [];
    }

    this.findBookingsConfig.set(config);

    return data.result.data.segments
      .filter((segment) => segment.departureDate && segment.arrivalDate)
      .map((segment) => this.mapToManageBookingCardVM(segment, data, config));
  }

  private mapToManageBookingCardVM(
    segment: BookingSegment,
    data: FindBookingsResponse,
    config: FindBookingsConfig
  ): ManageBookingCardVM {
    if (!data.result?.data?.segments) {
      return {
        journeyVM: this.createJourneyVM(segment, config),
        checkInDeepLinkUrl: '',
        isCheckInAvailable: false,
        isMmbAvailable: false,
        mmbDeepLinkUrl: '',
        pageNumber: 1,
        totalRecords: 0,
      };
    }
    const isCheckinOpen = this.isCheckInAvailable(segment, config.earlyCheckinEligibleStationCodes);
    const culture = this.cultureServiceEx.getCulture();
    const userData = this.authenticationStorageService.getAuthenticationTokenData();

    return {
      journeyVM: this.createJourneyVM(segment, config),
      checkInDeepLinkUrl: this.buildCheckinUrl(config.checkinUrl, segment.recordLocator, culture, userData),
      isCheckInAvailable: isCheckinOpen,
      isMmbAvailable: !isCheckinOpen,
      mmbDeepLinkUrl: this.buildMmbUrl(config.mmbUrl, segment.recordLocator, culture, userData),
      pageNumber: 1,
      totalRecords: data.result.data.segments.length,
    };
  }

  private buildCheckinUrl(
    url: string,
    recordLocator: string,
    culture: string,
    userData: AuthenticationTokenData
  ): string {
    const pointOfSale = this.posService.getCurrentPointOfSale();
    const normalizedLastName = this.textHelperService.normalizeUrlParameter(userData?.accountInfo?.lastName);

    const replacements: Record<string, string> = {
      '{{lang}}': culture,
      '{{pnr}}': recordLocator,
      '{{lastname}}': normalizedLastName,
      '{{pos}}': pointOfSale?.code ?? '',
    };
    return this.replaceUrlPlaceholders(url, replacements);
  }

  private buildMmbUrl(url: string, recordLocator: string, culture: string, userData: AuthenticationTokenData): string {
    const normalizedLastName = this.textHelperService.normalizeUrlParameter(userData?.accountInfo?.lastName);

    const replacements: Record<string, string> = {
      '{{lang}}': culture,
      '{{pnr}}': recordLocator,
      '{{lastname}}': normalizedLastName,
    };
    return this.replaceUrlPlaceholders(url, replacements);
  }

  /**
   * Replaces URL placeholders with their corresponding values.
   * @param url - The URL template with placeholders
   * @param replacements - A record of placeholders and their replacement values
   * @returns The URL with all placeholders replaced
   */
  private replaceUrlPlaceholders(url: string, replacements: Record<string, string>): string {
    return url.replaceAll(/{{\w+}}/g, (match) => replacements[match] || match);
  }

  private createJourneyVM(segment: BookingSegment, config: FindBookingsConfig): JourneyVM {
    const departureDate = new Date(segment.departureDate);
    const arrivalDate = new Date(segment.arrivalDate);
    const departureRealDate = new Date(segment.departureRealDate);
    const arrivalRealDate = new Date(segment.arrivalRealDate);

    return {
      id: segment.recordLocator,
      origin: this.createLocation(segment.origin, segment.originTerminal, segment.operationOriginIata),
      destination: this.createLocation(
        segment.destination,
        segment.destinationTerminal,
        segment.operationDestinationIata
      ),
      schedule: this.createSchedule(departureDate, arrivalDate, departureRealDate, arrivalRealDate),
      segments: [this.createSegmentVM(segment, config)],
      duration: this.normalizeDuration(segment.duration),
      status: this.getJourneyStatus(segment, departureDate),
    };
  }

  private createLocation(iataCode: string, terminal: string, operationIataCode: string): JourneyLocation {
    return {
      city: iataCode,
      iata: iataCode,
      country: '',
      terminal: terminal,
      iataOperation: operationIataCode,
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

  private createSegmentVM(segment: BookingSegment, config: FindBookingsConfig): SegmentVM {
    const departureDate = new Date(segment.departureDate);

    return {
      id: segment.recordLocator,
      origin: this.createLocation(segment.origin, segment.originTerminal, segment.operationOriginIata),
      destination: this.createLocation(
        segment.destination,
        segment.destinationTerminal,
        segment.operationDestinationIata
      ),
      schedule: this.createSchedule(
        new Date(segment.departureDate),
        new Date(segment.arrivalDate),
        new Date(segment.departureRealDate),
        new Date(segment.arrivalRealDate)
      ),
      legs: [this.createLegVM(segment, config)],
      duration: this.normalizeDuration(segment.duration),
      transport: {
        type: TransportType.PLANE,
        carrier: {
          code: segment.carrierCode,
          name: this.carrierService.getCarrierName(this.findBookingsConfig(), segment.carrierCode),
        },
        number: segment.transportNumber,
        model: this.getAircraftName(segment.transport, config),
      },
      status: this.getJourneyStatus(segment, departureDate),
    };
  }

  private createLegVM(segment: BookingSegment, config: FindBookingsConfig): any {
    return {
      origin: segment.origin,
      destination: segment.destination,
      duration: this.normalizeDuration(segment.duration),
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
        model: this.getAircraftName(segment.transport, config),
      },
    };
  }

  private mapStatus(segmentStatus: FlightStatus): JourneyStatus | undefined {
    switch (segmentStatus) {
      case FlightStatus.Confirmed:
        return JourneyStatus.CONFIRMED;
      case FlightStatus.Canceled:
        return JourneyStatus.CANCELLED;
      case FlightStatus.Delayed:
        return JourneyStatus.DELAYED;
      case FlightStatus.Diverted:
        return JourneyStatus.DIVERTED;
      case FlightStatus.Returned:
        return JourneyStatus.RETURNED;
      case FlightStatus.Departed:
        return JourneyStatus.DEPARTED;
      case FlightStatus.Landed:
        return JourneyStatus.LANDED;
      default:
        return undefined;
    }
  }

  private getJourneyStatus(segment: BookingSegment, departureDate: Date): JourneyStatus | undefined {
    const now = new Date();
    const daysDifference = Math.ceil((departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 7 && segment.segmentStatus) {
      return JourneyStatus.CONFIRMED;
    }

    return this.mapStatus(segment.segmentStatus);
  }

  private normalizeDuration(duration: string): string {
    try {
      if (!duration) {
        return '00:00:00';
      }

      const parts = duration.split(':');

      if (parts.length === 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
      }

      if (parts.length === 3) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
      }

      return '00:00:00';
    } catch (error) {
      console.error(`Error normalizing duration: ${duration}`, error);
      return '00:00:00';
    }
  }

  /**
   * Determines whether check‑in is currently available for the given segment.
   *
   * Rules:
   * - Early check-in airports: window is <= 24 hours before departure.
   * - All other airports: window is <= 48 hours before departure.
   * - In-flight: check-in stays available from departure until arrival.
   *
   * @param segment Booking segment containing departure information.
   * @param earlyCheckinCodes IATA codes that qualify for the 24h window.
   * @returns True if the flight is within the check-in window or currently in flight.
   */
  private isCheckInAvailable(
    segment: BookingSegment,
    earlyCheckinCodes: string[],
    currentDate: Date = new Date()
  ): boolean {
    if (!segment?.departureDate || (!segment.arrivalRealDate && !segment.arrivalDate)) {
      return false;
    }

    const originCode = segment.origin?.toUpperCase() || '';
    const destCode = segment.destination?.toUpperCase() || '';

    const isEarlyCheckin = earlyCheckinCodes.some((code) => {
      const upperCode = code.toUpperCase();
      return upperCode === originCode || upperCode === destCode;
    });

    const nowTime = currentDate.getTime();
    const departureTime = new Date(segment.departureDate).getTime();
    const arrivalTime = new Date(segment.arrivalRealDate || segment.arrivalDate).getTime();

    if (Number.isNaN(departureTime) || Number.isNaN(arrivalTime)) {
      return false;
    }

    const MS_PER_HOUR = 3600000;
    const STANDARD_CHECKIN_WINDOW = 48;
    const RESTRICTED_CHECKIN_WINDOW = 24;

    const hoursUntilDeparture = (departureTime - nowTime) / MS_PER_HOUR;
    const hoursToValidate = isEarlyCheckin ? RESTRICTED_CHECKIN_WINDOW : STANDARD_CHECKIN_WINDOW;

    const isWithinCheckinWindow = hoursUntilDeparture > 0 && hoursUntilDeparture <= hoursToValidate;
    const isInFlight = nowTime >= departureTime && nowTime < arrivalTime;

    return isWithinCheckinWindow || isInFlight;
  }

  private getAircraftName(aircraftCode: string, config: FindBookingsConfig): string {
    if (!aircraftCode || !config?.airCraftList) {
      return '';
    }

    const normalizedCode = aircraftCode.trim().toUpperCase();
    const aircraft = config.airCraftList.find((item) => item.code?.trim().toUpperCase() === normalizedCode);
    return aircraft?.name || '';
  }
}
