import { Component, ElementRef, inject, Input, OnInit } from '@angular/core';
import {
  DropdownListConfig,
  EnumStorageKey,
  EventBusService,
  GenerateIdPipe,
  IbeEventRedirectType,
  OptionsList,
  RedirectionService,
  StorageService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { resolveDropdownValueFromOptions } from '../dropdown-type';
import { DropdownListComponent } from '../dropdown-type/components/dropdown-list/dropdown-list.component';

import { SlugCultureControlService } from './slug-culture-control/slug-culture-control.service';

@Component({
  selector: 'language-selector',
  templateUrl: './language-selector.component.html',
  host: { class: 'language-selector' },
  imports: [DropdownListComponent],
  standalone: true,
})
export class LanguageSelectorComponent implements OnInit {
  public _languageSelected?: OptionsList;
  protected _culture: string = 'en-US';
  private readonly languages: OptionsList[] = [];
  private readonly redirectService = inject(RedirectionService);
  private readonly slugCultureControlService = inject(SlugCultureControlService);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) public config!: DropdownListConfig;

  private readonly storageService = inject(StorageService);

  constructor(
    public elementRef: ElementRef,
    public eventBusService: EventBusService,
    protected generateId: GenerateIdPipe
  ) {}

  @Input()
  set culture(value: string) {
    this._culture = value && value.length > 0 ? value : 'en-US';
  }

  // Set isSelected to true for the found language
  set languageSelected(value) {
    this._languageSelected = value;
    for (const language of this.languages) {
      language.isSelected = language.code === this._languageSelected?.code;
    }
    if (this._languageSelected?.name) {
      this.config.dropdownModel.value = this._languageSelected.name;
    }
  }

  get culture(): string {
    return this._culture;
  }

  get languageSelected(): OptionsList | undefined {
    return this._languageSelected;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public internalInit(): void {
    // Ensure each option has a `lang` attribute derived from the `code`
    this.enrichOptionsWithLang();

    const resolvedValue = resolveDropdownValueFromOptions(this._culture, this.config.optionsListConfig.options);

    this.config.dropdownModel.value = resolvedValue;

    // Set dropdown label from translations
    this.config.dropdownModel.config.label = this.translate.instant('Common.LanguageSelector_List_Label');
  }

  /**
   * Map incoming language list to SelectOption model.
   * This is required because the list from CMS is not strongly typed
   * @param languages Input list of languages
   */
  public mapLanguageList(languages: any): OptionsList[] {
    return languages.map((x: any) => ({
      code: x.longLanguage ?? x.language ?? x.code,
      name: x.name,
      url: x.url,
      isSelected: false,
      isDisabled: !x.language,
      lang: x.language ?? x.code,
    }));
  }

  /**
   * set selected language in storage and redirect the page
   * @param code the language key e.g en-US
   */
  public selectedLanguage(selectOption: OptionsList): void {
    if (!selectOption.code) {
      return;
    }
    const simpleLanguageCode: string = selectOption.code.substring(0, 2);
    this.storageService.setSessionStorage(EnumStorageKey.Language, simpleLanguageCode);
    this.redirectToSelectedLanguage(simpleLanguageCode);
  }

  private enrichOptionsWithLang(): void {
    this.config.optionsListConfig.options = this.config.optionsListConfig.options.map((opt) => ({
      ...opt,
      lang: opt.lang ?? opt.code,
    }));
  }

  private redirectToSelectedLanguage(language: string): void {
    const nextLang = (language || '').slice(0, 2).toLowerCase();
    if (!nextLang) return;
    this.slugCultureControlService.getFixedParameters(nextLang).subscribe((fixedParameters: string) => {
      const link: HTMLLinkElement | null = document.querySelector(
        `link[rel="alternate"][hreflang^="${nextLang}-" i],link[rel="alternate"][hreflang="${nextLang}" i]`
      );
      if (link?.href) {
        this.redirectService.redirect(IbeEventRedirectType.externalRedirect, link?.href + fixedParameters);
      } else {
        console.warn('No URL found for culture: ', language);
      }
    });
  }
}
