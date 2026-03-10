import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PageNavigationService } from '../../../services/page-navigation/page-navigation.service';

@Component({
  selector: 'personal-data',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent {
  private pageNavigation = inject(PageNavigationService);
  private translate = inject(TranslateService);
  private lastTap = 0;

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

  @HostListener('document:touchend', ['$event'])
  public onDocumentTouchEnd(event: TouchEvent): void {
    const now = Date.now();
    if (now - this.lastTap < 300) {
      event.preventDefault();
      this.fillDemoData();
    }
    this.lastTap = now;
  }

  public goNext(): void {
    void this.pageNavigation.navigateByPageId('1-2');
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
