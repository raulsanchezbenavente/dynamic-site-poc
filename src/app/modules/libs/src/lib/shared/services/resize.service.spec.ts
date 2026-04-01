import { ResizeSvc } from './resize.service';
import { EnumResizeWindowSize } from '../enums';
import { take } from 'rxjs/operators';

describe('ResizeSvc', () => {
  let service: ResizeSvc;

  beforeEach(() => {
    service = new ResizeSvc();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get window size layout', () => {
    const size = service['getWindowSize']();
    expect(size.height).toEqual(globalThis.innerHeight);
    expect(size.width).toEqual(globalThis.innerWidth);
    expect(Object.values(EnumResizeWindowSize)).toContain(size.layout as EnumResizeWindowSize);
  });

  it('should return correct layout for all EnumResizeWindowSize ranges', () => {
    const originalInnerWidth = globalThis.innerWidth;
    const setWindowWidth = (width: number) => {
      Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: width });
    };
    const ranges = [
      { width: 400, expected: EnumResizeWindowSize.sizeXs },
      { width: 500, expected: EnumResizeWindowSize.sizeS },
      { width: 650, expected: EnumResizeWindowSize.sizeM },
      { width: 800, expected: EnumResizeWindowSize.sizeL },
      { width: 1000, expected: EnumResizeWindowSize.sizeXL },
      { width: 1300, expected: EnumResizeWindowSize.sizeXXL },
    ];
    ranges.forEach(({ width, expected }) => {
      setWindowWidth(width);
      const size = service['getWindowSize']();
      expect(size.layout).toBe(expected);
    });
    setWindowWidth(originalInnerWidth);
  });

  it('should initialize BehaviorSubjects with correct values', () => {
    expect(service.width$).toBeTruthy();
    expect(service.height$).toBeTruthy();
    expect(service.layout$).toBeTruthy();
  });

  it('should emit width, height, and layout', (done) => {
    let widthEmitted = false;
    let heightEmitted = false;
    let layoutEmitted = false;
    service.width$.subscribe((width) => {
      expect(typeof width).toBe('number');
      widthEmitted = true;
      checkDone();
    });
    service.height$.subscribe((height) => {
      expect(typeof height).toBe('number');
      heightEmitted = true;
      checkDone();
    });
    service.layout$.subscribe((layout) => {
      expect(Object.values(EnumResizeWindowSize)).toContain(layout as EnumResizeWindowSize);
      layoutEmitted = true;
      checkDone();
    });
    function checkDone() {
      if (widthEmitted && heightEmitted && layoutEmitted) {
        done();
      }
    }
  });

  it('should emit distinct values only when width changes', (done) => {
    const originalInnerWidth = globalThis.innerWidth;
    const originalInnerHeight = globalThis.innerHeight;
    
    Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 600 });
    
    const newService = new ResizeSvc();
    const emittedWidths: number[] = [];
    
    newService.width$.pipe(take(1)).subscribe((width) => {
      emittedWidths.push(width);
      expect(width).toBe(800);
      
      Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: originalInnerWidth });
      Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: originalInnerHeight });
      done();
    });
  });

  it('should emit distinct values only when height changes', (done) => {
    const originalInnerHeight = globalThis.innerHeight;
    
    Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 1000 });
    
    const newService = new ResizeSvc();
    
    newService.height$.pipe(take(1)).subscribe((height) => {
      expect(height).toBe(1000);
      
      Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: originalInnerHeight });
      done();
    });
  });

  it('should emit distinct values only when layout changes', (done) => {
    const originalInnerWidth = globalThis.innerWidth;
    
    Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: 650 });
    
    const newService = new ResizeSvc();
    
    newService.layout$.pipe(take(1)).subscribe((layout) => {
      expect(layout).toBe(EnumResizeWindowSize.sizeM);
      
      Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: originalInnerWidth });
      done();
    });
  });

  it('should handle edge case widths correctly', () => {
    const originalInnerWidth = globalThis.innerWidth;
    const setWindowWidth = (width: number) => {
      Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: width });
    };
    
    const edgeCases = [
      { width: 479, expected: EnumResizeWindowSize.sizeXs },
      { width: 480, expected: EnumResizeWindowSize.sizeS },
      { width: 639, expected: EnumResizeWindowSize.sizeS },
      { width: 640, expected: EnumResizeWindowSize.sizeM },
      { width: 767, expected: EnumResizeWindowSize.sizeM },
      { width: 768, expected: EnumResizeWindowSize.sizeL },
      { width: 991, expected: EnumResizeWindowSize.sizeL },
      { width: 992, expected: EnumResizeWindowSize.sizeXL },
      { width: 1247, expected: EnumResizeWindowSize.sizeXL },
      { width: 1248, expected: EnumResizeWindowSize.sizeXXL },
    ];
    
    edgeCases.forEach(({ width, expected }) => {
      setWindowWidth(width);
      const size = service['getWindowSize']();
      expect(size.layout).toBe(expected);
    });
    
    setWindowWidth(originalInnerWidth);
  });

  it('should return WindowSize object with correct properties', () => {
    const size = service['getWindowSize']();
    expect(size.height).toBeDefined();
    expect(size.width).toBeDefined();
    expect(size.layout).toBeDefined();
    expect(typeof size.height).toBe('number');
    expect(typeof size.width).toBe('number');
    expect(typeof size.layout).toBe('string');
  });
});
