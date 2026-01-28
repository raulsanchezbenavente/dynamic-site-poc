import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type LmTripCard = {
  fromCity: string;
  toCity: string;
  dateText: string;

  statusText: string; // "Confirmado"
  departureTime: string; // "04:20"
  departureCode: string; // "MDE"

  arrivalTime: string; // "05:25"
  arrivalCode: string; // "BOG"

  directText: string; // "Direct"
  durationText: string; // "1h 5m"
  operatedByText: string; // "Operado por Avianca"
  ctaText: string; // "Start check-in"
};

@Component({
  selector: 'find-bookings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="ut-wrap"
      role="region"
      [attr.aria-label]="'TRIPS.ARIA_LABEL' | translate">
      <h2 class="ut-title">{{ title() | translate }}</h2>

      @for (t of trips(); track trackByTrip($index, t)) {
        <article class="ut-card">
          <div class="ut-head">
            <div class="ut-route">
              <span
                class="ut-plane-ico"
                aria-hidden="true"
                >✈</span
              >
              <span class="ut-route-text">{{ t.fromCity }} {{ 'TRIPS.TO' | translate }} {{ t.toCity }}</span>
            </div>

            <div class="ut-status">
              <span
                class="ut-status-ico"
                aria-hidden="true"
                >✓</span
              >
              <span>{{ t.statusText | translate }}</span>
            </div>
          </div>

          <div class="ut-date">{{ t.dateText }}</div>

          <div class="ut-mid">
            <div class="ut-time">
              <div class="ut-time-big">{{ t.departureTime }}</div>
              <div class="ut-time-code">{{ t.departureCode }}</div>
            </div>

            <div class="ut-line">
              <div class="ut-line-top">
                <span class="ut-direct">{{ t.directText | translate }}</span>
                <span
                  class="ut-dot-sep"
                  aria-hidden="true"
                  >|</span
                >
                <span class="ut-duration">{{ t.durationText }}</span>
              </div>

              <div
                class="ut-dots"
                aria-hidden="true">
                <span class="ut-dot ut-dot--left"></span>
                <span class="ut-dash"></span>
                <span class="ut-plane">✈</span>
                <span class="ut-dash"></span>
                <span class="ut-dot ut-dot--right"></span>
              </div>

              <div class="ut-operated">
                {{ t.operatedByText | translate }}
              </div>
            </div>

            <div class="ut-time ut-time--right">
              <div class="ut-time-big">{{ t.arrivalTime }}</div>
              <div class="ut-time-code">{{ t.arrivalCode }}</div>
            </div>
          </div>

          <div
            class="ut-sep"
            aria-hidden="true"></div>

          <div class="ut-cta">
            <button
              type="button"
              class="ut-btn"
              (click)="noop()">
              {{ t.ctaText | translate }}
            </button>
          </div>
        </article>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ut-wrap {
        max-width: 1100px;
      }

      .ut-title {
        margin: 0 0 14px;
        font-size: 22px;
        font-weight: 900;
        color: #111;
      }

      .ut-card {
        background: #fff;
        border-radius: 16px;
        border: 1px solid #eee;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.1);
        padding: 18px 18px 16px;
        margin: 14px 0;
      }

      .ut-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .ut-route {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #111;
        font-weight: 900;
        font-size: 20px;
      }

      .ut-plane-ico {
        font-size: 18px;
        transform: translateY(-1px);
      }

      .ut-date {
        margin-top: 6px;
        color: #555;
        font-size: 13px;
      }

      .ut-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 6px;
        background: #d8f7d8;
        color: #0b6b0b;
        font-weight: 800;
        font-size: 14px;
        white-space: nowrap;
      }

      .ut-status-ico {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #0b6b0b;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }

      .ut-mid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: 120px 1fr 120px;
        gap: 16px;
        align-items: center;
      }

      .ut-time {
        color: #111;
      }
      .ut-time--right {
        text-align: right;
      }
      .ut-time-big {
        font-size: 28px;
        font-weight: 900;
        letter-spacing: 0.3px;
      }
      .ut-time-code {
        margin-top: 4px;
        font-weight: 800;
        color: #111;
        opacity: 0.95;
      }

      .ut-line {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .ut-line-top {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: #444;
        white-space: nowrap;
      }
      .ut-direct {
        color: #0b7285;
        font-weight: 800;
      }
      .ut-dot-sep {
        opacity: 0.4;
      }

      .ut-dots {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ut-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #0b7285;
        flex: 0 0 auto;
      }
      .ut-dash {
        border-top: 2px dotted #999;
        flex: 1 1 auto;
        transform: translateY(1px);
      }
      .ut-plane {
        font-size: 18px;
        color: #111;
        transform: translateY(1px);
        flex: 0 0 auto;
      }

      .ut-operated {
        font-size: 12px;
        color: #555;
        background: #f4f4f4;
        padding: 8px 14px;
        border-radius: 10px;
        white-space: nowrap;
      }

      .ut-sep {
        margin-top: 16px;
        border-top: 1px dashed #ddd;
      }

      .ut-cta {
        display: flex;
        justify-content: center;
        padding-top: 14px;
      }

      .ut-btn {
        border: 0;
        background: #111;
        color: #fff;
        font-weight: 900;
        padding: 14px 26px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 16px;
        min-width: 260px;
        box-shadow: 0 12px 22px rgba(0, 0, 0, 0.18);
      }
      .ut-btn:hover {
        filter: brightness(1.06);
      }

      @media (max-width: 900px) {
        .ut-mid {
          grid-template-columns: 1fr;
          gap: 12px;
          text-align: left;
        }
        .ut-time--right {
          text-align: left;
        }
        .ut-line {
          align-items: flex-start;
        }
        .ut-dots {
          width: 100%;
        }
        .ut-cta {
          justify-content: flex-start;
        }
        .ut-btn {
          min-width: 220px;
        }
      }
    `,
  ],
})
export class FindBookingsComponent {
  public title = input<string>('TRIPS.TITLE');
  public trips = input<LmTripCard[]>([
    {
      fromCity: 'Medellín',
      toCity: 'Bogotá',
      dateText: 'Viernes, 23 de enero de 2026',
      statusText: 'TRIPS.STATUS_CONFIRMED',
      departureTime: '04:20',
      departureCode: 'MDE',
      arrivalTime: '05:25',
      arrivalCode: 'BOG',
      directText: 'TRIPS.DIRECT',
      durationText: '1h 5m',
      operatedByText: 'TRIPS.OPERATED_BY_AVIANCA',
      ctaText: 'TRIPS.CTA_CHECKIN',
    },
    {
      fromCity: 'Barcelona',
      toCity: 'Bogotá',
      dateText: 'Viernes, 23 de enero de 2026',
      statusText: 'TRIPS.STATUS_CONFIRMED',
      departureTime: '12:50',
      departureCode: 'BCN',
      arrivalTime: '17:45',
      arrivalCode: 'BOG',
      directText: 'TRIPS.DIRECT',
      durationText: '4h 55m',
      operatedByText: 'TRIPS.OPERATED_BY_AVIANCA',
      ctaText: 'TRIPS.CTA_CHECKIN',
    },
  ]);

  public trackByTrip(_: number, t: LmTripCard): string {
    return `${t.fromCity}-${t.toCity}-${t.departureTime}-${t.arrivalTime}`;
  }

  // Fake handler
  public noop(): void {}
}
