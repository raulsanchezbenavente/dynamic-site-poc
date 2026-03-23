import { Subject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

import { RouterHelperService, SiteConfigService } from '@navigation';
import { CmsTabContract } from './models/cms-tab-contract.model';
import { DsTabsComponent } from './tabs.component';

describe('DsTabsComponent', () => {
  let fixture: ComponentFixture<DsTabsComponent>;
  let component: DsTabsComponent;
  let routeQueryValues: Record<string, string | null>;
  let tabSummaries: Array<{ name: string; tabId?: string }>;

  const routerEvents$ = new Subject<NavigationStart>();
  const languageChange$ = new Subject<'en' | 'es' | 'fr' | 'pt'>();
  const activeTab$ = new Subject<string>();

  const routeMock = {
    snapshot: {
      data: { path: '/' },
      queryParamMap: {
        get: (key: string): string | null => routeQueryValues[key] ?? null,
      },
    },
  };

  const routerHelperMock = {
    languageChange$: languageChange$.asObservable(),
    activeTab$: activeTab$.asObservable(),
  };

  const siteConfigMock = {
    getTabNamesByTabsId: (_tabsId: string): Array<{ name: string; tabId?: string }> => tabSummaries,
  };

  const tabsInput: CmsTabContract[] = [
    {
      tabId: 'tab-1',
      name: 'overview',
      title: 'Overview',
      components: [{ component: 'header' }],
    },
    {
      tabId: 'tab-2',
      name: 'details',
      title: 'Details',
      components: [{ component: 'footer' }],
    },
  ];

  beforeEach(async () => {
    routeQueryValues = {};
    tabSummaries = [];

    await TestBed.configureTestingModule({
      imports: [DsTabsComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            events: routerEvents$.asObservable(),
          },
        },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: RouterHelperService, useValue: routerHelperMock },
        { provide: SiteConfigService, useValue: siteConfigMock },
        {
          provide: Title,
          useValue: jasmine.createSpyObj<Title>('Title', ['setTitle']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DsTabsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tabs', tabsInput);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render one tab button per tab', () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.tab');
    expect(buttons.length).toBe(2);
  });

  it('should activate selected tab on click', () => {
    spyOn(globalThis.history, 'pushState');

    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.tab');
    (buttons[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
    expect(globalThis.history.pushState).toHaveBeenCalled();
  });

  it('should activate the tab from the URL on browser back', () => {
    fixture.detectChanges();

    component.select(tabsInput[1]);
    expect(component.activeId()).toBe('tab-2');

    globalThis.history.replaceState({}, '', '/context.html?activeTab=overview');
    globalThis.dispatchEvent(new PopStateEvent('popstate'));
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-1');
  });

  it('should activate the current-language tab when browser back restores a tab name from another language', () => {
    fixture.componentRef.setInput('tabsId', 'members-tabs');
    fixture.componentRef.setInput('tabs', [
      {
        tabId: 'tab-1',
        name: 'Datos personales',
        title: 'Datos personales',
        components: [{ component: 'header' }],
      },
      {
        tabId: 'tab-2',
        name: 'Mis viajes',
        title: 'Mis viajes',
        components: [{ component: 'footer' }],
      },
    ] as CmsTabContract[]);
    tabSummaries = [
      { name: 'Personal data', tabId: 'tab-1' },
      { name: 'Datos personales', tabId: 'tab-1' },
      { name: 'My trips', tabId: 'tab-2' },
      { name: 'Mis viajes', tabId: 'tab-2' },
    ];

    fixture.detectChanges();

    globalThis.history.replaceState({}, '', '/context.html?activeTab=My%20trips');
    globalThis.dispatchEvent(new PopStateEvent('popstate'));
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
  });

  it('should replace the activeTab query param with the translated active tab on language change', () => {
    spyOn(globalThis.history, 'replaceState');

    fixture.componentRef.setInput('tabsId', 'members-tabs');
    tabSummaries = [
      { name: 'Datos personales', tabId: 'tab-1' },
      { name: 'Mis viajes', tabId: 'tab-2' },
    ];

    fixture.detectChanges();
    globalThis.history.replaceState({}, '', '/context.html?activeTab=details');

    component.select(tabsInput[1]);
    languageChange$.next('es');
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
    expect(globalThis.history.replaceState).toHaveBeenCalledWith({}, '', '/context.html?activeTab=Mis%20viajes');
  });
});
