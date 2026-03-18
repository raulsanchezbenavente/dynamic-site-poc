import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { RouterHelperService } from '../router-helper/router-helper.service';
import { SiteConfigService } from '../site-config/site-config.service';
import { PageNavigationService } from './page-navigation.service';

describe('PageNavigationService', () => {
  let service: PageNavigationService;
  let routerSpy: jasmine.SpyObj<Router>;
  let siteConfigSpy: jasmine.SpyObj<SiteConfigService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    routerSpy.navigateByUrl.and.resolveTo(true);

    siteConfigSpy = jasmine.createSpyObj<SiteConfigService>('SiteConfigService', ['getPathByPageId']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: SiteConfigService, useValue: siteConfigSpy },
        { provide: RouterHelperService, useValue: { language: 'en' } },
      ],
    });

    service = TestBed.inject(PageNavigationService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate internal route with encoded query params', async () => {
    await service.navigateByPath('/en/home', false, false, { q: 'a b', x: '1&2' });

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/en/home?q=a%20b&x=1%262');
  });

  it('should open a new tab when targetBlank is true', async () => {
    const openSpy = spyOn(globalThis, 'open').and.returnValue(null);

    const result = await service.navigateByPath('/en/home', false, true);

    expect(result).toBeTrue();
    expect(openSpy).toHaveBeenCalledWith('/en/home', '_blank', 'noopener,noreferrer');
  });

  it('should resolve fallback path when page id is unknown', () => {
    siteConfigSpy.getPathByPageId.and.returnValue(undefined);

    expect(service.resolvePagePath('missing', 'en')).toBe('/en/home');
  });

  it('should navigate by page id using resolved path', async () => {
    siteConfigSpy.getPathByPageId.and.returnValue('/es/home');

    await service.navigateByPageId('1', 'es');

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/es/home');
  });
});
