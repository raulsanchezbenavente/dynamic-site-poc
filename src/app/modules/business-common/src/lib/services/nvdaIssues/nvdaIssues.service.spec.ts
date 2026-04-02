import { TestBed } from '@angular/core/testing';

import { DetectionsService } from '../detections/detections.service';
import { Browser } from '../models/browsers.enum';
import { NvdaIssuesService } from './nvdaIssues.service';

describe('NvdaIssuesService', () => {
  let service: NvdaIssuesService;
  let detectionsService: jasmine.SpyObj<DetectionsService>;

  beforeEach(() => {
    const detectionsServiceSpy = jasmine.createSpyObj('DetectionsService', ['getBrowser']);

    TestBed.configureTestingModule({
      providers: [NvdaIssuesService, { provide: DetectionsService, useValue: detectionsServiceSpy }],
    });

    service = TestBed.inject(NvdaIssuesService);
    detectionsService = TestBed.inject(DetectionsService) as jasmine.SpyObj<DetectionsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isEventFromMouse', () => {
    it('should return true when event is null', () => {
      expect(service.isEventFromMouse(null)).toBe(true);
    });

    it('should return true when event is undefined', () => {
      expect(service.isEventFromMouse(undefined)).toBe(true);
    });

    it('should return false when event has clientX and clientY both equal to 0', () => {
      detectionsService.getBrowser.and.returnValue(Browser.Chrome);
      const event = new MouseEvent('click', { clientX: 0, clientY: 0 });
      expect(service.isEventFromMouse(event)).toBe(false);
    });

    describe('Chrome/Edge browser', () => {
      it('should return true when sourceCapabilities exists', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Chrome);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        Object.defineProperty(event, 'sourceCapabilities', {
          value: { firesTouchEvents: false },
          configurable: true,
        });
        expect(service.isEventFromMouse(event)).toBe(true);
      });

      it('should return false when sourceCapabilities is undefined', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Chrome);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        expect(service.isEventFromMouse(event)).toBe(false);
      });

      it('should work for Edge browser', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Edge);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        Object.defineProperty(event, 'sourceCapabilities', {
          value: { firesTouchEvents: false },
          configurable: true,
        });
        expect(service.isEventFromMouse(event)).toBe(true);
      });
    });

    describe('Firefox browser', () => {
      it('should return true when pointerType is "mouse"', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Firefox);
        const event = new PointerEvent('click', { clientX: 10, clientY: 10, pointerType: 'mouse' });
        expect(service.isEventFromMouse(event)).toBe(true);
      });

      it('should return false when pointerType is not "mouse"', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Firefox);
        const event = new PointerEvent('click', { clientX: 10, clientY: 10, pointerType: 'pen' });
        expect(service.isEventFromMouse(event)).toBe(false);
      });

      it('should return false when pointerType is "touch"', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Firefox);
        const event = new PointerEvent('click', { clientX: 10, clientY: 10, pointerType: 'touch' });
        expect(service.isEventFromMouse(event)).toBe(false);
      });
    });

    describe('Safari browser', () => {
      it('should return true when offsetX and offsetY are not both 0', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Safari);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        Object.defineProperty(event, 'offsetX', { value: 5, configurable: true });
        Object.defineProperty(event, 'offsetY', { value: 5, configurable: true });
        expect(service.isEventFromMouse(event)).toBe(true);
      });

      it('should return false when offsetX and offsetY are both 0', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Safari);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        Object.defineProperty(event, 'offsetX', { value: 0, configurable: true });
        Object.defineProperty(event, 'offsetY', { value: 0, configurable: true });
        expect(service.isEventFromMouse(event)).toBe(false);
      });

      it('should return true when only offsetX is 0', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Safari);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        Object.defineProperty(event, 'offsetX', { value: 0, configurable: true });
        Object.defineProperty(event, 'offsetY', { value: 5, configurable: true });
        expect(service.isEventFromMouse(event)).toBe(true);
      });
    });

    describe('Unknown browser', () => {
      it('should return true for unknown browser', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Unknown);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        expect(service.isEventFromMouse(event)).toBe(true);
      });
    });

    describe('Other browsers', () => {
      it('should return true for Opera browser', () => {
        detectionsService.getBrowser.and.returnValue(Browser.Opera);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        expect(service.isEventFromMouse(event)).toBe(true);
      });

      it('should return true for IE browser', () => {
        detectionsService.getBrowser.and.returnValue(Browser.IE);
        const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
        expect(service.isEventFromMouse(event)).toBe(true);
      });
    });
  });

  describe('isEventFromKeyboard', () => {
    it('should return false when event is from mouse', () => {
      detectionsService.getBrowser.and.returnValue(Browser.Chrome);
      const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
      Object.defineProperty(event, 'sourceCapabilities', {
        value: { firesTouchEvents: false },
        configurable: true,
      });
      expect(service.isEventFromKeyboard(event)).toBe(false);
    });

    it('should return true when event is not from mouse', () => {
      detectionsService.getBrowser.and.returnValue(Browser.Chrome);
      const event = new MouseEvent('click', { clientX: 10, clientY: 10 });
      expect(service.isEventFromKeyboard(event)).toBe(true);
    });

    it('should return false when event is null', () => {
      expect(service.isEventFromKeyboard(null)).toBe(false);
    });

    it('should return false when event is undefined', () => {
      expect(service.isEventFromKeyboard(undefined)).toBe(false);
    });

    it('should return true when clientX and clientY are both 0', () => {
      detectionsService.getBrowser.and.returnValue(Browser.Firefox);
      const event = new MouseEvent('click', { clientX: 0, clientY: 0 });
      expect(service.isEventFromKeyboard(event)).toBe(true);
    });
  });
});
