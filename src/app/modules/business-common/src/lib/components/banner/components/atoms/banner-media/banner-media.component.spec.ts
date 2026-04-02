import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { BannerMediaComponent } from './banner-media.component';
import { BANNER_BREAKPOINT_CONFIG, IBannerImageBreakpointsConfig, VideoSourceOption } from '@dcx/ui/libs';
import { BannerCanPlay } from '../../../enums';
import { BannerMediaConfig } from '../../../models';

describe('BannerMediaComponent', () => {
  let component: BannerMediaComponent;
  let fixture: ComponentFixture<BannerMediaComponent>;
  let mockBannerConfig: IBannerImageBreakpointsConfig;

  const mockImageMediaConfig: BannerMediaConfig = {
    imageMedia: {
      bg: { title: 'Test Image', url: 'test-image.jpg' },
      bgM: { title: 'Test Image Medium', url: 'test-image-m.jpg' },
      bgL: { title: 'Test Image Large', url: 'test-image-l.jpg' },
      text: 'Test banner image',
    },
  };

  const mockVideoMediaConfig: BannerMediaConfig = {
    videoMedia: {
      sourceOption: VideoSourceOption.UPLOAD,
      text: 'Test banner video',
      upload: {
        extension: 'mp4',
        height: '720',
        width: '1280',
        autoplay: true,
        muted: true,
        controls: false,
        url: 'test-video.mp4',
        loop: true,
      },
      fallbackImage: {
        bg: { title: 'Fallback Image', url: 'fallback-image.jpg' },
        text: 'Fallback image',
      },
    },
  };

  beforeEach(async () => {
    mockBannerConfig = {
      layout: {
        sizeUnit: 'px',
        breakpoints: {
          mediumSize: 768,
          largeSize: 1024,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [BannerMediaComponent],
      providers: [{ provide: BANNER_BREAKPOINT_CONFIG, useValue: mockBannerConfig }],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerMediaComponent);
    component = fixture.componentInstance;
    component.config = mockImageMediaConfig;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should check video support on initialization', () => {
      spyOn<any>(component, 'checkVideoSupport');

      component.ngOnInit();

      expect(component['checkVideoSupport']).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should create and observe video player with IntersectionObserver when available', () => {
      const mockObserver = {
        observe: jasmine.createSpy('observe'),
        disconnect: jasmine.createSpy('disconnect'),
      };
      spyOn(globalThis, 'IntersectionObserver' as any).and.returnValue(mockObserver);
      const videoElement = document.createElement('video');
      component.videoPlayer = new ElementRef(videoElement);

      component.ngAfterViewInit();

      expect(globalThis.IntersectionObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalledWith(videoElement);
    });

    it('should not throw when IntersectionObserver is unavailable', () => {
      const originalIntersectionObserver = (globalThis as any).IntersectionObserver;
      delete (globalThis as any).IntersectionObserver;

      expect(() => component.ngAfterViewInit()).not.toThrow();

      (globalThis as any).IntersectionObserver = originalIntersectionObserver;
    });
  });

  describe('intersectionHandler', () => {
    let mockVideoElement: jasmine.SpyObj<HTMLVideoElement>;

    beforeEach(() => {
      mockVideoElement = jasmine.createSpyObj('HTMLVideoElement', ['play', 'pause']);
      mockVideoElement.play.and.returnValue(Promise.resolve());
      component.videoPlayer = { nativeElement: mockVideoElement } as ElementRef<HTMLVideoElement>;
      // Create a fresh copy of the config to avoid mutation between tests
      component.config = JSON.parse(JSON.stringify(mockVideoMediaConfig)); 
    });

    it('should play video when intersecting and autoplay is enabled', () => {
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: true } as IntersectionObserverEntry,
      ];

      component.intersectionHandler(mockEntries);

      expect(mockVideoElement.play).toHaveBeenCalled();
      expect(mockVideoElement.pause).not.toHaveBeenCalled();
    });

    it('should pause video when not intersecting', () => {
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: false } as IntersectionObserverEntry,
      ];

      component.intersectionHandler(mockEntries);

      expect(mockVideoElement.pause).toHaveBeenCalled();
      expect(mockVideoElement.play).not.toHaveBeenCalled();
    });

    it('should not play video when autoplay is disabled', () => {
      component.config.videoMedia!.upload.autoplay = false;
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: true } as IntersectionObserverEntry,
      ];

      component.intersectionHandler(mockEntries);

      expect(mockVideoElement.play).not.toHaveBeenCalled();
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });
  });

  describe('checkVideoSupport', () => {
    let mockVideo: jasmine.SpyObj<HTMLVideoElement>;

    beforeEach(() => {
      mockVideo = jasmine.createSpyObj('HTMLVideoElement', ['canPlayType']);
      spyOn(document, 'createElement').and.returnValue(mockVideo as any);
    });

    it('should check video type support and handle unsupported formats', () => {
      component.config = mockVideoMediaConfig;
      mockVideo.canPlayType.and.returnValue('');
      spyOn<any>(component, 'changeVideoToPicture');

      component['checkVideoSupport']();
      mockVideo.onloadedmetadata!(new Event('loadedmetadata'));

      expect(document.createElement).toHaveBeenCalledWith('video');
      expect(mockVideo.src).toBe('test-video.mp4');
      expect(mockVideo.canPlayType).toHaveBeenCalledWith('video/mp4');
      expect(component['changeVideoToPicture']).toHaveBeenCalled();
    });

    it('should not fallback to image when video format is supported', () => {
      component.config = mockVideoMediaConfig;
      mockVideo.canPlayType.and.returnValue(BannerCanPlay.PROBABLY);
      spyOn<any>(component, 'changeVideoToPicture');

      component['checkVideoSupport']();
      mockVideo.onloadedmetadata!(new Event('loadedmetadata'));

      expect(component['changeVideoToPicture']).not.toHaveBeenCalled();
    });

    it('should fallback to image when video loading fails', () => {
      component.config = mockVideoMediaConfig;
      spyOn<any>(component, 'changeVideoToPicture');

      component['checkVideoSupport']();
      mockVideo.onerror!(new Event('error'));

      expect(component['changeVideoToPicture']).toHaveBeenCalled();
    });

    it('should not check video support when only imageMedia is present', () => {
      component.config = mockImageMediaConfig;

      component['checkVideoSupport']();

      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('changeVideoToPicture', () => {
    it('should replace config with fallback image from videoMedia', () => {
      component.config = mockVideoMediaConfig;

      component['changeVideoToPicture']();

      expect(component.config.imageMedia).toEqual(mockVideoMediaConfig.videoMedia!.fallbackImage);
    });
  });

  describe('template rendering', () => {
    it('should render picture element with responsive sources for imageMedia', () => {
      component.config = mockImageMediaConfig;
      fixture.detectChanges();

      const picture = fixture.nativeElement.querySelector('picture.banner-media_image');
      const sources = fixture.nativeElement.querySelectorAll('source');
      const img = fixture.nativeElement.querySelector('img');

      expect(picture).toBeTruthy();
      expect(sources.length).toBe(2);
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('test-image.jpg');
      expect(img.getAttribute('alt')).toBe('Test banner image');
      expect(img.getAttribute('loading')).toBe('lazy');
    });

    it('should render video element with correct attributes for videoMedia', () => {
      component.config = mockVideoMediaConfig;
      fixture.detectChanges();

      const video = fixture.nativeElement.querySelector('video.banner-video');
      const source = fixture.nativeElement.querySelector('video source');

      expect(video).toBeTruthy();
      expect(video.getAttribute('width')).toBe('1280');
      expect(video.getAttribute('height')).toBe('720');
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.hasAttribute('playsinline')).toBe(true);
      expect(source.getAttribute('type')).toBe('video/mp4');
    });

    it('should only render imageMedia when videoMedia is not present', () => {
      component.config = mockImageMediaConfig;
      fixture.detectChanges();

      const picture = fixture.nativeElement.querySelector('picture');
      const video = fixture.nativeElement.querySelector('video');

      expect(picture).toBeTruthy();
      expect(video).toBeFalsy();
    });
  });

  describe('bannerConfig injection', () => {
    it('should inject and use banner breakpoint configuration', () => {
      expect(component.bannerConfig).toBeDefined();
      expect(component.bannerConfig.layout.sizeUnit).toBe('px');
      expect(component.bannerConfig.layout.breakpoints.mediumSize).toBe(768);
      expect(component.bannerConfig.layout.breakpoints.largeSize).toBe(1024);
    });
  });
});
