import { ViewportSizeService } from './viewport-size.service';

describe('ViewportSizeService', () => {
  let service: ViewportSizeService;

  beforeEach(() => {
    service = new ViewportSizeService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get viewport height and width', () => {
    expect(typeof service.getViewportHeight()).toBe('number');
    expect(typeof (service as any).getViewportWidth()).toBe('number');
  });

  it('should set custom property for width and height', () => {
    spyOn(document.documentElement.style, 'setProperty');
    service.setComputeViewportWidth();
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--vw', jasmine.any(String));
    service.setComputeViewportHeight();
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--vh', jasmine.any(String));
  });

  it('should get component layout breakpoint', () => {
    spyOn(globalThis, 'getComputedStyle').and.returnValue({ getPropertyValue: () => '768px' } as any);
    const result = service.getComponentLayoutBreakpoint('--my-var');
    expect(result).toBe(768);
  });

  it('should unsubscribe on destroy', () => {
    const sub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (service as any).subscriptions = [sub];
    service.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});
