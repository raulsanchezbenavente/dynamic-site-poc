import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare const flatpickr: any;

@Component({
  selector: 'search',
  standalone: true,
  imports: [FormsModule],
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
            <span>Ida y vuelta</span>
          </label>
          <label class="av-radio">
            <input
              type="radio"
              name="tripType"
              [(ngModel)]="tripType"
              value="oneway" />
            <span>Solo ida</span>
          </label>
        </div>

        <div class="av-actions">
          <button
            type="button"
            class="av-pill">
            Comprar con millas
            <span class="av-pill-icon">↗</span>
          </button>

          <label class="av-check">
            <input
              type="checkbox"
              [(ngModel)]="payWithCredits"
              name="payWithCredits" />
            <span>Pagar con <strong>avianca credits</strong></span>
          </label>
        </div>

        <div class="av-right">
          <button
            type="button"
            class="av-pill">
            Hoteles
            <span class="av-pill-icon">↗</span>
          </button>
          <button
            type="button"
            class="av-pill">
            Autos
            <span class="av-pill-icon">↗</span>
          </button>
        </div>
      </div>

      <div class="av-card">
        <div class="av-field" [class.is-open]="fromOpen">
          <span class="av-field-icon">✈️</span>
          <div class="av-field-body">
            <span class="av-label">Origen</span>
            <input
              id="from"
              class="av-input"
              [(ngModel)]="fromQuery"
              (ngModelChange)="onFromInput($event)"
              (focus)="openFrom()"
              #fromInput
              name="from"
              placeholder="Madrid (MAD)" />
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
                      <span class="av-option-city">{{ option.city }}</span>
                      <span class="av-option-country">({{ option.country }})</span>
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
            <span class="av-label">Destino</span>
            <input
              id="to"
              class="av-input"
              [(ngModel)]="toQuery"
              (ngModelChange)="onToInput($event)"
              (focus)="openTo()"
              name="to"
              placeholder="Destino" />
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
                      <span class="av-option-city">{{ option.city }}</span>
                      <span class="av-option-country">({{ option.country }})</span>
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
            <span class="av-label">Ida</span>
            <input
              id="departure"
              class="av-input av-date-input"
              type="text"
              [(ngModel)]="departure"
              name="departure"
              placeholder="03/02/2026" />
          </div>
        </div>

        <div class="av-field">
          <span class="av-field-icon">📅</span>
          <div class="av-field-body">
            <span class="av-label">Vuelta</span>
            <input
              id="return"
              class="av-input av-date-input"
              type="text"
              [(ngModel)]="returnDate"
              name="returnDate"
              placeholder="06/02/2026" />
          </div>
        </div>

        <div class="av-field av-field-compact">
          <span class="av-field-icon">👤</span>
          <div class="av-field-body">
            <span class="av-label">Pasajeros</span>
            <input
              class="av-input av-input-center"
              type="number"
              min="1"
              [(ngModel)]="passengers"
              name="passengers" />
          </div>
        </div>

        <button
          type="button"
          class="av-search-btn"
          [disabled]="!isFormValid()"
          (click)="goToResults()">
          Buscar
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
  @ViewChild('fromInput', { static: false })
  private fromInput?: ElementRef<HTMLInputElement>;

  public tripType: 'round' | 'oneway' = 'round';
  public payWithCredits = false;
  public passengers = 1;
  public from: string | null = null;
  public to: string | null = null;
  public fromQuery = '';
  public toQuery = '';
  public fromOpen = false;
  public toOpen = false;
  public departure: string | null = null;
  public returnDate: string | null = null;
  public airportOptions: Array<{ city: string; country: string; code: string }> = [
    { city: 'Barcelona', country: 'España', code: 'BCN' },
    { city: 'Baréin', country: 'Baréin', code: 'BAH' },
    { city: 'Barrancabermeja', country: 'Colombia', code: 'EJA' },
    { city: 'Barranquilla', country: 'Colombia', code: 'BAQ' },
    { city: 'San Carlos de Bariloche', country: 'Argentina', code: 'BRC' },
    { city: 'Santa Bárbara', country: 'Estados Unidos', code: 'SBA' },
    { city: 'Wilkes Barre Scranton', country: 'Estados Unidos', code: 'AVP' },
    { city: 'Madrid', country: 'España', code: 'MAD' },
    { city: 'Bogotá', country: 'Colombia', code: 'BOG' },
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

  public selectFrom(option: { city: string; country: string; code: string }): void {
    const value = this.formatOption(option);
    this.from = value;
    this.fromQuery = value;
    this.fromOpen = false;
  }

  public selectTo(option: { city: string; country: string; code: string }): void {
    const value = this.formatOption(option);
    this.to = value;
    this.toQuery = value;
    this.toOpen = false;
  }

  public filteredFromOptions(): Array<{ city: string; country: string; code: string }> {
    return this.filterOptions(this.fromQuery);
  }

  public filteredToOptions(): Array<{ city: string; country: string; code: string }> {
    return this.filterOptions(this.toQuery);
  }

  private filterOptions(query: string): Array<{ city: string; country: string; code: string }> {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return this.airportOptions;
    return this.airportOptions.filter((item) => {
      return (
        item.city.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    });
  }

  private formatOption(option: { city: string; country: string; code: string }): string {
    return `${option.city} (${option.country}) ${option.code}`;
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
