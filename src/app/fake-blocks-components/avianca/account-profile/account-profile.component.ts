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
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss',
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
