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
import { SiteConfigService } from '../../services/site-config/site-config.service';
import { Location } from '@angular/common';

export type HeaderMenuItem = {
  label: string;
  checked?: boolean;
  external?: boolean;
  redirectTo?: string;
};

type Lang = { code: 'en' | 'es' | 'fr' | 'pt'; label: string };

const LANGS: Lang[] = [
  { code: 'en', label: 'HEADER.EN' },
  { code: 'es', label: 'HEADER.ES' },
  { code: 'fr', label: 'HEADER.FR' },
  { code: 'pt', label: 'HEADER.PT' },
];

const DEFAULT_MENU: HeaderMenuItem[] = [
  { label: 'Home', redirectTo: '/home' },
  { label: 'Personal Data', checked: true, redirectTo: '/avianca-home?activeTab=Personal%20Data' },
  { label: 'My trips', redirectTo: '/avianca-home?activeTab=My%20Trips' },
  { label: 'My elite status', redirectTo: '/avianca-home?activeTab=Elite%20status' },
  { label: 'Book a flight with LM' },
];

@Component({
  selector: 'main-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <!-- Top black bar -->
      <div class="lm-topbar" role="navigation" aria-label="Locale bar">
        <div class="lm-topbar-inner">
          <div class="lm-lang">
            <button
              type="button"
              class="lm-lang-trigger"
              [class.is-open]="langOpen()"
              (click)="toggleLangMenu($event)"
              [attr.aria-expanded]="langOpen()"
              aria-haspopup="menu"
            >
              <span class="lm-lang-ico" aria-hidden="true">🌐</span>
              <span class="lm-lang-label">{{ activeLangLabel() }}</span>
            </button>
            <div
              *ngIf="langOpen()"
              class="lm-lang-menu"
              role="menu"
              aria-label="Language menu"
              (click)="$event.stopPropagation()"
            >
              <button
                type="button"
                class="lm-lang-item"
                role="menuitem"
                [class.is-active]="activeLang() === 'en'"
                (click)="setLang('en')"
              >{{ 'HEADER.EN' | translate }}</button>
              <button
                type="button"
                class="lm-lang-item"
                role="menuitem"
                [class.is-active]="activeLang() === 'es'"
                (click)="setLang('es')"
              >{{ 'HEADER.ES' | translate }}</button>
              <button
                type="button"
                class="lm-lang-item"
                role="menuitem"
                [class.is-active]="activeLang() === 'fr'"
                (click)="setLang('fr')"
              >{{ 'HEADER.FR' | translate }}</button>
              <button
                type="button"
                class="lm-lang-item"
                role="menuitem"
                [class.is-active]="activeLang() === 'pt'"
                (click)="setLang('pt')"
              >{{ 'HEADER.PT' | translate }}</button>
            </div>
          </div>

          <span class="lm-topbar-sep" aria-hidden="true">|</span>

          <span class="lm-topbar-item-static">
            <span class="lm-topbar-ico" aria-hidden="true">💲</span>
            <span>{{ market() }}</span>
          </span>
        </div>
      </div>


    <header class="lm-header" role="banner">
      <div class="lm-inner" #root>
        <!-- Left: logo + nav -->
        <div class="lm-left">
          <a class="lm-logo" href="#" aria-label="Avianca">
            <span class="lm-logo-text">avianca</span>
            <svg class="lm-logo-mark" viewBox="0 0 64 32" aria-hidden="true">
              <path
                d="M4 22c10-10 22-14 34-10 6 2 13 6 22 12-14-2-24 0-30 3-8 4-14 3-26-5z"
                fill="currentColor"
              />
            </svg>
          </a>

          <nav class="lm-nav" aria-label="Main navigation">
            <a class="lm-link" href="#">Reservar</a>
            <a class="lm-link" href="#">Ofertas y destinos</a>
            <a class="lm-link" href="#">Tu reserva</a>
            <a class="lm-link lm-pill" href="#">Check-in</a>
            <a class="lm-link" href="#">Información y ayuda</a>
            <a class="lm-link" href="#">Lifemiles</a>
          </nav>
        </div>

        <!-- Right: locale + user -->
        <div class="lm-right">
          <div class="lm-user-wrap">
            <button
              type="button"
              class="lm-user"
              (click)="toggleMenu($event)"
              [attr.aria-expanded]="open()"
              aria-haspopup="menu"
            >
              <span class="lm-lm-badge" aria-hidden="true">lm</span>

              <span class="lm-user-text">
                <span class="lm-user-name">{{ userName() }}</span>
                <span class="lm-user-miles">{{ userMiles() }} mil...</span>
              </span>

              <span class="lm-caret" [class.is-open]="open()" aria-hidden="true">▾</span>
            </button>

            <div
              class="lm-dropdown"
              *ngIf="open()"
              role="menu"
              aria-label="User menu"
              (click)="$event.stopPropagation()"
            >
              <div class="lm-dd-list">
                <button
                  class="lm-dd-item"
                  type="button"
                  role="menuitem"
                  *ngFor="let item of items(); trackBy: trackByLabel"
                  (click)="redirectTo(item.redirectTo)"
                >
                  <span class="lm-dd-label">{{ item.label }}</span>

                  <span class="lm-dd-icon" *ngIf="item.checked" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>

                  <span class="lm-dd-icon" *ngIf="item.external" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M14 3h7v7"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 3l-9 9"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 7H7a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </button>

                <div class="lm-dd-sep" aria-hidden="true"></div>

                <button class="lm-dd-item lm-dd-item--logout" type="button" role="menuitem">
                  <span class="lm-dd-label">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display:block; }
    /* Top black bar */
    /* Topbar base (si ya la tienes, solo asegura estos) */
    .lm-topbar{
      background:#111;
      color:#fff;
      font-size: 13px;
    }
    .lm-topbar-inner{
      max-width:1240px;
      margin:0 auto;
      padding: 8px 18px;
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap: 12px;
    }
    .lm-topbar-sep{
      opacity:.5;
    }

    /* Language trigger */
    .lm-lang{
      position: relative;
      display:inline-flex;
      align-items:center;
    }

    .lm-lang-trigger{
      border: 0;
      background: transparent;
      color: #fff;              /* 🔹 blanco por defecto */
      cursor: pointer;
      display:inline-flex;
      align-items:center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: 10px;
      font-weight: 700;
      transition: color .15s ease, background .15s ease;
    }

    .lm-lang-trigger:hover{
      background: rgba(255,255,255,.08);
    }

    .lm-lang-trigger.is-open{
      color: #21c55d;
    }

    .lm-lang-ico{
      font-size: 14px;
      transform: translateY(-1px);
    }

    .lm-lang-label{
      white-space: nowrap;
    }

    /* Dropdown menu */
    .lm-lang-menu{
      position:absolute;
      left: 0;                     /* aparece bajo el trigger */
      top: calc(100% + 10px);
      width: 220px;
      background: #fff;
      color: #111;
      border-radius: 18px;
      box-shadow: 0 18px 35px rgba(0,0,0,.28);
      border: 1px solid #eee;
      padding: 10px 0;
      z-index: 80;
    }

    /* Menu item */
    .lm-lang-item{
      width:100%;
      border:0;
      background: transparent;
      cursor:pointer;
      padding: 14px 18px;
      text-align:left;

      font-size: 18px;
      font-weight: 500;
      color:#111;
    }

    .lm-lang-item:hover{
      background: #f6f6f6;
    }

    .lm-lang-item.is-active{
      font-weight: 900;            /* activo en negrita como la imagen */
    }

    /* Market (igual que antes) */
    .lm-topbar-item-static{
      display:inline-flex;
      align-items:center;
      gap: 8px;
      white-space: nowrap;
      opacity: .95;
      color:#fff;
    }
    .lm-topbar-ico{
      font-size: 14px;
      opacity: .95;
    }

    .lm-header{ background:#fff; border-bottom:1px solid #eee; }
    .lm-inner{
      max-width:1240px; margin:0 auto; padding:14px 18px;
      display:flex; align-items:center; justify-content:space-between; gap:14px;
    }

    .lm-left{ display:flex; align-items:center; gap:18px; min-width:0; }

    .lm-logo{
      display:flex; align-items:center; gap:10px;
      text-decoration:none; color:#e6001a;
      font-weight:800; letter-spacing:-.3px; white-space:nowrap;
    }
    .lm-logo-text{ font-size:34px; line-height:1; text-transform:lowercase; }
    .lm-logo-mark{ width:44px; height:22px; transform: translateY(2px); }

    .lm-nav{ display:flex; align-items:center; gap:18px; min-width:0; }
    .lm-link{
      color:#111; text-decoration:none; font-size:15px;
      padding:8px 10px; border-radius:999px; white-space:nowrap;
    }
    .lm-link:hover{ background:#f4f4f4; }
    .lm-pill{ background:#0a6cff; color:#fff; font-weight:700; }
    .lm-pill:hover{ background:#095fe0; }

    .lm-right{ display:flex; align-items:center; gap:14px; white-space:nowrap; }
    .lm-locale{ font-size:13px; color:#111; opacity:.9; display:flex; align-items:center; gap:10px; }
    .lm-dot{ opacity:.55; }

    .lm-user-wrap{ position:relative; }

    .lm-user{
      display:flex; align-items:center; gap:10px;
      border:2px solid #e2007a; background:#fff;
      border-radius:999px; padding:6px 10px 6px 8px;
      cursor:pointer; box-shadow:0 8px 18px rgba(0,0,0,.08);
    }

    .lm-lm-badge{
      width:34px; height:34px; border-radius:999px;
      display:flex; align-items:center; justify-content:center;
      background:#e2007a; color:#fff; font-weight:900;
      text-transform:lowercase; font-size:14px; flex:0 0 auto;
    }

    .lm-user-text{
      display:flex; flex-direction:column; align-items:flex-start;
      line-height:1.05; min-width:0;
    }
    .lm-user-name{ font-weight:800; font-size:14px; color:#111; }
    .lm-user-miles{ font-weight:700; font-size:13px; color:#111; opacity:.85; }

    .lm-caret{
      font-size:16px; opacity:.8; transform: translateY(-1px);
      transition: transform .15s ease; padding:0 6px 0 2px;
    }
    .lm-caret.is-open{ transform: translateY(-1px) rotate(180deg); }

    .lm-dropdown{
      position:absolute; right:0; top: calc(100% + 10px);
      width:280px; background:#fff;
      border-radius:14px; border:1px solid #eee;
      box-shadow:0 18px 35px rgba(0,0,0,.18);
      overflow:hidden; z-index:50;
    }

    .lm-dd-list{ padding:10px 0; }

    .lm-dd-item{
      width:100%; border:0; background:transparent; cursor:pointer;
      padding:12px 14px;
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      text-align:left; color:#111; font-size:14px;
    }
    .lm-dd-item:hover{ background:#f6f6f6; }

    .lm-dd-label{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    .lm-dd-icon{
      width:18px; height:18px; opacity:.9;
      display:flex; align-items:center; justify-content:center; flex:0 0 auto;
    }
    .lm-dd-icon svg{ width:18px; height:18px; }

    .lm-dd-sep{ height:1px; background:#eee; margin:8px 0; }
    .lm-dd-item--logout{ font-weight:700; }

    @media (max-width:1050px){
      .lm-nav{ display:none; }
    }
  `],
})
export class MainHeaderComponent {
  private readonly siteConfig = inject(SiteConfigService);
  private readonly location = inject(Location);

  language = input<string>('Español');
  market = input<string>('Colombia (COP)');

  userName = input<string>('Jose');
  userMiles = input<string>('600,700');
  private translate = inject(TranslateService);

  langOpen = signal(false);
  langs = LANGS;
  activeLang = signal<'en' | 'es' | 'fr' | 'pt'>('en');
  activeLangLabel = computed(() => {
    const code = this.activeLang();
    const key = this.langs.find(l => l.code === code)?.label ?? 'HEADER.EN';
    return this.translate.instant(key);
  });

  setLang(lang: 'en' | 'es' |'fr' | 'pt') {
    this.activeLang.set(lang);
    this.translate.use(lang);
    this.langOpen.set(false);
    this.location.replaceState('avianca-inicio?activeTab=Datos%20Personales');

    console.log(this.router.config)
    setTimeout(() => {
      this.siteConfig.loadSite(lang).subscribe(()=>{
            console.log(this.router.config)

        // this.router.navigateByUrl('/avianca-inicio?activeTab=Datos%20Personales2222');
        // this.siteConfig.loadSite('en').subscribe();
      });
    }, 1000);
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
