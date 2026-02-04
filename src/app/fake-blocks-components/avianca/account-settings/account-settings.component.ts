import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type SettingItem = {
  title: string;
  description: string;
  cta?: string;
};

@Component({
  selector: 'account-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsComponent {
  public title = input<string>('ACCOUNT_SETTINGS.TITLE');
  public subtitle = input<string>('ACCOUNT_SETTINGS.SUBTITLE');

  public items = input<SettingItem[]>([
    {
      title: 'ACCOUNT_SETTINGS.SECURITY_TITLE',
      description: 'ACCOUNT_SETTINGS.SECURITY_DESC',
      cta: 'ACCOUNT_SETTINGS.CTA_MANAGE',
    },
    {
      title: 'ACCOUNT_SETTINGS.COMMS_TITLE',
      description: 'ACCOUNT_SETTINGS.COMMS_DESC',
      cta: 'ACCOUNT_SETTINGS.CTA_PREFERENCES',
    },
    {
      title: 'ACCOUNT_SETTINGS.PREFS_TITLE',
      description: 'ACCOUNT_SETTINGS.PREFS_DESC',
      cta: 'ACCOUNT_SETTINGS.CTA_UPDATE',
    },
  ]);

  public trackByTitle(_: number, item: SettingItem): string {
    return item.title;
  }
}
