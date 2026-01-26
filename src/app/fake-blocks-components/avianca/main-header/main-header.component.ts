import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  computed,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SiteConfigService } from '../../../services/site-config/site-config.service';
import { Location } from '@angular/common';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { DEFAULT_MENU, LANGS } from './translations/main-header.constants';
import { HeaderMenuItem, Lang } from './models/main-header.models';

@Component({
  selector: 'main-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  private readonly siteConfig = inject(SiteConfigService);
  private readonly location = inject(Location);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly translate = inject(TranslateService);

  public market = input<string>('Colombia (COP)');
  public userName = input<string>('Perico');
  public userMiles = input<string>('600,700');

  public langOpen = signal(false);
  public langs = LANGS;
  public activeLang = signal<AppLang>(this.routerHelper.language);
  public activeLangLabelKey = computed(() => {
    const code = this.activeLang();
    return this.langs.find((l) => l.code === code)?.label ?? 'HEADER.EN';
  });

  public setLang(lang: AppLang): void {
    this.activeLang.set(lang);
    this.translate.use(lang);
    this.langOpen.set(false);
    const pageId: string | undefined = this.routerHelper.getCurrentPageId();
    if (pageId) {
      const nextPath: string | undefined = this.siteConfig.getPathByPageId(pageId, lang);
      console.log(pageId, nextPath);
      if (nextPath) {
        const query = this.router.url.split('?')[1];
        this.location.replaceState(query ? `${nextPath}?${query}` : nextPath);
        this.routerHelper.changeLanguage(lang);
      }
    }
  }

  public trackByLang(_: number, l: Lang): AppLang {
    return l.code;
  }

  public toggleLangMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.open.set(false);
    this.langOpen.update((v) => !v);
  }

  public menuItems = input<HeaderMenuItem[] | null | undefined>(DEFAULT_MENU);

  public open = signal(false);

  private router = inject(Router);

  // Always returns a non-empty array if nothing is provided
  public items = computed(() => {
    const v = this.menuItems();
    return Array.isArray(v) && v.length ? v : DEFAULT_MENU;
  });

  // Close on outside click + ESC
  @HostListener('document:click')
  public onDocumentClick(): void {
    this.open.set(false);
    this.langOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  public onEsc(): void {
    this.open.set(false);
    this.langOpen.set(false);
  }

  public toggleMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.langOpen.set(false);
    this.open.update(v => !v);
  }

  public trackByLabel(_: number, item: HeaderMenuItem): string {
    return item.label;
  }

  public redirectTo(item: HeaderMenuItem): void {
    this.open.set(false);

    if (item.redirectTo) {
      this.router.navigateByUrl(item.redirectTo);
    }

    if (item.pageId) {
      const currentPageId: string | undefined = this.routerHelper.getCurrentPageId();
      console.log('Current pageId:', currentPageId, 'Target pageId:', item.pageId);
      console.log(currentPageId === item.pageId)
      if (currentPageId === item.pageId) {
        console.log('Same page, do nothing');
        this.routerHelper.changeActiveTab(item.tabId ?? '');
      } else {
        const path = this.siteConfig.getPathByPageId(item.pageId, this.activeLang());
        this.router.navigateByUrl(path ?? '/');
      }
    }
  }
}
