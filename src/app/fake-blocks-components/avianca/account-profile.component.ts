import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type Field = {
  label: string;
  value: string;
  type?: 'text' | 'select' | 'date' | 'email' | 'tel';
  inputValue?: string;
  options?: Array<{ label: string; value: string }>;
};
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
    <section
      class="mp-wrap"
      role="region"
      [attr.aria-label]="'PROFILE.ARIA_LABEL' | translate">
      <h2 class="mp-title">{{ title() | translate }}</h2>
      <p class="mp-subtitle">{{ subtitle() | translate }}</p>

      @for (s of sections(); track trackByTitle($index, s)) {
        <div class="mp-section">
          <div class="mp-section-head">
            <h3 class="mp-section-title">{{ s.title | translate }}</h3>

            @if (s.editable) {
              @if (!isEditing(s)) {
                <button
                  type="button"
                  class="mp-edit"
                  (click)="startEdit(s)">
                  <span class="mp-edit-label">✎&nbsp;{{ 'PROFILE.EDIT' | translate }}</span>
                </button>
              }
            }
          </div>

          <div class="mp-grid">
            <div class="mp-col">
              @for (f of s.left; track trackByField($index, f)) {
                <div class="mp-field">
                  <div class="mp-label">{{ f.label | translate }}</div>
                  @if (isEditing(s)) {
                    <div class="mp-control">
                      @if (f.type === 'select') {
                        <select
                          class="mp-input"
                          [value]="f.inputValue">
                          @for (o of f.options ?? []; track o.value) {
                            <option [value]="o.value">{{ o.label | translate }}</option>
                          }
                        </select>
                      } @else if (f.type === 'date') {
                        <input
                          class="mp-input"
                          type="date"
                          [value]="f.inputValue ?? ''" />
                      } @else if (f.type === 'email') {
                        <input
                          class="mp-input"
                          type="email"
                          [value]="f.inputValue ?? f.value" />
                      } @else if (f.type === 'tel') {
                        <input
                          class="mp-input"
                          type="tel"
                          [value]="f.inputValue ?? f.value" />
                      } @else {
                        <input
                          class="mp-input"
                          type="text"
                          [value]="f.inputValue ?? f.value" />
                      }
                    </div>
                  } @else {
                    <div class="mp-value">{{ f.value | translate }}</div>
                  }
                </div>
              }
            </div>

            @if (s.right?.length) {
              <div class="mp-col">
                @for (f of s.right!; track trackByField($index, f)) {
                  <div class="mp-field">
                    <div class="mp-label">{{ f.label | translate }}</div>
                    @if (isEditing(s)) {
                      <div class="mp-control">
                        @if (f.type === 'select') {
                          <select
                            class="mp-input"
                            [value]="f.inputValue">
                            @for (o of f.options ?? []; track o.value) {
                              <option [value]="o.value">{{ o.label | translate }}</option>
                            }
                          </select>
                        } @else if (f.type === 'date') {
                          <input
                            class="mp-input"
                            type="date"
                            [value]="f.inputValue ?? ''" />
                        } @else if (f.type === 'email') {
                          <input
                            class="mp-input"
                            type="email"
                            [value]="f.inputValue ?? f.value" />
                        } @else if (f.type === 'tel') {
                          <input
                            class="mp-input"
                            type="tel"
                            [value]="f.inputValue ?? f.value" />
                        } @else {
                          <input
                            class="mp-input"
                            type="text"
                            [value]="f.inputValue ?? f.value" />
                        }
                      </div>
                    } @else {
                      <div class="mp-value">{{ f.value | translate }}</div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          @if (s.editable && isEditing(s)) {
            <div class="mp-actions">
              <button
                type="button"
                class="mp-action mp-action--primary"
                (click)="saveSection(s)">
                {{ 'PROFILE.SAVE' | translate }}
              </button>
              <button
                type="button"
                class="mp-action mp-action--ghost"
                (click)="cancelSection(s)">
                {{ 'PROFILE.CANCEL' | translate }}
              </button>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mp-wrap {
        background: #fff;
        border-radius: 16px;
        padding: 22px 22px 26px;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.1);
        border: 1px solid #f0f0f0;
        max-width: 1100px;
      }

      .mp-title {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 900;
        color: #111;
      }

      .mp-subtitle {
        margin: 0 0 18px;
        color: #333;
        font-size: 14px;
        line-height: 1.45;
      }

      .mp-section {
        border: 1px solid #dadada;
        border-radius: 12px;
        padding: 18px 18px 14px;
        background: #fff;
        margin-top: 16px;
      }

      .mp-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .mp-section-title {
        margin: 0;
        font-size: 16px;
        font-weight: 900;
        color: #111;
      }

      .mp-edit {
        display: inline-flex;
        align-items: center;
        gap: 0;
        font-size: 13px;
        color: #0b7285;
        text-decoration: none;
        font-weight: 700;
        white-space: nowrap;
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
      }

      .mp-edit:hover {
        text-decoration: underline;
      }

      .mp-edit-label {
        display: inline-flex;
        align-items: center;
      }

      .mp-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
      }

      .mp-action {
        border-radius: 999px;
        font-size: 15px;
        font-weight: 700;
        padding: 10px 20px;
        cursor: pointer;
        border: 1px solid transparent;
        background: #111;
        color: #fff;
      }

      .mp-action--primary {
        background: #111;
        color: #fff;
        border-color: #111;
      }

      .mp-action--ghost {
        background: transparent;
        color: #111;
        border-color: #111;
      }

      .mp-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
      }

      .mp-field {
        padding: 10px 0;
      }

      .mp-label {
        font-size: 13px;
        color: #666;
        margin-bottom: 3px;
      }

      .mp-value {
        font-size: 15px;
        color: #111;
        font-weight: 700;
      }

      .mp-control {
        padding-top: 2px;
      }

      .mp-input {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        border: 1px solid #d7d7d7;
        font-size: 14px;
        color: #111;
        background: #fff;
      }

      .mp-input:focus {
        outline: none;
        border-color: #0b7285;
        box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.14);
      }

      @media (max-width: 900px) {
        .mp-grid {
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .mp-section {
          padding: 16px;
        }
      }
    `,
  ],
})
export class AccountProfileComponent {
  public title = input<string>('PROFILE.TITLE');

  public subtitle = input<string>('PROFILE.SUBTITLE');

  private readonly editingSections = new Set<string>();

  public sections = input<Section[]>([
    {
      title: 'PROFILE.SECTION_PERSONAL_INFO',
      editable: true,
      left: [
        {
          label: 'PROFILE.FIELD_GENDER',
          value: 'PROFILE.VALUE_OTHER',
          type: 'select',
          inputValue: 'other',
          options: [
            { label: 'PROFILE.VALUE_FEMALE', value: 'female' },
            { label: 'PROFILE.VALUE_MALE', value: 'male' },
            { label: 'PROFILE.VALUE_OTHER', value: 'other' },
          ],
        },
        {
          label: 'PROFILE.FIELD_DOB',
          value: '18 de diciembre de 2005',
          type: 'date',
          inputValue: '2005-12-18',
        },
        { label: 'PROFILE.FIELD_ADDRESS', value: 'Cra 23 # 35', type: 'text' },
      ],
      right: [
        { label: 'PROFILE.FIELD_NAME_LASTNAME', value: 'Perico Martinez', type: 'text' },
        {
          label: 'PROFILE.FIELD_COUNTRY_RESIDENCE',
          value: 'PROFILE.VALUE_COUNTRY_CO',
          type: 'select',
          inputValue: 'co',
          options: [
            { label: 'PROFILE.VALUE_COUNTRY_CO', value: 'co' },
            { label: 'PROFILE.VALUE_COUNTRY_US', value: 'us' },
            { label: 'PROFILE.VALUE_COUNTRY_ES', value: 'es' },
          ],
        },
      ],
    },
    {
      title: 'PROFILE.SECTION_CONTACT_INFO',
      editable: true,
      left: [{ label: 'PROFILE.FIELD_PHONE', value: '57 123456789012345', type: 'tel' }],
      right: [{ label: 'PROFILE.FIELD_EMAIL', value: 'usuario.valido-1@dominio.co', type: 'email' }],
    },
    {
      title: 'PROFILE.SECTION_EMERGENCY',
      editable: true,
      left: [{ label: 'PROFILE.FIELD_NAME', value: 'Juan Villalba', type: 'text' }],
      right: [{ label: 'PROFILE.FIELD_PHONE', value: '90 3102212336688', type: 'tel' }],
    },
  ]);

  public trackByTitle(_: number, s: Section): string {
    return s.title;
  }

  public trackByField(_: number, f: Field): string {
    return `${f.label}:${f.value}`;
  }

  public startEdit(s: Section): void {
    if (!s.editable) {
      return;
    }

    this.editingSections.add(s.title);
  }

  public saveSection(s: Section): void {
    if (!s.editable) {
      return;
    }

    this.editingSections.delete(s.title);
  }

  public cancelSection(s: Section): void {
    if (!s.editable) {
      return;
    }

    this.editingSections.delete(s.title);
  }

  public isEditing(s: Section): boolean {
    return this.editingSections.has(s.title);
  }
}
