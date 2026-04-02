import { Inject, Injectable } from '@angular/core';
import {
  Booking,
  Bundle,
  Charge,
  EnumChargesType,
  EnumSellType,
  EnumSeparators,
  EnumServiceStatus,
  GroupedCharges,
  ISummarySelectedJourneysService,
  JourneyVM,
  PerPax,
  PerPaxJourney,
  PerPaxSegment,
  PerPricing,
  PerPricingVm,
  ScheduleSelection,
  SegmentVM,
  SellTypeOfService,
  Service,
  SessionStore,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummarySection,
  SummaryTypologyDataPerRouteVmParams,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyDataVmParams,
  SummaryTypologyRecord,
  SummaryTypologyRecordCommonParams,
  SummaryTypologyService,
  UtilitiesHelper,
} from '@dcx/ui/libs';

@Injectable({ providedIn: 'root' })
export class SummaryTypologyBaseService {
  constructor(
    protected sessionStore: SessionStore,
    @Inject(SUMMARY_SELECTED_JOURNEYS_SERVICE)
    protected summarySelectedJourneysService: ISummarySelectedJourneysService
  ) {}

  public buildSummaryTypologyDataVm(params: SummaryTypologyDataVmParams): SummaryTypologyDataVm[] {
    const result: SummaryTypologyDataVm[] = [];

    const servicesByRoute = this.getServiceByRoutes(
      params.booking,
      params.scheduleSelection,
      params.excludeChargesCode,
      params.showInfoForSelectedFlight
    );

    if (servicesByRoute.departureJourneyList.length > 0) {
      result.push(
        this.getDataByJourney(
          servicesByRoute.departureJourneyList,
          params.departureLabel,
          params.booking.journeys[0].origin.city +
            EnumSeparators.DASH_SEPARATOR +
            params.booking.journeys[0].destination.city,
          false,
          params.excludeChargesCode
        )
      );
    }

    if (servicesByRoute.arrivalJourneyList.length > 0) {
      const labelText =
        params.scheduleSelection && !params.scheduleSelection.departure
          ? params.booking.journeys[0].origin.city +
            EnumSeparators.DASH_SEPARATOR +
            params.booking.journeys[0].destination.city
          : params.booking.journeys[1].origin.city +
            EnumSeparators.DASH_SEPARATOR +
            params.booking.journeys[1].destination.city;
      result.push(
        this.getDataByJourney(
          servicesByRoute.arrivalJourneyList,
          params.returnLabel,
          labelText,
          false,
          params.excludeChargesCode
        )
      );
    }

    const sections: SummarySection[] = [{ label: params.servicesLabel, chargesTypes: [EnumChargesType.SERVICE] }];

    for (const section of sections) {
      const changesSections = this.getSummaryTypologyData(
        servicesByRoute.departureJourneyList.concat(servicesByRoute.arrivalJourneyList),
        section.label,
        params.excludeChargesCode,
        section.chargesTypes,
        params.booking
      );

      this.summaryTypologyRecordMerge(changesSections, params.servicesCodesToMerge);

      if (changesSections.records && changesSections.records.length > 0) {
        result.push(changesSections);
      }
    }

    return result;
  }

  public buildSummaryTypologyDataPerRouteVm(params: SummaryTypologyDataPerRouteVmParams): SummaryTypologyDataVm[] {
    const result: SummaryTypologyDataVm[] = [];

    const servicesByRoute = this.getServiceByRoutes(
      params.booking,
      params.scheduleSelection,
      params.excludeChargesCode,
      params.showInfoForSelectedFlight
    );
    const serviceByBooking = params.sellTypePerServices
      .filter((s) => s.scope === EnumSellType.PER_BOOKING || s.scope === EnumSellType.PER_PAX)
      .map((s) => s.code);

    if (servicesByRoute.departureJourneyList.length > 0) {
      const departure = this.getDataByJourney(
        servicesByRoute.departureJourneyList,
        params.departureLabel,
        params.booking.journeys[0].origin.city +
          EnumSeparators.DASH_SEPARATOR +
          params.booking.journeys[0].destination.city,
        true,
        serviceByBooking.concat(params.excludeChargesCode)
      );
      departure.modelType = SummaryTypologyDataVmModelType.DEPARTURE;
      result.push(departure);
    }

    if (servicesByRoute.arrivalJourneyList.length > 0) {
      const labelText =
        params.scheduleSelection && !params.scheduleSelection.departure
          ? params.booking.journeys[0].origin.city +
            EnumSeparators.DASH_SEPARATOR +
            params.booking.journeys[0].destination.city
          : params.booking.journeys[1].origin.city +
            EnumSeparators.DASH_SEPARATOR +
            params.booking.journeys[1].destination.city;

      const arrival = this.getDataByJourney(
        servicesByRoute.arrivalJourneyList,
        params.returnLabel,
        labelText,
        true,
        serviceByBooking.concat(params.excludeChargesCode)
      );
      arrival.modelType = SummaryTypologyDataVmModelType.ARRIVAL;
      result.push(arrival);
    }

    const servicesList = servicesByRoute.departureJourneyList
      .concat(servicesByRoute.arrivalJourneyList)
      .concat(servicesByRoute.perBookingServiceList);
    for (const svc of servicesList) {
      if (svc?.charges) {
        svc.charges = svc.charges.filter((charge) =>
          charge.type === EnumChargesType.SERVICE ? serviceByBooking.includes(charge.code as string) : true
        );
      }
    }

    let chargesTypesList = [EnumChargesType.SERVICE, EnumChargesType.DISCOUNT];
    if (servicesByRoute.perBookingServiceList.some((x) => x.charges.some((c) => c.type === EnumChargesType.FARE))) {
      const additionalChargesTypes = [EnumChargesType.FARE, EnumChargesType.TAX];
      chargesTypesList = [...chargesTypesList, ...additionalChargesTypes];
    }

    const sections: SummarySection[] = [
      {
        label: params.servicesLabel,
        chargesTypes: chargesTypesList,
      },
    ];

    for (const section of sections) {
      const chargesSection = this.getSummaryTypologyData(
        servicesList,
        section.label,
        params.excludeChargesCode,
        section.chargesTypes,
        params.booking
      );

      if (chargesSection.records && chargesSection.records.length > 0) {
        chargesSection.modelType = SummaryTypologyDataVmModelType.SERVICES;
        result.push(chargesSection);
      }
    }

    for (const r of result) {
      this.mergeServiceByScope(r, params.sellTypePerServices);
      this.summaryTypologyRecordMerge(r, params.servicesCodesToMerge);
      this.summaryTypologyChargesMerge(r, params.chargesCodesToMerge);
    }

    return result;
  }

