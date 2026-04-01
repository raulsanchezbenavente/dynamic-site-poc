import { Component, Directive, ElementRef, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LanguageSelectorComponent } from './language-selector.component';
import {
  EventBusService,
  GenerateIdPipe,
  OptionsList,
  DropdownListConfig,
  DropdownLayoutType,
  RedirectionService,
  IbeEventRedirectType,
  ExternalLinkPipe,
} from '@dcx/ui/libs';
import { i18nTestingImportsWithMemoryLoader, i18nTestingProvidersWithServiceStub } from '@dcx/ui/storybook-i18n';

/* --------------------------
 * Lightweight test doubles
 * -------------------------- */

// <a accessibleLink> … </a>
@Directive({ selector: 'a[accessibleLink]', standalone: true })
class MockAccessibleLinkDirective {
  @Input() link: any;
  @Input() skipRel = false;
  @Input() showIcon = true;
}

// Pipe used somewhere in DS templates; always returns true here.
@Pipe({ name: 'isExternalLink', standalone: true })
class MockExternalLinkPipe implements PipeTransform {
  transform(_: string): boolean {
    return true;
  }
}

/** Stub of DropdownListComponent so we avoid pulling its template (which uses translate/date pipes). */
@Component({
  selector: 'dropdown-list',
  template: '',
  standalone: true,
})
class MockDropdownListComponent {
  @Input() config!: DropdownListConfig;
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
}

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  const redirectServiceMock = {
    getRedirectFromCurrentUrl: jasmine.createSpy('getRedirectFromCurrentUrl').and.returnValue('/redirected-url'),
    validateEventRedirectType: jasmine.createSpy('validateEventRedirectType').and.returnValue('internal'),
  };

  const eventBusServiceMock = {
    notifyEvent: jasmine.createSpy('notifyEvent'),
  };

  const generateIdPipeMock = {
    transform: jasmine.createSpy('transform').and.callFake((prefix: string) => `${prefix}-generated-id`),
  };

  const configMock: DropdownListConfig = {
    dropdownModel: {
      value: '',
      config: {
        label: '',
        layoutConfig: { layout: DropdownLayoutType.DEFAULT },
      },
    },
    optionsListConfig: {
      options: [
        { code: 'en-US', name: 'English', link: { url: '/en' }, isSelected: false, isDisabled: false },
        { code: 'es-ES', name: 'Español', link: { url: '/es' }, isSelected: false, isDisabled: false },
      ],
    },
  };

  const redirectionServiceMock = {
    redirect: jasmine.createSpy('redirect'),
  };

  beforeEach(fakeAsync(() => {
    redirectServiceMock.getRedirectFromCurrentUrl.calls.reset();
    redirectServiceMock.validateEventRedirectType.calls.reset();
    eventBusServiceMock.notifyEvent.calls.reset();
    redirectionServiceMock.redirect.calls.reset();

    TestBed.configureTestingModule({
      imports: [
        LanguageSelectorComponent,
        MockDropdownListComponent,
        MockAccessibleLinkDirective,
        MockExternalLinkPipe,
        ...i18nTestingImportsWithMemoryLoader({
          'Common.LanguageSelector_List_Label': 'translated:Common.LanguageSelector_List_Label'
        }),
      ],
      providers: [
        { provide: RedirectionService, useValue: redirectionServiceMock },
        { provide: EventBusService, useValue: eventBusServiceMock },
        { provide: GenerateIdPipe, useValue: generateIdPipeMock },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        ...i18nTestingProvidersWithServiceStub({
            'Common.LanguageSelector_List_Label': 'translated:Common.LanguageSelector_List_Label'
        }),
        { provide: ExternalLinkPipe, useValue: { transform: () => true } },
      ]
    });

    TestBed.overrideComponent(LanguageSelectorComponent, {
      set: {
        imports: [MockDropdownListComponent],
      },
    });

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', structuredClone(configMock));

    fixture.detectChanges();
    tick();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize culture with default if empty', () => {
    component.culture = '';
    expect(component.culture).toBe('en-US');
  });

  it('should use provided culture if not empty', () => {
    component.culture = 'es-ES';
    expect(component.culture).toBe('es-ES');
  });

  it('should set selected language and update config', () => {
    const option: OptionsList = {
      code: 'es-ES',
      name: 'Español',
      link: { url: '/es' },
      isSelected: false,
      isDisabled: false,
    };

    component.languageSelected = option;

    expect(component.languageSelected?.code).toBe('es-ES');
    expect(component.config.dropdownModel.value).toBe('Español');
    // languages may be initialized by ngOnInit; ensure no selection flip here
    expect(Array.isArray((component as any).languages)).toBeTrue();
  });

  it('should call internalInit on ngOnInit', () => {
    const spy = spyOn(component as any, 'internalInit').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should set translated label and resolved value in internalInit', () => {
    component.ngOnInit();
    expect(component.config.dropdownModel.config.label).toBe('translated:Common.LanguageSelector_List_Label');
    // default resolved value from options (first or culture)
    expect(component.config.dropdownModel.value).toBeTruthy();
  });

  it('should map language list correctly', () => {
    const input = [
      { longLanguage: 'en-US', name: 'English', link: { url: '/en' } },
      { language: 'es-ES', name: 'Español', link: { url: '/es' } },
      { code: 'fr-FR', name: 'Français', link: { url: '/fr' } },
    ];

    const result = component.mapLanguageList(input);

    expect(result.length).toBe(3);
    expect(result[0].code).toBe('en-US');
    expect(result[1].code).toBe('es-ES');
    expect(result[2].code).toBe('fr-FR');
    expect(result[1].isDisabled).toBeFalse();
  });

  it('should select a language and redirect', () => {
    const linkEl = document.createElement('link');
    linkEl.href = '/es';
    spyOn(document, 'querySelector').and.returnValue(linkEl as any);
    globalThis.history.replaceState(null, '', '/en');

    const selected: OptionsList = {
      code: 'es-ES', name: 'Español', link: { url: '/es' }, isSelected: false, isDisabled: false,
    };

    component.culture = selected.code;
    component.config.dropdownModel.value = selected.name;
    component.languageSelected = selected;

    component.selectedLanguage(selected);

    expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
    IbeEventRedirectType.externalRedirect,
      jasmine.stringMatching(/\/es$/)
    );
  });


  it('should append query params if present', () => {
    const linkEl = document.createElement('link');
    linkEl.href = '/lang/pt';
    spyOn(document, 'querySelector').and.returnValue(linkEl as any);
    globalThis.history.replaceState(null, '', '/lang/pt?lang=en');

    const selected: OptionsList = {
      code: 'pt-BR', name: 'Português', link: { url: '/lang/pt' }, isSelected: false, isDisabled: false,
    };

    component.culture = selected.code;
    component.config.dropdownModel.value = selected.name;
    component.languageSelected = selected;

    component.selectedLanguage(selected);

    expect(redirectionServiceMock.redirect).toHaveBeenCalledWith(
      IbeEventRedirectType.externalRedirect,
      jasmine.stringMatching(/\/lang\/pt\?lang=en$/)
    );
  });

});
