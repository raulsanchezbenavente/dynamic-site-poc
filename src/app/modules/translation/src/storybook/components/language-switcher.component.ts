import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'language-switcher',
  template: `
    <div style="margin-bottom: 1rem; display: flex; gap: 8px; align-items: center;">
      @for (lang of langs(); track lang) {
        <button
          (click)="switchLang(lang)"
          [disabled]="lang === currentLang()"
          class="storybook-lang-btn"
          [class.active-switch]="lang === currentLang()">
          {{ lang }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .storybook-lang-btn {
        border: 2px solid #ff80ab;
        background: rgb(254, 254, 254);
        color: #d81b60;
        font-weight: bold;
        font-size: 15px;
        border-radius: 20px;
        padding: 6px 18px;
        margin-right: 0;
        cursor: pointer;
        transition:
          background 0.3s,
          color 0.3s,
          border 0.3s,
          box-shadow 0.3s;
        box-shadow: none;
        position: relative;
        z-index: 1;
      }
      .storybook-lang-btn:not(:last-child) {
        margin-right: 8px;
      }
      .storybook-lang-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        background: #ffe4ec;
        color: #b71c50;
        border-color: #ffb6d5;
      }
      .storybook-lang-btn:not(:disabled):hover {
        background: #ffd1e6;
        color: #ad1457;
        border-color: #ffb6d5;
      }
      .storybook-lang-btn.active-switch {
        background: linear-gradient(90deg, #ff80ab 0%, #ffd1e6 100%);
        color: black;
        border-color: #ff80ab;
        box-shadow: 0 2px 12px 0 #ffb6d5a0;
        font-weight: bold;
      }
    `,
  ],
})
export class StorybookLanguageSwitcherComponent {
  private readonly translateService = inject(TranslateService);

  public langs = (): string[] => ['es-ES', 'en-US', 'fr-FR'];

  public currentLang = (): string => this.translateService.getCurrentLang() || 'es-ES';

  public switchLang(lang: string): void {
    this.translateService.use(lang);
  }
}
