import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { delay, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';

import { TranslationKeys } from '../enums/translation-keys.enum';

import { StorybookLanguageSwitcherComponent } from './language-switcher.component';

/**
 * This demo uses the ngx-translate TranslatePipe for template translations.
 * It also demonstrates:
 * - Variable interpolation
 * - Programmatic translation (TranslateService)
 * - Attribute translation
 * - Fallback language
 *
 * Advanced examples:
 * - Nested keys / Namespaces
 * - Async translation (Observable)
 * - Language change event
 * - Dynamic keys
 */

@Component({
  selector: 'storybook-demo',
  template: `
    <h1 style="text-align: center; margin-top: 2rem; color: #d81b60;">NGX-Translate Storybook Demo</h1>
    <div style="display: flex; justify-content: center; margin-top: 2.5rem;">
      <language-switcher></language-switcher>
    </div>
    <div style="margin-top: 2rem; display: flex; flex-direction: column; align-items: center;">
      <div
        style="background: linear-gradient(90deg, #ff80ab 0%, #ffd1e6 100%); border-radius: 16px; padding: 2rem 3rem; box-shadow: 0 2px 12px 0 #ffb6d5a0; display: flex; align-items: center; gap: 2rem; max-width: 600px;">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=120&q=80"
          alt="Banner"
          style="width: 120px; height: 120px; border-radius: 12px; object-fit: cover; box-shadow: 0 2px 8px #ffb6d5a0;" />
        <div>
          <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; color: #d81b60;">
            {{ translationKeys.BannerTitle | translate }}
          </h2>
          <p style="margin: 0; font-size: 1.2rem; color: #333;">{{ translationKeys.BannerSubtitle | translate }}</p>
        </div>
      </div>
      <div style="margin-top: 2.5rem; text-align: center; width: 100%; max-width: 600px;">
        <h3>Basic Translation (TranslatePipe)</h3>
        <h4>{{ translationKeys.Hello | translate }}</h4>
        <p>{{ translationKeys.Goodbye | translate }}</p>

        <h3 style="margin-top: 2rem;">Variable Interpolation</h3>
        <p>{{ translationKeys.Greeting | translate: { name: userName } }}</p>

        <h3 style="margin-top: 2rem;">Attribute Translation (placeholder)</h3>
        <input
          [placeholder]="translationKeys.SearchPlaceholder | translate"
          style="margin-top: 0.5rem; padding: 0.5rem; border-radius: 8px; border: 1px solid #ccc; width: 220px;" />

        <h3 style="margin-top: 2rem;">Service Translation</h3>
        <button
          (click)="showAlert()"
          style="margin-top: 0.5rem; padding: 0.5rem 1.5rem; border-radius: 8px; background: #ff80ab; color: white; border: none; font-weight: bold; cursor: pointer;">
          {{ translationKeys.ShowAlert | translate }}
        </button>

        <h3 style="margin-top: 2rem;">Fallback Language (Missing Key)</h3>
        <p style="margin-top: 0.5rem; color: #b71c50;">{{ translationKeys.NotFoundKey | translate }}</p>
      </div>

      <!-- Advanced Examples Section -->
      <div
        style="margin-top: 4rem; width: 100%; max-width: 600px; border-top: 2px dashed #ffb6d5; padding-top: 2.5rem;">
        <h2 style="text-align: center; color: #ad1457;">Advanced ngx-translate Examples</h2>

        <h3>Nested Keys / Namespaces</h3>
        <p>{{ translationKeys.ProfileGreeting | translate: { name: userName } }}</p>

        <h3 style="margin-top: 2rem;">Async Translation (Observable)</h3>
        <p>Async: {{ translated$ | async }}</p>

        <h3 style="margin-top: 2rem;">Language Change Event</h3>
        <p>{{ langChangeMsg }}</p>

        <h3 style="margin-top: 2rem;">Dynamic Keys</h3>
        <select
          [(ngModel)]="bannerType"
          style="margin-bottom: 0.5rem;">
          <option value="info">Info</option>
          <option value="warning">Warning</option>
        </select>
        <p>{{ getDynamicBannerKey() | translate }}</p>
      </div>
    </div>
  `,
  standalone: true,
  imports: [TranslateModule, StorybookLanguageSwitcherComponent, FormsModule, AsyncPipe],
})
export class StorybookDemoComponent implements OnDestroy {
  public translationKeys = TranslationKeys;
  public userName = 'Test User';
  public bannerType = 'info';
  public langChangeMsg = '';
  public translated$: Observable<string>;
  private readonly translate = inject(TranslateService);
  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  constructor() {
    // Async translation example (with artificial delay)
    this.translated$ = this.translate.onLangChange.pipe(
      takeUntil(this.unsubscribe$),
      startWith({ lang: this.translate.getCurrentLang() } as LangChangeEvent),
      switchMap(() => this.translate.get(TranslationKeys.Hello).pipe(delay(800)))
    );
    // Language change event example
    this.translate.onLangChange.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
      this.langChangeMsg = `Language changed to: ${event.lang}`;
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public showAlert(): void {
    alert(this.translate.instant(TranslationKeys.AlertMessage, { name: this.userName }));
  }

  public getDynamicBannerKey(): string {
    return this.bannerType === 'info'
      ? this.translationKeys.BannerDynamicInfo
      : this.translationKeys.BannerDynamicWarning;
  }
}
