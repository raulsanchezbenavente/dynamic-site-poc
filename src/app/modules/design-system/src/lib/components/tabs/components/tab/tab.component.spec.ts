import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TabComponent } from '../tab/tab.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AriaAttributes, ComposerService } from '@dcx/ui/libs';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;
  let sanitizerMock: jasmine.SpyObj<DomSanitizer>;
  let composerServiceMock: Partial<ComposerService>;

  beforeAll(() => {
    sanitizerMock = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);
    composerServiceMock = {
      runningSubmit: signal(false),
      isolatedLoadingComponentsList: signal([]),
    };
  });

  beforeEach(fakeAsync(() => {
    sanitizerMock.bypassSecurityTrustHtml.calls.reset();

    TestBed.configureTestingModule({
      imports: [TabComponent],
      providers: [
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: ComposerService, useValue: composerServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideTemplate(TabComponent, '<div></div>');

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  describe('ngOnChanges', () => {
    it('should sanitize and set safeContent when content is present', fakeAsync(() => {
      const html = '<div>Safe</div>';
      const safeHtml: SafeHtml = {} as SafeHtml;
      sanitizerMock.bypassSecurityTrustHtml.and.returnValue(safeHtml);

      fixture.componentRef.setInput('content', html);
      fixture.detectChanges();
      tick();

      component.ngOnChanges();

      expect(sanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
      expect(component.safeContent()).toBe(safeHtml);
    }));

    it('should not call sanitizer or set safeContent when content is null', fakeAsync(() => {
      fixture.componentRef.setInput('content', null);
      fixture.detectChanges();
      tick();

      component.ngOnChanges();

      expect(sanitizerMock.bypassSecurityTrustHtml).not.toHaveBeenCalled();
      expect(component.safeContent()).toBeNull();
    }));

    it('should handle undefined content gracefully', fakeAsync(() => {
      fixture.componentRef.setInput('content', undefined);
      fixture.detectChanges();
      tick();

      expect(() => component.ngOnChanges()).not.toThrow();
      expect(sanitizerMock.bypassSecurityTrustHtml).not.toHaveBeenCalled();
      expect(component.safeContent()).toBeNull();
    }));
  });

  describe('setSelected', () => {
    beforeEach(() => {
      // Reset isFirstLoad signal and _hasBeenLoaded flag
      component.isFirstLoad.set(false);
      (component as any)._hasBeenLoaded = false;
    });

    it('should set isSelected signal to true when selected is true', () => {
      component.setSelected(true);
      expect(component.isSelected()).toBeTrue();
    });

    it('should set isSelected signal to false when selected is false', () => {
      component.setSelected(false);
      expect(component.isSelected()).toBeFalse();
    });

    it('should set isFirstLoad to true only the first time selected is true', () => {
      expect(component.isFirstLoad()).toBeFalse();

      component.setSelected(true);
      expect(component.isFirstLoad()).toBeTrue();

      // Call again, should not set isFirstLoad again
      component.isFirstLoad.set(false);
      component.setSelected(true);
      expect(component.isFirstLoad()).toBeFalse();
    });

    it('should not set isFirstLoad if selected is false', () => {
      component.setSelected(false);
      expect(component.isFirstLoad()).toBeFalse();
    });
  });

  describe('setIds', () => {
    it('should set ids signal with provided AriaAttributes', () => {
      const aria: AriaAttributes = {
        ariaControls: 'panelId_123',
        ariaLabelledBy: 'tabId_456',
      };
      component.setIds(aria);
      expect(component.ids()).toEqual(aria);
    });

    it('should handle empty AriaAttributes object', () => {
      const aria: AriaAttributes = {};
      component.setIds(aria);
      expect(component.ids()).toEqual(aria);
    });
  });

  describe('extractIsolatedLoadingComponents', () => {
    it('should extract single component ID with data-isolated-loading', () => {
      // Arrange
      const html = '<dcx-component data-module-id="test-id-1" data-isolated-loading>Component 1</dcx-component>';

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1']);
    });

    it('should extract multiple component IDs with data-isolated-loading', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-module-id="test-id-2" data-isolated-loading>Component 2</dcx-component>
        <dcx-component data-module-id="test-id-3" data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-2', 'test-id-3']);
    });

    it('should ignore components without data-isolated-loading attribute', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-module-id="test-id-2">Component 2</dcx-component>
        <dcx-component data-module-id="test-id-3" data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-3']);
    });

    it('should ignore components without data-module-id attribute', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-isolated-loading>Component 2</dcx-component>
        <dcx-component data-module-id="test-id-3" data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-3']);
    });

    it('should handle components with additional attributes', () => {
      // Arrange
      const html = `
        <dcx-component class="test-class" data-module-id="test-id-1" data-isolated-loading style="color: red;">Component 1</dcx-component>
        <dcx-component data-config="some-config" data-module-id="test-id-2" data-isolated-loading data-priority="1">Component 2</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-2']);
    });

    it('should handle different quote styles for data-module-id', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-module-id='test-id-2' data-isolated-loading>Component 2</dcx-component>
        <dcx-component data-module-id=test-id-3 data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-2', 'test-id-3']);
    });

    it('should handle multiline HTML with nested elements', () => {
      // Arrange
      const html = `
        <div class="container">
          <dcx-component
            data-module-id="test-id-1"
            data-isolated-loading>
            <div>Nested content</div>
          </dcx-component>
          <span>Other content</span>
          <dcx-component
            data-module-id="test-id-2"
            data-isolated-loading>
            Component 2
          </dcx-component>
        </div>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1', 'test-id-2']);
    });

    it('should handle empty or whitespace-only data-module-id', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-module-id="   " data-isolated-loading>Component 2</dcx-component>
        <dcx-component data-module-id="test-id-3" data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      // The implementation extracts all non-empty data-module-id values, including whitespace
      const result = (component as any).isolatedLoadingComponentIds();
      expect(result).toContain('test-id-3');
      expect(result).toContain('   '); // Whitespace is preserved as-is
      expect(result.length).toBe(2); // Empty string is filtered out
    });

    it('should handle duplicate component IDs by keeping unique values', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="duplicate-id" data-isolated-loading>Component 1</dcx-component>
        <dcx-component data-module-id="unique-id" data-isolated-loading>Component 2</dcx-component>
        <dcx-component data-module-id="duplicate-id" data-isolated-loading>Component 3</dcx-component>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['duplicate-id', 'unique-id']);
    });

    it('should return empty array when no matching components found', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1">Component without isolated loading</dcx-component>
        <div>Regular HTML content</div>
        <span>More content</span>
      `;

      // Act
      (component as any).extractIsolatedLoadingComponents(html);

      // Assert
      expect((component as any).isolatedLoadingComponentIds()).toEqual([]);
    });

    it('should handle malformed HTML gracefully', () => {
      // Arrange
      const html = `
        <dcx-component data-module-id="test-id-1" data-isolated-loading>Valid Component</dcx-component>
        <dcx-component data-module-id= data-isolated-loading>Invalid Component</dcx-component>
        <dcx-component data-module-id"test-id-2" data-isolated-loading>Another Component</dcx-component>
      `;

      // Act & Assert - Should not throw errors
      expect(() => {
        (component as any).extractIsolatedLoadingComponents(html);
      }).not.toThrow();

      // Should extract valid IDs
      expect((component as any).isolatedLoadingComponentIds()).toEqual(['test-id-1']);
    });

    it('should handle null or undefined HTML input', () => {
      // Reset the signal before testing
      (component as any).isolatedLoadingComponentIds.set([]);

      // Act & Assert - Current implementation throws TypeError for null/undefined
      expect(() => {
        (component as any).extractIsolatedLoadingComponents(null);
      }).toThrowError(TypeError);

      expect(() => {
        (component as any).extractIsolatedLoadingComponents(undefined);
      }).toThrowError(TypeError);
    });

    it('should handle empty string input', () => {
      // Reset the signal before testing
      (component as any).isolatedLoadingComponentIds.set([]);

      // Act & Assert - Empty string should not throw
      expect(() => {
        (component as any).extractIsolatedLoadingComponents('');
      }).not.toThrow();

      // Should result in empty array
      expect((component as any).isolatedLoadingComponentIds()).toEqual([]);
    });
  });
});
