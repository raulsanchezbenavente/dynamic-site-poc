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
    syncActiveTabUrl: jasmine.createSpy('syncActiveTabUrl'),
    setCurrentTabId: jasmine.createSpy('setCurrentTabId'),
  };

  const siteConfigMock = {
    getTabNamesByTabsId: (_tabsId: string): Array<{ name: string; tabId?: string }> => tabSummaries,
  };

  const tabsInput: CmsTabContract[] = [
    {
      tabId: 'tab-1',
      name: 'overview',
      title: 'Overview',
      layout: {
        rows: [
          {
            cols: [{ component: 'header' }],
          },
        ],
      },
    },
    {
      tabId: 'tab-2',
      name: 'details',
      title: 'Details',
      layout: {
        rows: [
          {
            cols: [{ component: 'footer' }],
          },
        ],
      },
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
    fixture.componentRef.setInput('config', { tabs: tabsInput });
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

  it('should support layout-based tab content format', () => {
    fixture.componentRef.setInput('config', { tabs: [
      {
        tabId: 'tab-1',
        name: 'overview',
        title: 'Overview',
        layout: {
          rows: [
            {
              cols: [{ component: 'header' }],
            },
          ],
        },
      },
    ] as CmsTabContract[] });

    fixture.detectChanges();

    const renderedBlock = fixture.nativeElement.querySelector('block-outlet');
    expect(renderedBlock).toBeTruthy();
  });

  it('should preserve span values when rendering tab layout columns', () => {
    fixture.componentRef.setInput('config', { tabs: [
      {
        tabId: 'tab-1',
        name: 'overview',
        title: 'Overview',
        layout: {
          rows: [
            {
              cols: [
                { component: 'header', span: 7 },
                { component: 'footer', span: 5 },
              ],
            },
          ],
        },
      },
    ] as CmsTabContract[] });

    fixture.detectChanges();

    const cols = fixture.nativeElement.querySelectorAll('.tab-panel .col');
    expect(cols.length).toBe(2);
    expect((cols[0] as HTMLElement).style.gridColumn).toBe('span 7');
    expect((cols[1] as HTMLElement).style.gridColumn).toBe('span 5');
  });

  it('should activate selected tab on click', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.tab');
    (buttons[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
    expect(routerHelperMock.syncActiveTabUrl).toHaveBeenCalledWith('details', 'push');
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
    fixture.componentRef.setInput('config', { tabsId: 'members-tabs', tabs: [
      {
        tabId: 'tab-1',
        name: 'Datos personales',
        title: 'Datos personales',
        layout: {
          rows: [
            {
              cols: [{ component: 'header' }],
            },
          ],
        },
      },
      {
        tabId: 'tab-2',
        name: 'Mis viajes',
        title: 'Mis viajes',
        layout: {
          rows: [
            {
              cols: [{ component: 'footer' }],
            },
          ],
        },
      },
    ] as CmsTabContract[] });
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
    fixture.componentRef.setInput('config', { tabsId: 'members-tabs', tabs: tabsInput });
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
    expect(routerHelperMock.syncActiveTabUrl).toHaveBeenCalledWith('Mis viajes', 'replace');
  });

  it('should use the same push-history flow when a tab is activated externally', () => {
    fixture.detectChanges();

    activeTab$.next('tab-2');
    fixture.detectChanges();

    expect(component.activeId()).toBe('tab-2');
    expect(routerHelperMock.syncActiveTabUrl).toHaveBeenCalledWith('details', 'push');
  });
});
