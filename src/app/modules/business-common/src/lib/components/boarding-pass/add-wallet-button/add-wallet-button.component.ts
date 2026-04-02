import { Component, computed, input, output } from '@angular/core';
import { BoardingPassFormatType } from '@dcx/ui/business-common';
import { DictionaryType } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { AddWalletButtonConfig } from './models/add-wallet-button.config';

@Component({
  selector: 'add-wallet-button',
  templateUrl: './add-wallet-button.component.html',
  styleUrls: ['./styles/add-wallet-button.styles.scss'],
  host: {
    class: 'add-wallet-button',
  },
  imports: [TranslateModule],
  standalone: true,
})
export class AddWalletButtonComponent {
  // inputs
  public config = input.required<AddWalletButtonConfig>();

  // outputs
  public buttonClicked = output<BoardingPassFormatType>();

  // Computed
  protected imgSrc = computed(() => this.assetsConfig[this.config().formatType]);

  private readonly assetsConfig: DictionaryType<string> = {
    [BoardingPassFormatType.APPLE_WALLET]: '/assets/ui_plus/imgs/boarding-pass/apple-wallet-badge.svg',
    [BoardingPassFormatType.GOOGLE_PAY]: '/assets/ui_plus/imgs/boarding-pass/google-pay-badge.svg',
  };

  public onButtonClick(): void {
    this.buttonClicked.emit(this.config().formatType);
  }
}