  public buildSummaryTypologyDataPerPaxVm(
    booking: Booking,
    priceBreakdown: string,
    servicesLabel: string,
    taxesLabel: string,
    servicesCodesToMerge: string[],
    excludeChargesCode: string[]
  ): SummaryTypologyDataVm[] {
    const result: SummaryTypologyDataVm[] = [];
    const journeyList: PerPricingVm[] = [];

    if (booking.pricing.breakdown?.perPaxJourney) {
      for (const ppj of booking.pricing.breakdown.perPaxJourney) {
        journeyList.push(this.perPricingToPerPricingVm(ppj.journeyId, ppj.paxId, ppj, EnumSellType.PER_PAX_JOURNEY));
      }
    }

    if (journeyList.length > 0) {
      result.push(this.getDataByJourney(journeyList, priceBreakdown, '', false, excludeChargesCode));
    }

    const sections: SummarySection[] = [
      { label: servicesLabel, chargesTypes: [EnumChargesType.SERVICE] },
      { label: taxesLabel, chargesTypes: [EnumChargesType.TAX] },
    ];

    for (const section of sections) {
      const chargesSection = this.getSummaryTypologyData(
        journeyList,
        section.label,
        excludeChargesCode,
        section.chargesTypes,
        booking
      );
      this.summaryTypologyRecordMerge(chargesSection, servicesCodesToMerge);

      if (chargesSection.records?.length && chargesSection.records.length > 0) {
        result.push(chargesSection);
      }
    }

    return result;
  }

  protected getPaxJourneyList(
    selectedJourneys: JourneyVM[],
    booking: Booking,
    showInfoForSelectedFlight: boolean,
    perPaxJourneyList: PerPaxJourney[]
  ): PerPaxJourney[] {
    if (showInfoForSelectedFlight) {
      const pendingServicesByJourney = this.getPendingServices(booking, EnumSellType.PER_PAX_JOURNEY);
      return this.getPerPaxJourneysBySelectedJourneys(pendingServicesByJourney, selectedJourneys, perPaxJourneyList);
    }

    const selectedJourneyIds = new Set(selectedJourneys.map((sj) => sj.id));
    const servicesByJourney = booking.services.filter((s) => selectedJourneyIds.has(s.sellKey));

    return perPaxJourneyList.filter((ppj) => servicesByJourney.filter((pj) => pj.sellKey === ppj.journeyId));
  }

  protected getPerPaxJourneysBySelectedJourneys(
    pendingServices: Service[],
    selectedJourneys: JourneyVM[],
    perPaxJourneyList: PerPaxJourney[]
  ): PerPaxJourney[] {
    const selectedJourneyIds = new Set(selectedJourneys.map((sj) => sj.id));
    const servicesByJourneys = pendingServices.filter((s) => selectedJourneyIds.has(s.sellKey));

    return perPaxJourneyList.filter((ppj) =>
      servicesByJourneys.some(
        (pj) => pj.sellKey === ppj.journeyId && pj.paxId === ppj.paxId && pj.id === ppj.referenceId
      )
    );
  }

  protected getPaxSegmentList(
    selectedSegments: SegmentVM[],
    booking: Booking,
    showInfoForSelectedFlight: boolean,
    perPaxSegmentList: PerPaxSegment[]
  ): PerPaxSegment[] {
    if (showInfoForSelectedFlight) {
      const pendingServicesBySegment = this.getPendingServices(booking, EnumSellType.PER_PAX_SEGMENT);
      return this.getPerPaxSegmentsBySelectedSegments(pendingServicesBySegment, selectedSegments, perPaxSegmentList);
    }

    const selectedSegmentIds = new Set(selectedSegments.map((ss) => ss.id));
    const servicesBySegment = booking.services.filter((s) => selectedSegmentIds.has(s.sellKey));

    return perPaxSegmentList.filter((pps) => servicesBySegment.filter((ps) => ps.sellKey === pps.segmentId));
  }

  protected getPerPaxSegmentsBySelectedSegments(
    pendingServices: Service[],
    selectedSegments: SegmentVM[],
    perPaxSegments: PerPaxSegment[]
  ): PerPaxSegment[] {
    const selectedSegmentIds = new Set(selectedSegments.map((sj) => sj.id));
    const servicesBySegments = pendingServices.filter((s) => selectedSegmentIds.has(s.sellKey));

    return perPaxSegments.filter((ppj) =>
      servicesBySegments.some(
        (pj) => pj.sellKey === ppj.segmentId && pj.paxId === ppj.paxId && pj.id === ppj.referenceId
      )
    );
  }

  protected getPendingServices(booking: Booking, scope: EnumSellType): Service[] {
    const result = booking.services.filter((s) => s.scope === scope && s.status === EnumServiceStatus.PENDING);
    return result;
  }

  protected getServiceListPerBooking(booking: Booking, showInfoForSelectedFlight: boolean): PerPricingVm[] {
    const perBookingServiceList: PerPricingVm[] = [];

    if (!booking.pricing.breakdown?.perBooking) {
      return perBookingServiceList;
    }

    if (showInfoForSelectedFlight) {
      return perBookingServiceList;
    }

    for (const services of booking.services) {
      if (services.scope !== EnumSellType.PER_BOOKING) {
        continue;
      }

      for (const pb of booking.pricing.breakdown.perBooking) {
        const newItem = {
          ...pb,
          sellType: EnumSellType.PER_BOOKING,
        };
        
        const exists = perBookingServiceList.some((existingItem) => existingItem.charges === newItem.charges);
        if (!exists) {
          perBookingServiceList.push(newItem);
        }
      }
    }

    return perBookingServiceList;
  }

