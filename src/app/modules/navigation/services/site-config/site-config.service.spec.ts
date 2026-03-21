import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
  let service: SiteConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(SiteConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should load and merge pages for unique languages only', () => {
    let resultPages: any[] = [];

    service.loadSite(['en', 'es', 'en']).subscribe((result) => {
      resultPages = result.pages;
    });

    const enReq = httpMock.expectOne('/assets/config-site/en');
    const esReq = httpMock.expectOne('/assets/config-site/es');

    enReq.flush({ pages: [{ pageId: '1', path: '/en/home' }] });
    esReq.flush({ pages: [{ pageId: '1', path: '/es/home' }] });

    expect(resultPages.length).toBe(2);
    expect(service.getPagesByLang('en').length).toBe(1);
    expect(service.getPagesByLang('es').length).toBe(1);
    expect(service.siteSnapshot?.pages?.length).toBe(2);
  });

  it('should resolve page path by page id and language', () => {
    service.configSitesByLanguage = {
      en: [{ pageId: '10', path: '/en/results' }],
    };

    expect(service.getPathByPageId('10', 'en')).toBe('/en/results');
    expect(service.getPathByPageId(undefined, 'en')).toBeUndefined();
  });

  it('should collect unique tab names by tabsId from page tabs and layout tabs', () => {
    service.configSitesByLanguage = {
      en: [
        {
          tabsId: 'booking',
          tabs: [{ name: 'overview', title: 'Overview', tabId: '1' }],
          layout: {
            rows: [
              {
                cols: [
                  {
                    tabsId: 'booking',
                    tabs: [{ name: 'details', title: 'Details', tabId: '2' }],
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

  it('should keep previously loaded routes when loading a new language', () => {
    let firstLoadPages: any[] = [];
    let secondLoadPages: any[] = [];

    service.loadSite(['en']).subscribe((result) => {
      firstLoadPages = result.pages;
    });

    const enReq = httpMock.expectOne('/assets/config-site/en');
    enReq.flush({ pages: [{ pageId: '0', path: '/en/home' }] });

    expect(firstLoadPages).toEqual([{ pageId: '0', path: '/en/home' }]);

    service.loadSite(['es']).subscribe((result) => {
      secondLoadPages = result.pages;
    });

    const esReq = httpMock.expectOne('/assets/config-site/es');
    esReq.flush({ pages: [{ pageId: '0', path: '/es/home' }] });

    expect(service.getPagesByLang('en')).toEqual([{ pageId: '0', path: '/en/home' }]);
    expect(service.getPagesByLang('es')).toEqual([{ pageId: '0', path: '/es/home' }]);
    expect(secondLoadPages).toEqual([
      { pageId: '0', path: '/en/home' },
      { pageId: '0', path: '/es/home' },
    ]);
  });
});
