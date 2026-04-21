import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  CommonTranslationKeys,
  CurrencyService,
  DropdownListConfig,
  EventBusService,
  GenerateIdPipe,
  IbeEventTypeEnum,
  OptionsList,
  RedirectService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { resolveDropdownValueFromOptions } from '../dropdown-type';
import { DropdownListComponent } from '../dropdown-type/components/dropdown-list/dropdown-list.component';

import { CurrencyListVM } from './models/currency-list-config';

@Component({
  selector: 'currency-selector',
  templateUrl: './currency-selector.component.html',
  imports: [DropdownListComponent],
  standalone: true,
})
export class CurrencySelectorComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) public config!: DropdownListConfig;
  @Input() public reloadPageOnSelection: boolean = true;
  @Input() public quotedCurrency!: string;

  @Output() private readonly selectCurrencyEmitter = new EventEmitter<string>();

  public selectedOption: OptionsList = {} as OptionsList;
  public selectedCurrency: string = '';
  public label: string = '';
  public currencyListMV: CurrencyListVM = {} as CurrencyListVM;
  private culturecode: string = '';

  private readonly translate = inject(TranslateService);

  constructor(
    public elementRef: ElementRef,
    public currencyService: CurrencyService,
    public redirectService: RedirectService,
    public eventBusService: EventBusService,
    protected generateId: GenerateIdPipe
  ) {}

  @Input()
  set culture(value: string) {
    this.culturecode = value && value.length > 0 ? value : 'en-US';
  }

  get culture(): string {
    return this.culturecode;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterViewInit(): void {
    this.initCurrencies();
  }

  /**
   * @param selectedCurrency
   * emit event with selected currency and update currency service
   */
  public selectCurrency(selectedCurrency: OptionsList): void {
    if (!selectedCurrency.code) return;

    const oldSelectedCurrency = this.currencyService.getCurrentCurrency();

    this.selectCurrencyEmitter.emit(selectedCurrency.code);
    this.selectedCurrency = selectedCurrency.code;
    this.currencyService.setCurrency(selectedCurrency.code, true);
    this.config.dropdownModel.value = this.selectedCurrency;
    if (this.reloadPageOnSelection) {
      this.reloadPageUsingSpecificCurrency(oldSelectedCurrency, selectedCurrency.code);
    }
  }

  protected internalInit(): void {
    this.selectedCurrency = this.currencyService.getCurrentCurrency();
    this.getSelectedCurrency();
    this.subscribeToCurrencyChange();
    this.label = this.translate.instant(CommonTranslationKeys.Common_CurrencySelector_List_Label);
    this.config.dropdownModel.config.label = this.label;
  }

  /**
   * find (code, name) input currency in currency list
   */
  protected getSelectedCurrency(): void {
    this.config.dropdownModel.value = resolveDropdownValueFromOptions(
      this.selectedCurrency,
      this.config.optionsListConfig.options
    );
  }

  private subscribeToCurrencyChange(): void {
    this.currencyService.currency$.pipe(filter((currency) => currency !== null)).subscribe((currency) => {
      if (currency) {
        this.selectedCurrency = currency;
        this.getSelectedCurrency();
      }
    });
  }

  private reloadPageUsingSpecificCurrency(oldSelectedCurrency: string, selectedCurrency: string): void {
    const url = this.redirectService.getRedirectFromCurrentUrl(this.culture);
    const newUrlWithNewCurrency = url.replace(oldSelectedCurrency, selectedCurrency);
    this.redirectToUrl(newUrlWithNewCurrency);
  }

  private redirectToUrl(urlToRedirect: string): void {
    this.eventBusService.notifyEvent({
      type: IbeEventTypeEnum.pageRedirected,
      culture: this.culture,
      redirectUrl: {
        type: this.redirectService.validateEventRedirectType(urlToRedirect),
        url: urlToRedirect,
      },
    });
  }

  private initCurrencies(): void {
    if (this.config?.optionsListConfig?.options.length > 0) {
      for (const bc of this.config.optionsListConfig.options) {
        const currencyName = `CurrencyName_${bc.code}`;
        bc.name = this.translate.instant(currencyName);
      }
    }
  }
}