  private getDataByJourney(
    perPricing: PerPricingVm[],
    label: string,
    labelText?: string,
    includeServices?: boolean,
    skipServices?: string[]
  ): SummaryTypologyDataVm {
    let summaryTypologyDataVm: SummaryTypologyDataVm = {};
    if (perPricing.length > 0) {
      summaryTypologyDataVm = {};
      summaryTypologyDataVm.records = [];
      summaryTypologyDataVm.currency = perPricing[0].currency;
      summaryTypologyDataVm.label = label;
      summaryTypologyDataVm.labelText = labelText;

      const filteredPricing = perPricing
        .filter((priceItem) => {
          const principalCharge = this.getPrincipalChargeType(priceItem);
          return (
            principalCharge &&
            (principalCharge.type !== EnumChargesType.SERVICE ||
              (includeServices === true && !skipServices?.includes(principalCharge.code as string)))
          );
        });
      
      for (const priceItem of filteredPricing) {
        const principalCharge = this.getPrincipalChargeType(priceItem);

        const recordExists = summaryTypologyDataVm.records?.find(
          (record) => record.code === principalCharge.code && record.price === priceItem.totalAmount
        );
        const relatedServices: SummaryTypologyService = {
          referenceId: priceItem.referenceId,
          paxId: priceItem.paxId,
          sellkey: priceItem.sellKey,
        };

        if (recordExists?.charges) {
          recordExists.quantity++;
          recordExists.relatedServices.push(relatedServices);
          recordExists.charges = this.mergeCharges(recordExists.charges, priceItem.charges);
        } else {
          summaryTypologyDataVm.records?.push(
            this.buildSummaryTypologyRecord(
              principalCharge.code as string,
              principalCharge,
              priceItem,
              [relatedServices],
              [],
              []
            )
          );
        }
      }
      summaryTypologyDataVm.price = this.getTotalAmount(summaryTypologyDataVm.records).toString();
    }
    return summaryTypologyDataVm;
  }

  /**
   * Get services and charges by route
   */
  private getServiceByRoutes(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    excludeChargesCode: string[],
    showInfoForSelectedFlight: boolean
  ): {
    departureJourneyList: PerPricingVm[];
    arrivalJourneyList: PerPricingVm[];
    perBookingServiceList: PerPricingVm[];
  } {
    const departureJourneyList: PerPricingVm[] = [];
    const arrivalJourneyList: PerPricingVm[] = [];

    let perPaxJourneyList = booking.pricing.breakdown?.perPaxJourney
      ? (UtilitiesHelper.clone(booking.pricing.breakdown.perPaxJourney) as PerPaxJourney[])
      : ([] as PerPaxJourney[]);

    let perPaxSegmentList = booking.pricing.breakdown?.perPaxSegment
      ? (UtilitiesHelper.clone(booking.pricing.breakdown.perPaxSegment) as PerPaxSegment[])
      : ([] as PerPaxSegment[]);

    const selectedJourneysToCheckIn = this.summarySelectedJourneysService.getJourneysToRequest();
    if (selectedJourneysToCheckIn) {
      const result = this.processSelectedJourneys(
        booking,
        selectedJourneysToCheckIn,
        showInfoForSelectedFlight,
        perPaxJourneyList,
        perPaxSegmentList
      );
      perPaxJourneyList = result.perPaxJourneyList;
      perPaxSegmentList = result.perPaxSegmentList;
    }

    this.processPerPaxJourneyLists(booking, scheduleSelection, departureJourneyList, arrivalJourneyList, perPaxJourneyList);
    this.processPerPaxSegmentList(booking, scheduleSelection, departureJourneyList, arrivalJourneyList, perPaxSegmentList);

    const perBookingServiceList = this.getServiceListPerBooking(booking, showInfoForSelectedFlight);

    this.processPerSegmentBreakdown(booking, scheduleSelection, departureJourneyList, arrivalJourneyList);

    return {
      departureJourneyList: this.joinServicesOfTheSameTypeIfApplicable(departureJourneyList, excludeChargesCode),
      arrivalJourneyList: this.joinServicesOfTheSameTypeIfApplicable(arrivalJourneyList, excludeChargesCode),
      perBookingServiceList: this.joinServicesOfTheSameTypeIfApplicable(perBookingServiceList, excludeChargesCode),
    };
  }

  /**
   * Process selected journeys and segments
   */
  private processSelectedJourneys(
    booking: Booking,
    selectedJourneysToCheckIn: string[],
    showInfoForSelectedFlight: boolean,
    perPaxJourneyList: PerPaxJourney[],
    perPaxSegmentList: PerPaxSegment[]
  ): { perPaxJourneyList: PerPaxJourney[]; perPaxSegmentList: PerPaxSegment[] } {
    const selectedJourneys = booking.journeys.filter((j: JourneyVM) =>
      selectedJourneysToCheckIn.includes(j.id)
    );
    const selectedSegments = selectedJourneys.reduce<SegmentVM[]>((s, j) => [...s, ...j.segments], []);

    return {
      perPaxJourneyList: this.getPaxJourneyList(selectedJourneys, booking, showInfoForSelectedFlight, perPaxJourneyList),
      perPaxSegmentList: this.getPaxSegmentList(selectedSegments, booking, showInfoForSelectedFlight, perPaxSegmentList),
    };
  }

  /**
   * Process per pax journey lists for departure and arrival
   */
  private processPerPaxJourneyLists(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    departureJourneyList: PerPricingVm[],
    arrivalJourneyList: PerPricingVm[],
    perPaxJourneyList: PerPaxJourney[]
  ): void {
    if (!perPaxJourneyList) return;

    this.departurePerPaxJourney(booking, scheduleSelection, departureJourneyList, perPaxJourneyList);
    this.arrivalPerPaxJourney(booking, scheduleSelection, arrivalJourneyList, perPaxJourneyList);
  }

  /**
   * Process per pax segment list
   */
  private processPerPaxSegmentList(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    departureJourneyList: PerPricingVm[],
    arrivalJourneyList: PerPricingVm[],
    perPaxSegmentList: PerPaxSegment[]
  ): void {
    if (!perPaxSegmentList) return;

    for (const pps of perPaxSegmentList) {
      const filteredByRoute = this.filterByRoute(
        pps.segmentId,
        pps.paxId,
        pps,
        EnumSellType.PER_PAX_SEGMENT,
        booking,
        scheduleSelection
      );
      departureJourneyList.push(...filteredByRoute.departure);
      arrivalJourneyList.push(...filteredByRoute.arrival);
    }
  }

  /**
   * Process per pax breakdown to create booking service list
   */
  private processPerPaxBreakdown(booking: Booking): PerPricingVm[] {
    if (!booking.pricing.breakdown?.perPax) {
      return [];
    }

    const groupedCharges = this.groupChargesFromPerPax(booking.pricing.breakdown.perPax);
    return this.createPerBookingServiceList(booking.pricing.breakdown.perPax, groupedCharges);
  }

