import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerMediaComponent } from './banner-media.component';
import { BANNER_BREAKPOINT_CONFIG, IBannerImageBreakpointsConfig } from '@dcx/ui/libs';
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

  it('should render picture element with responsive sources for imageMedia', () => {
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
});
