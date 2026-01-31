import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

declare const flatpickr: any;

@Component({
  selector: 'search',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="av-search">
      <div class="av-search-top">
        <div class="av-trip">
          <label class="av-radio">
            <input
              type="radio"
              name="tripType"
              [(ngModel)]="tripType"
              value="round" />
            <span>{{ 'SEARCH.TRIP_ROUND' | translate }}</span>
          </label>
          <label class="av-radio">
            <input
              type="radio"
              name="tripType"
              [(ngModel)]="tripType"
              value="oneway" />
            <span>{{ 'SEARCH.TRIP_ONEWAY' | translate }}</span>
          </label>
        </div>

        <div class="av-actions">
          <button
            type="button"
            class="av-pill">
            {{ 'SEARCH.BUY_WITH_MILES' | translate }}
            <span class="av-pill-icon">↗</span>
          </button>

          <label class="av-check">
            <input
              type="checkbox"
              [(ngModel)]="payWithCredits"
              name="payWithCredits" />
            <span>{{ 'SEARCH.PAY_WITH' | translate }} <strong>avianca credits</strong></span>
          </label>
        </div>

        <div class="av-right">
          <button
            type="button"
            class="av-pill">
            {{ 'SEARCH.HOTELS' | translate }}
            <span class="av-pill-icon">↗</span>
          </button>
          <button
            type="button"
            class="av-pill">
            {{ 'SEARCH.CARS' | translate }}
            <span class="av-pill-icon">↗</span>
          </button>
        </div>
      </div>

      <div class="av-card">
        <div class="av-field" [class.is-open]="fromOpen">
          <span class="av-field-icon">✈️</span>
          <div class="av-field-body">
            <span class="av-label">{{ 'SEARCH.ORIGIN' | translate }}</span>
            <input
              id="from"
              class="av-input"
              [(ngModel)]="fromQuery"
              (ngModelChange)="onFromInput($event)"
              (focus)="openFrom()"
              #fromInput
              name="from"
              [placeholder]="'SEARCH.ORIGIN_PLACEHOLDER' | translate" />
          </div>

          @if (fromOpen) {
            <div class="av-dropdown">
              <div class="av-dropdown-list">
                @for (option of filteredFromOptions(); track option.code) {
                  <button
                    type="button"
                    class="av-option"
                    (click)="selectFrom(option)">
                    <span class="av-option-main">
                      <span class="av-option-city">{{ option.cityKey | translate }}</span>
                      <span class="av-option-country">({{ option.countryKey | translate }})</span>
                    </span>
                    <span class="av-option-code">{{ option.code }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="av-field" [class.is-open]="toOpen">
          <span class="av-field-icon">✈️</span>
          <div class="av-field-body">
            <span class="av-label">{{ 'SEARCH.DESTINATION' | translate }}</span>
            <input
              id="to"
              class="av-input"
              [(ngModel)]="toQuery"
              (ngModelChange)="onToInput($event)"
              (focus)="openTo()"
              name="to"
              [placeholder]="'SEARCH.DESTINATION_PLACEHOLDER' | translate" />
          </div>

          @if (toOpen) {
            <div class="av-dropdown">
              <div class="av-dropdown-list">
                @for (option of filteredToOptions(); track option.code) {
                  <button
                    type="button"
                    class="av-option"
                    (click)="selectTo(option)">
                    <span class="av-option-main">
                      <span class="av-option-city">{{ option.cityKey | translate }}</span>
                      <span class="av-option-country">({{ option.countryKey | translate }})</span>
                    </span>
                    <span class="av-option-code">{{ option.code }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="av-field">
          <span class="av-field-icon">📅</span>
          <div class="av-field-body">
            <span class="av-label">{{ 'SEARCH.DEPARTURE' | translate }}</span>
            <input
              id="departure"
              class="av-input av-date-input"
              type="text"
              [(ngModel)]="departure"
              name="departure"
              [placeholder]="'SEARCH.DEPARTURE_PLACEHOLDER' | translate" />
          </div>
        </div>

        <div class="av-field">
          <span class="av-field-icon">📅</span>
          <div class="av-field-body">
            <span class="av-label">{{ 'SEARCH.RETURN' | translate }}</span>
            <input
              id="return"
              class="av-input av-date-input"
              type="text"
              [(ngModel)]="returnDate"
              name="returnDate"
              [placeholder]="'SEARCH.RETURN_PLACEHOLDER' | translate" />
          </div>
        </div>

        <div class="av-field av-field-compact" [class.is-open]="passengersOpen">
          <span class="av-field-icon">👤</span>
          <button
            type="button"
            class="av-passenger-trigger"
            (click)="togglePassengers()">
            <span class="av-label">{{ 'SEARCH.PASSENGERS' | translate }}</span>
            <span class="av-passenger-count">
              {{ totalPassengers() }}
              <span class="av-passenger-caret">▴</span>
            </span>
          </button>

          @if (passengersOpen) {
            <div class="av-passenger-dropdown" (click)="$event.stopPropagation()">
              <div class="av-passenger-title">{{ 'SEARCH.WHO_FLY' | translate }}</div>

              <div class="av-passenger-row">
                <div class="av-passenger-info">
                  <div class="av-passenger-label">{{ 'SEARCH.ADULTS' | translate }}</div>
                  <div class="av-passenger-sub">{{ 'SEARCH.ADULTS_SUB' | translate }}</div>
                </div>
                <div class="av-counter">
                  <button
                    type="button"
                    class="av-counter-btn"
                    [disabled]="adults <= 1"
                    (click)="decrement('adults')">
                    −
                  </button>
                  <span class="av-counter-value">{{ adults }}</span>
                  <button
                    type="button"
                    class="av-counter-btn"
                    (click)="increment('adults')">
                    +
                  </button>
                </div>
              </div>

              <div class="av-passenger-row">
                <div class="av-passenger-info">
                  <div class="av-passenger-label">{{ 'SEARCH.TEENS' | translate }}</div>
                  <div class="av-passenger-sub">{{ 'SEARCH.TEENS_SUB' | translate }}</div>
                </div>
                <div class="av-counter">
                  <button
                    type="button"
                    class="av-counter-btn"
                    [disabled]="teens <= 0"
                    (click)="decrement('teens')">
                    −
                  </button>
                  <span class="av-counter-value">{{ teens }}</span>
                  <button
                    type="button"
                    class="av-counter-btn"
                    (click)="increment('teens')">
                    +
                  </button>
                </div>
              </div>

              <div class="av-passenger-row">
                <div class="av-passenger-info">
                  <div class="av-passenger-label">{{ 'SEARCH.KIDS' | translate }}</div>
                  <div class="av-passenger-sub">{{ 'SEARCH.KIDS_SUB' | translate }}</div>
                </div>
                <div class="av-counter">
                  <button
                    type="button"
                    class="av-counter-btn"
                    [disabled]="kids <= 0"
                    (click)="decrement('kids')">
                    −
                  </button>
                  <span class="av-counter-value">{{ kids }}</span>
                  <button
                    type="button"
                    class="av-counter-btn"
                    (click)="increment('kids')">
                    +
                  </button>
                </div>
              </div>

              <div class="av-passenger-row">
                <div class="av-passenger-info">
                  <div class="av-passenger-label">{{ 'SEARCH.INFANTS' | translate }}</div>
                  <div class="av-passenger-sub">{{ 'SEARCH.INFANTS_SUB' | translate }}</div>
                </div>
                <div class="av-counter">
                  <button
                    type="button"
                    class="av-counter-btn"
                    [disabled]="infants <= 0"
                    (click)="decrement('infants')">
                    −
                  </button>
                  <span class="av-counter-value">{{ infants }}</span>
                  <button
                    type="button"
                    class="av-counter-btn"
                    (click)="increment('infants')">
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="av-passenger-confirm"
                (click)="confirmPassengers()">
                {{ 'SEARCH.CONFIRM' | translate }}
              </button>
            </div>
          }
        </div>

        <button
          type="button"
          class="av-search-btn"
          [disabled]="!isFormValid()"
          (click)="goToResults()">
          {{ 'SEARCH.SEARCH' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .av-search {
        background: linear-gradient(135deg, #bfe6f4 0%, #cdeef8 45%, #b7dfee 100%);
        border-radius: 18px;
        padding: 18px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
        padding-left: clamp(16px, 4vw, 40px);
        padding-right: clamp(16px, 4vw, 40px);
      }

      .av-search-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }

      .av-trip {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        background: #fff;
        padding: 6px 10px;
        border-radius: 999px;
        box-shadow: inset 0 0 0 1px #e6e6e6;
      }

      .av-radio {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #111;
      }

      .av-radio input {
        width: 18px;
        height: 18px;
        accent-color: #2dbf5c;
      }

      .av-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .av-right {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .av-pill {
        border: 0;
        background: #fff;
        color: #111;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 999px;
        box-shadow: inset 0 0 0 1px #e6e6e6;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .av-pill-icon {
        font-size: 12px;
      }

      .av-check {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        padding: 8px 14px;
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px #e6e6e6;
        font-weight: 600;
        color: #111;
      }

      .av-check input {
        width: 18px;
        height: 18px;
        accent-color: #2dbf5c;
      }

      .av-card {
        background: #fff;
        border-radius: 18px;
        padding: 14px;
        display: grid;
        grid-template-columns: 2.2fr 2.2fr 1.5fr 1.5fr 1fr auto;
        gap: 12px;
        align-items: center;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        overflow: visible;
      }

      .av-field {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-left: 10px;
        position: relative;
      }

      .av-field + .av-field {
        border-left: 1px solid #e6e6e6;
      }

      .av-field.is-open::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -2px;
        height: 2px;
        background: #25c04a;
        border-radius: 2px;
      }

      .av-field-icon {
        font-size: 20px;
      }

      .av-field-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .av-label {
        font-size: 12px;
        color: #6a6a6a;
        font-weight: 600;
      }

      .av-input {
        border: 0;
        background: transparent;
        font-size: 18px;
        font-weight: 700;
        color: #111;
        outline: none;
        padding: 0;
        width: 100%;
      }

      .av-input::placeholder {
        color: #111;
        opacity: 0.6;
      }

      .av-dropdown {
        position: absolute;
        left: 0;
        right: auto;
        top: calc(100% + 12px);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
        border: 1px solid #e9e9e9;
        padding: 6px 0;
        z-index: 20;
        width: 640px;
        max-width: 90vw;
      }

      .av-dropdown-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(240px, 1fr));
        column-gap: 24px;
      }

      .av-option {
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 14px 18px;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        color: #111;
        width: 100%;
        box-sizing: border-box;
      }

      .av-option:hover {
        background: #f6f6f6;
      }

      .av-option-main {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex-wrap: wrap;
      }

      .av-option-city {
        font-weight: 700;
        white-space: nowrap;
      }

      .av-option-country {
        color: #4b4b4b;
        font-weight: 500;
        white-space: nowrap;
      }

      .av-option-code {
        font-weight: 600;
        color: #222;
        white-space: nowrap;
      }

      .av-input-center {
        text-align: center;
        max-width: 64px;
      }

      .av-passenger-trigger {
        border: 0;
        background: transparent;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        cursor: pointer;
        font: inherit;
        color: inherit;
      }

      .av-passenger-count {
        font-size: 18px;
        font-weight: 700;
        color: #111;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .av-passenger-caret {
        font-size: 14px;
        transform: rotate(180deg);
      }

      .av-field.is-open .av-passenger-caret {
        transform: rotate(0deg);
      }

      .av-passenger-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 12px);
        width: 320px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.2);
        border: 1px solid #e9e9e9;
        padding: 20px;
        z-index: 30;
        display: grid;
        gap: 16px;
      }

      .av-passenger-title {
        font-size: 18px;
        font-weight: 700;
        color: #111;
      }

      .av-passenger-row {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 12px;
      }

      .av-passenger-label {
        font-weight: 700;
        color: #111;
      }

      .av-passenger-sub {
        color: #6a6a6a;
        font-size: 13px;
        margin-top: 2px;
      }

      .av-counter {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .av-counter-btn {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        border: 2px solid #111;
        background: #fff;
        color: #111;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .av-counter-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .av-counter-value {
        font-size: 18px;
        font-weight: 700;
        min-width: 16px;
        text-align: center;
      }

      .av-passenger-confirm {
        border: 0;
        background: #111;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        padding: 12px 18px;
        border-radius: 999px;
        cursor: pointer;
        width: 100%;
        margin-top: 6px;
      }

      .av-search-btn {
        border: 0;
        background: #111;
        color: #fff;
        font-weight: 700;
        font-size: 18px;
        padding: 16px 28px;
        border-radius: 999px;
        cursor: pointer;
        min-width: 140px;
      }

      .av-search-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 1100px) {
        .av-card {
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .av-field {
          border-left: none;
          padding-left: 0;
        }

        .av-field + .av-field {
          border-left: none;
        }

        .av-search-btn {
          width: 100%;
        }

        .av-dropdown {
          position: relative;
          top: 12px;
        }

        .av-dropdown-list {
          grid-template-columns: 1fr;
        }

        .av-passenger-dropdown {
          position: relative;
          top: 12px;
          right: auto;
          width: 100%;
        }
      }

      @media (max-width: 700px) {
        .av-trip {
          width: 100%;
          justify-content: space-between;
        }

        .av-right {
          width: 100%;
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class SearchComponent implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly translate = inject(TranslateService);
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
    });
    requestAnimationFrame(() => {
      this.fromInput?.nativeElement.focus();
      this.openFrom();
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
      return (
        city.includes(q) ||
        country.includes(q) ||
        item.code.toLowerCase().includes(q)
      );
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
  }
}
