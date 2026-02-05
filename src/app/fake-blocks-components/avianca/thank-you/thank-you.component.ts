import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

@Component({
  selector: 'thank-you',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './thank-you.component.html',
  styleUrl: './thank-you.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThankYouComponent {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);

  public goHome(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('0', lang);
    this.router.navigateByUrl(path ?? `/${lang}/home`);
  }
}
