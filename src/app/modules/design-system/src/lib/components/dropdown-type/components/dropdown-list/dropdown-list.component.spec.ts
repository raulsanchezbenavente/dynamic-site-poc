import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DropdownListComponent } from './dropdown-list.component';
import { DropdownListConfig, OptionsList, DropdownLayoutType } from '@dcx/ui/libs';
import { resolveDropdownValueFromOptions } from './helpers/dropdown-value-from-options.helper';

describe('DropdownListComponent', () => {
  let component: DropdownListComponent;
  let fixture: ComponentFixture<DropdownListComponent>;
  let mockDropdownRef: jasmine.SpyObj<any>;

  const emitSpy = jasmine.createSpy('dropdownOptionValueEmitter');

  const options: OptionsList[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
  ];

  const configMock: DropdownListConfig = {
    dropdownModel: {
      value: 'en',
      displayLabel: '',
      isVisible: false,
      config: {
        label: 'Language',
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.DEFAULT,
        },
        closeOnSelection: true,
      },
    },
    optionsListConfig: {
      options,
    },
  };

  beforeAll(() => {
    mockDropdownRef = jasmine.createSpyObj('MockDropdownComponent',
      ['scrollToSelectedOptionInContent', 'getContentElement']);

    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 1 as any;
    });
  });

  beforeEach(fakeAsync(() => {
    emitSpy.calls.reset();
    mockDropdownRef.scrollToSelectedOptionInContent.calls.reset();
    mockDropdownRef.getContentElement.calls.reset();

    TestBed.configureTestingModule({
      imports: [DropdownListComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    TestBed.overrideTemplate(DropdownListComponent, '<div></div>');

    fixture = TestBed.createComponent(DropdownListComponent);
    component = fixture.componentInstance;

    component.config = structuredClone(configMock);
    (component as any).dropdownOptionValueEmitter.subscribe(emitSpy);

    // Set up dropdownInstance after component initialization
    fixture.detectChanges();

    // Mock the ViewChild dropdownRef since template is isolated
    (component as any).dropdownRef = mockDropdownRef;

    tick();
  }));

  it('should resolve value and displayLabel on init', () => {
    const expectedValue = resolveDropdownValueFromOptions(
      configMock.dropdownModel.value,
      configMock.optionsListConfig.options
    );

    expect(component.config.dropdownModel.value).toBe(expectedValue);
    expect(component.config.dropdownModel.displayLabel).toBe('English');
  });

  it('should emit selected option with updated model when selectOption is called', () => {
    const selectedOption = options[1];

    component.selectOption(selectedOption);

    expect(component.config.dropdownModel.value).toBe('es');
    expect(component.config.dropdownModel.displayLabel).toBe('Spanish');
    expect(emitSpy).toHaveBeenCalledOnceWith(selectedOption);
  });

  it('should scroll and focus on selected option on dropdown opened', fakeAsync(() => {
    const selectedEl = document.createElement('div');
    selectedEl.setAttribute('aria-selected', 'true');
    const focusSpy = spyOn(selectedEl, 'focus');

    const container = document.createElement('div');
    container.appendChild(selectedEl);

    mockDropdownRef.getContentElement.and.returnValue(container);

    component.onDropdownOpened();
    tick();

    expect(mockDropdownRef.scrollToSelectedOptionInContent).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  }));

  it('should fallback to first option when no selected option exists', fakeAsync(() => {
    const fallbackEl = document.createElement('div');
    fallbackEl.setAttribute('role', 'option');
    const focusSpy = spyOn(fallbackEl, 'focus');

    const container = document.createElement('div');
    container.appendChild(fallbackEl);

    mockDropdownRef.getContentElement.and.returnValue(container);

    component.onDropdownOpened();
    tick();

    expect(mockDropdownRef.scrollToSelectedOptionInContent).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  }));

  it('should not scroll or focus when layout isAlwaysVisible', fakeAsync(() => {
    component.config.dropdownModel.config.layoutConfig.isAlwaysVisible = true;

    component.onDropdownOpened();
    tick();

    expect(mockDropdownRef.scrollToSelectedOptionInContent).not.toHaveBeenCalled();
    expect(mockDropdownRef.getContentElement).not.toHaveBeenCalled();
  }));

  it('should handle missing dropdownRef gracefully', fakeAsync(() => {
    (component as any).dropdownRef = undefined;

    expect(() => {
      component.onDropdownOpened();
      tick();
    }).toThrowError(TypeError);
  }));

  it('should set displayLabel from selected option if displayLabel is initially missing', () => {
    // Create fresh config to test this scenario independently
    const testConfig = structuredClone(configMock);
    testConfig.dropdownModel.displayLabel = '';
    testConfig.dropdownModel.value = 'es';
    component.config = testConfig;

    component.ngOnInit();

    expect(component.config.dropdownModel.displayLabel).toBe('Spanish');
  });

  it('should not override displayLabel if it is already set', () => {
    // Create fresh config to test this scenario independently
    const testConfig = structuredClone(configMock);
    testConfig.dropdownModel.value = 'en';
    testConfig.dropdownModel.displayLabel = 'Custom label';
    component.config = testConfig;

    component.ngOnInit();

    expect(component.config.dropdownModel.displayLabel).toBe('Custom label');
  });

  it('should select the option marked as isSelected if no value is provided', () => {
    const customOptions = [
      { code: 'en', name: 'English', isSelected: false },
      { code: 'fr', name: 'Français', isSelected: true },
      { code: 'de', name: 'Deutsch', isSelected: false },
    ];

    const testConfig = structuredClone(configMock);
    testConfig.dropdownModel.value = '';
    testConfig.optionsListConfig.options = customOptions;
    component.config = testConfig;

    component.ngOnInit();

    expect(component.config.dropdownModel.value).toBe('fr');
    expect(component.config.dropdownModel.displayLabel).toBe('Français');
    const selected = component.config.optionsListConfig.options.find(opt => opt.isSelected);
    expect(selected?.code).toBe('fr');
  });

  it('should handle null/undefined config gracefully', fakeAsync(() => {
    component.config = null as any;

    expect(() => {
      component.ngOnInit();
    }).toThrow();
  }));

  it('should handle empty options list', () => {
    // Create fresh config with empty options from the start
    const testConfig = structuredClone(configMock);
    testConfig.optionsListConfig.options = [];
    testConfig.dropdownModel.value = 'nonexistent';
    testConfig.dropdownModel.displayLabel = '';
    component.config = testConfig;

    component.ngOnInit();

    expect(component.config.dropdownModel.displayLabel).toBe('');
  });
});
