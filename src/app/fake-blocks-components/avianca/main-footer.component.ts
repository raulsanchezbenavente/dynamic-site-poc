import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

@Component({
  selector: 'main-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="ft-wrap"
      role="contentinfo">
      <div class="ft-inner">
        <div class="ft-top">
          <div
            class="ft-brand"
            aria-label="Avianca">
            <span class="ft-logo">avianca</span>
            <svg
              class="ft-mark"
              viewBox="0 0 64 32"
              aria-hidden="true">
              <path
                d="M4 22c10-10 22-14 34-10 6 2 13 6 22 12-14-2-24 0-30 3-8 4-14 3-26-5z"
                fill="currentColor" />
            </svg>
          </div>

          <div class="ft-follow">
            <div class="ft-follow-title">{{ followTitle() | translate }}</div>
            <div
              class="ft-social"
              aria-label="Social links">
              <a
                class="ft-social-btn"
                href="#"
                aria-label="X"
                (click)="$event.preventDefault()"
                >x</a
              >
              <a
                class="ft-social-btn"
                href="#"
                aria-label="Facebook"
                (click)="$event.preventDefault()"
                >f</a
              >
              <a
                class="ft-social-btn"
                href="#"
                aria-label="Instagram"
                (click)="$event.preventDefault()"
                >⌁</a
              >
              <a
                class="ft-social-btn"
                href="#"
                aria-label="LinkedIn"
                (click)="$event.preventDefault()"
                >in</a
              >
            </div>
          </div>
        </div>

        <div class="ft-grid">
          @for (col of columns(); track trackByTitle) {
            <div class="ft-col">
              <h3 class="ft-col-title">{{ col.title | translate }}</h3>

              @for (link of col.links; track trackByLink) {
                <a
                  class="ft-link"
                  [href]="link.href || '#'"
                  (click)="$event.preventDefault()">
                  <span class="ft-link-text">{{ link.label | translate }}</span>

                  <span
                    class="ft-ext"
                    *ngIf="link.external"
                    aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M14 3h7v7"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path
                        d="M21 3l-9 9"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                      <path
                        d="M10 7H7a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </span>
                </a>
              }
            </div>
          }
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ft-wrap {
        background: #171717;
        color: #fff;
        padding: 34px 0 42px;
        margin-top: 22px;
      }

      .ft-inner {
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 18px;
      }

      .ft-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 26px;
      }

      /* Brand */
      .ft-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;
        font-weight: 900;
        user-select: none;
      }
      .ft-logo {
        font-size: 42px;
        letter-spacing: -0.4px;
        text-transform: lowercase;
        line-height: 1;
      }
      .ft-mark {
        width: 52px;
        height: 28px;
        opacity: 0.95;
        transform: translateY(2px);
      }

      /* Follow */
      .ft-follow {
        text-align: right;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
        white-space: nowrap;
      }
      .ft-follow-title {
        font-weight: 900;
        font-size: 16px;
      }
      .ft-social {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .ft-social-btn {
        width: 26px;
        height: 26px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        color: #111;
        text-decoration: none;
        font-weight: 900;
        font-size: 13px;
        line-height: 1;
        opacity: 0.95;
      }
      .ft-social-btn:hover {
        opacity: 1;
        transform: translateY(-1px);
      }

      /* Columns */
      .ft-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 22px;
      }

      .ft-col-title {
        margin: 0 0 14px;
        font-weight: 900;
        font-size: 16px;
      }

      .ft-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        opacity: 0.92;
      }
      .ft-link:hover {
        opacity: 1;
        text-decoration: underline;
      }

      .ft-link-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ft-ext {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        opacity: 0.9;
        flex: 0 0 auto;
      }
      .ft-ext svg {
        width: 14px;
        height: 14px;
      }

      @media (max-width: 1050px) {
        .ft-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 650px) {
        .ft-top {
          flex-direction: column;
          align-items: flex-start;
        }
        .ft-follow {
          align-items: flex-start;
          text-align: left;
        }
        .ft-grid {
          grid-template-columns: 1fr;
        }
        .ft-logo {
          font-size: 36px;
        }
      }
    `,
  ],
})
export class MainFooterComponent {
  public followTitle = input<string>('FOOTER.FOLLOW_US');

  public columns = input<FooterColumn[]>([
    {
      title: 'FOOTER.DISCOVER_BUY',
      links: [
        { label: 'FOOTER.CHEAP_FLIGHTS' },
        { label: 'FOOTER.HOTEL_BOOKINGS', external: true },
        { label: 'FOOTER.CAR_RENTAL', external: true },
      ],
    },
    {
      title: 'FOOTER.ABOUT_US',
      links: [
        { label: 'FOOTER.WE_ARE_AVIANCA' },
        { label: 'FOOTER.CAREERS', external: true },
        { label: 'FOOTER.CORP_NEWS' },
      ],
    },
    {
      title: 'FOOTER.PORTALS',
      links: [
        { label: 'FOOTER.LIFEMILES_PROGRAM', external: true },
        { label: 'FOOTER.AVIANCA_BUSINESS', external: true },
        { label: 'FOOTER.AVIANCA_DIRECT' },
      ],
    },
    {
      title: 'FOOTER.QUICK_LINKS',
      links: [
        { label: 'FOOTER.LEGAL_INFO' },
        { label: 'FOOTER.PRIVACY_POLICY' },
        { label: 'FOOTER.CARRIAGE_CONTRACT' },
      ],
    },
  ]);

  public trackByTitle(_: number, col: FooterColumn): string {
    return col.title;
  }

  public trackByLink(_: number, link: FooterLink): string {
    return link.label;
  }
}
