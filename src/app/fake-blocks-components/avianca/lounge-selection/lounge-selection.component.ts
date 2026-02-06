import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'lounge-selection',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './lounge-selection.component.html',
  styleUrl: './lounge-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoungeSelectionComponent {
  @Output() public close = new EventEmitter<void>();

  public tabs = [
    {
      id: 'mad',
      labelKey: 'LOUNGE.TABS.MADRID',
      flightTextKey: 'LOUNGE.FLIGHTS.MAD',
      price: '€ 39,02',
      benefitsKeys: [
        'LOUNGE.BENEFITS.WIFI',
        'LOUNGE.BENEFITS.COFFEE',
        'LOUNGE.BENEFITS.SNACKS',
        'LOUNGE.BENEFITS.WORK',
      ],
      schedule: [
        { titleKey: 'LOUNGE.SCHEDULE.CO_TITLE', hoursKey: 'LOUNGE.SCHEDULE.CO_HOURS' },
        { titleKey: 'LOUNGE.SCHEDULE.INTL_TITLE', hoursKey: 'LOUNGE.SCHEDULE.INTL_HOURS' },
      ],
      noteKey: 'LOUNGE.NOTES.NO_REFUND',
      linkTextKey: 'LOUNGE.INFO_LINK_TEXT',
      linkHref: 'https://www.avianca.com',
    },
    {
      id: 'bog',
      labelKey: 'LOUNGE.TABS.BOGOTA',
      flightTextKey: 'LOUNGE.FLIGHTS.BOG_1',
      price: '€ 39,02',
      benefitsKeys: [
        'LOUNGE.BENEFITS.WIFI',
        'LOUNGE.BENEFITS.COFFEE',
        'LOUNGE.BENEFITS.SNACKS',
        'LOUNGE.BENEFITS.WORK',
      ],
      schedule: [
        { titleKey: 'LOUNGE.SCHEDULE.CO_TITLE', hoursKey: 'LOUNGE.SCHEDULE.CO_HOURS' },
        { titleKey: 'LOUNGE.SCHEDULE.INTL_TITLE', hoursKey: 'LOUNGE.SCHEDULE.INTL_HOURS' },
      ],
      noteKey: 'LOUNGE.NOTES.NO_REFUND',
      linkTextKey: 'LOUNGE.INFO_LINK_TEXT',
      linkHref: 'https://www.avianca.com',
    },
    {
      id: 'aua',
      labelKey: 'LOUNGE.TABS.ARUBA',
      flightTextKey: 'LOUNGE.FLIGHTS.ARU',
      price: '€ 31,57',
      benefitsKeys: [
        'LOUNGE.BENEFITS.WIFI_PREMIUM',
        'LOUNGE.BENEFITS.PREMIUM_SNACKS',
        'LOUNGE.BENEFITS.REST',
        'LOUNGE.BENEFITS.PRIVATE_WORK',
      ],
      schedule: [
        { titleKey: 'LOUNGE.SCHEDULE.INTL_TITLE', hoursKey: 'LOUNGE.SCHEDULE.INTL_ALT_HOURS' },
      ],
      noteKey: 'LOUNGE.NOTES.SEASONAL',
      linkTextKey: 'LOUNGE.INFO_LINK_TEXT',
      linkHref: 'https://www.avianca.com',
    },
    {
      id: 'bog-2',
      labelKey: 'LOUNGE.TABS.BOGOTA',
      flightTextKey: 'LOUNGE.FLIGHTS.BOG_2',
      price: '€ 39,02',
      benefitsKeys: [
        'LOUNGE.BENEFITS.WIFI',
        'LOUNGE.BENEFITS.COFFEE',
        'LOUNGE.BENEFITS.SNACKS',
        'LOUNGE.BENEFITS.WORK',
      ],
      schedule: [
        { titleKey: 'LOUNGE.SCHEDULE.CO_TITLE', hoursKey: 'LOUNGE.SCHEDULE.CO_HOURS' },
        { titleKey: 'LOUNGE.SCHEDULE.INTL_TITLE', hoursKey: 'LOUNGE.SCHEDULE.INTL_HOURS' },
      ],
      noteKey: 'LOUNGE.NOTES.NO_REFUND',
      linkTextKey: 'LOUNGE.INFO_LINK_TEXT',
      linkHref: 'https://www.avianca.com',
    },
  ];
  public activeTabId = this.tabs[0].id;

  public passengers = [
    { id: 'all', labelKey: 'LOUNGE.PASSENGERS.ALL', checked: false },
    { id: 'p1', labelKey: 'LOUNGE.PASSENGERS.P1', checked: false },
  ];

  public setTab(tabId: string): void {
    this.activeTabId = tabId;
  }

  public get activeTab(): (typeof this.tabs)[number] {
    return this.tabs.find((t) => t.id === this.activeTabId) ?? this.tabs[0];
  }

  public togglePassenger(id: string): void {
    const passenger = this.passengers.find((p) => p.id === id);
    if (passenger) {
      passenger.checked = !passenger.checked;
    }
  }
}
