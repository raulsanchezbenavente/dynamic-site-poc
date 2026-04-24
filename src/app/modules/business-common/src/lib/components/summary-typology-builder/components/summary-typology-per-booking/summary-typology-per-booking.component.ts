import { Component, Inject, OnInit } from '@angular/core';
import {
  PriceBreakdownComponent,
  PriceBreakdownItemsVM,
  PriceBreakdownItemVM,
  PriceBreakdownVM,
} from '@dcx/ui/design-system';
import {
  CommonTranslationKeys,
  EnumChargesType,
  GroupedCharges,
  ISummarySelectedJourneysService,
  PassengerTypesVM,
  PaxTypeCode,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyRecord,
} from '@dcx/ui/libs';

import { PassengerTypesComponent } from '../../../passenger-types/passenger-types.component';
import { TranslationKeys } from '../../enums/translation-keys.enum';
import { SummaryTypologyBaseService } from '../../services/summary-typology-base.service';
import { SummaryTypologyBaseComponent } from '../../summary-typology-base.component';

@Component({
  selector: 'summary-typology-per-booking',
  templateUrl: './summary-typology-per-booking.component.html',
  styleUrls: ['./styles/summary-typology-per-booking.style.scss'],
  imports: [PassengerTypesComponent, PriceBreakdownComponent],
  standalone: true,
})
export class SummaryTypologyPerBookingComponent extends SummaryTypologyBaseComponent implements OnInit {
  public passengerTypesModel!: PassengerTypesVM;
  protected summaryTypologyDataVm: SummaryTypologyDataVm[] = [];

