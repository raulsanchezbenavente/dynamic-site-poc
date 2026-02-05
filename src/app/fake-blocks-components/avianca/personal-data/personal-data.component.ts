import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

@Component({
  selector: 'personal-data',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);
  private translate = inject(TranslateService);

  public activeTab: 'adult' | 'holder' = 'adult';
  public adultName = '';
  public adultLastName = '';
  public adultGender = '';
  public adultNationality = '';
  public adultDay = '';
  public adultMonth = '';
  public adultYear = '';
  public holderName = '';
  public holderLastName = '';
  public holderDocType = '';
  public holderDocNumber = '';
  public holderEmail = '';
  public holderPhone = '';

  @HostListener('document:dblclick')
  public onDocumentDoubleClick(): void {
    this.fillDemoData();
  }

  public goNext(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('1-2', lang);
    this.router.navigateByUrl(path ?? `/${lang}/extras`);
  }

  public setTab(tab: 'adult' | 'holder'): void {
    this.activeTab = tab;
  }

  public fillDemoData(): void {
    this.adultName = 'Camila';
    this.adultLastName = 'López';
    this.adultGender = this.translate.instant('PERSONAL_DATA.OPTION_FEMALE');
    this.adultNationality = this.translate.instant('PERSONAL_DATA.OPTION_COUNTRY_CO');
    this.adultDay = '12';
    this.adultMonth = this.translate.instant('PERSONAL_DATA.MONTH_MAY');
    this.adultYear = '1992';
    this.holderName = 'Camila';
    this.holderLastName = 'López';
    this.holderDocType = this.translate.instant('PERSONAL_DATA.OPTION_PASSPORT');
    this.holderDocNumber = 'A12345678';
    this.holderEmail = 'camila.lopez@example.com';
    this.holderPhone = '+57 300 123 4567';
  }

  public isAdultFormValid(): boolean {
    return (
      this.hasValue(this.adultName) &&
      this.hasValue(this.adultLastName) &&
      this.hasValue(this.adultGender) &&
      this.hasValue(this.adultNationality) &&
      this.hasValue(this.adultDay) &&
      this.hasValue(this.adultMonth) &&
      this.hasValue(this.adultYear)
    );
  }

  public isHolderFormValid(): boolean {
    return (
      this.hasValue(this.holderName) &&
      this.hasValue(this.holderLastName) &&
      this.hasValue(this.holderDocType) &&
      this.hasValue(this.holderDocNumber) &&
      this.hasValue(this.holderEmail) &&
      this.hasValue(this.holderPhone)
    );
  }

  private hasValue(value: string): boolean {
    return value.trim().length > 0;
  }
}