  /**
   * Group charges from per pax breakdown
   */
  private groupChargesFromPerPax(perPaxList: PerPax[]): GroupedCharges[] {
    const groupedCharges: GroupedCharges[] = [];

    for (const perPax of perPaxList) {
      for (const charge of perPax.charges) {
        const groupedChargesFound = groupedCharges.find((x) => x.code === charge.code && x.price === charge.amount);
        if (groupedChargesFound) {
          groupedChargesFound.quantity = groupedChargesFound.quantity + 1;
        } else {
          groupedCharges.push({
            code: charge.code as string,
            quantity: 1,
            currency: charge.currency as string,
            type: charge.type as string,
            price: charge.amount as number,
          });
        }
      }
    }

    return groupedCharges;
  }

  /**
   * Create per booking service list with grouped charges
   */
  private createPerBookingServiceList(perPaxList: PerPax[], groupedCharges: GroupedCharges[]): PerPricingVm[] {
    const perBookingServiceList: PerPricingVm[] = [];
    const charges: Charge[] = [];
    const perPaxs: PerPax[] = [];

    for (const perPax of perPaxList) {
      perPaxs.push(UtilitiesHelper.clone(perPax) as PerPax);
      const lastPerPaxIncluded = perPaxs.at(-1)!;
      lastPerPaxIncluded.charges = [];

      for (const charge of perPax.charges) {
        charges.push(UtilitiesHelper.clone(charge) as Charge);
        const lastChargeIncluded = charges.at(-1)!;

        const groupedChargesFound = groupedCharges.find((x) => x.code === charge.code && x.price === charge.amount);
        if (groupedChargesFound!.quantity > 1) {
          lastChargeIncluded.amount = (charge.amount ?? 0) * groupedChargesFound!.quantity;
        }

        lastPerPaxIncluded.charges.push(lastChargeIncluded);
      }

      perBookingServiceList.push({
        ...lastPerPaxIncluded,
        sellType: EnumSellType.PER_BOOKING,
      });
    }

    return perBookingServiceList;
  }

  /**
   * Process per segment breakdown
   */
  private processPerSegmentBreakdown(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    departureJourneyList: PerPricingVm[],
    arrivalJourneyList: PerPricingVm[]
  ): void {
    if (!booking.pricing.breakdown?.perSegment) return;

    for (const ps of booking.pricing.breakdown.perSegment) {
      const filteredByRoute = this.filterByRoute(
        ps.sellKey as string,
        '',
        ps,
        EnumSellType.PER_SEGMENT,
        booking,
        scheduleSelection
      );
      departureJourneyList.push(...filteredByRoute.departure);
      arrivalJourneyList.push(...filteredByRoute.arrival);
    }
  }

  /**
   * Get getSummaryTypologyData model, section into of summary/basket
   * @param perPricing object perPricing into of pricing of booking
   * @param label section text
   * @param excludeChargesCode codes to exclude into the section
   * @param chargesTypes types of charges that make up the section
   * @param booking booking of the session
   */
  private getSummaryTypologyData(
    perPricing: PerPricingVm[],
    label: string,
    excludeChargesCode: string[],
    chargesTypes: string[],
    booking?: Booking
  ): SummaryTypologyDataVm {
    const services = booking?.services;
    const bundles = booking?.bundles;
    let summaryTypologyDataVm: SummaryTypologyDataVm = {};
    summaryTypologyDataVm = {};
    summaryTypologyDataVm.records = [];
    summaryTypologyDataVm.bundledRecords = [];
    summaryTypologyDataVm.currency = '';
    summaryTypologyDataVm.label = label;

    const filteredPerPricing = perPricing
      .filter((priceItem) => {
        const principalCharge = this.getPrincipalChargeType(priceItem);
        return (
          principalCharge &&
          chargesTypes.includes(principalCharge.type as string) &&
          !excludeChargesCode.includes(principalCharge.code as string)
        );
      });
    
    for (const priceItem of filteredPerPricing) {
      const principalCharge = this.getPrincipalChargeType(priceItem);

      this.setPrincipalCharge(
        principalCharge,
        priceItem,
        booking ?? ({} as Booking),
        summaryTypologyDataVm,
        services ?? ([] as Service[]),
        bundles ?? ([] as Bundle[])
      );
    }

    summaryTypologyDataVm.currency =
      summaryTypologyDataVm.records.length > 0 ? summaryTypologyDataVm.records[0].currency : '';

    summaryTypologyDataVm.price = this.getTotalAmount(summaryTypologyDataVm.records).toString();

    // Sum all the charges to get the price for the record
    for (const record of summaryTypologyDataVm.records) {
      let chargeSum = 0;

      if (record.charges && record.charges.length > 0) {
        for (const charge of record.charges) {
          chargeSum = chargeSum + charge.price;
        }

        record.price = chargeSum;
      }
    }

    return summaryTypologyDataVm;
  }

  private summaryTypologyRecordMerge(services: SummaryTypologyDataVm, servicesCodesToMerge: string[]): void {
    for (const code of servicesCodesToMerge) {
      const records = services.records?.filter((s) => s.code === code);
      if (records && records.length > 0) {
        const newRecord = records[0];

        newRecord.price = records.reduce((sum: number, current) => current.price * current.quantity + sum, 0);
        newRecord.quantity = 0;

        services.records = services.records?.filter((s) => s.code !== code);
        services.records?.push(newRecord);
      }
    }
  }

  private mergeServiceByScope(summaryTypologyData: SummaryTypologyDataVm, servicesScope: SellTypeOfService[]): void {
    if (!summaryTypologyData?.records?.length) {
      return;
    }

    for (const record of summaryTypologyData.records) {
      if (!record) continue;
      if (!record.relatedServices?.length) continue;

      const serviceScope = servicesScope.find((s) => record.code === s.code && s.scope !== record.sellType);

      if (!serviceScope) continue;

      const grouped = this.groupServicesBySellKey(record.relatedServices);
      if (!grouped.length) continue;

      const minValue = Math.min(...grouped.map((g) => g.length));
      if (Number.isFinite(minValue)) {
        record.quantity = minValue;
      }

      record.price *= grouped.length;
    }
  }

