import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageNavigationService } from '@navigation';
import { TranslateModule } from '@ngx-translate/core';

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
    void this.pageNavigation.navigateByPageId('0', undefined, true);
  }
}
