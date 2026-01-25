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

export type HeaderMenuItem = {
  label: string;
  checked?: boolean;
  external?: boolean;
  redirectTo?: string;
  pageId?: string;
  tabsId?: string;
  tabId?: string;
};

type Lang = { code: AppLang; label: string };

const LANGS: Lang[] = [
  { code: 'en', label: 'HEADER.EN' },
  { code: 'es', label: 'HEADER.ES' },
  { code: 'fr', label: 'HEADER.FR' },
  { code: 'pt', label: 'HEADER.PT' },
];

const DEFAULT_MENU: HeaderMenuItem[] = [
  { label: 'HEADER.MENU_HOME' },
  { label: 'HEADER.MENU_PERSONAL_DATA', checked: true, pageId: '1', tabsId: '111', tabId: '22' },
  { label: 'HEADER.MENU_MY_TRIPS', pageId: '1', tabsId: '11', tabId: '33' },
  { label: 'HEADER.MENU_MY_ELITE_STATUS', pageId: '1', tabsId: '112', tabId: '55' },
  { label: 'HEADER.MENU_BOOK_LM' },
];

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

  // language = input<string>('Español');
  market = input<string>('Colombia (COP)');

  userName = input<string>('Perico');
  userMiles = input<string>('600,700');

  langOpen = signal(false);
  langs = LANGS;
  activeLang = signal<AppLang>(this.routerHelper.language );
  activeLangLabelKey = computed(() => {
    const code = this.activeLang();
    return this.langs.find(l => l.code === code)?.label ?? 'HEADER.EN';
  });

  setLang(lang: AppLang) {
    this.activeLang.set(lang);
    this.translate.use(lang);
    this.langOpen.set(false);
    const pageId: string | undefined= this.routerHelper.getCurrentPageId();
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

  trackByLang(_: number, l: Lang) {
    return l.code;
  }

  toggleLangMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.open.set(false);
    this.langOpen.update(v => !v);
  }

  menuItems = input<HeaderMenuItem[] | null | undefined>(DEFAULT_MENU);

  open = signal(false);

  private router = inject(Router);

  // Always returns a non-empty array if nothing is provided
  items = computed(() => {
    const v = this.menuItems();
    return Array.isArray(v) && v.length ? v : DEFAULT_MENU;
  });

  // Close on outside click + ESC
  @HostListener('document:click')
  onDocumentClick() {
    this.open.set(false);
    this.langOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.open.set(false);
    this.langOpen.set(false);
  }

  toggleMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.langOpen.set(false);
    this.open.update(v => !v);
  }

  trackByLabel(_: number, item: HeaderMenuItem) {
    return item.label;
  }

  public redirectTo(item: HeaderMenuItem) {
    this.open.set(false);

    if (item.redirectTo) {
      this.router.navigateByUrl(item.redirectTo);
    }

    if (item.pageId) {
      const getCurrentPageId = this.routerHelper.getCurrentPageId();
      if (getCurrentPageId === item.pageId) {


      } else {
        const path = this.siteConfig.getPathByPageId(item.pageId, this.activeLang());
        this.router.navigateByUrl(path ?? '/');
      // Navigate by pageId and tabs
      // if
      // let path = this.siteConfig.getPathByPageId(item.pageId, this.activeLang());
      // if (item.tabsId) {
      }
    }
  }
}
