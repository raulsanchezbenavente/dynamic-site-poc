import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ToastStickyBehaviorService } from './toast-sticky-behavior.service';

function createRect(top: number, right: number = 0): DOMRect {
  return {
    x: 0,
    y: top,
    width: 300,
    height: 40,
    top,
    right,
    bottom: top + 40,
    left: right - 300,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('ToastStickyBehaviorService', () => {
  let service: ToastStickyBehaviorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastStickyBehaviorService],
    });

    service = TestBed.inject(ToastStickyBehaviorService);
    document.documentElement.style.setProperty('--header-height', '50px');
  });

  afterEach(() => {
    service.cleanupAll();
    document.documentElement.style.removeProperty('--header-height');
    document.body.innerHTML = '';
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should activate sticky mode when toast reaches threshold', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 0));
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();
    expect(toast.style.top).toBe('82px');
  }));

  it('should keep absolute mode when toast is above sticky threshold', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(300, 0));

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeFalse();
    expect(toast.style.top).toBe('0px');
  }));

  it('should calculate and apply right in desktop widths', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 1000));
    spyOn(toast, 'getBoundingClientRect').and.returnValue(createRect(0, 1000));
    spyOnProperty(document.documentElement, 'clientWidth', 'get').and.returnValue(1300);
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.style.right).toBe('300px');
  }));

  it('should calculate and apply right in non-desktop widths', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 300));
    spyOn(toast, 'getBoundingClientRect').and.returnValue(createRect(0, 300));
    spyOnProperty(document.documentElement, 'clientWidth', 'get').and.returnValue(390);
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();
    expect(toast.style.right).toBe('90px');
  }));

  it('cleanup function should restore original inline styles and remove sticky class', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '10px';
    toast.style.right = '20px';
    toast.style.left = '30px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 0));
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    const cleanup = service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();

    cleanup();

    expect(toast.classList.contains('toast--sticky-active')).toBeFalse();
    expect(toast.style.top).toBe('10px');
    expect(toast.style.right).toBe('20px');
    expect(toast.style.left).toBe('30px');
  }));

  it('detach should remove sticky behavior for a specific toast', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 0));
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();

    service.detach(toast);

    expect(toast.classList.contains('toast--sticky-active')).toBeFalse();
  }));

  it('should not override left style when activating sticky mode', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';
    toast.style.left = '16px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 500));
    spyOn(toast, 'getBoundingClientRect').and.returnValue(createRect(0, 500));
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();
    expect(toast.style.left).toBe('16px');
  }));

  it('should use only viewportOffset as threshold when --header-height is not set', fakeAsync(() => {
    document.documentElement.style.removeProperty('--header-height');

    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 0));
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();
    // threshold = 0 (no header) + 32 (offset) = 32
    expect(toast.style.top).toBe('32px');
  }));

  it('should recapture offsets on resize and recalculate right', fakeAsync(() => {
    const container = document.createElement('div');
    const toast = document.createElement('div');
    toast.style.top = '0px';

    const containerSpy = spyOn(container, 'getBoundingClientRect').and.returnValue(createRect(0, 800));
    const toastSpy = spyOn(toast, 'getBoundingClientRect').and.returnValue(createRect(0, 800));
    spyOnProperty(document.documentElement, 'clientWidth', 'get').and.returnValue(1000);
    spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(100);

    document.body.appendChild(container);
    document.body.appendChild(toast);

    service.attachStickyBehavior(toast, container, 32);
    tick(20);

    expect(toast.classList.contains('toast--sticky-active')).toBeTrue();
    expect(toast.style.right).toBe('200px');

    // Simulate resize: container is now narrower (right = 600)
    containerSpy.and.returnValue(createRect(0, 600));
    toastSpy.and.returnValue(createRect(0, 600));

    window.dispatchEvent(new Event('resize'));
    tick(20);

    // After resize recapture: right = 1000 - 600 + 0 = 400
    expect(toast.style.right).toBe('400px');
  }));
});
