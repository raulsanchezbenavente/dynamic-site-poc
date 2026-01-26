import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type Field = { label: string; value: string };
type Section = {
  title: string;
  editable?: boolean;
  left: Field[];
  right?: Field[];
};

@Component({
  selector: 'my-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input type="text">
    <section class="mp-wrap" role="region" [attr.aria-label]="'PROFILE.ARIA_LABEL' | translate">
      <h2 class="mp-title">{{ title() | translate }}</h2>
      <p class="mp-subtitle">{{ subtitle() | translate }}</p>

      @for (s of sections(); track trackByTitle) {
      <div class="mp-section">
        <div class="mp-section-head">
          <h3 class="mp-section-title">{{ s.title | translate }}</h3>

          <a
            *ngIf="s.editable"
            class="mp-edit"
            href="#"
            (click)="$event.preventDefault()"
          >
            <span class="mp-edit-ico" aria-hidden="true">✎</span>
            <span>{{ 'PROFILE.EDIT' | translate }}</span>
          </a>
        </div>

        <div class="mp-grid">
          <div class="mp-col">
            @for (f of s.left; track trackByField) {
            <div class="mp-field">
              <div class="mp-label">{{ f.label | translate }}</div>
              <div class="mp-value">{{ f.value | translate }}</div>
            </div>
            }
          </div>

          <div class="mp-col" *ngIf="s.right?.length">
            @for (f of s.right!; track trackByField) {
            <div class="mp-field">
              <div class="mp-label">{{ f.label | translate }}</div>
              <div class="mp-value">{{ f.value | translate }}</div>
            </div>
            }
          </div>
        </div>
      </div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; }

    .mp-wrap{
      background:#fff;
      border-radius: 16px;
      padding: 22px 22px 26px;
      box-shadow: 0 12px 26px rgba(0,0,0,.10);
      border: 1px solid #f0f0f0;
      max-width: 1100px;
    }

    .mp-title{
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 900;
      color:#111;
    }

    .mp-subtitle{
      margin: 0 0 18px;
      color:#333;
      font-size: 14px;
      line-height: 1.45;
    }

    .mp-section{
      border: 1px solid #dadada;
      border-radius: 12px;
      padding: 18px 18px 14px;
      background:#fff;
      margin-top: 16px;
    }

    .mp-section-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .mp-section-title{
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      color:#111;
    }

    .mp-edit{
      display:inline-flex;
      align-items:center;
      gap: 8px;
      font-size: 13px;
      color:#0b7285;
      text-decoration: underline;
      font-weight: 700;
      white-space: nowrap;
    }

    .mp-edit-ico{
      width: 18px;
      height: 18px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius: 6px;
      color:#0b7285;
    }

    .mp-grid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }

    .mp-field{
      padding: 10px 0;
    }

    .mp-label{
      font-size: 13px;
      color:#666;
      margin-bottom: 3px;
    }

    .mp-value{
      font-size: 15px;
      color:#111;
      font-weight: 700;
    }

    @media (max-width: 900px){
      .mp-grid{ grid-template-columns: 1fr; gap: 6px; }
      .mp-section{ padding: 16px; }
    }
  `],
})
export class AccountProfileComponent {
  title = input<string>('PROFILE.TITLE');

  subtitle = input<string>('PROFILE.SUBTITLE');

  sections = input<Section[]>([
    {
      title: 'PROFILE.SECTION_PERSONAL_INFO',
      editable: true,
      left: [
        { label: 'PROFILE.FIELD_GENDER', value: 'PROFILE.VALUE_OTHER' },
        { label: 'PROFILE.FIELD_DOB', value: '18 de diciembre de 2005' },
        { label: 'PROFILE.FIELD_ADDRESS', value: 'Cra 23 # 35' },
      ],
      right: [
        { label: 'PROFILE.FIELD_NAME_LASTNAME', value: 'Javier Martinez' },
        { label: 'PROFILE.FIELD_COUNTRY_RESIDENCE', value: 'PROFILE.VALUE_COUNTRY_CO' },
      ],
    },
    {
      title: 'PROFILE.SECTION_CONTACT_INFO',
      editable: false,
      left: [{ label: 'PROFILE.FIELD_PHONE', value: '57 123456789012345' }],
      right: [{ label: 'PROFILE.FIELD_EMAIL', value: 'usuario.valido-1@dominio.co' }],
    },
    {
      title: 'PROFILE.SECTION_EMERGENCY',
      editable: true,
      left: [{ label: 'PROFILE.FIELD_NAME', value: 'Juan Villalba' }],
      right: [{ label: 'PROFILE.FIELD_PHONE', value: '90 3102212336688' }],
    },
  ]);

  trackByTitle(_: number, s: Section) {
    return s.title;
  }

  trackByField(_: number, f: Field) {
    return `${f.label}:${f.value}`;
  }
}
