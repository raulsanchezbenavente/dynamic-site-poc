import { Injectable } from '@angular/core';
import {
  Booking as ApiBooking,
  BookingInfo as ApiBookingInfo,
  Bundle as ApiBundle,
  PersonCommunicationChannel as ApiChannel,
  Contact as ApiContact,
  Eticket as ApiEticket,
  Pax as ApiPax,
  Payment as ApiPayment,
  PersonDocument as ApiPersonDocument,
  PricedItem as ApiPricedItem,
  Service as ApiService,
} from '@dcx/ui/api-layer';
import {
  BookingComment,
  BookingContact,
  BookingFee,
  BookingInfo,
  Channel,
  Document,
  EnumChangeSpecificationService,
  EnumProductScopeType,
  EnumSellType,
  Eticket,
  JourneyVM,
  LoyaltyNumber,
  Passenger,
  PaxTypeCode,
  Pricing,
  QueueInfo,
  Booking as SharedBooking,
  Bundle as SharedBundle,
  Payment as SharedPayment,
  Service as SharedService,
  TripType,
} from '@dcx/ui/libs';

import { BreakdownKey, BreakdownKeys } from '../models/breakdown-keys.const';

import { JourneyMapperService } from './journey-mapper.service';

@Injectable({ providedIn: 'root' })
export class BookingMapperService {
  constructor(private readonly journeyMapper: JourneyMapperService) {}

  public map(api: ApiBooking): SharedBooking {
    const journeys: JourneyVM[] = (api.journeys || []).map((j) => this.journeyMapper.map(j));
    const pax: Passenger[] = (api.pax || []).map((p) => this.mapPax(p));
    const payments: SharedPayment[] = (api.payments || []).map((p) => this.mapPayment(p));
    const contacts: BookingContact[] = (api.contacts || []).map((c) => this.mapContact(c));
    const services: SharedService[] = (api.services || []).map((s) => this.mapService(s));
    const bundles: SharedBundle[] | undefined = api.bundles?.map((b) => this.mapBundle(b));

    const pricing: Pricing = this.mapPricing(api.pricing);
    const bookingInfo: BookingInfo = this.mapBookingInfo(api.bookingInfo);

    const etickets: Eticket[] = (api.etickets || []).map((e: ApiEticket) => this.mapEticket(e));

    return {
      bookingInfo,
      pax,
      journeys,
      payments,
      contacts,
      pricing,
      services,
      bundles,
      bookingFees: [] as BookingFee[],
      etickets,
      hasDisruptions: api.hasDisruptions,
    } as SharedBooking;
  }

  /**
   * Maps an ApiBooking to a SharedBooking only if it hasn't been mapped yet.
   * Storybook fakes already provide a SharedBooking shape which would cause a
   * double mapping (and potential data loss) if processed again.
   * Heuristic: SharedBooking produced by this mapper always contains the
   * "bookingFees" property (even if empty). ApiBooking DTOs coming from the
   * backend do not include this property. We leverage that difference to
   * decide whether mapping is needed.
   */
  public mapIfNeeded(apiOrShared: ApiBooking | SharedBooking): SharedBooking {
    if ((apiOrShared as SharedBooking).bookingFees !== undefined) {
      return apiOrShared as SharedBooking;
    }
    return this.map(apiOrShared as ApiBooking);
  }

  private mapBookingInfo(api: ApiBookingInfo): BookingInfo {
    return {
      referenceId: api.referenceId,
      recordLocator: api.recordLocator,
      comments:
        (api as unknown as { comments?: Array<{ type: string; data: string }> }).comments?.map((c) =>
          this.mapComment(c)
        ) || [],
      queues:
        (api as unknown as { queues?: Array<{ code: string; queuedDate: Date }> }).queues?.map((q) =>
          this.mapQueue(q)
        ) || [],
      status: api.status as unknown as string,
      createdDate: (api.createdDate as unknown as Date)?.toString?.() || (api.createdDate as unknown as string),
      pointOfSale: {
        agent: { id: api.pointOfSale?.agent?.id },
        organization: { id: api.pointOfSale?.organization?.id },
        channelType: (api.pointOfSale as unknown as { channelType?: number }).channelType as number,
        posCode: (api.pointOfSale as unknown as { posCode?: string }).posCode as string,
      },
      tripType: (api as unknown as { tripType?: TripType }).tripType as unknown as TripType,
    } as BookingInfo;
  }

  private mapComment(c: { type: string; data: string }): BookingComment {
    return { type: c.type as unknown as string, data: c.data };
  }

  private mapQueue(q: { code: string; queuedDate: Date | string }): QueueInfo {
    return { code: q.code, queuedDate: (q.queuedDate as Date)?.toString?.() || (q.queuedDate as string) };
  }

