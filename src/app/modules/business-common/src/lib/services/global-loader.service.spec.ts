import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { GlobalLoaderService } from './global-loader.service';

describe('GlobalLoaderService', () => {
  let service: GlobalLoaderService;
  let loaderElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalLoaderService],
    });

    service = TestBed.inject(GlobalLoaderService);

    loaderElement = document.createElement('div');
    loaderElement.id = 'nativeLoader';
    document.body.appendChild(loaderElement);
  });

  afterEach(() => {
    loaderElement.remove();
    document.documentElement.className = '';
  });

  it('shows the loader and applies the loading class when requested', () => {
    service.show();

    expect(loaderElement.style.display).toBe('flex');
    expect(document.documentElement.classList.contains('page--loading')).toBeTrue();
    expect(loaderElement.classList.contains('page-overlay-blocker')).toBeFalse();
  });

  it('only blocks interaction when requested without displaying the loader overlay', () => {
    service.show(true);

    expect(loaderElement.style.display).toBe('flex');
    expect(loaderElement.classList.contains('page-overlay-blocker')).toBeTrue();
    expect(document.documentElement.classList.contains('page--loading')).toBeFalse();
  });

  it('does not add the loading class when the page is already interactive', () => {
    document.documentElement.classList.add('page--interactive');

    service.show();

    expect(loaderElement.style.display).toBe('flex');
    expect(document.documentElement.classList.contains('page--loading')).toBeFalse();
  });

  it('hides the loader and cleans up classes after the configured delays', fakeAsync(() => {
    service.show();
    loaderElement.classList.add('page-overlay-blocker');
    document.documentElement.classList.add('page--loading', 'page--interactive');

    const timings = service as unknown as {
      ANTI_FLICKER_DELAY_MS: number;
      MIN_TIME_VISIBLE: number;
    };

    let resolved = false;
    const hidePromise = service.hide();
    hidePromise.then(() => {
      resolved = true;
    });

    tick(timings.ANTI_FLICKER_DELAY_MS + timings.MIN_TIME_VISIBLE);

    expect(loaderElement.style.display).toBe('none');
    expect(loaderElement.classList.contains('page-overlay-blocker')).toBeFalse();
    expect(document.documentElement.classList.contains('page--loading')).toBeFalse();
    expect(document.documentElement.classList.contains('page--interactive')).toBeFalse();
    expect(resolved).toBeTrue();
  }));
});