  private groupServicesBySellKey(relatedServices: SummaryTypologyService[]): SummaryTypologyService[][] {
    if (!relatedServices?.length) return [];

    const relatedServicesFilteredByReferenciId = relatedServices.filter((svc) => !!svc.referenceId);

    if (relatedServicesFilteredByReferenciId.length === 0) {
      return [[...relatedServices]];
    }

    const groupsMap = new Map<string, SummaryTypologyService[]>();
    for (const svc of relatedServicesFilteredByReferenciId) {
      const key = svc.sellkey ?? '';
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(svc);
    }

    return Array.from(groupsMap.values());
  }

  /**
   *  function to merge service charges with configuration code sent from
   * @param services List services by booking
   * @param chargesCodesToMerge codes config sent from CMS
   */
  private summaryTypologyChargesMerge(services: SummaryTypologyDataVm, chargesCodesToMerge: string[]): void {
    for (const code of chargesCodesToMerge) {
      if (services.records) {
        for (const record of services.records) {
          const charges = record.charges?.filter((ch) => ch.code === code);
          if (charges && charges.length > 0) {
            const newCharge = charges[0];

            newCharge.price = charges.reduce((sum: number, current) => current.price * current.quantity + sum, 0);
            newCharge.quantity = 1;

            record.charges = record.charges?.filter((ch) => ch.code !== code);
            record.charges?.push(newCharge);
          }
        }
      }
    }
  }

  /**
   * convert perPricing to the vm (view model)
   * @param sellKey sellkey related to the Breakdown (session booking)
   * @param perPricing perPricing in booking
   * @param sellType EnumSellType
   */
  private perPricingToPerPricingVm(
    sellKey: string,
    paxId: string,
    perPricing: PerPricing,
    sellType: string
  ): PerPricingVm {
    const result: PerPricingVm = {
      charges: perPricing.charges,
      currency: perPricing.currency,
      sellKey,
      referenceId: perPricing.referenceId,
      totalAmount: perPricing.totalAmount,
      sellType,
      paxId,
    };
    return result;
  }

  /**
   * Get PerPaxJourney services and charge by departure route
   * @param booking session booking
   * @param scheduleSelection schedule
   * @param departureJourneyList PerPricingVm
   */
  private departurePerPaxJourney(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    departureJourneyList: PerPricingVm[],
    perPaxJourneyList: PerPaxJourney[]
  ): void {
    const groupedChargesDeparture: GroupedCharges[] = [];

    // Group all the charges independent of the passengers
    this.groupChargesForDeparture(perPaxJourneyList, booking, scheduleSelection, groupedChargesDeparture);

    // Get all the charges grouped and multiply by it quantity, overriding the original amount
    this.processGroupedChargesForDeparture(
      perPaxJourneyList,
      booking,
      scheduleSelection,
      groupedChargesDeparture,
      departureJourneyList
    );
  }

  /**
   * Group charges for departure route
   */
  private groupChargesForDeparture(
    perPaxJourneyList: PerPaxJourney[],
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    groupedChargesDeparture: GroupedCharges[]
  ): void {
    for (const ppj of perPaxJourneyList) {
      const filteredByRoute = this.filterByRoute(
        ppj.journeyId,
        ppj.paxId,
        ppj,
        EnumSellType.PER_PAX_JOURNEY,
        booking,
        scheduleSelection
      );

      this.processDepartureCharges(filteredByRoute.departure, groupedChargesDeparture);
    }
  }

  /**
   * Process departure charges for grouping
   */
  private processDepartureCharges(departureList: PerPricingVm[], groupedChargesDeparture: GroupedCharges[]): void {
    for (const departureSelected of departureList) {
      this.processChargesForDeparture(departureSelected, groupedChargesDeparture);
    }
  }

  private processChargesForDeparture(departureSelected: PerPricingVm, groupedChargesDeparture: GroupedCharges[]): void {
    for (const charge of departureSelected.charges) {
      if (charge.type === EnumChargesType.SERVICE) {
        this.addOrUpdateGroupedCharge(charge, groupedChargesDeparture);
      }
    }
  }

  /**
   * Add or update grouped charge
   */
  private addOrUpdateGroupedCharge(charge: Charge, groupedCharges: GroupedCharges[]): void {
    const groupedChargesFound = groupedCharges.find((x) => x.code === charge.code && x.price === charge.amount);
    if (groupedChargesFound?.quantity) {
      groupedChargesFound.quantity = groupedChargesFound.quantity + 1;
    } else {
      groupedCharges.push({
        code: charge.code as string,
        quantity: 1,
        currency: charge.currency as string,
        type: charge.type!,
        price: charge.amount as number,
      });
    }
  }

  /**
   * Process grouped charges for departure
   */
  private processGroupedChargesForDeparture(
    perPaxJourneyList: PerPaxJourney[],
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    groupedChargesDeparture: GroupedCharges[],
    departureJourneyList: PerPricingVm[]
  ): void {
    for (const ppj of perPaxJourneyList) {
      const filteredByRoute = this.filterByRoute(
        ppj.journeyId,
        ppj.paxId,
        ppj,
        EnumSellType.PER_PAX_JOURNEY,
        booking,
        scheduleSelection
      );

      const perPaxsDeparture = this.createPerPaxsWithGroupedCharges(filteredByRoute.departure, groupedChargesDeparture);

      if (perPaxsDeparture.length > 0) {
        departureJourneyList.push(...perPaxsDeparture);
      }
    }
  }

  /**
   * Create PerPaxs with grouped charges
   */
  private createPerPaxsWithGroupedCharges(
    departureList: PerPricingVm[],
    groupedCharges: GroupedCharges[]
  ): PerPricingVm[] {
    const perPaxs: PerPricingVm[] = [];
    const charges: Charge[] = [];

    for (const departureSelected of departureList) {
      perPaxs.push(UtilitiesHelper.clone(departureSelected) as PerPricingVm);
      const lastPerPaxIncluded = perPaxs.at(-1)!;

      this.processChargesForPerPax(departureSelected, lastPerPaxIncluded, charges, groupedCharges);
    }

    return perPaxs;
  }

  /**
   * Process charges for PerPax
   */
  private processChargesForPerPax(
    departureSelected: PerPricingVm,
    lastPerPaxIncluded: PerPricingVm,
    charges: Charge[],
    groupedCharges: GroupedCharges[]
  ): void {
    for (const charge of departureSelected.charges) {
      if (charge.type === EnumChargesType.SERVICE) {
        lastPerPaxIncluded.charges = [];
        charges.push(UtilitiesHelper.clone(charge) as Charge);
        const lastChargeIncluded = charges.at(-1)!;

        this.applyGroupedChargeAmount(charge, lastChargeIncluded, groupedCharges);
        lastPerPaxIncluded.charges.push(lastChargeIncluded);
      }
    }
  }