  private mapPax(api: ApiPax): Passenger {
    return {
      type: { category: api.type?.category as unknown as string, code: api.type?.code as unknown as PaxTypeCode },
      dependentPaxes: api.dependentPaxes,
      id: api.id,
      name: {
        title: api.name?.title,
        first: api.name?.first,
        middle: api.name?.middle,
        last: api.name?.last,
      },
      address: api.address
        ? {
            country: api.address.country,
            province: api.address.province,
            city: api.address.city,
            zipCode: api.address.zipCode,
            addressLine: api.address.addressLine,
          }
        : undefined,
      documents: (api.documents || []).map((d) => this.mapDocument(d)),
      personInfo: api.personInfo,
      channels: (api.channels || []).map((ch) => this.mapChannel(ch)),
      segmentsInfo: (api.segmentsInfo || []).map((si) => ({
        segmentId: si.segmentId,
        status: si.status,
        seat: si.seat,
        extraSeats: si.extraSeats,
        boardingSequence: si.boardingSequence,
        boardingZone: si.boardingZone,
      })),
      status: api.status as unknown as string,
      referenceId: api.referenceId,
      loyaltyNumbers: (api.loyaltyNumbers || []) as unknown as LoyaltyNumber[],
    } as Passenger;
  }

  private mapContact(api: ApiContact): BookingContact {
    return {
      id: api.id,
      type: api.type as unknown as string,
      mktOption: api.mktOption,
      personInfo: api.personInfo,
      name: {
        title: api.name?.title,
        first: api.name?.first || '',
        middle: api.name?.middle,
        last: api.name?.last || '',
      },
      address: api.address
        ? {
            country: api.address.country,
            province: api.address.province,
            city: api.address.city,
            zipCode: api.address.zipCode,
            addressLine: api.address.addressLine,
          }
        : undefined,
      channels: (api.channels || []).map((ch) => this.mapChannel(ch)),
      documents: (api.documents || []).map((d) => this.mapDocument(d)),
      billingInfo: api.billingInfo,
      paxReferenceId: api.paxReferenceId,
    } as BookingContact;
  }

  private mapDocument(d: ApiPersonDocument): Document {
    return {
      type: d.type,
      number: d.number,
      issuedCountry: d.issuedCountry,
      nationality: d.nationality,
      expirationDate: d.expirationDate,
      issuedDate: d.issuedDate,
      isDefault: d.isDefault,
    };
  }

  private mapChannel(ch: ApiChannel): Channel {
    return {
      type: ch.type,
      info: ch.info,
      prefix: ch.prefix,
      cultureCode: ch.cultureCode,
      scope: ch.scope as unknown as number,
      additionalData: ch.additionalData,
    } as Channel;
  }

  private mapPayment(api: ApiPayment): SharedPayment {
    return {
      paymentMethod: api.paymentMethod,
      paymentType: String(api.paymentType),
      currency: api.currency,
      amount: api.amount,
      paymentDate: api.paymentDate,
      status: api.status as unknown as string,
      id: api.id ?? '',
      referenceId: api.referenceId,
      accountNumber: api.accountNumberId,
    } as SharedPayment;
  }

  private mapService(api: ApiService): SharedService {
    return {
      id: api.referenceId,
      referenceId: api.referenceId,
      code: api.code,
      sellKey: api.sellKey,
      paxId: api.paxId,
      status: api.status as unknown as string,
      type: api.type,
      scope: api.scope as unknown as EnumSellType,
      name: undefined,
      inventoried: undefined,
      bundledServices: undefined,
      capacity: undefined,
      changeStrategy: api.BookingChangeStrategy as unknown as EnumChangeSpecificationService,
      category: api.category,
      note: api.note,
      source: api.source,
      isChecked: api.isChecked,
    } as SharedService;
  }

  private mapBundle(api: ApiBundle): SharedBundle {
    return {
      id: api.referenceId,
      paxId: api.paxId,
      code: api.code,
      status: api.status as unknown as string,
      scope: api.scope as unknown as string,
      sellKey: api.sellKey,
      services: api.services,
    } as SharedBundle;
  }

  private mapEticket(api: ApiEticket): Eticket {
    return {
      code: api.code,
      paxId: api.paxId,
      referenceId: api.referenceId,
      scope: api.scope as unknown as EnumProductScopeType,
      sellKey: api.sellKey,
    };
  }

