import { Component, Inject, OnInit } from '@angular/core';
import {
  PriceBreakdownComponent,
  PriceBreakdownConfig,
  PriceBreakdownItemsVM,
  PriceBreakdownItemVM,
  PriceBreakdownVM,
} from '@dcx/ui/design-system';
import {
  EnumChargesType,
  ISummarySelectedJourneysService,
  PassengerTypesVM,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
} from '@dcx/ui/libs';

import { SummaryTypologyBaseService } from '../../services/summary-typology-base.service';
import { SummaryTypologyBaseComponent } from '../../summary-typology-base.component';
import { TranslateModule } from '@ngx-translate/core';
import { PassengerTypesComponent } from '../../../passenger-types/passenger-types.component';

@Component({
  selector: 'summary-typology-per-journey',
  templateUrl: './summary-typology-per-journey.component.html',
  styleUrls: ['./styles/summary-typology-per-journey.style.scss'],
  imports: [TranslateModule, PassengerTypesComponent, PriceBreakdownComponent],
  standalone: true,
})
export class SummaryTypologyPerJourneyComponent extends SummaryTypologyBaseComponent implements OnInit {
  public passengerTypesModel!: PassengerTypesVM;
  public hasServicesAndJourneys!: boolean;

  constructor(
    public override summaryTypologyBaseService: SummaryTypologyBaseService,
    @Inject(SUMMARY_SELECTED_JOURNEYS_SERVICE)
    protected override summarySelectedJourneysService: ISummarySelectedJourneysService
  ) {
    super(summaryTypologyBaseService, summarySelectedJourneysService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.internalInit();
  }

  protected setHasServicesAndJourneys(summaryTypologyRoutes: SummaryTypologyDataVm[]): void {
    this.hasServicesAndJourneys =
      summaryTypologyRoutes.some((route) => route.modelType === SummaryTypologyDataVmModelType.SERVICES) &&
      summaryTypologyRoutes.some(
        (route) =>
          route.modelType === SummaryTypologyDataVmModelType.DEPARTURE ||
          route.modelType === SummaryTypologyDataVmModelType.ARRIVAL
      );
  }

  protected internalInit(): void {
    this.passengerTypesModel = this.initPassengerTypesModel();
  }

  protected override initPriceBreakdownModel(): PriceBreakdownVM {
    let summaryTypologyRoutes = this.getSummaryTypologyByRoute();
    if (this.summaryConfig.showInfoForSelectedFlight) {
      const summaryTypologyRoutesTemp: SummaryTypologyDataVm[] = [];
      for (const x of summaryTypologyRoutes) {
        if (x.records?.some((service) => service.chargeType === EnumChargesType.SERVICE)) {
          summaryTypologyRoutesTemp.push({
            bundledRecords: x.bundledRecords,
            currency: x.currency,
            label: x.label,
            labelText: x.labelText,
            modelType: x.modelType,
            price: x.price,
            records: x.records?.filter((service) => service.chargeType === EnumChargesType.SERVICE),
          });
        }
      }
      summaryTypologyRoutes = summaryTypologyRoutesTemp;
    }
    return this.getPriceBreakdown(summaryTypologyRoutes);
  }

  protected getBreakdownItemsVm(summaryTypologyRoute: SummaryTypologyDataVm): PriceBreakdownItemsVM[] {
    const priceBreakdown = summaryTypologyRoute.records!.map(
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

    return this.priceBreakdownItemsVMOrder(priceBreakdown);
  }

  private getPriceBreakdown(summaryTypologyData: SummaryTypologyDataVm[]): PriceBreakdownVM {
    this.setHasServicesAndJourneys(summaryTypologyData);
    return {
      config: summaryTypologyData.map(
        (summaryTypologyRoute) =>
          ({
            header: {
              config: {
                label: summaryTypologyRoute.label,
                secondLabel: summaryTypologyRoute.labelText,
                price: +summaryTypologyRoute.price!,
                currency: summaryTypologyRoute.currency,
                isCollapsible: this.summaryConfig.isCollapsible,
                ariaAttributes: {
                  ariaControls: `summaryTypologyPerJourney${summaryTypologyRoute.label}Id`,
                },
              },
              isCollapsed: true,
            },
            list: this.getBreakdownItemsVm(summaryTypologyRoute),
            isCollapsible: this.summaryConfig.isCollapsible,
            accessibilityConfig: {
              id: `summaryTypologyPerJourney${summaryTypologyRoute.label}Id`,
            },
          }) as PriceBreakdownConfig
      ),
      isCollapsed: true,
    } as PriceBreakdownVM;
  }
}