  constructor(
    public override summaryTypologyBaseService: SummaryTypologyBaseService,
    @Inject(SUMMARY_SELECTED_JOURNEYS_SERVICE)
    protected override summarySelectedJourneysService: ISummarySelectedJourneysService
  ) {
    super(summaryTypologyBaseService, summarySelectedJourneysService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.passengerTypesModel = this.initPassengerTypesModel();
  }

  protected getMergeJourneysResult(summaryTypologyPerRoute: SummaryTypologyDataVm[]): SummaryTypologyDataVm[] {
    let summaryTypologyDataVm: SummaryTypologyDataVm[] = [];

    if (summaryTypologyPerRoute.length) {
      const departure = summaryTypologyPerRoute.find(
        (summary) => summary.modelType === SummaryTypologyDataVmModelType.DEPARTURE
      );

      const arrival = summaryTypologyPerRoute.find(
        (summary) => summary.modelType === SummaryTypologyDataVmModelType.ARRIVAL
      );

      if (arrival) {
        summaryTypologyDataVm.push(this.mergeSummaryTypologyDataVm(departure!, arrival));
      } else if (departure) {
        const records = this.getRecords(departure, { records: [] });
        departure.records = records;
        summaryTypologyDataVm.push(departure);
      }

      const summaryTypologyServices = this.getSummaryTypologyServices(summaryTypologyPerRoute);

      if (summaryTypologyServices.length) {
        summaryTypologyDataVm = summaryTypologyDataVm.concat(summaryTypologyServices);
      }
    }
    return summaryTypologyDataVm;
  }

  protected getSummaryTypologyServices(summaryTypologyPerRoute: SummaryTypologyDataVm[]): SummaryTypologyDataVm[] {
    return summaryTypologyPerRoute.filter(
      (summary) =>
        !(
          summary.modelType === SummaryTypologyDataVmModelType.DEPARTURE ||
          summary.modelType === SummaryTypologyDataVmModelType.ARRIVAL
        )
    );
  }

  protected mergeSummaryTypologyDataVm(
    departure: SummaryTypologyDataVm,
    arrival: SummaryTypologyDataVm
  ): SummaryTypologyDataVm {
    const departurePrice = departure?.price ? +departure.price : 0;
    const arrivalPrice = arrival?.price ? +arrival.price : 0;
    return {
      currency: this.booking.pricing.currency,
      price: (departurePrice + arrivalPrice).toString(),
      records: this.getRecords(departure, arrival),
    };
  }

  protected getRecords(departure: SummaryTypologyDataVm, arrival: SummaryTypologyDataVm): SummaryTypologyRecord[] {
    let summaryTypologyRecords: SummaryTypologyRecord[] = [];

    const recordPerTax = this.getSummaryTypologyRecordGroupedByChargeType(EnumChargesType.TAX, departure, arrival);

    this.addRecordPerTaxInSummaryTypology(recordPerTax, summaryTypologyRecords);

    const departureRecords = this.getDepartureRecords(departure, arrival);

    summaryTypologyRecords = summaryTypologyRecords.concat(departureRecords);

    const arrivalRecords = this.getArrivalRecordsThatDoesNotExistInDepartureRecord(
      arrival.records!,
      departure,
      EnumChargesType.TAX
    );
    summaryTypologyRecords = summaryTypologyRecords.concat(arrivalRecords);

    return summaryTypologyRecords;
  }

  protected getSummaryTypologyRecordGroupedByChargeType(
    chargeType: string, // EnumChargesType
    departure: SummaryTypologyDataVm,
    arrival: SummaryTypologyDataVm
  ): SummaryTypologyRecord {
    const departureRecords = departure ? departure.records!.filter((record) => record.chargeType === chargeType) : [];
    const arrivalRecords = arrival ? arrival.records!.filter((record) => record.chargeType === chargeType) : [];

    const joinRecords = departureRecords.concat(arrivalRecords);

    if (joinRecords.length) {
      const quantity = joinRecords.reduce((total, current) => total + current.quantity, 0);
      const price = joinRecords.reduce((total, current) => total + current.quantity * current.price, 0);

      const allGroupedCharges: GroupedCharges[] = [];

      for (const record of joinRecords) {
        for (const charge of record.charges!) {
          allGroupedCharges.push(charge);
        }
      }

      const res = {
        quantity,
        price,
        chargeType,
        currency: this.booking.pricing.currency,
        code: joinRecords[0].code,
        charges: joinRecords[0].charges!.map((charge) => {
          const chargePriceTotal = allGroupedCharges
            .filter((groupedCharge) => groupedCharge.type === charge.type && groupedCharge.code === charge.code)
            .reduce((total, current) => total + current.quantity * current.price, 0);
          return {
            code: charge.code,
            currency: charge.currency,
            type: charge.type,
            price: chargePriceTotal,
            quantity,
          } as GroupedCharges;
        }),
      } as SummaryTypologyRecord;
      return res;
    }

    return undefined!;
  }

  protected setQuantityAndPricePerChargeType(
    summaryTypologyRecord: GroupedCharges | SummaryTypologyRecord,
    departure: GroupedCharges | SummaryTypologyRecord,
    arrival: GroupedCharges | SummaryTypologyRecord
  ): void {
    if (summaryTypologyRecord.type === EnumChargesType.SERVICE && summaryTypologyRecord.code !== PaxTypeCode.INF) {
      summaryTypologyRecord.quantity = departure.quantity + arrival.quantity;
    } else {
      summaryTypologyRecord.quantity = departure.quantity;
    }
    summaryTypologyRecord.price = departure.price * departure.quantity + arrival.price * arrival.quantity;
  }

  protected getPriceBreakdownVM(summaryTypologyDataVm: SummaryTypologyDataVm[]): PriceBreakdownVM {
    return {
      config: [
        {
          header: {
            config: {
              label: this.translate.instant(TranslationKeys.SummaryTypology_PerBooking_Header_Title),
              price: this.booking.pricing.totalAmount,
              currency: this.booking.pricing.currency,
              isCollapsible: this.summaryConfig.isCollapsible,
              ariaAttributes: {
                ariaControls: 'summaryTypologyPerBookingId',
              },
            },
            isCollapsed: true, // isCollapsed == true is closed, isCollapsed == false is open
          },
          list: this.getBreakdownItemsVm(summaryTypologyDataVm),
          accessibilityConfig: {
            id: 'summaryTypologyPerBookingId',
          },
        },
      ],
    } as PriceBreakdownVM;
  }

  protected getBreakdownItemsVm(summaryTypologyDataVm: SummaryTypologyDataVm[]): PriceBreakdownItemsVM[] {
    let priceBreakdownItemsVM: PriceBreakdownItemsVM[] = [];

    this.sortSummaryTypologyDataAndRecords(
      summaryTypologyDataVm,
      this.translate.instant(CommonTranslationKeys.Common_Services)
    );

    for (const summary of summaryTypologyDataVm) {
      const priceBreakdown = summary.records!.map(
        (record) =>
          ({
            item: {
              quantity: record.quantity,
              code: record.code,
              price: record.price,
              currency: record.currency,
            },
            subitems: record.charges!.map(
              (charge) =>
                ({
                  quantity: charge.quantity,
                  code: charge.code,
                  price: charge.price,
                  currency: charge.currency,
                }) as PriceBreakdownItemVM
            ),
          }) as PriceBreakdownItemsVM
      );
      priceBreakdownItemsVM = priceBreakdownItemsVM.concat(priceBreakdown);
    }

    return this.priceBreakdownItemsVMOrder(priceBreakdownItemsVM);
  }

  protected sortSummaryTypologyDataAndRecords(
    summaryTypologyDataVm: SummaryTypologyDataVm[],
    servicesLabel: string
  ): void {
    const firstElement = summaryTypologyDataVm.find(
      (x) => x.label === servicesLabel && x.records!.some((r) => r.type === EnumChargesType.FARE)
    );
    if (firstElement) {
      firstElement.records!.sort((x) => (x.type === EnumChargesType.TAX ? -1 : 1));
      firstElement.records!.sort((x) => (x.type === EnumChargesType.FARE ? -1 : 1));
      summaryTypologyDataVm.sort((x, y) => (x === firstElement ? -1 : this.getOrderIndex(y, firstElement)));
    }
  }

  protected override initPriceBreakdownModel(): PriceBreakdownVM {
    this.summaryTypologyDataVm = this.getMergeJourneysResult(this.getSummaryTypologyByRoute());
    return this.getPriceBreakdownVM(this.summaryTypologyDataVm);
  }

  private getArrivalRecordsThatDoesNotExistInDepartureRecord(
    arrivalRecords: SummaryTypologyRecord[],
    departure: SummaryTypologyDataVm,
    chargeType: string
  ): SummaryTypologyRecord[] {
    const filteredRecords = this.filterArrivalRecords(arrivalRecords, departure, chargeType);
    this.getArrivalRecordByQuntity(filteredRecords);
    return filteredRecords;
  }

  private filterArrivalRecords(
    arrivalRecords: SummaryTypologyRecord[],
    departure: SummaryTypologyDataVm,
    chargeType: string
  ): SummaryTypologyRecord[] {
    return arrivalRecords.filter(
      (arrivalRecord) =>
        arrivalRecord.chargeType !== chargeType &&
        !departure?.records?.some((record) => record.code === arrivalRecord.code)
    );
  }

  private getArrivalRecordByQuntity(arrivalRecords: SummaryTypologyRecord[]): void {
    for (const arrivalRecord of arrivalRecords) {
      arrivalRecord.price *= arrivalRecord.quantity;
    }
  }

  private addRecordPerTaxInSummaryTypology(
    recordPerTax: SummaryTypologyRecord,
    summaryTypologyRecords: SummaryTypologyRecord[]
  ): void {
    if (recordPerTax) {
      summaryTypologyRecords.push(recordPerTax);
    }
  }

  private getDepartureRecords(
    departure: SummaryTypologyDataVm,
    arrival: SummaryTypologyDataVm
  ): SummaryTypologyRecord[] {
    return departure
      ? departure
          .records!.filter((record) => record.chargeType !== EnumChargesType.TAX)
          .map((record) => {
            let charges: GroupedCharges[] = [];

            // find if the departure record is on the arrival
            const arrivalRecord = arrival.records!.find((recordA) => recordA.code === record.code);

            if (arrivalRecord) {
              const chargesDeparture = record.charges!.map((charge) => {
                // find if the departure charge is on the arrival
                const arrivalCharge = arrivalRecord.charges!.find((c) => c.code === charge.code);

                if (arrivalCharge) {
                  // return a charge
                  const buildCharge = {
                    code: charge.code,
                    currency: charge.currency,
                    type: charge.type,
                  } as GroupedCharges;

                  this.setQuantityAndPricePerChargeType(buildCharge, charge, arrivalCharge);

                  return buildCharge;
                } else {
                  // calc only departure
                  charge.price = charge.quantity * charge.price;
                  return charge;
                }
              });

              charges = charges.concat(chargesDeparture);

              // charges that the departure does not have
              const chargesArrival = arrivalRecord.charges!.filter(
                (charge) => !record.charges!.some((c) => c.code === charge.code)
              );

              charges = charges.concat(chargesArrival);

              // return a record
              const buildRecord = {
                chargeType: record.chargeType,
                type: record.chargeType,
                code: record.code,
                currency: record.currency,
                charges,
              } as SummaryTypologyRecord;

              this.setQuantityAndPricePerChargeType(buildRecord, record, arrivalRecord);

              return buildRecord;
            } else {
              // calc only departure
              record.price = record.quantity * record.price;
              for (const charge of record.charges!) {
                charge.price = charge.quantity * charge.price;
              }
              return record;
            }
          })
      : [];
  }

  private getOrderIndex(element: SummaryTypologyDataVm, firstElement: SummaryTypologyDataVm): number {
    return element === firstElement ? 1 : 0;
  }
}
