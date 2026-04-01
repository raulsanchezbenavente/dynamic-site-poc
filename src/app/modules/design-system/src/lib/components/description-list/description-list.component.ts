import { NgClass } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SessionStore } from '@dcx/ui/libs';

import { DateDisplayComponent } from '../date-display/date-display.component';
import { IconComponent } from '../icon/icon.component';
import { PriceCurrencyComponent } from '../price-currency/price-currency.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

import { DescriptionListLayoutType } from './enums/description-list-layout-type.enum';
import { DescriptionListOptionType } from './enums/description-list-option-type.enum';
import { DescriptionListDateData } from './models/description-list-date-data.model';
import { DescriptionList } from './models/description-list.config';

@Component({
  selector: 'description-list',
  templateUrl: './description-list.component.html',
  styleUrls: ['./styles/description-list.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [NgClass, IconComponent, PriceCurrencyComponent, DateDisplayComponent, TooltipComponent],
  standalone: true,
})
export class DescriptionListComponent implements OnInit {
  @Input({ required: true }) public config!: DescriptionList;

  public culture: string;
  public descriptionListOptionType = DescriptionListOptionType;
  public shortDateFormat: string = 'EEE. d MMM. y';

  constructor(protected sessionStore: SessionStore) {
    const sessionStorage = this.sessionStore.getSession();
    this.culture = sessionStorage.session.culture;
  }

  public ngOnInit(): void {
    this.setDateFormat();
    this.setLayout();
  }

  protected setDateFormat(): void {
    const dateOption = this.config.options.find((opt) => opt.type === this.descriptionListOptionType.DATE);
    if (!dateOption) return;

    const descriptionListDateData = dateOption.description as DescriptionListDateData;
    const full = (descriptionListDateData.date as any)?.fullFormat as string | undefined;

    this.shortDateFormat = full ?? this.shortDateFormat;
  }

  protected setLayout(): void {
    this.config.layout ??= DescriptionListLayoutType.DEFAULT;
  }
}
