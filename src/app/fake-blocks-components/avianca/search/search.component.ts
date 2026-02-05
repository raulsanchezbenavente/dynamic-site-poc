import { AfterViewInit, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

declare const flatpickr: any;

@Component({
  selector: 'search',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  @ViewChild('fromInput', { static: false })
  private fromInput?: ElementRef<HTMLInputElement>;

  public tripType: 'round' | 'oneway' = 'round';
  public payWithCredits = false;
  public passengers = 1;
  public passengersOpen = false;
  public adults = 1;
  public teens = 1;
  public kids = 1;
  public infants = 1;
  public from: string | null = null;
  public to: string | null = null;
  public fromQuery = '';
  public toQuery = '';
  public fromOpen = false;
  public toOpen = false;
  public departure: string | null = null;
  public returnDate: string | null = null;
  public airportOptions: Array<{ cityKey: string; countryKey: string; code: string }> = [
    { cityKey: 'SEARCH.CITY_BARCELONA', countryKey: 'SEARCH.COUNTRY_SPAIN', code: 'BCN' },
    { cityKey: 'SEARCH.CITY_BAHRAIN', countryKey: 'SEARCH.COUNTRY_BAHRAIN', code: 'BAH' },
    { cityKey: 'SEARCH.CITY_BARRANCABERMEJA', countryKey: 'SEARCH.COUNTRY_COLOMBIA', code: 'EJA' },
    { cityKey: 'SEARCH.CITY_BARRANQUILLA', countryKey: 'SEARCH.COUNTRY_COLOMBIA', code: 'BAQ' },
    { cityKey: 'SEARCH.CITY_BARILOCHE', countryKey: 'SEARCH.COUNTRY_ARGENTINA', code: 'BRC' },
    { cityKey: 'SEARCH.CITY_SANTA_BARBARA', countryKey: 'SEARCH.COUNTRY_UNITED_STATES', code: 'SBA' },
    { cityKey: 'SEARCH.CITY_WILKES_BARRE', countryKey: 'SEARCH.COUNTRY_UNITED_STATES', code: 'AVP' },
    { cityKey: 'SEARCH.CITY_MADRID', countryKey: 'SEARCH.COUNTRY_SPAIN', code: 'MAD' },
    { cityKey: 'SEARCH.CITY_BOGOTA', countryKey: 'SEARCH.COUNTRY_COLOMBIA', code: 'BOG' },
  ];

  public ngAfterViewInit(): void {
    flatpickr('.av-date-input', {
      dateFormat: 'd/m/Y',
      disableMobile: true,
    });
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.fromOpen = false;
      this.toOpen = false;
      this.passengersOpen = false;
    }
  }

  public openFrom(): void {
    this.fromOpen = true;
    this.toOpen = false;
  }

  public openTo(): void {
    this.toOpen = true;
    this.fromOpen = false;
  }

  public onFromInput(value: string): void {
    this.fromQuery = value;
    this.from = value;
    this.openFrom();
  }

  public onToInput(value: string): void {
    this.toQuery = value;
    this.to = value;
    this.openTo();
  }

  public selectFrom(option: { cityKey: string; countryKey: string; code: string }): void {
    const value = this.formatOption(option);
    this.from = value;
    this.fromQuery = value;
    this.fromOpen = false;
  }

  public selectTo(option: { cityKey: string; countryKey: string; code: string }): void {
    const value = this.formatOption(option);
    this.to = value;
    this.toQuery = value;
    this.toOpen = false;
  }

  public togglePassengers(): void {
    this.passengersOpen = !this.passengersOpen;
    this.fromOpen = false;
    this.toOpen = false;
  }

  public confirmPassengers(): void {
    this.passengersOpen = false;
  }

  public increment(type: 'adults' | 'teens' | 'kids' | 'infants'): void {
    if (type === 'adults') this.adults += 1;
    if (type === 'teens') this.teens += 1;
    if (type === 'kids') this.kids += 1;
    if (type === 'infants') this.infants += 1;
  }

  public decrement(type: 'adults' | 'teens' | 'kids' | 'infants'): void {
    if (type === 'adults' && this.adults > 1) this.adults -= 1;
    if (type === 'teens' && this.teens > 0) this.teens -= 1;
    if (type === 'kids' && this.kids > 0) this.kids -= 1;
    if (type === 'infants' && this.infants > 0) this.infants -= 1;
  }

  public totalPassengers(): number {
    return this.adults + this.teens + this.kids + this.infants;
  }

  public filteredFromOptions(): Array<{ cityKey: string; countryKey: string; code: string }> {
    return this.filterOptions(this.fromQuery);
  }

  public filteredToOptions(): Array<{ cityKey: string; countryKey: string; code: string }> {
    return this.filterOptions(this.toQuery);
  }

  private filterOptions(query: string): Array<{ cityKey: string; countryKey: string; code: string }> {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return this.airportOptions;
    return this.airportOptions.filter((item) => {
      const city = this.translate.instant(item.cityKey).toLowerCase();
      const country = this.translate.instant(item.countryKey).toLowerCase();
      return city.includes(q) || country.includes(q) || item.code.toLowerCase().includes(q);
    });
  }

  private formatOption(option: { cityKey: string; countryKey: string; code: string }): string {
    const city = this.translate.instant(option.cityKey);
    const country = this.translate.instant(option.countryKey);
    return `${city} (${country}) ${option.code}`;
  }

  public isFormValid(): boolean {
    if (this.tripType === 'oneway') {
      return !!(this.from && this.to && this.departure);
    }
    return !!(this.from && this.to && this.departure && this.returnDate);
  }

  public goToResults(): void {
    console.log('Searching flights with:', {
      from: this.from,
      to: this.to,
      departure: this.departure,
      returnDate: this.returnDate,
    });

    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('11', lang);
    this.router.navigateByUrl(path ?? `/${lang}/results`);
  }

  public goTo(page: string): void {
    let url = 'https://www.avianca.com/';
    switch (page) {
      case 'miles':
        url =
          'https://www.lifemiles.com/fly/find?&utm_source=avianca&utm_medium=referral&utm_campaign=Redirect_compra_avco';
        break;
      case 'hotels':
        url =
          'https://hotels.lifemiles.com/?utm_source=avianca&utm_medium=search-widget&utm_campaign=avianca-search-widget&utm_term=11-2025&utm_content=search-widget';
        break;
      case 'cars':
        url = 'https://www.rentalcars.com/?affiliateCode=avianca695&adplat=cardlandingpage';
        break;
      default:
        break;
    }

    globalThis.open(url, '_blank');
  }
}
