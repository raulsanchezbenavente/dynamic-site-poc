import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'loyalty-overview-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="lm-wrap" role="region" aria-label="Account summary">
      <header class="lm-header">
        <div class="lm-title">
          <span class="lm-hello">Hello,</span>
          <span class="lm-name">{{ name() }}</span>
        </div>

        <div class="lm-brand" aria-label="LifeMiles">
          <span class="lm-brand-mark">lm</span>
          <span class="lm-brand-text">LifeMiles</span>
        </div>
      </header>

      <div class="lm-card">
        <div class="lm-cell lm-cell--main">
          <div class="lm-label">Lifemiles number</div>
          <div class="lm-value-row">
            <div class="lm-value">{{ memberNumber() }}</div>

            <button
              type="button"
              class="lm-copy"
              (click)="copy(memberNumber())"
              aria-label="Copy Lifemiles number"
              title="Copy"
            >
              ⧉
            </button>
          </div>
        </div>

        <div class="lm-divider" aria-hidden="true"></div>

        <div class="lm-cell">
          <div class="lm-label">Total miles</div>
          <div class="lm-value-row">
            <span class="lm-badge" aria-hidden="true">lm</span>
            <div class="lm-value">{{ totalMiles() }}</div>
          </div>
        </div>

        <div class="lm-divider" aria-hidden="true"></div>

        <div class="lm-cell">
          <div class="lm-label">Expiration date</div>
          <div class="lm-subvalue">{{ expirationDate() }}</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .lm-wrap{
      border-radius: 16px;
      padding: 22px 26px 26px;
      color: #fff;
      background: linear-gradient(180deg, #b50080, red);
      box-shadow: 0 12px 30px rgba(0,0,0,.12);
      max-width: 1100px;
      margin-left: auto;
      margin-right: auto;
    }

    .lm-header{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .lm-title{
      font-size: 34px;
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: -0.3px;
      display:flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: baseline;
    }

    .lm-locale{
      opacity: .95;
      font-weight: 900;
    }
    .lm-hello{ opacity: .95; font-weight: 800; }
    .lm-name{ font-weight: 900; }

    .lm-brand{
      display:flex;
      align-items:center;
      gap:10px;
      padding-top: 6px;
      font-weight: 800;
      white-space: nowrap;
      user-select:none;
    }
    .lm-brand-mark{
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.22);
      font-weight: 900;
      text-transform: lowercase;
    }
    .lm-brand-text{
      font-size: 28px;
      letter-spacing: -0.2px;
    }

    .lm-card{
      background:#fff;
      color:#111;
      border-radius: 14px;
      padding: 18px 20px;
      display:grid;
      grid-template-columns: 1.6fr 1px 1fr 1px 1fr;
      align-items:center;
      gap: 14px;
      box-shadow: 0 10px 22px rgba(0,0,0,.12);
    }

    .lm-divider{
      width:1px;
      height: 56px;
      background: #e7e7e7;
      justify-self: stretch;
    }

    .lm-cell{ min-width: 0; }
    .lm-cell--main{ padding-right: 6px; }

    .lm-label{
      font-size: 14px;
      color:#5d5d5d;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lm-value-row{
      display:flex;
      align-items:center;
      gap: 10px;
      min-width: 0;
    }

    .lm-value{
      font-size: 30px;
      font-weight: 900;
      letter-spacing: .2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lm-subvalue{
      font-size: 16px;
      font-weight: 600;
      color:#222;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lm-badge{
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      background: #ff004f;
      color:#fff;
      font-weight: 900;
      font-size: 12px;
      text-transform: lowercase;
      flex: 0 0 auto;
    }

    .lm-copy{
      margin-left: 2px;
      border: 0;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      color: #0a6a78;
      padding: 6px 8px;
      border-radius: 8px;
    }
    .lm-copy:hover{
      background:#f2f2f2;
    }

    /* Responsive */
    @media (max-width: 900px){
      .lm-title{ font-size: 28px; }
      .lm-brand-text{ font-size: 22px; }
      .lm-card{
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .lm-divider{ display:none; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyOverviewCardComponent {
  name = input<string>('Javier');

  memberNumber = input<string>('13440242314');
  totalMiles = input<string>('600,700');
  expirationDate = input<string>('31 de mayo de 2026');

  async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Silencioso; si quieres, aquí puedes emitir un toast/evento
    }
  }
}