  /**
   * Apply grouped charge amount
   */
  private applyGroupedChargeAmount(charge: Charge, lastChargeIncluded: Charge, groupedCharges: GroupedCharges[]): void {
    const groupedChargesFound = groupedCharges.find((x) => x.code === charge.code && x.price === charge.amount);
    if (groupedChargesFound?.quantity && groupedChargesFound.quantity > 1) {
      lastChargeIncluded.amount = (charge.amount ?? 0) * groupedChargesFound.quantity;
    }
  }

  /**
   * Get PerPaxJourney services and charge by arrival route
   * @param booking session booking
   * @param scheduleSelection schedule
   * @param arrivalJourneyList PerPricingVm
   */
  private arrivalPerPaxJourney(
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    arrivalJourneyList: PerPricingVm[],
    perPaxJourneyList: PerPaxJourney[]
  ): void {
    const groupedChargesArrival: GroupedCharges[] = [];

    // Group all the charges independent of the passengers
    this.groupChargesForArrival(perPaxJourneyList, booking, scheduleSelection, groupedChargesArrival);

    // Get all the charges grouped and multiply by it quantity, overriding the original amount
    this.processGroupedChargesForArrival(
      perPaxJourneyList,
      booking,
      scheduleSelection,
      groupedChargesArrival,
      arrivalJourneyList
    );
  }

  /**
   * Group charges for arrival route
   */
  private groupChargesForArrival(
    perPaxJourneyList: PerPaxJourney[],
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    groupedChargesArrival: GroupedCharges[]
  ): void {
    for (const ppj of perPaxJourneyList) {
      const filteredByRoute = this.filterByRoute(
        ppj.journeyId,
        ppj.paxId,
        ppj,
        EnumSellType.PER_PAX_JOURNEY,
        booking,
        scheduleSelection
      );

      this.processArrivalCharges(filteredByRoute.arrival, groupedChargesArrival);
    }
  }

  /**
   * Process arrival charges for grouping
   */
  private processArrivalCharges(arrivalList: PerPricingVm[], groupedChargesArrival: GroupedCharges[]): void {
    for (const arrivalSelected of arrivalList) {
      this.processChargesForArrival(arrivalSelected, groupedChargesArrival);
    }
  }

  private processChargesForArrival(arrivalSelected: PerPricingVm, groupedChargesArrival: GroupedCharges[]): void {
    for (const charge of arrivalSelected.charges) {
      if (charge.type === EnumChargesType.SERVICE) {
        this.addOrUpdateGroupedCharge(charge, groupedChargesArrival);
      }
    }
  }

  /**
   * Process grouped charges for arrival
   */
  private processGroupedChargesForArrival(
    perPaxJourneyList: PerPaxJourney[],
    booking: Booking,
    scheduleSelection: ScheduleSelection,
    groupedChargesArrival: GroupedCharges[],
    arrivalJourneyList: PerPricingVm[]
  ): void {
    for (const ppj of perPaxJourneyList) {
      const filteredByRoute = this.filterByRoute(
        ppj.journeyId,
        ppj.paxId,
        ppj,
        EnumSellType.PER_PAX_JOURNEY,
        booking,
        scheduleSelection
      );

      const perPaxsArrival = this.createPerPaxsWithGroupedChargesForArrival(
        filteredByRoute.arrival,
        groupedChargesArrival
      );

      if (perPaxsArrival.length > 0) {
        arrivalJourneyList.push(...perPaxsArrival);
      }
    }
  }

  /**
   * Create PerPaxs with grouped charges for arrival
   */
  private createPerPaxsWithGroupedChargesForArrival(
    arrivalList: PerPricingVm[],
    groupedCharges: GroupedCharges[]
  ): PerPricingVm[] {
    const perPaxs: PerPricingVm[] = [];
    const charges: Charge[] = [];

    for (const arrivalSelected of arrivalList) {
      perPaxs.push(UtilitiesHelper.clone(arrivalSelected) as PerPricingVm);
      const lastPerPaxIncluded = perPaxs.at(-1)!;

      this.processChargesForArrivalPerPax(arrivalSelected, lastPerPaxIncluded, charges, groupedCharges);
    }

    return perPaxs;
  }

  /**
   * Process charges for arrival PerPax
   */
  private processChargesForArrivalPerPax(
    arrivalSelected: PerPricingVm,
    lastPerPaxIncluded: PerPricingVm,
    charges: Charge[],
    groupedCharges: GroupedCharges[]
  ): void {
    for (const charge of arrivalSelected.charges) {
      if (charge.type === EnumChargesType.SERVICE) {
        lastPerPaxIncluded.charges = [];
        charges.push(UtilitiesHelper.clone(charge) as Charge);
        const lastChargeIncluded = charges.at(-1)!;

        this.applyGroupedChargeAmount(charge, lastChargeIncluded, groupedCharges);
        lastPerPaxIncluded.charges.push(lastChargeIncluded);
      }
    }
  }

  /**
   * Get PerPricingVm by route
   * @param sellKey segment or journey id
   * @param paxId passenger id
   * @param perPricing price item
   * @param sellType price item type
   * @param booking session booking
   * @param scheduleSelection schedule
   */
  private filterByRoute(
    sellKey: string,
    paxId: string,
    perPricing: PerPricing,
    sellType: string,
    booking: Booking,
    scheduleSelection: ScheduleSelection
  ): {
    departure: PerPricingVm[];
    arrival: PerPricingVm[];
  } {
    const departure: PerPricingVm[] = [];
    const arrival: PerPricingVm[] = [];

    if (this.isDeparture(sellKey, booking, scheduleSelection, sellType)) {
      departure.push(this.perPricingToPerPricingVm(sellKey, paxId, perPricing, sellType));
    } else if (this.isArrival(sellKey, booking, scheduleSelection, sellType)) {
      arrival.push(this.perPricingToPerPricingVm(sellKey, paxId, perPricing, sellType));
    }

    return { departure, arrival };
  }

