import { Injectable } from '@angular/core';
import {
  Booking as BookingDto,
  BookingInfo as BookingInfoDto,
  BookingPricing,
  Bundle as BundleDto,
  Contact,
  Eticket as EticketDto,
  Journey,
  Leg,
  Pax,
  Payment as PaymentDto,
  Segment,
  Service as ServiceDto,
} from '@dcx/ui/api-layer';
import {
  Booking,
  BookingContact,
  BookingInfo,
  Bundle,
  EnumProductScopeType,
  EnumSellType,
  Eticket,
  JourneyType,
  JourneyVM,
  LegVM,
  Passenger,
  PaxTypeCode,
  Payment,
  Pricing,
  SegmentVM,
  Service,
  Transport,
  TripType,
} from '@dcx/ui/libs';

import { BreakdownKeys } from '../components/summary-cart/models/breakdown-keys.const';
import { BreakdownFields } from '../enums/breakdown-fields.enum';

@Injectable({
  providedIn: 'root',
})
export class BookingDtoMapperService {
  public mapBooking(dto: BookingDto): Booking {
    return {
      bookingInfo: this.mapBookingInfo(dto.bookingInfo),
      pax: this.mapPax(dto.pax),
      journeys: this.mapJourneys(dto.journeys),
      payments: this.mapPayments(dto.payments),
      contacts: this.mapContacts(dto.contacts),
      pricing: this.mapPricing(dto.pricing),
      services: this.mapServices(dto.services),
      bundles: this.mapBundles(dto.bundles),
      bookingFees: [],
      etickets: this.mapEtickets(dto.etickets),
      hasDisruptions: dto.hasDisruptions,
    };
  }

  private mapBookingInfo(dto: BookingInfoDto): BookingInfo {
    return {
      recordLocator: dto.recordLocator,
      createdDate: typeof dto.createdDate === 'string' ? dto.createdDate : dto.createdDate.toISOString(),
      status: dto.status.toString(),
      comments: dto.comments.map((comment) => ({
        type: '',
        data: comment.data,
      })),
      queues: dto.queues.map((queue) => ({
        code: queue.code,
        queuedDate: typeof queue.queuedDate === 'string' ? queue.queuedDate : queue.queuedDate.toISOString(),
      })),
      pointOfSale: {
        agent: dto.pointOfSale.agent,
        organization: dto.pointOfSale.organization,
        channelType: dto.pointOfSale.channelType as unknown as number,
        posCode: dto.pointOfSale.posCode,
      },
      tripType: dto.tripType as unknown as TripType,
      referenceId: dto.referenceId,
    };
  }

  private mapPax(dtoPax: Pax[]): Passenger[] {
    return dtoPax.map((pax) => ({
      type: {
        category: pax.type.category,
        code: pax.type.code as unknown as PaxTypeCode,
      },
      dependentPaxes: pax.dependentPaxes,
      id: pax.id,
      name: {
        title: pax.name.title,
        first: pax.name.first,
        middle: pax.name.middle,
        last: pax.name.last,
      },
      address: pax.address,
      documents: pax.documents,
      personInfo: pax.personInfo,
      channels: pax.channels.map((channel) => ({
        type: channel.type,
        info: channel.info,
        prefix: channel.prefix,
        cultureCode: channel.cultureCode,
        scope: channel.scope as unknown as number,
        additionalData: channel.additionalData,
      })),
      segmentsInfo: pax.segmentsInfo,
      status: pax.status,
      referenceId: pax.referenceId,
      loyaltyNumbers: pax.loyaltyNumbers,
    }));
  }

  private mapJourneys(dtoJourneys: Journey[]): JourneyVM[] {
    return dtoJourneys.map((journey, index: number, arr: Journey[]) => {
      const inferredJourneyType: JourneyType = arr.length > 1 && index > 0 ? JourneyType.RETURN : JourneyType.OUTBOUND;
      return {
        id: journey.id,
        origin: {
          city: journey.origin,
          iata: journey.origin,
          terminal: journey.originTerminal,
          country: journey.originCountry,
        },
        destination: {
          city: journey.destination,
          iata: journey.destination,
          terminal: journey.destinationTerminal,
          country: journey.destinationCountry,
        },
        schedule: {
          std: journey.std,
          stdutc: journey.stdutc,
          sta: journey.sta,
          stautc: journey.stautc,
        },
        duration: journey.duration,
        segments: this.mapSegments(journey.segments),
        fares: journey.fares,
        status: journey.status,
        journeyType: inferredJourneyType,
        checkinInfo: {
          openingCheckInDate: journey.openingCheckInDate,
          closingCheckInDate: journey.closingCheckInDate,
        },
      };
    });
  }

  private mapSegments(dtoSegments: Segment[]): SegmentVM[] {
    return dtoSegments.map((segment) => ({
      id: segment.id,
      referenceId: segment.referenceId,
      origin: {
        city: segment.origin,
        iata: segment.origin,
        country: segment.originCountry,
      },
      destination: {
        city: segment.destination,
        iata: segment.destination,
        country: segment.destinationCountry,
      },
      schedule: {
        std: segment.std,
        stdutc: segment.stdutc,
        sta: segment.sta,
        stautc: segment.stautc,
      },
      duration: segment.duration,
      transport: segment.transport as unknown as Transport,
      legs: this.mapLegs(segment.legs, segment.transport as unknown as Transport),
    }));
  }

