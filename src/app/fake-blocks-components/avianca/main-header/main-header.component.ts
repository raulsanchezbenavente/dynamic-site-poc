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
};

type Lang = { code: AppLang; label: string };

const LANGS: Lang[] = [
  { code: 'en', label: 'HEADER.EN' },
  { code: 'es', label: 'HEADER.ES' },
  { code: 'fr', label: 'HEADER.FR' },
  { code: 'pt', label: 'HEADER.PT' },
];

const DEFAULT_MENU: HeaderMenuItem[] = [
  { label: 'Home', redirectTo: '/home' },
  { label: 'Personal Data', checked: true, redirectTo: '/en/avianca-home?activeTab=Personal%20Data' },
  { label: 'My trips', redirectTo: '/en/avianca-home?activeTab=My%20Trips' },
  { label: 'My elite status', redirectTo: '/en/avianca-home?activeTab=Elite%20status' },
  { label: 'Book a flight with LM' },
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

  language = input<string>('Español');
  market = input<string>('Colombia (COP)');

  userName = input<string>('Jose');
  userMiles = input<string>('600,700');
  private translate = inject(TranslateService);

  langOpen = signal(false);
  langs = LANGS;
  activeLang = signal<AppLang>('en');
  activeLangLabel = computed(() => {
    const code = this.activeLang();
    const key = this.langs.find(l => l.code === code)?.label ?? 'HEADER.EN';
    return this.translate.instant(key);
  });

  setLang(lang: AppLang) {
    this.activeLang.set(lang);
    this.translate.use(lang);
    this.langOpen.set(false);
    this.location.replaceState(this.buildLangUrl(lang));
    console.log(this.siteConfig.getPagesByLang(lang));
    this.routerHelper.changeLanguage(lang);

  }

  private buildLangUrl(lang: AppLang): string {
    const [path, query] = this.router.url.split('?');
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = lang;
    } else {
      const fallbackPath = this.siteConfig.getPagesByLang(lang)[0]?.path ?? 'home';
      segments.push(lang, fallbackPath);
    }
    const newPath = `/${segments.join('/')}`;
    return query ? `${newPath}?${query}` : newPath;
  }

  trackByLang(_: number, l: Lang) {
    return l.code;
  }

  toggleLangMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.open.set(false);
    this.langOpen.update(v => !v);
  }

  // ✅ Items por defecto hardcoded pero overrideable desde JSON/inputs
  menuItems = input<HeaderMenuItem[] | null | undefined>(DEFAULT_MENU);

  // UI state
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

  public redirectTo(url?: string) {
    this.open.set(false);
    if (url) {
      this.router.navigateByUrl(url);
    }
  }
}
