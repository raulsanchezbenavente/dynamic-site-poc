import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppLang, PageNavigationService, RouterHelperService, SiteConfigService } from '@navigation';
import { LanguageSwitchService } from './language-switch.service';

describe('LanguageSwitchService', () => {
  let service: LanguageSwitchService;
  let siteConfigService: jasmine.SpyObj<SiteConfigService>;
  let pageNavigationService: jasmine.SpyObj<PageNavigationService>;
  let routerHelperService: jasmine.SpyObj<RouterHelperService>;
  let router: jasmine.SpyObj<Router>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const siteConfigSpy = jasmine.createSpyObj('SiteConfigService', [
      'markRouteAsVisited',
      'loadSite',
      'pruneLanguageKeepingVisitedRoutes',
      'getTabsIdByPageId',
      'getTabNamesByTabsId',
    ]);

    const pageNavigationSpy = jasmine.createSpyObj('PageNavigationService', ['resolvePagePath']);
    const routerHelperSpy = jasmine.createSpyObj('RouterHelperService', ['getCurrentPageId', 'changeLanguage'], {
      language: 'en' as AppLang,
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['use']);

    TestBed.configureTestingModule({
      providers: [
        LanguageSwitchService,
        { provide: SiteConfigService, useValue: siteConfigSpy },
        { provide: PageNavigationService, useValue: pageNavigationSpy },
        { provide: RouterHelperService, useValue: routerHelperSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(LanguageSwitchService);
    siteConfigService = TestBed.inject(SiteConfigService) as jasmine.SpyObj<SiteConfigService>;
    pageNavigationService = TestBed.inject(PageNavigationService) as jasmine.SpyObj<PageNavigationService>;
    routerHelperService = TestBed.inject(RouterHelperService) as jasmine.SpyObj<RouterHelperService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    siteConfigService.loadSite.and.returnValue(of({ pages: [] }));
    routerHelperService.getCurrentPageId.and.returnValue('home-page');
    pageNavigationService.resolvePagePath.and.returnValue('/es/home');
    router.navigateByUrl.and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load site with target language', (done) => {
    service.switchLanguage('es' as AppLang).subscribe(() => {
      expect(siteConfigService.loadSite).toHaveBeenCalledWith(['es']);
      done();
    });
  });

  it('should resolve page path in new language', (done) => {
    service.switchLanguage('es' as AppLang).subscribe(() => {
      expect(pageNavigationService.resolvePagePath).toHaveBeenCalledWith('home-page', 'es');
      done();
    });
  });

  it('should navigate to resolved page', (done) => {
    service.switchLanguage('es' as AppLang).subscribe(() => {
      const navigatedUrl = router.navigateByUrl.calls.mostRecent().args[0] as string;
      expect(navigatedUrl).toContain('/es/home');
      done();
    });
  });

  it('should not prune if navigation fails', (done) => {
    router.navigateByUrl.and.returnValue(Promise.resolve(false));
    service.switchLanguage('es' as AppLang).subscribe(() => {
      setTimeout(() => {
        expect(siteConfigService.pruneLanguageKeepingVisitedRoutes).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  it('should prune previous language after successful navigation', (done) => {
    service.switchLanguage('es' as AppLang).subscribe(() => {
      setTimeout(() => {
        expect(siteConfigService.pruneLanguageKeepingVisitedRoutes).toHaveBeenCalledWith('en');
        done();
      }, 50);
    });
  });

  it('should update language services after navigation', (done) => {
    service.switchLanguage('es' as AppLang).subscribe(() => {
      setTimeout(() => {
        expect(translateService.use).toHaveBeenCalledWith('es');
        expect(routerHelperService.changeLanguage).toHaveBeenCalledWith('es');
        done();
      }, 50);
    });
  });

  it('should handle language switch without page context', (done) => {
    routerHelperService.getCurrentPageId.and.returnValue(undefined);
    service.switchLanguage('es' as AppLang).subscribe(() => {
      setTimeout(() => {
        expect(translateService.use).toHaveBeenCalledWith('es');
        expect(routerHelperService.changeLanguage).toHaveBeenCalledWith('es');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });
});
