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
  let queryActiveTab: string | null = null;
  let queryActiveTabId: string | null = null;
  let tabSummaries: Array<{ name: string; tabId?: string }> = [];

  const routerEvents$ = new Subject<NavigationStart>();
  const languageChange$ = new Subject<'en' | 'es' | 'fr' | 'pt'>();
  const activeTab$ = new Subject<string>();

  const routeMock = {
    snapshot: {
      data: { path: '/' },
      queryParamMap: {
        get: (key: string): string | null => (key === 'activeTabId' ? queryActiveTabId : queryActiveTab),
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
    queryActiveTab = null;
    queryActiveTabId = null;
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
    const pushedUrl = String((globalThis.history.pushState as jasmine.Spy).calls.mostRecent().args[2]);
    expect(pushedUrl).toContain('activeTabId=tab-2');
  });

  it('should keep the same tab when activeTab query is from another language', () => {
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
        name: 'Configuracion de cuenta',
        title: 'Configuracion de cuenta',
        components: [{ component: 'footer' }],
      },
    ] as CmsTabContract[]);

    tabSummaries = [
      { name: 'Personal data', tabId: 'tab-1' },
      { name: 'Datos personales', tabId: 'tab-1' },
      { name: 'Account settings', tabId: 'tab-2' },
      { name: 'Configuracion de cuenta', tabId: 'tab-2' },
    ];

    fixture.detectChanges();

    routerEvents$.next(new NavigationStart(1, '/es/members?activeTab=Account%20settings'));
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
  });

  it('should preserve selected tab by tabId when language changes', () => {
    fixture.componentRef.setInput('tabsId', 'members-tabs');
    fixture.componentRef.setInput('tabs', [
      {
        tabId: 'tab-1',
        name: 'Personal data',
        title: 'Personal data',
        components: [{ component: 'header' }],
      },
      {
        tabId: 'tab-2',
        name: 'Account settings',
        title: 'Account settings',
        components: [{ component: 'footer' }],
      },
    ] as CmsTabContract[]);

    tabSummaries = [
      { name: 'Datos personales', tabId: 'tab-1' },
      { name: 'Configuracion de cuenta', tabId: 'tab-2' },
    ];

    fixture.detectChanges();

    component.activeId.set('tab-2');
    languageChange$.next('es');
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
  });

  it('should prioritize activeTabId over activeTab label mismatch', () => {
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
        name: 'Configuracion de cuenta',
        title: 'Configuracion de cuenta',
        components: [{ component: 'footer' }],
      },
    ] as CmsTabContract[]);

    fixture.detectChanges();

    routerEvents$.next(new NavigationStart(2, '/es/members?activeTab=Datos%20personales&activeTabId=tab-2'));
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
  });
});