  /**
   * Join the services that are equals in Code, paxId and sellkey in order to show one in breakdown
   * @param pricingVm The original items
   * @param excludeChargesCode The services charge codes to exclude from calculation
   * @returns List of unique items
   */
  private joinServicesOfTheSameTypeIfApplicable(
    pricingVm: PerPricingVm[],
    excludeChargesCode: string[]
  ): PerPricingVm[] {
    if (!pricingVm?.length) {
      return pricingVm;
    }

    const servicesCodes = pricingVm.flatMap((p) => p.charges.map((c) => c.code as string));

    if (!servicesCodes.length) {
      return pricingVm;
    }

    const freq = new Map<string, number>();
    for (const code of servicesCodes) {
      freq.set(code, (freq.get(code) ?? 0) + 1);
    }

    const repeatCodeServices = Array.from(freq.entries())
      .filter(([code, count]) => count > 1 && !excludeChargesCode.includes(code))
      .map(([code]) => code);

    if (!repeatCodeServices.length) {
      return pricingVm;
    }

    const repeatCodesSet = new Set(repeatCodeServices);
    const duplicateServices = pricingVm.filter((x) =>
      x.charges.some((charge) => repeatCodesSet.has(charge.code as string))
    );
    const itemsWithoutDuplicates = pricingVm.filter((p) => !duplicateServices.includes(p));

    if (!duplicateServices.length) {
      return pricingVm;
    }

    const noDuplicateServices = this.buildNoDuplicateServices(duplicateServices);

    return [...itemsWithoutDuplicates, ...noDuplicateServices];
  }

  private buildNoDuplicateServices(duplicateServices: PerPricingVm[]): PerPricingVm[] {
    const result: PerPricingVm[] = [];

    for (const service of duplicateServices) {
      const existingSameItems = duplicateServices.filter(
        (s) =>
          s.paxId === service.paxId &&
          s.sellKey === service.sellKey &&
          s.charges.some((c) => service.charges.some((sc) => sc.code === c.code))
      );

      if (this.existsItemsToJoin(existingSameItems)) {
        const uniqueItem = this.getUniqueItem(existingSameItems);
        if (uniqueItem && !result.includes(uniqueItem)) {
          result.push(uniqueItem);
        }
      } else if (!result.includes(service)) {
        result.push(service);
      }
    }
    return result;
  }

  /**
   * get charge type related to rate
   * @param PerPricingVm perPricing
   * @returns Charge
   */
  private getPrincipalChargeType(perPricing: PerPricingVm): Charge {
    let relatedCharge: Charge = {};
    const chargesTypes = [EnumChargesType.SERVICE, EnumChargesType.TAX, EnumChargesType.FARE];
    for (const type of chargesTypes) {
      relatedCharge = perPricing?.charges?.find((charge) => charge.type === type) as Charge;
      if (relatedCharge) {
        break;
      }
    }
    return relatedCharge ?? perPricing?.charges?.[0];
  }

  /**
   * Get all charges and merge the repeat charges
   * @param chargeGroup charges of priceItem
   * @param charges charges of booking pricing
   */
  private mergeCharges(chargeGroup: GroupedCharges[], charges: Charge[]): GroupedCharges[] {
    const newChargeGroup = [...chargeGroup];

    for (const charge of charges) {
      const conceptExits = newChargeGroup.find(
        (concept) => concept.code === charge.code && concept.price === charge.amount
      );

      if (conceptExits) {
        conceptExits.quantity += 1;
      } else {
        const newConcept: GroupedCharges = {
          code: charge.code as string,
          type: charge.type as string,
          currency: charge.currency as string,
          price: charge.amount as number,
          quantity: 1,
        };

        newChargeGroup.push(newConcept);
      }
    }

    return newChargeGroup;
  }

  /**
   * get SummaryTypologyRecord
   * @param chargeCode charge code in pricing of booking
   * @param charge charge in pricing of booking
   * @param services services of the booking
   * @param bundles bundles of the booking
   * @param perPricing object perPricing in the booking
   * @param summaryTypologyServices services related with SummaryTypologyRecord
   * @returns summary typology record
   */
  private buildSummaryTypologyRecord(
    chargeCode: string,
    charge: Charge,
    perPricing: PerPricingVm,
    summaryTypologyServices: SummaryTypologyService[],
    services: Service[] = [],
    bundles: Bundle[] = []
  ): SummaryTypologyRecord {
    const service = services.find(
      (s) => s.code === chargeCode && perPricing.paxId === s.paxId && perPricing.sellKey === s.sellKey
    );
    const bundle = bundles.find(
      (b) => b.code === chargeCode && perPricing.paxId === b.paxId && perPricing.sellKey === b.sellKey
    );

    return {
      code: chargeCode,
      currency: charge.currency!,
      price: perPricing.totalAmount,
      quantity: 1,
      type: services.map((s) => s.code).includes(chargeCode)
        ? (services.find((s) => s.code === chargeCode)?.type ?? charge.type ?? '')
        : (charge.type ?? ''),
      serviceType: '',
      sellType: perPricing.sellType,
      chargeType: charge.type!,
      relatedServices: summaryTypologyServices,
      status: service ? service.status : this.getBundleStatus(bundle),
      charges: this.mergeCharges([], perPricing.charges),
    };
  }

  /**
   * get total amount of price items records
   * @param records price items
   */
  private getTotalAmount(records: SummaryTypologyRecord[]): number {
    return records.reduce(
      (sum, record) =>
        sum + record.quantity * (record.type === EnumChargesType.DISCOUNT ? -record.price : record.price),
      0
    );
  }

  private setPrincipalCharge(
    principalCharge: Charge,
    priceItem: PerPricingVm,
    booking: Booking,
    summaryTypologyDataVm: SummaryTypologyDataVm,
    services: Service[],
    bundles: Bundle[]
  ): void {
    if (principalCharge) {
      const codeWithoutSpaces = principalCharge.code?.trim();

      // Add the record to the corresponding list
      const parentBundle = this.getParentBundle(priceItem.referenceId, booking);

      const paramsSummaryTypologyRecordCommon = {
        summaryTypologyDataVm,
        codeWithoutSpaces,
        principalCharge,
        services,
        bundles,
      } as SummaryTypologyRecordCommonParams;

      this.setParentBundle(parentBundle, priceItem, paramsSummaryTypologyRecordCommon);
    }
  }

  private isDeparture(id: string, booking: Booking, scheduleSelection: ScheduleSelection, type: string): boolean {
    if (scheduleSelection && !scheduleSelection.departure) {
      return false;
    }

    return this.hasSellKeyInJourneySegment(id, booking, type, 0);
  }

