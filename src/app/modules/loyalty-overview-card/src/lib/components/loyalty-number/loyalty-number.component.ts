import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { IconButtonComponent, IconButtonConfig } from '@dcx/ui/design-system';
import { ClipboardCopyHelperService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LoyaltyOverviewCardTranslationKeys } from '../../enums/loyalty-overview-card-translation-keys.enum';

@Component({
  selector: 'loyalty-overview-card-loyalty-number',
  templateUrl: './loyalty-number.component.html',
  styleUrls: ['./styles/loyalty-number.styles.scss'],
  imports: [TranslateModule, IconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardLoyaltyNumberComponent {
  public loyaltyId = input.required<string>();
  public copied = signal(false);

  private readonly translateService = inject(TranslateService);
  private readonly clipboard = inject(ClipboardCopyHelperService);

  public readonly translateKeys = LoyaltyOverviewCardTranslationKeys;

  public copyIconButtonConfig = computed<IconButtonConfig>(() => {
    const copied = this.copied();
    return {
      ariaAttributes: {
        ariaLabel: this.translateService.instant(
          copied
            ? LoyaltyOverviewCardTranslationKeys.OverviewCard_CopyLoyaltyNumberSuccess
            : LoyaltyOverviewCardTranslationKeys.OverviewCard_CopyLoyaltyNumber
        ),
      },
      icon: {
        name: copied ? 'check' : 'copy',
      },
    };
  });

  public copyToClipboard(): void {
    this.clipboard.copy(this.loyaltyId());
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 3000);
  }
}
