import { Injectable } from '@angular/core';
import {
  Fare as ApiFare,
  Journey as ApiJourney,
  Leg as ApiLeg,
  Segment as ApiSegment,
  Transport as ApiTransport,
} from '@dcx/ui/api-layer';
import {
  JourneyCheckInInfo,
  JourneyLocation,
  JourneySchedule,
  JourneyVM,
  LegVM,
  SegmentVM,
  Fare as SharedFare,
  Transport,
} from '@dcx/ui/libs';

@Injectable({ providedIn: 'root' })
export class JourneyMapperService {
  public map(api: ApiJourney): JourneyVM {
    const origin = this.mapLocation(api.origin, api.originTerminal, api.originCountry);
    const destination = this.mapLocation(api.destination, api.destinationTerminal, api.destinationCountry);

    const schedule: JourneySchedule = this.mapSchedule(api.std, api.stdutc, api.sta, api.stautc);

    const segments: SegmentVM[] = (api.segments || []).map((s) => this.mapSegment(s));

    const fares: SharedFare[] = (api.fares || []).map((f) => this.mapFare(f));

    const checkinInfo: JourneyCheckInInfo | undefined = this.mapCheckinInfo(
      api.openingCheckInDate,
      api.closingCheckInDate
    );

    return {
      id: api.id,
      origin,
      destination,
      schedule,
      segments,
      duration: api.duration,
      fares,
      status: api.status,
      checkinInfo,
      // journeyType and totalPax are not provided by the API Journey dto
    } as JourneyVM;
  }

  private mapLocation(iata: string, terminal?: string, country?: string): JourneyLocation {
    return {
      city: iata, // Using IATA as city display/key in UI models
      iata,
      terminal,
      country,
    };
  }

  private mapSchedule(std: Date, stdUTC: Date, sta: Date, staUTC: Date): JourneySchedule {
    return {
      std,
      stdutc: stdUTC,
      sta,
      stautc: staUTC,
    };
  }

  private mapSegment(api: ApiSegment): SegmentVM {
    const origin = this.mapLocation(api.origin, undefined, api.originCountry);
    const destination = this.mapLocation(api.destination, undefined, api.destinationCountry);
    const schedule = this.mapSchedule(api.std, api.stdutc, api.sta, api.stautc);
    const transport = this.mapTransport(api.transport, api.operatingTransport);

    const legs: LegVM[] = (api.legs || []).map((leg) => this.mapLeg(leg, api.duration, transport));

    return {
      id: api.id,
      referenceId: api.referenceId,
      origin,
      destination,
      schedule,
      legs,
      duration: api.duration,
      transport,
      // status on segment not present on API segment dto
    } as SegmentVM;
  }

  private mapLeg(leg: ApiLeg, duration: string | undefined, transport: Transport): LegVM {
    return {
      origin: leg.origin,
      destination: leg.destination,
      duration: duration || '', // API Leg doesn't include duration; fallback to segment duration
      std: leg.std,
      stdutc: leg.stdutc,
      sta: leg.sta,
      stautc: leg.stautc,
      // No ETA/ETD in API leg dto
      transport,
    } as LegVM;
  }

  private mapTransport(api?: ApiTransport, operatingApi?: ApiTransport): Transport {
    if (!api && !operatingApi) {
      // minimal transport placeholder
      return {
        carrier: { code: '', name: '' },
        number: '',
      } as Transport;
    }
    return {
      type: operatingApi?.type,
      carrier: {
        code: operatingApi?.carrier?.code || api?.carrier?.code,
        name: operatingApi?.carrier?.name || api?.carrier?.name,
        operatingAirlineCode: operatingApi?.carrier?.operatingAirlineCode || api?.carrier?.operatingAirlineCode,
      },
      number: operatingApi?.number || api?.number,
      model: operatingApi?.model || api?.model,
      aircraftConfigurationVersion: operatingApi?.aircraftConfigurationVersion || api?.aircraftConfigurationVersion,
      // manufacturer not provided by API transport dto
    } as Transport;
  }

  private mapFare(api: ApiFare): SharedFare {
    return {
      id: api.id,
      referenceId: api.referenceId,
      fareBasisCode: api.fareBasisCode,
      classOfService: api.classOfService,
      productClass: api.productClass,
      serviceBundleCode: api.serviceBundleCode,
      availableSeats: api.availableSeats,
      charges: (api.charges || []).map((c) => ({
        type: c.type as unknown as string,
        code: c.code,
        amount: c.amount,
        currency: c.currency,
      })),
      totalAmount: api.totalAmount,
      // UI flags not part of API: order, isSelected, isRecommended
    } as SharedFare;
  }

  private mapCheckinInfo(opening?: Date, closing?: Date): JourneyCheckInInfo | undefined {
    if (!opening && !closing) return undefined;
    return { openingCheckInDate: opening, closingCheckInDate: closing };
  }
}
