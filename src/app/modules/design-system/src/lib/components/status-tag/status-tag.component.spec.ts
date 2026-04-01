import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TextHelperService } from '@dcx/ui/libs';

import { StatusTagComponent } from './status-tag.component';
import { StatusTagStyles } from './enums/status-tag-styles.enum';
import { StatusTagType } from './enums/status-tag-type.enum';
import { StatusTagConfig } from './models/status-tag.config';

// Mock builders (outside describe - Sonar S7721)
const createConfig = (overrides?: Partial<StatusTagConfig>): StatusTagConfig => ({
  status: StatusTagType.SUCCESS,
  style: StatusTagStyles.DEFAULT,
  text: 'Active',
  ...overrides,
});

// Translation Mock
let mockTranslateService: jasmine.SpyObj<TranslateService>;
let mockTextHelperService: jasmine.SpyObj<TextHelperService>;
let langChangeSubject: Subject<any>;
let translationChangeSubject: Subject<any>;

describe('StatusTagComponent', () => {
  let component: StatusTagComponent<StatusTagType>;
  let fixture: ComponentFixture<StatusTagComponent<StatusTagType>>;

  beforeEach(async () => {
    // Initialize translation subjects with BehaviorSubject for immediate emission
    langChangeSubject = new BehaviorSubject<any>({ lang: 'es-CO' });
    translationChangeSubject = new BehaviorSubject<any>({ translations: {} });

    // Create typed spies using jasmine.createSpyObj with properties object
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: langChangeSubject.asObservable(),
      onTranslationChange: translationChangeSubject.asObservable(),
    });

    mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['toKebabCase']);

    // Configure spy behaviors
    mockTranslateService.instant.and.callFake((key: string) => key);
    mockTextHelperService.toKebabCase.and.callFake((text: string) => text.toLowerCase().replaceAll(/\s+/g, '-'));

    await TestBed.configureTestingModule({
      imports: [StatusTagComponent],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TextHelperService, useValue: mockTextHelperService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusTagComponent<StatusTagType>);
    component = fixture.componentInstance;
  });

  describe('Basic Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render status tag with valid config', () => {
      // Arrange
      const config = createConfig({ text: 'Confirmed' });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - DOM validation
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeTruthy();
      expect(statusTag.textContent?.trim()).toContain('Confirmed');
    });

    it('should not render when status is empty', () => {
      // Arrange
      const config = createConfig({ status: '' as StatusTagType });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeFalsy();
    });

    it('should render as span element for inline semantics', () => {
      // Arrange
      const config = createConfig();
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag?.tagName.toLowerCase()).toBe('span');
    });
  });

  describe('Status Type Variants', () => {
    const statusTypes = [
      StatusTagType.DEFAULT,
      StatusTagType.SUCCESS,
      StatusTagType.WARNING,
      StatusTagType.INFO,
      StatusTagType.ERROR,
      StatusTagType.INACTIVE,
      StatusTagType.PENDING,
      StatusTagType.BLOCKED,
    ];

    statusTypes.forEach((statusType) => {
      it(`should apply correct CSS class for ${statusType} status`, () => {
        // Arrange
        const config = createConfig({ status: statusType });
        fixture.componentRef.setInput('config', config);

        // Act
        TestBed.flushEffects();
        fixture.detectChanges();

        // Assert - DOM class validation
        const statusTag = fixture.nativeElement.querySelector('.status-tag');
        const expectedClass = `status-tag--type-${statusType}`;
        expect(statusTag.classList.contains(expectedClass)).toBe(true);
      });
    });
  });

  describe('Style Variants', () => {
    it('should apply default style class', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.DEFAULT });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--style-default')).toBe(true);
    });

    it('should apply filled style class', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.FILLED });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--style-filled')).toBe(true);
    });

    it('should apply outline style class', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.OUTLINE });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--style-outline')).toBe(true);
    });

    it('should apply no-icon class when style is NO_ICON', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.NO_ICON });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--no-icon')).toBe(true);
    });
  });

  describe('Icon Rendering', () => {
    it('should render icon with default style', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.DEFAULT });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - DOM validation
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeTruthy();
    });

    it('should render icon with filled style', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.FILLED });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeTruthy();
    });

    it('should render icon with outline style', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.OUTLINE });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeTruthy();
    });

    it('should NOT render icon when style is NO_ICON', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.NO_ICON });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should add role="img" to icon element', () => {
      // Arrange
      const config = createConfig({ style: StatusTagStyles.DEFAULT });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon.getAttribute('role')).toBe('img');
    });

    it('should add aria-label to icon element', () => {
      // Arrange
      const config = createConfig({ status: StatusTagType.SUCCESS });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const icon = fixture.nativeElement.querySelector('.status-tag_icon');
      const ariaLabel = icon.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Common.A11y.Status_Icon.Success');
    });

    it('should generate correct translation key for ARIA label', () => {
      // Arrange
      const config = createConfig({ status: StatusTagType.ERROR });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Common.A11y.Status_Icon.Error');
    });

    it('should handle uppercase status for ARIA label', () => {
      // Arrange
      const config = createConfig({ status: 'WARNING' as StatusTagType });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Common.A11y.Status_Icon.Warning');
    });
  });

  describe('Text Content', () => {
    it('should display provided text', () => {
      // Arrange
      const config = createConfig({ text: 'Payment Pending' });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const textSpan = fixture.nativeElement.querySelector('.status-tag_text');
      expect(textSpan.textContent?.trim()).toBe('Payment Pending');
    });

    it('should handle empty text', () => {
      // Arrange
      const config = createConfig({ text: '' });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const textSpan = fixture.nativeElement.querySelector('.status-tag_text');
      expect(textSpan.textContent?.trim()).toBe('');
    });

    it('should handle very long text', () => {
      // Arrange
      const longText = 'Very Long Status Text That Might Wrap Or Truncate';
      const config = createConfig({ text: longText });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const textSpan = fixture.nativeElement.querySelector('.status-tag_text');
      expect(textSpan.textContent).toContain(longText);
    });
  });

  describe('Reactive Updates', () => {
    it('should update text when config changes', () => {
      // Arrange
      const initialConfig = createConfig({ text: 'Initial' });
      fixture.componentRef.setInput('config', initialConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Act
      const updatedConfig = createConfig({ text: 'Updated' });
      fixture.componentRef.setInput('config', updatedConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const textSpan = fixture.nativeElement.querySelector('.status-tag_text');
      expect(textSpan.textContent?.trim()).toBe('Updated');
    });

    it('should update status classes when status changes', () => {
      // Arrange
      const initialConfig = createConfig({ status: StatusTagType.SUCCESS });
      fixture.componentRef.setInput('config', initialConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Act
      const updatedConfig = createConfig({ status: StatusTagType.ERROR });
      fixture.componentRef.setInput('config', updatedConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--type-error')).toBe(true);
      expect(statusTag.classList.contains('status-tag--type-success')).toBe(false);
    });

    it('should update style classes when style changes', () => {
      // Arrange
      const initialConfig = createConfig({ style: StatusTagStyles.DEFAULT });
      fixture.componentRef.setInput('config', initialConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Act
      const updatedConfig = createConfig({ style: StatusTagStyles.FILLED });
      fixture.componentRef.setInput('config', updatedConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--style-filled')).toBe(true);
      expect(statusTag.classList.contains('status-tag--style-default')).toBe(false);
    });

    it('should toggle icon visibility when style changes to NO_ICON', () => {
      // Arrange
      const initialConfig = createConfig({ style: StatusTagStyles.DEFAULT });
      fixture.componentRef.setInput('config', initialConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeTruthy();

      // Act
      const updatedConfig = createConfig({ style: StatusTagStyles.NO_ICON });
      fixture.componentRef.setInput('config', updatedConfig);
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      icon = fixture.nativeElement.querySelector('.status-tag_icon');
      expect(icon).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null status gracefully', () => {
      // Arrange
      const config = createConfig({ status: null as any });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - Should not render
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeFalsy();
    });

    it('should handle undefined style by falling back to default', () => {
      // Arrange
      const config = createConfig({ style: undefined });
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - Should render with default config
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeTruthy();
    });

    it('should handle custom generic status types', () => {
      // Arrange
      type CustomStatus = 'processing' | 'archived';
      const customConfig: StatusTagConfig<CustomStatus> = {
        status: 'processing' as CustomStatus,
        text: 'Processing',
        style: StatusTagStyles.DEFAULT,
      };
      fixture.componentRef.setInput('config', customConfig);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - Should render and apply kebab-cased class
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeTruthy();
      expect(mockTextHelperService.toKebabCase).toHaveBeenCalledWith('processing');
      expect(statusTag.classList.contains('status-tag--type-processing')).toBe(true);
    });
  });

  describe('Default Config Merging', () => {
    it('should use default style when not provided', () => {
      // Arrange
      const config: StatusTagConfig = {
        status: StatusTagType.INFO,
        text: 'Info',
      };
      fixture.componentRef.setInput('config', config);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert - Should apply default style
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag.classList.contains('status-tag--style-default')).toBe(true);
    });

    it('should merge partial config with defaults', () => {
      // Arrange
      const partialConfig: Partial<StatusTagConfig> & Pick<StatusTagConfig, 'status' | 'text'> = {
        status: StatusTagType.WARNING,
        text: 'Warning',
        // style omitted - should use default
      };
      fixture.componentRef.setInput('config', partialConfig as StatusTagConfig);

      // Act
      TestBed.flushEffects();
      fixture.detectChanges();

      // Assert
      const statusTag = fixture.nativeElement.querySelector('.status-tag');
      expect(statusTag).toBeTruthy();
      expect(statusTag.textContent).toContain('Warning');
    });
  });
});
