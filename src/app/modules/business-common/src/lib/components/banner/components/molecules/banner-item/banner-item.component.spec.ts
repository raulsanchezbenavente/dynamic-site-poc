import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, SimpleChange } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BannerItemComponent } from './banner-item.component';
import { BannerItemConfig } from '../../../models/banner-item.config.model';
import { BannerItemStyle, BannerType } from '../../../enums';
import { BANNER_BREAKPOINT_CONFIG, BUSINESS_CONFIG, EnumVerticalAlign, GenerateIdPipe, HorizontalAlign, LayoutSize, LinkTarget } from '@dcx/ui/libs';
import { BANNER_DEFAULT_CONFIG, BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';

class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({
      'Banner.LowestPrice_Label': 'From',
    });
  }
}


describe('BannerItemComponent', () => {
  let component: BannerItemComponent;
  let fixture: ComponentFixture<BannerItemComponent>;
  let mockGenerateIdPipe: jasmine.SpyObj<GenerateIdPipe>;

  const mockBannerItemConfig: BannerItemConfig = {
    configuration: {
      enableLowestPrice: true,
      isFullAreaClickable: false,
      showButton: true,
      link: {
        url: 'https://example.com',
        target: LinkTarget.BLANK,
      },
    },
    content: {
      title: 'Test Banner Title',
      subtitle: 'Test Banner Subtitle',
      text: 'Test Banner Text',
      footnote: '<a href="#">Test Link</a>',
      bannerType: BannerType.GENERIC,
      lowestPrice: {
        USD: 100,
        EUR: 85,
      },
    },
    media: {
      imageMedia: {
        bg: { title: 'Test Image', url: 'test-image.jpg' },
        text: 'Test banner image',
      },
    },
    layout: {
      bannerStyle: BannerItemStyle.DEFAULT,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: EnumVerticalAlign.MIDDLE,
      fontSize: LayoutSize.MEDIUM,
    },
    tags: ['US'],
  };

  beforeEach(async () => {
    mockGenerateIdPipe = jasmine.createSpyObj('GenerateIdPipe', ['transform']);
    mockGenerateIdPipe.transform.and.returnValue('test-banner-item-id');

    await TestBed.configureTestingModule({
      imports: [
        BannerItemComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: GenerateIdPipe, useValue: mockGenerateIdPipe },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
        { provide: BANNER_BREAKPOINT_CONFIG, useValue: BANNER_DEFAULT_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerItemComponent);
    component = fixture.componentInstance;
    // Create a fresh copy of the config for each test to avoid mutation issues
    component.config = JSON.parse(JSON.stringify(mockBannerItemConfig));
    component.index = 0;
    component.isCarouselItem = false;
    component.currency = 'USD';
    // Don't call fixture.detectChanges() or ngOnInit() here - let each test control initialization
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct lowestPrice when currency is provided', () => {
      component.ngOnInit();

      expect(component.lowestPrice.currency).toBe('USD');
      expect(component.lowestPrice.price).toBe(100);
      expect(component.lowestPrice.isEnabled).toBe(true);
      expect(component.lowestPrice.label).toBe('Banner.LowestPrice_Label');
    });

    it('should disable lowestPrice when enableLowestPrice is false', () => {
      component.config.configuration.enableLowestPrice = false;
      component.ngOnInit();

      expect(component.lowestPrice.isEnabled).toBe(false);
    });

    it('should disable lowestPrice when price is 0 or undefined', () => {
      component.config.content.lowestPrice = { USD: 0 };
      component.ngOnInit();
      expect(component.lowestPrice.isEnabled).toBe(false);

      component.config.content.lowestPrice = undefined;
      component.ngOnInit();
      expect(component.lowestPrice.isEnabled).toBe(false);
    });

    it('should set layout classes correctly including video and style classes', () => {
      component.ngOnInit();

      expect(component.layoutClasses).toContain('banner-item-html--style-default');
      expect(component.layoutClasses).toContain('banner-item-html--halign-center');
      expect(component.layoutClasses).toContain('banner-item-html--valign-middle');
      expect(component.layoutClasses).toContain('banner-item-html--fontsize-medium');
    });

    it('should add has-video class when videoMedia is present', () => {
      component.config.media.videoMedia = {
        sourceOption: 'upload',
        text: 'Test video',
        upload: {
          url: 'test-video.mp4',
          extension: 'mp4',
          height: '720',
          width: '1280',
          autoplay: true,
          muted: true,
          controls: false,
          loop: true,
        },
      } as any;

      component.ngOnInit();

      expect(component.layoutClasses).toContain('banner-item-html--has-video');
    });
  });

  describe('Currency changes', () => {
    it('should update lowestPrice when currency changes', () => {
      component.ngOnInit();
      expect(component.lowestPrice.price).toBe(100);

      component.currency = 'EUR';
      component.ngOnChanges({
        currency: new SimpleChange('USD', 'EUR', false),
      });

      expect(component.lowestPrice.currency).toBe('EUR');
      expect(component.lowestPrice.price).toBe(85);
    });

    it('should not reinitialize when other properties change', () => {
      spyOn<any>(component, 'internalInit');
      component.ngOnChanges({
        index: new SimpleChange(0, 1, false),
      });

      expect(component['internalInit']).not.toHaveBeenCalled();
    });
  });

  describe('Footnote and links management', () => {
    it('should set innerHTML and manage tabindex for hidden carousel items', () => {
      const mockElement = document.createElement('div');
      const link = document.createElement('a');
      link.href = '#';
      mockElement.appendChild(link);
      
      component.bannerItemCaptionFootnote = new ElementRef(mockElement);
      component.isCarouselItem = true;
      component.index = 1;
      component.selectedSlideIndex = 0;
      component.ngOnInit();
      component.ngAfterViewInit();

      // innerHTML is set by ngAfterViewInit
      expect(mockElement.innerHTML).toBe('<a href="#" tabindex="-1">Test Link</a>');
      expect(mockElement.querySelector('a')?.getAttribute('tabindex')).toBe('-1');
    });

    it('should not set tabindex for visible carousel items', () => {
      const mockElement = document.createElement('div');
      const link = document.createElement('a');
      link.href = '#';
      mockElement.appendChild(link);
      
      component.bannerItemCaptionFootnote = new ElementRef(mockElement);
      component.isCarouselItem = true;
      component.index = 0;
      component.selectedSlideIndex = 0;
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(mockElement.querySelector('a')?.getAttribute('tabindex')).toBeNull();
    });
  });

  describe('Click handling', () => {
    beforeEach(() => {
      spyOn(globalThis, 'open');
    });

    it('should open link when isFullAreaClickable is true', () => {
      component.config.configuration.isFullAreaClickable = true;

      const result = component.onClick(component.config);

      // El config tiene target: LinkTarget.BLANK (_blank)
      expect(globalThis.open).toHaveBeenCalledWith('https://example.com', LinkTarget.BLANK);
      expect(result).toBe(true);
    });

    it('should use default _self target when not specified', () => {
      component.config.configuration.isFullAreaClickable = true;
      component.config.configuration.link = { url: 'https://example.com' };

      component.onClick(component.config);

      expect(globalThis.open).toHaveBeenCalledWith('https://example.com', '_self');
    });

    it('should not open link when isFullAreaClickable is false', () => {
      const result = component.onClick(component.config);

      expect(globalThis.open).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('Focus and blur events', () => {
    it('should emit fullClickFocus only when not triggered by mouse down', () => {
      const emitSpy = spyOn(component.fullClickFocus, 'emit');
      
      component['isMouseDownFullClick'] = false;
      component.onFullClickFocus();
      expect(emitSpy).toHaveBeenCalled();

      emitSpy.calls.reset();
      component['isMouseDownFullClick'] = true;
      component.onFullClickFocus();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit fullClickBlur and reset mouse down flag', () => {
      spyOn(component.fullClickBlur, 'emit');
      component['isMouseDownFullClick'] = true;

      component.onFullClickBlur();

      expect(component['isMouseDownFullClick']).toBe(false);
      expect(component.fullClickBlur.emit).toHaveBeenCalled();
    });

    it('should set mouse down flag on onFullClickMouseDown', () => {
      component['isMouseDownFullClick'] = false;
      component.onFullClickMouseDown();
      expect(component['isMouseDownFullClick']).toBe(true);
    });
  });
});

