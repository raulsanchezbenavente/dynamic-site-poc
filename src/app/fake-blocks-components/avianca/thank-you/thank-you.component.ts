import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PageNavigationService } from '../../../services/page-navigation/page-navigation.service';

@Component({
  selector: 'thank-you',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './thank-you.component.html',
  styleUrl: './thank-you.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThankYouComponent {
  private pageNavigation = inject(PageNavigationService);

  public goHome(): void {
    void this.pageNavigation.navigateByPageId('0');
  }
}