  private mapPricing(api: {
    breakdown: Record<string, ApiPricedItem[]>;
    totalAmount: number;
    balanceDue: number;
    isBalanced: boolean;
    currency: string;
  }): Pricing {
    const keysToCheck: BreakdownKey[] = [
      BreakdownKeys.PER_PAX_JOURNEY,
      BreakdownKeys.PER_PAX_SEGMENT,
      BreakdownKeys.PER_PAX,
      BreakdownKeys.PER_BOOKING,
      BreakdownKeys.PER_SEGMENT,
    ];

    const isAlreadyMappedBreakdown =
      api.breakdown &&
      typeof api.breakdown === 'object' &&
      keysToCheck.some((key) => Array.isArray(api.breakdown[key]));

    if (isAlreadyMappedBreakdown) {
      return {
        totalAmount: api.totalAmount,
        balanceDue: api.balanceDue,
        isBalanced: api.isBalanced,
        currency: api.currency,
        breakdown: {
          perBooking: api.breakdown[BreakdownKeys.PER_BOOKING],
          perPax: api.breakdown[BreakdownKeys.PER_PAX] || [],
          perPaxSegment: api.breakdown[BreakdownKeys.PER_PAX_SEGMENT] || [],
          perSegment: api.breakdown[BreakdownKeys.PER_SEGMENT] || [],
          perPaxJourney: api.breakdown[BreakdownKeys.PER_PAX_JOURNEY] || [],
        },
      } as Pricing;
    }
    const per = (
      items:
        | Array<
            ApiPricedItem & {
              referenceId?: string;
              sellKey?: string;
              charges?: Array<{ type: string; code: string; amount: number; currency: string }>;
            }
          >
        | undefined
    ): Array<{
      referenceId: string;
      sellKey: string;
      totalAmount: number;
      currency: string;
      charges: Array<{ type: string; code: string; amount: number; currency: string }>;
    }> =>
      (items || []).map((i) => ({
        referenceId: i.referenceId,
        sellKey: i.sellKey as string,
        totalAmount: i.totalAmount,
        currency: i.currency,
        charges: (i.charges || []).map((c) => ({
          type: c.type as unknown as string,
          code: c.code,
          amount: c.amount,
          currency: c.currency,
        })),
      }));

    type Charges = { type: string; code: string; amount: number; currency: string };
    type PricedBase = ApiPricedItem & { referenceId?: string; sellKey?: string; charges?: Charges[] };
    type PerPaxItem = PricedBase & { paxId: string };
    type PerPaxSegmentItem = PricedBase & { paxId: string; segmentId: string };
    type PerPaxJourneyItem = PricedBase & { paxId: string; journeyId: string };

    const breakdownMap = (api.breakdown || {}) as Record<string, Array<ApiPricedItem & { [key: string]: unknown }>>;

    return {
      totalAmount: api.totalAmount,
      balanceDue: api.balanceDue,
      isBalanced: api.isBalanced,
      currency: api.currency,
      breakdown: {
        perBooking: per(breakdownMap[BreakdownKeys.PER_BOOKING]),
        perPax: ((breakdownMap[BreakdownKeys.PER_PAX] || []) as unknown as PerPaxItem[]).map((i) => ({
          paxId: i.paxId,
          referenceId: i.referenceId,
          sellKey: i.sellKey,
          totalAmount: i.totalAmount,
          currency: i.currency,
          charges: (i.charges || []).map((c) => ({
            type: c.type as unknown as string,
            code: c.code,
            amount: c.amount,
            currency: c.currency,
          })),
        })),
        perPaxSegment: ((breakdownMap[BreakdownKeys.PER_PAX_SEGMENT] || []) as unknown as PerPaxSegmentItem[]).map(
          (i) => ({
            paxId: i.paxId,
            segmentId: i.segmentId,
            referenceId: i.referenceId,
            sellKey: i.sellKey,
            totalAmount: i.totalAmount,
            currency: i.currency,
            charges: (i.charges || []).map((c) => ({
              type: c.type as unknown as string,
              code: c.code,
              amount: c.amount,
              currency: c.currency,
            })),
          })
        ),
        perSegment: per(breakdownMap[BreakdownKeys.PER_SEGMENT]),
        perPaxJourney: ((breakdownMap[BreakdownKeys.PER_PAX_JOURNEY] || []) as unknown as PerPaxJourneyItem[]).map(
          (i) => ({
            paxId: i.paxId,
            journeyId: i.journeyId,
            referenceId: i.referenceId,
            sellKey: i.sellKey,
            totalAmount: i.totalAmount,
            currency: i.currency,
            charges: (i.charges || []).map((c) => ({
              type: c.type as unknown as string,
              code: c.code,
              amount: c.amount,
              currency: c.currency,
            })),
          })
        ),
      },
    } as Pricing;
  }
}