  private mapLegs(dtoLegs: Leg[], segmentTransport: Transport): LegVM[] {
    return dtoLegs.map((leg) => ({
      origin: leg.origin,
      destination: leg.destination,
      duration: this.calculateDuration(leg.std, leg.sta),
      std: leg.std,
      stdutc: leg.stdutc,
      sta: leg.sta,
      stautc: leg.stautc,
      transport: segmentTransport,
    }));
  }

  private mapContacts(dtoContacts: Contact[]): BookingContact[] {
    return dtoContacts.map((contact) => ({
      id: contact.id,
      type: contact.type.toString(),
      mktOption: contact.mktOption,
      personInfo: contact.personInfo,
      name: {
        title: contact.name.title,
        first: contact.name.first,
        middle: contact.name.middle,
        last: contact.name.last,
      },
      address: contact.address,
      channels: contact.channels.map((channel) => ({
        type: channel.type,
        info: channel.info,
        prefix: channel.prefix,
        cultureCode: channel.cultureCode,
        scope: channel.scope as unknown as number,
        additionalData: channel.additionalData,
      })),
      documents: contact.documents,
      billingInfo: contact.billingInfo,
      paxReferenceId: contact.paxReferenceId,
    }));
  }

  private mapPricing(dtoPricing: BookingPricing): Pricing {
    return {
      totalAmount: dtoPricing.totalAmount,
      balanceDue: dtoPricing.balanceDue,
      isBalanced: dtoPricing.isBalanced,
      currency: dtoPricing.currency,
      breakdown: {
        perBooking: this.mapBreakdownItems(dtoPricing.breakdown[BreakdownKeys.PER_BOOKING]),
        perPax: this.mapBreakdownItems(dtoPricing.breakdown[BreakdownKeys.PER_PAX], [BreakdownFields.PAX_ID]),
        perPaxSegment: this.mapBreakdownItems(dtoPricing.breakdown[BreakdownKeys.PER_PAX_SEGMENT], [
          BreakdownFields.PAX_ID,
          BreakdownFields.SEGMENT_ID,
        ]),
        perSegment: this.mapBreakdownItems(dtoPricing.breakdown[BreakdownKeys.PER_SEGMENT]),
        perPaxJourney: this.mapBreakdownItems(dtoPricing.breakdown[BreakdownKeys.PER_PAX_JOURNEY], [
          BreakdownFields.PAX_ID,
          BreakdownFields.JOURNEY_ID,
        ]),
      },
    };
  }

  private mapBreakdownItems(items: any[] | undefined, extraFields: string[] = []): any[] {
    if (!items) {
      return [];
    }

    return items.map((item) => {
      const mappedItem: any = {
        ...item,
        charges: item.charges || [],
      };

      extraFields.forEach((field) => {
        mappedItem[field] = item[field] || '';
      });

      return mappedItem;
    });
  }

  private mapPayments(dtoPayments: PaymentDto[]): Payment[] {
    return dtoPayments.map((payment) => ({
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType.toString(),
      currency: payment.currency,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      status: payment.status.toString(),
      id: payment.id ?? '',
      referenceId: payment.referenceId,
      accountNumber: payment.accountNumberId,
    }));
  }

  private mapServices(dtoServices: ServiceDto[]): Service[] {
    return dtoServices.map((service) => ({
      id: service.id,
      referenceId: service.referenceId,
      code: service.code,
      sellKey: service.sellKey,
      paxId: service.paxId,
      status: service.status.toString(),
      type: service.type,
      scope: service.scope as unknown as EnumSellType,
      category: service.category,
      note: service.note,
      source: service.source,
      isChecked: service.isChecked,
    }));
  }

  private mapBundles(dtoBundles: BundleDto[]): Bundle[] {
    return dtoBundles.map((bundle) => ({
      id: bundle.referenceId,
      paxId: bundle.paxId,
      code: bundle.code,
      status: bundle.status.toString(),
      scope: bundle.scope.toString(),
      sellKey: bundle.sellKey,
      services: bundle.services,
    }));
  }

  private mapEtickets(dtoEtickets: EticketDto[]): Eticket[] {
    return dtoEtickets.map((eticket) => ({
      code: eticket.code,
      paxId: eticket.paxId,
      referenceId: eticket.referenceId,
      scope: eticket.scope as unknown as EnumProductScopeType, // Cast del enum si es necesario
      sellKey: eticket.sellKey,
    }));
  }

  private calculateDuration(std: Date | string, sta: Date | string): string {
    const departureTime = new Date(std).getTime();
    const arrivalTime = new Date(sta).getTime();
    if (!Number.isFinite(departureTime) || !Number.isFinite(arrivalTime) || arrivalTime <= departureTime) {
      return '00:00';
    }
    const totalMinutes = Math.floor((arrivalTime - departureTime) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
