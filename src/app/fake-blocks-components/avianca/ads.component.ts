import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ads',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="ad-shell">
      <section class="ad-wrap">
        <div class="ad-hero">
          <div class="ad-hero-image">
            <div class="ad-hero-badge">{{ 'ADS.BADGE_EARN_MILES' | translate }}</div>
            <div class="ad-hero-title">{{ 'ADS.HERO_TITLE' | translate }}</div>
            <div class="ad-hero-sub">{{ 'ADS.HERO_SUBTITLE' | translate }}</div>
          </div>
          <div class="ad-hero-panel">
            <div class="ad-hero-panel-title">{{ 'ADS.PANEL_TITLE' | translate }}</div>
            <div class="ad-hero-panel-copy">
              {{ 'ADS.PANEL_COPY' | translate }}
            </div>
            <button class="ad-hero-cta" type="button">{{ 'ADS.CTA_BUY_NOW' | translate }}</button>
          </div>
        </div>

        <div class="ad-section-title">
          {{ 'ADS.OFFERS_FROM' | translate }} <span class="ad-section-link">Madrid</span>
          <span class="ad-section-caret">▾</span>
        </div>

        <div class="ad-cards">
          <article class="ad-card">
            <div class="ad-card-img ad-img-lima"></div>
            <div class="ad-card-body">
              <div class="ad-card-title">Lima</div>
              <div class="ad-card-sub">{{ 'ADS.FARE_FROM' | translate }}</div>
              <div class="ad-card-price">EUR 241</div>
            </div>
          </article>
          <article class="ad-card">
            <div class="ad-card-img ad-img-tampa"></div>
            <div class="ad-card-body">
              <div class="ad-card-title">Tampa</div>
              <div class="ad-card-sub">{{ 'ADS.FARE_FROM' | translate }}</div>
              <div class="ad-card-price">EUR 244</div>
            </div>
          </article>
          <article class="ad-card">
            <div class="ad-card-img ad-img-miami"></div>
            <div class="ad-card-body">
              <div class="ad-card-title">Miami</div>
              <div class="ad-card-sub">{{ 'ADS.FARE_FROM' | translate }}</div>
              <div class="ad-card-price">EUR 244</div>
            </div>
          </article>
        </div>

        <div class="ad-more">
          <a href="#" class="ad-more-link">{{ 'ADS.MORE_OFFERS' | translate }}</a>
        </div>

        <div class="ad-prep-title">{{ 'ADS.PREPARE_TO_TRAVEL' | translate }}</div>
        <div class="ad-info">
          <div class="ad-info-card">
            <div class="ad-info-icon">🧾</div>
            <div class="ad-info-text">
              <div class="ad-info-title">{{ 'ADS.INFO_CHECKIN_TITLE' | translate }}</div>
              <div class="ad-info-sub">{{ 'ADS.INFO_CHECKIN_SUB' | translate }}</div>
            </div>
          </div>
          <div class="ad-info-card">
            <div class="ad-info-icon">📍</div>
            <div class="ad-info-text">
              <div class="ad-info-title">{{ 'ADS.INFO_HELP_TITLE' | translate }}</div>
              <div class="ad-info-sub">{{ 'ADS.INFO_HELP_SUB' | translate }}</div>
            </div>
          </div>
          <div class="ad-info-card">
            <div class="ad-info-icon">🛂</div>
            <div class="ad-info-text">
              <div class="ad-info-title">{{ 'ADS.INFO_REQUIREMENTS_TITLE' | translate }}</div>
              <div class="ad-info-sub">{{ 'ADS.INFO_REQUIREMENTS_SUB' | translate }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ad-shell {
        padding-left: clamp(16px, 4vw, 40px);
        padding-right: clamp(16px, 4vw, 40px);
        box-sizing: border-box;
      }

      .ad-wrap {
        display: grid;
        gap: 22px;
        padding: 16px 0 16px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      .ad-hero {
        display: grid;
        grid-template-columns: 2.1fr 1fr;
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
      }

      .ad-hero-image {
        position: relative;
        min-height: 190px;
        background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80');
        background-size: cover;
        background-position: center;
        padding: 26px;
        color: #fff;
      }

      .ad-hero-badge {
        position: absolute;
        right: 18px;
        top: 18px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }

      .ad-hero-title {
        font-size: 40px;
        font-weight: 800;
        letter-spacing: -1px;
        text-transform: lowercase;
      }

      .ad-hero-sub {
        font-size: 14px;
        font-weight: 600;
        margin-top: 8px;
      }

      .ad-hero-panel {
        background: #e40000;
        color: #fff;
        padding: 22px;
        display: grid;
        align-content: center;
        gap: 12px;
      }

      .ad-hero-panel-title {
        font-size: 22px;
        font-weight: 800;
      }

      .ad-hero-panel-copy {
        font-size: 13px;
        line-height: 1.4;
      }

      .ad-hero-cta {
        border: 0;
        background: #fff;
        color: #111;
        font-weight: 700;
        padding: 8px 14px;
        border-radius: 999px;
        width: fit-content;
        cursor: pointer;
      }

      .ad-section-title {
        text-align: center;
        font-weight: 700;
        color: #111;
      }

      .ad-section-link {
        color: #0a82b2;
        text-decoration: underline;
        cursor: pointer;
      }

      .ad-section-caret {
        color: #0a82b2;
        margin-left: 4px;
      }

      .ad-cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .ad-card {
        background: #fff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
      }

      .ad-card-img {
        height: 120px;
        background-size: cover;
        background-position: center;
      }

      .ad-img-lima {
        background-image: url('https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=900&q=80');
      }

      .ad-img-tampa {
        background-image: url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80');
      }

      .ad-img-miami {
        background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80');
      }

      .ad-card-body {
        padding: 12px 14px;
        display: grid;
        gap: 4px;
      }

      .ad-card-title {
        font-weight: 700;
      }

      .ad-card-sub {
        font-size: 12px;
        color: #6a6a6a;
      }

      .ad-card-price {
        font-weight: 700;
        text-align: right;
      }

      .ad-more {
        display: flex;
        justify-content: flex-end;
      }

      .ad-more-link {
        color: #0a82b2;
        font-size: 13px;
        text-decoration: none;
      }

      .ad-prep-title {
        text-align: center;
        font-weight: 700;
        margin-top: 6px;
      }

      .ad-info {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .ad-info-card {
        background: #fff;
        border-radius: 14px;
        padding: 14px;
        display: flex;
        gap: 12px;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
        align-items: center;
      }

      .ad-info-icon {
        font-size: 22px;
      }

      .ad-info-title {
        font-weight: 700;
      }

      .ad-info-sub {
        font-size: 12px;
        color: #6a6a6a;
      }

      @media (max-width: 960px) {
        .ad-hero {
          grid-template-columns: 1fr;
        }

        .ad-cards,
        .ad-info {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdsComponent {}
