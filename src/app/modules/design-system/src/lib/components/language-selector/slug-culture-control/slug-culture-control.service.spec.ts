import { TestBed } from '@angular/core/testing';
import { SlugCultureControlService } from './slug-culture-control.service';

describe('SlugCultureControlService', () => {
  let service: SlugCultureControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlugCultureControlService);
  });

  function mockLocation(search: string, pathname: string): void {
    // Update the browser URL without reloading; affects both document.location and window.location
    const url = `${pathname}${search}`;
    window.history.pushState({}, '', url);
  }

  it('should emit original search when no activeTab is present', (done) => {
    mockLocation('?foo=bar', '/en/my-page');

    service.getFixedParameters('es').subscribe((val) => {
      expect(val).toBe('?foo=bar');
      done();
    });
  });

  it('should replace activeTab with translated title from API', (done) => {
    const originalSearch = '?activeTab=My%20Trips&foo=bar';
    mockLocation(originalSearch, '/en/account');

    const fetchResponse = {
      json: () => Promise.resolve({ translatedTabTitle: 'Datos Personales' }),
    } as Response;

    const fetchSpy = spyOn(window as any, 'fetch').and.returnValue(Promise.resolve(fetchResponse));

    service.getFixedParameters('es').subscribe((val) => {
      // activeTab replaced, other params preserved
      expect(val).toBe('?activeTab=Datos+Personales&foo=bar');

      // ensure fetch called with expected query params
      const calledUrl: string = fetchSpy.calls.mostRecent().args[0] as string;
      expect(calledUrl).toContain('nodeName=Members');
      expect(calledUrl).toContain('currentLang=en');
      expect(calledUrl).toContain('nextLang=es');
      expect(calledUrl).toContain('activeTab=My%20Trips');
      done();
    });
  });

  it('should fall back to original search on fetch error', (done) => {
    const originalSearch = '?activeTab=My%20Trips';
    mockLocation(originalSearch, '/en/home');

    spyOn(window as any, 'fetch').and.returnValue(Promise.reject(new Error('Network error')));
    spyOn(console, 'error');

    service.getFixedParameters('es').subscribe((val) => {
      expect(val).toBe(originalSearch);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching active tab translation:',
        jasmine.any(Error)
      );
      done();
    });
  });
});
