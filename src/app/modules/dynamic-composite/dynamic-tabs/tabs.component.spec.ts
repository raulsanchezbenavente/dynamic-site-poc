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

  const routerEvents$ = new Subject<NavigationStart>();
  const languageChange$ = new Subject<'en' | 'es' | 'fr' | 'pt'>();
  const activeTab$ = new Subject<string>();

  const routeMock = {
    snapshot: {
      data: { path: '/' },
      queryParamMap: {
        get: (_key: string): string | null => null,
      },
    },
  };

  const routerHelperMock = {
    languageChange$: languageChange$.asObservable(),
    activeTab$: activeTab$.asObservable(),
  };

  const siteConfigMock = {
    getTabNamesByTabsId: (_tabsId: string): Array<{ name: string }> => [],
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
});
