import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, effect, inject, input, OnInit, signal, TemplateRef } from '@angular/core';
import { ModuleTranslationService, TranslationLoadStatusDirective, TranslationsLoaded } from '@dcx/module/translation';

@Component({
  selector: 'i18n-story-host',
  standalone: true,
  imports: [NgTemplateOutlet, TranslationLoadStatusDirective],
  template: `
    <ng-template #defaultProjected>
      <ng-content></ng-content>
    </ng-template>

    <div
      translationLoadStatus
      class="i18n-story-host__loader"
      style="display: none"
      [moduleKeys]="modules()"
      (translationsLoaded)="handleTranslations($event)"
      aria-hidden="true"></div>

    @if(ready()) {
      <ng-container *ngTemplateOutlet="storyTemplate ?? defaultProjected"></ng-container>
    }
  `,
})
export class I18nStoryHostComponent implements OnInit {
  /** Modules to load, e.g. 'Common' or ['Common', 'Navigation'] */
  public modules = input<string | string[]>('Common');

  @ContentChild('i18nStoryContent', { read: TemplateRef })
  public storyTemplate?: TemplateRef<unknown> | null;

  private readonly moduleTranslationService = inject(ModuleTranslationService);
  private readonly readyState = signal(false);
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    // Trigger translation loading when modules change
    // Use ModuleTranslationService (aliased to StoryModuleTranslationService in decorator)
    // so it uses the correct DI context with per-story TRANSLATION_BASE_URL override
    effect(() => {
      const keys = this.modules();
      if (keys) {
        // Cast to any because the interface doesn't expose loadModuleTranslations
        // but StoryModuleTranslationService does implement it
        (this.moduleTranslationService as any).loadModuleTranslations(keys).subscribe();
      }
    });

    // Check if modules are already loaded on init
    effect(() => {
      if (this.readyState()) return;

      const moduleKeys = Array.isArray(this.modules()) ? this.modules() as string[] : [this.modules() as string];
      const allLoaded = moduleKeys.every((key) => this.moduleTranslationService.isModuleLoaded(key));

      if (allLoaded) {
        this.readyState.set(true);
      }
    });
  }

  public ngOnInit(): void {
    // Fallback: if translations don't load within 100ms (e.g., mock-only mode), force render
    // This ensures Storybook tests don't hang waiting for async translation loading
    this.timeoutId = setTimeout(() => {
      if (!this.readyState()) {
        console.warn('[i18n-story-host] Timeout waiting for translations, forcing render for:', this.modules());
        this.readyState.set(true);
      }
    }, 100);
  }

  /** Delay projecting the story until translations land so translate.instant() reads hydrated keys. */
  public handleTranslations(payload: TranslationsLoaded): void {
    if (!this.readyState()) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.readyState.set(true);
      if (!payload?.success) {
        console.warn('[i18n-story-host] Failed to load translations for', this.modules());
      }
    }
  }

  public ready(): boolean {
    return this.readyState();
  }
}
