import { TestBed } from '@angular/core/testing';
import { RedirectService } from '../redirect.service';
import { CultureServiceEx } from '../culture-service-ex/culture-ex.service';
import { WindowHelper } from '../../helpers/window-helper';
import { IbeEventRedirectType } from '../../models/ibe-event-redirect-type';

describe('RedirectService', () => {
  let service: RedirectService;
  let cultureServiceExMock: jasmine.SpyObj<CultureServiceEx>;
  let getLocationSpy: jasmine.Spy;

  beforeEach(() => {
    cultureServiceExMock = jasmine.createSpyObj<CultureServiceEx>('CultureServiceEx', ['getCulture']);

    TestBed.configureTestingModule({
      providers: [
        RedirectService,
        { provide: CultureServiceEx, useValue: cultureServiceExMock },
      ],
    });

    service = TestBed.inject(RedirectService);
    getLocationSpy = spyOn(WindowHelper, 'getLocation');
    getLocationSpy.and.returnValue({
      host: 'store.example.com',
      href: 'https://store.example.com/',
    } as any);
  });

  describe('getRedirect', () => {
    it('should replace {culture}/[culture] and {currentDomain}/[currentDomain]', () => {
      const url = 'https://{currentDomain}/{culture}/page?ref=[culture]@[currentDomain]';
      const result = service.getRedirect(url, 'es-ES');

      expect(result).toBe('https://example.com/es-ES/page?ref=es-ES@example.com');
    });

    it('should fallback to culture service when culture is null/undefined', () => {
      cultureServiceExMock.getCulture.and.returnValue('fr-FR');

      const url = 'https://{currentDomain}/{culture}/x';
      const result = service.getRedirect(url, null as any);

      expect(cultureServiceExMock.getCulture).toHaveBeenCalled();
      expect(result).toBe('https://example.com/fr-FR/x');
    });

    it('should map culture using cultureAlias when provided', () => {
      const aliases = new Map<string, string>([
        ['es', 'es-ES'],
        ['en', 'en-GB'],
      ]);

      const url = 'https://{currentDomain}/[culture]/x';
      const result = service.getRedirect(url, 'es', aliases);

      expect(result).toBe('https://example.com/es-ES/x');
    });

    it('should keep culture value when alias not found', () => {
      const aliases = new Map<string, string>([['xx', 'xx-YY']]);

      const url = 'https://{currentDomain}/[culture]/x';
      const result = service.getRedirect(url, 'es-ES', aliases);

      expect(result).toBe('https://example.com/es-ES/x');
    });
  });

  describe('getRedirectFromCurrentUrl', () => {
    it('should replace culture segment in current URL when present', () => {
      getLocationSpy.and.returnValue({
        host: 'store.example.com',
        href: 'https://store.example.com/en-US/products/list',
      } as any);

      const result = service.getRedirectFromCurrentUrl('es-ES');

      // Reemplaza "en-US" por "es-ES"
      expect(result).toBe('https://store.example.com/es-ES/products/list');
    });

    it('should append "{culture}/" when culture segment not present', () => {
      getLocationSpy.and.returnValue({
        host: 'store.example.com',
        href: 'https://store.example.com/products/',
      } as any);
      const result = service.getRedirectFromCurrentUrl('es-ES');
      expect(result).toBe('https://store.example.com/products/es-ES/');
    });
  });

  describe('isExternalUrl', () => {
    it('should return true for http/https', () => {
      expect(service.isExternalUrl('http://example.com')).toBeTrue();
      expect(service.isExternalUrl('https://example.com/path')).toBeTrue();
    });

    it('should return true for protocol-relative or www', () => {
      expect(service.isExternalUrl('//cdn.example.com/img.png')).toBeTrue();
      expect(service.isExternalUrl('www.example.com/page')).toBeTrue();
    });

    it('should return false for relative/internal paths', () => {
      expect(service.isExternalUrl('/internal/path')).toBeFalse();
      expect(service.isExternalUrl('relative')).toBeFalse();
      expect(service.isExternalUrl('#hash')).toBeFalse();
      expect(service.isExternalUrl('mailto:someone@example.com')).toBeFalse();
    });
  });

  describe('validateEventRedirectType', () => {
    it('should return externalRedirect for external urls', () => {
      const type = service.validateEventRedirectType('https://example.com');
      expect(type).toBe(IbeEventRedirectType.externalRedirect);
    });

    it('should return internalRedirect for internal urls', () => {
      const type = service.validateEventRedirectType('/home');
      expect(type).toBe(IbeEventRedirectType.internalRedirect);
    });
  });
});
