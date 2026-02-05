import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

@Component({
  selector: 'personal-data',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);

  public activeTab: 'adult' | 'holder' = 'adult';

  public goNext(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('2', lang);
    this.router.navigateByUrl(path ?? `/${lang}/members`);
  }

  public setTab(tab: 'adult' | 'holder'): void {
    this.activeTab = tab;
  }
}
