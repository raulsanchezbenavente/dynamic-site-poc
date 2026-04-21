import { NgClass, UpperCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { BadgeComponent, ListComponent, PriceCurrencyComponent, TagConfig } from '@dcx/ui/design-system';
import { CommonTranslationKeys, Fare, FareBenefitsList, FareItemApplicability, GenerateIdPipe } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TranslationKeys } from '../../enums/translation-keys.enum';

@Component({
  selector: 'fare-options-item',
  templateUrl: './fare-options-item.component.html',
  styleUrls: ['./styles/fare-options-item.styles.scss'],
  host: {
    class: 'fare-option-item',
  },
  imports: [TranslateModule, BadgeComponent, PriceCurrencyComponent, ListComponent, NgClass, UpperCasePipe],
  standalone: true,
})
export class FareOptionsItemComponent implements OnInit {
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  @Input({ required: true }) public data!: Fare;

  public isSoldOut = false;
  public price = 0;
  public currency = 'COP';
  public recommendBadgeConfig!: TagConfig;

  public benefitsListConfig!: FareBenefitsList;
  public benefitsAriaLabel!: string;

  // Unique IDs used to reference key sections via aria-labelledby.
  // Enable a complete and accessible description for screen readers.
  public headerId: string;
  public priceId: string;
  public benefitsId: string;
  public footerId: string;

  private readonly translate = inject(TranslateService);
  private readonly generateId = inject(GenerateIdPipe);

  constructor() {
    this.headerId = this.generateId.transformWithUUID('fareHeader');
    this.priceId = this.generateId.transformWithUUID('farePrice');
    this.benefitsId = this.generateId.transformWithUUID('fareBenefits');
    this.footerId = this.generateId.transformWithUUID('fareFooter');
  }

  public ngOnInit(): void {
    this.isSoldOut = this.data.availableSeats === 0;
    this.internalInit();

    this.benefitsListConfig = this.buildBenefitsListConfig();
  }

  protected internalInit(): void {
    this.setPriceFromCharges();
    this.setRecommendTag();
  }

  private setRecommendTag(): void {
    if (this.data.isRecommended) {
      this.recommendBadgeConfig = {
        text: this.translate.instant(CommonTranslationKeys.Common_Select_RecommendedBadge_Text),
      };
    }
  }

  private setPriceFromCharges(): void {
    const charges = this.data.charges ?? [];
    this.price = charges.reduce((sum, charge) => sum + (charge.amount ?? 0), 0);
    this.currency = charges[0]?.currency ?? 'COP';
  }

  // Configure the fare benefits list to:
  // - Override the icon name for chargeable and not offered items
  // - Add a modifier CSS class to each list item for styling purposes
  private buildBenefitsListConfig(): FareBenefitsList {
    const items =
      this.data.benefitsList?.items.map((item) => {
        const iconData = this.getApplicabilityIcon(
          item.icon?.name ?? '',
          item.applicability ?? FareItemApplicability.INCLUDED
        );

        return {
          ...item,
          icon: {
            name: iconData.name,
            ariaAttributes: iconData.ariaAttributes,
          },
          cssClass: this.getApplicabilityCssClass(item.applicability),
        };
      }) ?? [];

    return {
      ...this.data.benefitsList,
      items,
      ariaAttributes: {
        ariaLabel: this.buildBenefitsAriaLabel(items),
      },
    };
  }

  private getApplicabilityCssClass(applicability?: FareItemApplicability): string {
    switch (applicability) {
      case FareItemApplicability.CHARGEABLE:
        return 'benefit--chargeable';
      case FareItemApplicability.NOT_INCLUDED:
        return 'benefit--not-offered';
      case FareItemApplicability.INCLUDED:
      default:
        return 'benefit--included';
    }
  }
  /**
   * Returns the appropriate icon name based on the benefit's applicability:
   * - 'currency' for chargeable items
   * - 'cross' for items not offered
   * - the original icon name for included or unknown applicability
   */
  private getApplicabilityIcon(
    originalIconName: string,
    applicability: FareItemApplicability
  ): {
    name: string;
    ariaAttributes: { ariaLabel: string };
  } {
    switch (applicability) {
      case FareItemApplicability.CHARGEABLE:
        return {
          name: 'currency',
          ariaAttributes: {
            ariaLabel: this.translate.instant(TranslationKeys.Fare_Chargeable_IconLabel),
          },
        };
      case FareItemApplicability.NOT_INCLUDED:
        return {
          name: 'cross',
          ariaAttributes: {
            ariaLabel: this.translate.instant(TranslationKeys.Fare_NotIncluded_IconLabel),
          },
        };
      case FareItemApplicability.INCLUDED:
      default:
        return {
          name: originalIconName,
          ariaAttributes: {
            ariaLabel: this.translate.instant(TranslationKeys.Fare_Included_IconLabel),
          },
        };
    }
  }

  /**
   * Builds an accessible string that describes all fare benefits,
   * combining the icon's aria-label (e.g., "Included", "Not offered", etc.)
   * with each item's visible content.
   * Used to provide a meaningful aria-label for screen readers.
   */
  private buildBenefitsAriaLabel(items: any[]): string {
    const labels = items
      .map((item) => {
        const iconLabel = item.icon?.ariaAttributes?.ariaLabel;
        const content = item.content;
        return iconLabel ? `${iconLabel}: ${content}` : content;
      })
      .filter(Boolean);
    return labels.length ? labels.join(', ') : '';
  }
}
