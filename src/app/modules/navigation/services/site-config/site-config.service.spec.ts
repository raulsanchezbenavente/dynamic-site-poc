import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
  const SESSION_STORAGE_KEY = 'dynamic-site.site-config-by-language.v1';
  let service: SiteConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(SiteConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should load and merge pages for unique languages only', () => {
    let resultPages: any[] = [];

    service.loadSite(['en', 'es', 'en']).subscribe((result) => {
      resultPages = result.pages;
    });

    const enReq = httpMock.expectOne('/static-config/site/config-site_en-us.json');
    const esReq = httpMock.expectOne('/static-config/site/config-site_es-es.json');

    enReq.flush({ pages: [{ pageId: '1', path: '/en/home' }] });
    esReq.flush({ pages: [{ pageId: '1', path: '/es/home' }] });

    expect(resultPages.length).toBe(2);
    expect(service.getPagesByLang('en').length).toBe(1);
    expect(service.getPagesByLang('es').length).toBe(1);
    expect(service.siteSnapshot?.pages?.length).toBe(2);
  });

  it('should keep layout URL unresolved when page layout is a string', () => {
    let loadedPage: any;

    service.loadSite(['es']).subscribe((result) => {
      loadedPage = result.pages[0];
    });

    const siteReq = httpMock.expectOne('/static-config/site/config-site_es-es.json');
    siteReq.flush({
      pages: [
        {
          pageId: '0',
          path: 'es/inicio',
          layout: '/assets/config-site/layouts/es/inicio',
        },
      ],
    });

    expect(httpMock.match('/assets/config-site/layouts/es/inicio').length).toBe(0);
    expect(loadedPage.layout).toBe('/assets/config-site/layouts/es/inicio');
  });

  it('should resolve page path by page id and language', () => {
    service.configSitesByLanguage = {
      en: [{ pageId: '10', path: '/en/results' }],
    };

    expect(service.getPathByPageId('10', 'en')).toBe('/en/results');
    expect(service.getPathByPageId(undefined, 'en')).toBeUndefined();
  });

  it('should resolve tabs id by page id and language', () => {
    service.configSitesByLanguage = {
      en: [
        {
          pageId: '10',
          path: '/en/results',
          layout: {
            rows: [
              {
                cols: [
                  {
                    component: 'multiTabBlock_uiplus',
                    config: {
                      tabsId: 'booking',
                      tabs: [],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    expect(service.getTabsIdByPageId('10', 'en')).toBe('booking');
    expect(service.getTabsIdByPageId(undefined, 'en')).toBeUndefined();
  });

  it('should collect unique tab names by tabsId from layout tab config', () => {
    service.configSitesByLanguage = {
      en: [
        {
          layout: {
            rows: [
              {
                cols: [
                  {
                    config: {
                      tabsId: 'booking',
                      tabs: [{ name: 'overview', title: 'Overview', tabId: '1' }],
                    },
                  },
                  {
                    config: {
                      tabsId: 'booking',
                      tabs: [{ name: 'details', title: 'Details', tabId: '2' }],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const tabs = service.getTabNamesByTabsId('booking', 'en');

    expect(tabs.map((t) => t.name)).toEqual(['overview', 'details']);
  });

  it('should remove a language from config sites', () => {
    service.configSitesByLanguage = {
      en: [{ pageId: '1', path: '/en/home' }],
      es: [{ pageId: '1', path: '/es/home' }],
    };

    service.removeLanguage('en');

    expect(service.getPagesByLang('en')).toEqual([]);
    expect(service.getPagesByLang('es').length).toBe(1);
  });

  it('should keep only visited routes when pruning a language', () => {
    service.configSitesByLanguage = {
      en: [
        { pageId: '1', path: 'en/home' },
        { pageId: '2', path: 'en/results' },
        { pageId: '3', path: 'en/payment' },
      ],
      es: [{ pageId: '1', path: 'es/home' }],
    };

    service.markRouteAsVisited('en', '/en/home');
    service.markRouteAsVisited('en', '/en/results');
    service.pruneLanguageKeepingVisitedRoutes('en');

    expect(service.getPagesByLang('en').map((p) => p.path)).toEqual(['en/home', 'en/results']);
    expect(service.getPagesByLang('es').map((p) => p.path)).toEqual(['es/home']);
  });

  it('should keep accented french route when visited url is percent-encoded', () => {
    service.configSitesByLanguage = {
      fr: [
        { pageId: '1', path: 'fr/accueil' },
        { pageId: '2', path: 'fr/résultats' },
      ],
    };

    service.markRouteAsVisited('fr', '/fr/accueil');
    service.markRouteAsVisited('fr', '/fr/r%C3%A9sultats');
    service.pruneLanguageKeepingVisitedRoutes('fr');

    expect(service.getPagesByLang('fr').map((p) => p.path)).toEqual(['fr/accueil', 'fr/résultats']);
  });

  it('should remove language when pruning and no routes were visited', () => {
    service.configSitesByLanguage = {
      en: [
        { pageId: '1', path: 'en/home' },
        { pageId: '2', path: 'en/results' },
      ],
      es: [{ pageId: '1', path: 'es/home' }],
    };

    service.pruneLanguageKeepingVisitedRoutes('en');

    expect(service.getPagesByLang('en')).toEqual([]);
    expect(service.getPagesByLang('es').map((p) => p.path)).toEqual(['es/home']);
  });

  it('should restore full language routes when loading a previously pruned language', () => {
    let resultPages: any[] = [];

    service.loadSite(['en']).subscribe((result) => {
      resultPages = result.pages;
    });

    const enReq = httpMock.expectOne('/static-config/site/config-site_en-us.json');
    enReq.flush({
      pages: [
        { pageId: '0', path: 'en/home' },
        { pageId: '1', path: 'en/results' },
      ],
    });

    service.markRouteAsVisited('en', '/en/home');
    service.pruneLanguageKeepingVisitedRoutes('en');

    expect(service.getPagesByLang('en').map((p) => p.path)).toEqual(['en/home']);

    service.removeLanguage('en');
    service.loadSite(['en']).subscribe((result) => {
      resultPages = result.pages;
    });

    expect(httpMock.match('/static-config/site/config-site_en-us.json').length).toBe(0);
    expect(service.getPagesByLang('en').map((p) => p.path)).toEqual(['en/home', 'en/results']);
    expect(resultPages.some((p) => p.path === 'en/results')).toBeTrue();
  });

  it('should restore full language routes when loading a pruned language still present in active config', () => {
    service.loadSite(['en']).subscribe();

    const enReq = httpMock.expectOne('/static-config/site/config-site_en-us.json');
    enReq.flush({
      pages: [
        { pageId: '0', path: 'en/home' },
        { pageId: '1', path: 'en/results' },
      ],
    });

    service.markRouteAsVisited('en', '/en/home');
    service.pruneLanguageKeepingVisitedRoutes('en');

    expect(service.getPagesByLang('en').map((p) => p.path)).toEqual(['en/home']);

    service.loadSite(['en']).subscribe();

    expect(httpMock.match('/static-config/site/config-site_en-us.json').length).toBe(0);
    expect(service.getPagesByLang('en').map((p) => p.path)).toEqual(['en/home', 'en/results']);
  });
});
