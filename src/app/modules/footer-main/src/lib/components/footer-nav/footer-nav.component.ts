import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AccessibleLinkDirective, collapseAnimationV2, LinkTarget } from '@dcx/ui/libs';

import { FooterNav } from '../../models/footer-nav.model';

@Component({
  selector: 'footer-nav',
  templateUrl: './footer-nav.component.html',
  styleUrls: ['./styles/footer-nav.styles.scss'],
  animations: [collapseAnimationV2],
  imports: [AccessibleLinkDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterNavComponent {
  public data = input.required<FooterNav>();
  public index = input.required<number>();
  public isResponsive = input<boolean>(false);
  public selectedMenu = input<string>('');

  public menuToggleEmitter = output<string>();

  public readonly linkTarget = LinkTarget;

  public navMenuId = computed(() => `footerNavMenuId-${this.index()}`);
  public navTitleId = computed(() => `footerNavTitleId_${this.navMenuId()}`);

  public isCollapsed = computed(() => {
    if (!this.isResponsive()) {
      return false;
    }
    return this.selectedMenu() !== this.navMenuId();
  });

  public collapseNav(): void {
    if (this.isResponsive()) {
      this.menuToggleEmitter.emit(this.navMenuId());
    }
  }
}