  private isArrival(id: string, booking: Booking, scheduleSelection: ScheduleSelection, type: string): boolean {
    if (scheduleSelection && !scheduleSelection.departure) {
      return this.isDeparture(id, booking, scheduleSelection, type);
    } else if (scheduleSelection && !scheduleSelection.return) {
      return false;
    }

    return this.hasSellKeyInJourneySegment(id, booking, type, 1);
  }

  /**
   * Validate if a list of same services have duplicates items to merge
   * @param duplicateServices list of same services
   * @returns true if there are same items to merge
   */
  private existsItemsToJoin(duplicateServices: PerPricingVm[]): boolean {
    return duplicateServices.some((ex) =>
      ex.charges.some((c) => c.type === EnumChargesType.EMPTY || c.type === EnumChargesType.DEFAULT)
    );
  }

  /**
   * Get the unique service item of a list of duplicate items
   * @param duplicateServices list of duplicate services
   * @returns unique service item
   */
  private getUniqueItem(duplicateServices: PerPricingVm[]): PerPricingVm {
    const uniqueItem = duplicateServices.find((i) =>
      i.charges.some((x) => x.type !== EnumChargesType.EMPTY && x.type !== EnumChargesType.DEFAULT)
    );

    duplicateServices.splice(duplicateServices.indexOf(uniqueItem ?? ({} as PerPricingVm)), 1);
    for (const item of duplicateServices) {
      if (uniqueItem) {
        if (uniqueItem.charges[0].amount && item.charges[0].amount) {
          uniqueItem.charges[0].amount += item.charges[0].amount;
        }
        uniqueItem.totalAmount += item.totalAmount;
      }
    }

    return uniqueItem!;
  }

  private getBundleStatus(bundle: Bundle | undefined): string {
    return bundle?.status ?? '';
  }

  /**
   * Check if a service record is included in a bundle comparing its referenceId against the bundle's services,
   *  and returns the service's parent bundle
   * @param pricingReferenceId reference id of the service in pricing of the booking
   * @param booking Session booking to get services and bundles
   */
  private getParentBundle(pricingReferenceId: string, booking: Booking): Bundle | undefined {
    const service = booking.services.find((x) => x.id === pricingReferenceId);
    if (!service) {
      return undefined;
    }

    const bundle = booking.bundles?.find((b) => b.services.find((svc) => svc === service.id));
    return bundle;
  }

  private setParentBundle(
    parentBundle: Bundle | undefined,
    priceItem: PerPricingVm,
    paramsSummaryTypologyRecordCommon: SummaryTypologyRecordCommonParams
  ): void {
    if (parentBundle) {
      const bundledRecord = paramsSummaryTypologyRecordCommon.summaryTypologyDataVm.bundledRecords?.find(
        (record) => record.code === paramsSummaryTypologyRecordCommon.codeWithoutSpaces
      );

      this.addBundleRecords(
        bundledRecord as SummaryTypologyRecord,
        parentBundle,
        priceItem,
        paramsSummaryTypologyRecordCommon
      );
    } else {
      const record = paramsSummaryTypologyRecordCommon.summaryTypologyDataVm.records?.find(
        (r) => r.code === paramsSummaryTypologyRecordCommon.codeWithoutSpaces
      );
      const relatedServices: SummaryTypologyService = {
        referenceId: priceItem.referenceId,
        paxId: priceItem.paxId,
        sellkey: priceItem.sellKey,
      };

      this.addRecords(record as SummaryTypologyRecord, relatedServices, priceItem, paramsSummaryTypologyRecordCommon);
    }
  }

  /**
   * Get if the journey or segment has the sellkey id
   * @param id sellKey id
   * @param booking booking in session
   * @param type sell type
   * @param index index of the journey
   */
  private hasSellKeyInJourneySegment(id: string, booking: Booking, type: string, index: number): boolean {
    let res: boolean;

    switch (type) {
      case EnumSellType.PER_PAX_JOURNEY:
        res = booking.journeys[index]?.id === id;
        break;
      case EnumSellType.PER_PAX_SEGMENT:
      case EnumSellType.PER_SEGMENT:
      default: {
        const segmentIds = new Set(booking.journeys[index]?.segments.map((e) => e.id) ?? []);
        res = segmentIds.has(id);
        break;
      }
    }

    return res;
  }

  private addBundleRecords(
    bundledRecord: SummaryTypologyRecord,
    parentBundle: Bundle,
    priceItem: PerPricingVm,
    paramsSummaryTypologyRecordCommon: SummaryTypologyRecordCommonParams
  ): void {
    // If bundledRecord already exists increase quantity, bundledRecords don't sum for the total. If not, push to bundledRecords list
    if (bundledRecord) {
      bundledRecord.quantity++;
    } else {
      // Overwrite the referenceId to point to its parentBundle code instead of the service
      const relatedServices: SummaryTypologyService = {
        referenceId: parentBundle.code,
        paxId: priceItem.paxId,
        sellkey: priceItem.sellKey,
      };
      paramsSummaryTypologyRecordCommon.summaryTypologyDataVm.bundledRecords?.push(
        this.buildSummaryTypologyRecord(
          paramsSummaryTypologyRecordCommon.codeWithoutSpaces,
          paramsSummaryTypologyRecordCommon.principalCharge,
          priceItem,
          [relatedServices],
          paramsSummaryTypologyRecordCommon.services,
          paramsSummaryTypologyRecordCommon.bundles
        )
      );
    }
  }

  private addRecords(
    record: SummaryTypologyRecord,
    relatedServices: SummaryTypologyService,
    priceItem: PerPricingVm,
    paramsSummaryTypologyRecordCommon: SummaryTypologyRecordCommonParams
  ): void {
    // If record already exists increase quantity. If not, push to records list
    if (record) {
      record.quantity++;
      record.relatedServices.push(relatedServices);
      record.charges = this.mergeCharges(record.charges ?? [], priceItem.charges);
    } else {
      paramsSummaryTypologyRecordCommon.summaryTypologyDataVm.records?.push(
        this.buildSummaryTypologyRecord(
          paramsSummaryTypologyRecordCommon.codeWithoutSpaces,
          paramsSummaryTypologyRecordCommon.principalCharge,
          priceItem,
          [relatedServices],
          paramsSummaryTypologyRecordCommon.services,
          paramsSummaryTypologyRecordCommon.bundles
        )
      );
    }
  }
}
