import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SessionApiService, SessionData } from './services/session-api.service';

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
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss',
})
export class AccountProfileComponent {
  private readonly sessionApi = inject(SessionApiService);
  public title = input<string>('PROFILE.TITLE');

  public subtitle = input<string>('PROFILE.SUBTITLE');

  private readonly editingSections = new Set<string>();

  public readonly sections = signal<Section[]>(this.buildDefaultSections());

  constructor() {
    void this.loadSessionData();
  }

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

    if (this.isAnyEditing() && !this.isEditing(s)) {
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

  public isAnyEditing(): boolean {
    return this.editingSections.size > 0;
  }

  private async loadSessionData(): Promise<void> {
    const data = await this.sessionApi.getSessionData();
    if (data) {
      this.sections.set(this.buildSectionsFromSession(data));
    }
  }

  private buildDefaultSections(): Section[] {
    return [
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
            value: '2005-12-18',
            type: 'date',
            inputValue: '2005-12-18',
          },
          { label: 'PROFILE.FIELD_ADDRESS', value: 'Cra 23 # 35', type: 'text' },
        ],
        right: [
          { label: 'PROFILE.FIELD_NAME_LASTNAME', value: '-', type: 'text' },
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
        left: [{ label: 'PROFILE.FIELD_PHONE', value: '-', type: 'tel' }],
        right: [{ label: 'PROFILE.FIELD_EMAIL', value: '-', type: 'email' }],
      },
      {
        title: 'PROFILE.SECTION_EMERGENCY',
        editable: true,
        left: [{ label: 'PROFILE.FIELD_NAME', value: '-', type: 'text' }],
        right: [{ label: 'PROFILE.FIELD_PHONE', value: '-', type: 'tel' }],
      },
    ];
  }

  private buildSectionsFromSession(data: SessionData): Section[] {
    const fullName = this.sessionApi.formatPersonName([data.firstName, data.middleName, data.lastName]);

    const gender = this.mapGender(data.gender);
    const dob = this.normalizeIsoDate(data.dateOfBirth) || '2005-12-18';
    const countryCode = this.mapCountryCode(data.nationality);
    const countryValueKey = this.mapCountryValueKey(countryCode);

    const email = (data.communicationChannels || []).find((channel) => channel.type === 'Email')?.info || '-';
    const phoneChannel = (data.communicationChannels || []).find((channel) => channel.type === 'Phone');
    const phonePrefix = String(phoneChannel?.prefix || '').trim();
    const phoneValue = String(phoneChannel?.info || '').trim();
    const phone = phoneValue ? (phonePrefix ? `${phonePrefix} ${phoneValue}` : phoneValue) : '-';

    const emergencyContact = (data.contacts || []).find((contact) => contact.type === 'Emergency');
    const emergencyName = this.sessionApi.formatPersonName([
      emergencyContact?.name?.first,
      emergencyContact?.name?.middle,
      emergencyContact?.name?.last,
    ]);
    const emergencyPhoneChannel = (emergencyContact?.channels || []).find((channel) => channel.type === 'Phone');
    const emergencyPhonePrefix = String(emergencyPhoneChannel?.prefix || '').trim();
    const emergencyPhoneValue = String(emergencyPhoneChannel?.info || '').trim();
    const emergencyPhone = emergencyPhoneValue
      ? emergencyPhonePrefix
        ? `${emergencyPhonePrefix} ${emergencyPhoneValue}`
        : emergencyPhoneValue
      : '-';

    return [
      {
        title: 'PROFILE.SECTION_PERSONAL_INFO',
        editable: true,
        left: [
          {
            label: 'PROFILE.FIELD_GENDER',
            value: gender.valueKey,
            type: 'select',
            inputValue: gender.inputValue,
            options: [
              { label: 'PROFILE.VALUE_FEMALE', value: 'female' },
              { label: 'PROFILE.VALUE_MALE', value: 'male' },
              { label: 'PROFILE.VALUE_OTHER', value: 'other' },
            ],
          },
          {
            label: 'PROFILE.FIELD_DOB',
            value: dob,
            type: 'date',
            inputValue: dob,
          },
          { label: 'PROFILE.FIELD_ADDRESS', value: String(data.addressLine || '-'), type: 'text' },
        ],
        right: [
          { label: 'PROFILE.FIELD_NAME_LASTNAME', value: fullName || '-', type: 'text' },
          {
            label: 'PROFILE.FIELD_COUNTRY_RESIDENCE',
            value: countryValueKey,
            type: 'select',
            inputValue: countryCode,
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
        left: [{ label: 'PROFILE.FIELD_PHONE', value: phone, type: 'tel' }],
        right: [{ label: 'PROFILE.FIELD_EMAIL', value: String(email), type: 'email' }],
      },
      {
        title: 'PROFILE.SECTION_EMERGENCY',
        editable: true,
        left: [{ label: 'PROFILE.FIELD_NAME', value: emergencyName || '-', type: 'text' }],
        right: [{ label: 'PROFILE.FIELD_PHONE', value: emergencyPhone, type: 'tel' }],
      },
    ];
  }

  private normalizeIsoDate(dateValue: string | undefined): string {
    const trimmed = String(dateValue || '').trim();
    if (!trimmed) {
      return '';
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mapGender(gender: string | undefined): { valueKey: string; inputValue: string } {
    const normalized = String(gender || '')
      .trim()
      .toLowerCase();
    if (normalized === 'female') {
      return { valueKey: 'PROFILE.VALUE_FEMALE', inputValue: 'female' };
    }

    if (normalized === 'male') {
      return { valueKey: 'PROFILE.VALUE_MALE', inputValue: 'male' };
    }

    return { valueKey: 'PROFILE.VALUE_OTHER', inputValue: 'other' };
  }

  private mapCountryCode(nationality: string | undefined): 'co' | 'us' | 'es' {
    const normalized = String(nationality || '')
      .trim()
      .toUpperCase();
    if (normalized === 'US') {
      return 'us';
    }

    if (normalized === 'ES') {
      return 'es';
    }

    return 'co';
  }

  private mapCountryValueKey(countryCode: 'co' | 'us' | 'es'): string {
    if (countryCode === 'us') {
      return 'PROFILE.VALUE_COUNTRY_US';
    }

    if (countryCode === 'es') {
      return 'PROFILE.VALUE_COUNTRY_ES';
    }

    return 'PROFILE.VALUE_COUNTRY_CO';
  }
}
