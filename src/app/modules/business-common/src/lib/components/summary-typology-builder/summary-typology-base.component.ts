import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import { PriceBreakdownItemsVM, PriceBreakdownVM } from '@dcx/ui/design-system';
import {
  Booking,
  curtainEffec,
  EnumServiceStatus,
  ISummarySelectedJourneysService,
  PassengerTypesVM,
  PaxTypeCode,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyBuilderConfig,
  SummaryTypologyDataVm,
  SummaryTypologyRecord,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { SummaryTypologyBaseService } from './services/summary-typology-base.service';

@Component({
  selector: 'summary-typology-base',
  template: '',
  animations: [curtainEffec],
  imports: [],
  standalone: true,
})
export class SummaryTypologyBaseComponent implements OnInit {
  public summaryConfig: SummaryTypologyBuilderConfig;
  public loaded: boolean;
  public summaryTypologyVm: SummaryTypologyDataVm[];
  public totalFlight: number;
  public priceBreakdownModel: PriceBreakdownVM;
  public serviceTypes: string[];
  public showStaticDetails: boolean[];
  public adults: number;
  public children: number;
  public infants: number;
  public teens: number;
  public infantsWithSeat: number;
  /**
   * Property to store only the records that are services. For ease of use in template
   */
  public services: SummaryTypologyDataVm;
  /**
   * List of bundles to display separately from stand-alone service records
   */
  public bundleServices: SummaryTypologyRecord[];
  protected summaryTypologyPerRoute: SummaryTypologyDataVm[];
  protected bookingData: Booking;
  protected enumServiceStatus = EnumServiceStatus;

  protected readonly translate = inject(TranslateService);

  constructor(
    public summaryTypologyBaseService: SummaryTypologyBaseService,
    @Inject(SUMMARY_SELECTED_JOURNEYS_SERVICE)
    protected summarySelectedJourneysService: ISummarySelectedJourneysService
  ) {
    this.summaryTypologyVm = [];
    this.showStaticDetails = [];
    this.adults = 0;
    this.children = 0;
    this.infants = 0;
    this.teens = 0;
    this.infantsWithSeat = 0;
    this.loaded = false;
    this.summaryConfig = {} as SummaryTypologyBuilderConfig;
    this.totalFlight = 0;
    this.priceBreakdownModel = {} as PriceBreakdownVM;
    this.serviceTypes = [];
    this.services = {} as SummaryTypologyDataVm;
    this.bundleServices = [];
    this.summaryTypologyPerRoute = [];
    this.bookingData = {} as Booking;
  }

  @Input()
  set summaryTypologyConfig(value: SummaryTypologyBuilderConfig) {
    this.summaryConfig = value;
    this.bookingData = value.booking;
    this.loadSummaryTypologyVm();
    this.summaryTypologyPerRoute = undefined!;
    this.priceBreakdownModel = this.initPriceBreakdownModel();
  }

  get booking(): Booking {
    return this.bookingData;
  }

  public ngOnInit(): void {
    this.loadSummaryTypologyVm();
    this.getSummaryTypologyByRoute();
    this.valueTotalFlight();
    this.loadDetailsStatus();
    if (this.summaryConfig.showPaxGroup) {
      this.loadPaxGroup();
    }
    this.services = this.initServices();
    this.serviceTypes = this.getServiceTypes();
    this.bundleServices = this.getBundleServices();
    this.loaded = true;
    this.setServiceTypeToSummaryTypologyVm();
  }

  public initPassengerTypesModel(): PassengerTypesVM {
    const result: PassengerTypesVM = { config: [] };
    let paxes = this.booking.pax;
    if (this.summaryConfig.showInfoForSelectedFlight) {
      const selectedPassenger = this.summarySelectedJourneysService.getSelectedPassengers();
      paxes = paxes.filter((p) => selectedPassenger.some((sp) => sp.passengers.includes(p.id)));
    }
    const paxTypeOrder = [
      PaxTypeCode.ADT,
      PaxTypeCode.TNG,
      PaxTypeCode.CHD,
      PaxTypeCode.INF,
      PaxTypeCode.INS,
      PaxTypeCode.EXST,
    ];
    for (const paxType of paxTypeOrder) {
      const passengersByType = paxes.filter((pax) => pax.type.code === paxType);
      if (passengersByType.length) {
        result.config.push({
          code: paxType,
          quantity: passengersByType.length,
        });
      }
    }
    return result;
  }

  /**
   * Depending if flight is OW or RT assign total value of flight in the field totalFlight
   */
  public valueTotalFlight(): void {
    if (this.summaryTypologyVm && this.summaryTypologyVm.length > 0) {
      if (this.summaryTypologyVm.length > 1) {
        if (this.summaryTypologyVm[1].label === 'Return') {
          this.totalFlight = +this.summaryTypologyVm[0].price! + +this.summaryTypologyVm[1].price!;
        } else {
          this.totalFlight = +this.summaryTypologyVm[0].price!;
        }
      } else {
        this.totalFlight = +this.summaryTypologyVm[0].price!;
      }
    }
  }

  public loadSummaryTypologyVm(): void {
    this.summaryTypologyVm = this.summaryTypologyBaseService.buildSummaryTypologyDataVm({
      booking: this.booking,
      departureLabel: this.translate.instant('Common.Departure'),
      returnLabel: this.translate.instant('Common.Return'),
      servicesLabel: this.translate.instant('Common.Services'),
      taxesLabel: this.translate.instant('Common.Taxes'),
      scheduleSelection: this.summaryConfig.scheduleSelection!,
      servicesCodesToMerge: this.summaryConfig.servicesCodesToMerge ?? [],
      excludeChargesCode: this.summaryConfig.excludeChargesCode ?? [],
      showInfoForSelectedFlight: this.summaryConfig.showInfoForSelectedFlight,
    });
  }

  public loadPaxGroup(): void {
    for (const pax of this.booking.pax) {
      this.adults += pax.type.code === PaxTypeCode.ADT ? 1 : 0;
      this.children += pax.type.code === PaxTypeCode.CHD ? 1 : 0;
      this.infants += pax.type.code === PaxTypeCode.INF ? 1 : 0;
      this.teens += pax.type.code === PaxTypeCode.TNG ? 1 : 0;
      this.infantsWithSeat += pax.type.code === PaxTypeCode.INS ? 1 : 0;
    }
  }

  public loadDetailsStatus(): void {
    const value = !!this.summaryConfig.useStaticDetails;
    this.showStaticDetails = new Array(this.summaryTypologyPerRoute.length).fill(value);
  }

  /**
   * Get the service types that exists in the booking and has at least one item
   */
  public getServiceTypes(): string[] {
    const serviceTypes: string[] = [];
    for (const bookingService of this.booking.services) {
      if (
        !serviceTypes.includes(bookingService.type) &&
        this.services.records!.some((record) => record.type === bookingService.type)
      ) {
        serviceTypes.push(bookingService.type);
      }
    }
    return serviceTypes;
  }

  public setServiceTypeToSummaryTypologyVm(): void {
    if (!this.summaryTypologyVm || !Array.isArray(this.summaryTypologyVm)) {
      return;
    }
    for (const serviceSummary of this.summaryTypologyVm) {
      for (const record of serviceSummary.records!) {
        const service = this.booking.services.find((bookingService) => bookingService.code === record.code);
        record.serviceType = service ? service.type : '';
      }
    }
  }

  /**
   * Get the records that are identified as bundles from a list of codes
   */
  public getBundleServices(): SummaryTypologyRecord[] {
    if (!this.summaryConfig.bundleCodes || this.summaryConfig.bundleCodes.length === 0) {
      return [];
    }

    return this.services.records!.filter((record) =>
      this.summaryConfig.bundleCodes!.find((code) => record.code === code)
    );
  }

  public getSummaryTypologyByRoute(): SummaryTypologyDataVm[] {
    if (this.summaryTypologyPerRoute) {
      return this.summaryTypologyPerRoute;
    }

    this.summaryTypologyPerRoute = this.summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm({
      booking: this.booking,
      departureLabel: this.translate.instant('Common.Departure'),
      returnLabel: this.translate.instant('Common.Return'),
      servicesLabel: this.translate.instant('Common.Services'),
      taxesLabel: this.translate.instant('Common.Taxes'),
      scheduleSelection: this.summaryConfig.scheduleSelection!,
      servicesCodesToMerge: this.summaryConfig.servicesCodesToMerge ?? [],
      excludeChargesCode: this.summaryConfig.excludeChargesCode ?? [],
      sellTypePerServices: this.summaryConfig.sellTypePerServices ?? [],
      chargesCodesToMerge: this.summaryConfig.chargesCodesToMerge ?? [],
      showInfoForSelectedFlight: this.summaryConfig.showInfoForSelectedFlight,
    });

    return this.summaryTypologyPerRoute;
  }

  /**
   * Group a list of bundled services
   */
  public getBundledGroupByType(): SummaryTypologyRecord[] {
    const bundleService = new Set(this.services.bundledRecords!.map((record: SummaryTypologyRecord) => record.type));

    const newArray: SummaryTypologyRecord[] = [];

    for (const bundleType of bundleService) {
      const found = Object.assign(
        this.services.bundledRecords!.find((record: SummaryTypologyRecord) => record.type === bundleType)!,
        {}
      );
      if (found) {
        newArray.push(found);
      }
    }

    return newArray;
  }

  protected priceBreakdownItemsVMOrder(priceBreakdownItemsVM: PriceBreakdownItemsVM[]): PriceBreakdownItemsVM[] {
    return priceBreakdownItemsVM.sort((item, item2) => item2.subitems.length - item.subitems.length);
  }

  protected initPriceBreakdownModel(): PriceBreakdownVM {
    return {} as PriceBreakdownVM;
  }

  private initServices(): SummaryTypologyDataVm {
    return this.summaryTypologyVm && this.summaryTypologyVm.length > 0
      ? this.summaryTypologyVm.at(-1)!
      : ({ records: [] as SummaryTypologyRecord[] } as SummaryTypologyDataVm);
  }
}
