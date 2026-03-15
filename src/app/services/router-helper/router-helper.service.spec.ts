import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { RouterHelperService } from './router-helper.service';

describe('RouterHelperService', () => {
  let service: RouterHelperService;

  const leafRoute = {
    snapshot: {
      data: { pageId: '42' },
    },
    firstChild: null,
  } as unknown as ActivatedRoute;

  const rootRoute = {
    firstChild: {
      firstChild: leafRoute,
    },
  } as unknown as ActivatedRoute;

  const routerMock = {
    config: [{ data: { pageId: '42' }, path: 'en/test' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: rootRoute },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(RouterHelperService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should read the current page id from the deepest route', () => {
    expect(service.getCurrentPageId()).toBe('42');
  });

  it('should find route by page id', () => {
    const route = service.findRouteByPageId('42');
    expect(route?.path).toBe('en/test');
  });

  it('should store and read tab id by tabsId key', () => {
    service.setCurrentTabId('booking-tabs', 'tab-2');

    expect(service.getCurrentTabId('booking-tabs')).toBe('tab-2');
  });

  it('should emit language and active tab changes', (done) => {
    let languageSeen = false;

    service.languageChange$.subscribe((lang) => {
      expect(lang).toBe('es');
      languageSeen = true;
      service.changeActiveTab('tab-3');
    });

    service.activeTab$.subscribe((tabId) => {
      expect(tabId).toBe('tab-3');
      expect(languageSeen).toBeTrue();
      done();
    });

    service.changeLanguage('es');
  });
});
