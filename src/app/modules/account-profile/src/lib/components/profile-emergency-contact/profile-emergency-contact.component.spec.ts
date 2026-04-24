import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { RfFormStore } from 'reactive-forms';

import { ProfileEmergencyContactComponent } from './profile-emergency-contact.component';
import { EmergencyContactData } from '../../core/models/emergency-contact-data';
import { TextHelperService } from '@dcx/ui/libs';

// Mock pipes
@Pipe({
  name: 'generateId',
  standalone: true
})
class MockGenerateIdPipe implements PipeTransform {
  transform(value: any): string {
    return 'mock-id';
  }
}

// Mock reactive forms components
@Component({
  selector: 'rf-form-summary',
  template: '<div>Form Summary Mock</div>',
  standalone: true
})
class MockFormSummaryComponent {}

@Component({
  selector: 'rf-form-builder',
  template: '<div>Form Builder Mock</div>',
  standalone: true
})
class MockFormBuilderComponent {}

describe('ProfileEmergencyContactComponent', () => {
  let component: ProfileEmergencyContactComponent;
  let fixture: ComponentFixture<ProfileEmergencyContactComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockRfFormStore: jasmine.SpyObj<typeof RfFormStore>;
  let mockTextHelperService: jasmine.SpyObj<TextHelperService>;

  const mockPrefixOptions = [
    { value: '+1', label: 'United States (+1)' },
    { value: '+52', label: 'Mexico (+52)' },
    { value: '+57', label: 'Colombia (+57)' }
  ];

  const mockFormName = 'formEmergencyContact';
  const mockCulture = 'en-US';

  beforeEach(async () => {
    // Create service mocks
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);

    // Setup service return values
    mockTranslateService.instant.and.returnValue('Mocked Translation');
    mockRfFormStore = jasmine.createSpyObj('mockRfFormStore', [
      'getFormGroup'
    ]);
    mockTextHelperService = jasmine.createSpyObj('mockTextHelperService', [
      'normalizeTextSpacing'
    ]);

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: RfFormStore, useValue: mockRfFormStore },
        { provide: TextHelperService, useValue: mockTextHelperService },
      ]
    }).compileComponents();

    // Override the component to use mock child components
    TestBed.overrideComponent(ProfileEmergencyContactComponent, {
      set: {
        template: `
          <div class="profile-emergency-contact">
            <rf-form-summary #formSummary></rf-form-summary>
            <rf-form-builder></rf-form-builder>
          </div>
        `,
        imports: [
          MockFormSummaryComponent,
          MockFormBuilderComponent,
          MockGenerateIdPipe
        ]
      }
    });

    fixture = TestBed.createComponent(ProfileEmergencyContactComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('formName', mockFormName);
    fixture.componentRef.setInput('culture', mockCulture);
    fixture.componentRef.setInput('prefixOptions', mockPrefixOptions);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render the container correctly', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should have required inputs set', () => {
      expect(component.formName()).toEqual(mockFormName);
      expect(component.culture()).toEqual(mockCulture);
      expect(component.prefixOptions().length).toEqual(mockPrefixOptions.length);
    });

    it('should have default optional inputs', () => {
      expect(component.parentLabelledById()).toBeNull();
      expect(component.ownLabelledById()).toBeNull();
      expect(component.isLoading()).toBeFalsy();
      expect((component as any).columns()).toBe(2);
    });
  });

  describe('Child Components', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display form summary component', () => {
      const formSummaryElement = fixture.debugElement.nativeElement.querySelector('rf-form-summary');
      expect(formSummaryElement).toBeTruthy();
    });

    it('should display form builder component', () => {
      const formBuilderElement = fixture.debugElement.nativeElement.querySelector('rf-form-builder');
      expect(formBuilderElement).toBeTruthy();
    });
  });

  describe('Component Properties', () => {
    it('should have correct component class', () => {
      fixture.detectChanges();
      const container = fixture.debugElement.nativeElement;
      expect(container.querySelector('.profile-emergency-contact')).toBeTruthy();
    });

    it('should initialize formBuilderConfig signal', () => {
      expect(component.formBuilderConfig()).toBeDefined();
    });

    it('should initialize buttonsConfig signal', () => {
      // buttonsConfig is a model that starts as undefined until createButtonsConfig is called
      component['createButtonsConfig']();
      expect(component.buttonsConfig()).toBeDefined();
    });

    it('should have translationKeys defined', () => {
      expect(component['translationKeys']).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');
      component.ngOnInit();
      expect((component as any).internalInit).toHaveBeenCalled();
    });

    it('should create buttons config on initialization', () => {
      spyOn(component as any, 'createButtonsConfig');
      component.ngOnInit();
      expect((component as any).createButtonsConfig).toHaveBeenCalled();
    });

    it('should set form builder config on initialization', () => {
      component.ngOnInit();
      // Config should be updated after ngOnInit
      expect(component.formBuilderConfig()).toBeDefined();
    });
  });



  describe('saveEmergencyContact Method', () => {
    it('should emit updateProfileEmergencyContact with correct data', () => {
      const mockForm = {
        completeName: '  Jane Doe  ',
        email: 'jane.doe@example.com',
        phoneNumber: {
          prefix: '+1',
          phone: '5559876543'
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const expectedEmergencyContact: EmergencyContactData = {
        firstName: 'Jane Doe',
        lastName: 'Unknown',
        email: 'jane.doe@example.com',
        number: '5559876543',
        prefix: '+1'
      };

      expect(component.updateProfileEmergencyContact.emit)
        .toHaveBeenCalledWith(expectedEmergencyContact);
    });

    it('should handle form with missing email', () => {
      const mockForm = {
        completeName: 'John Smith',
        phoneNumber: {
          prefix: '+52',
          phone: '1234567890'
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const expectedEmergencyContact: EmergencyContactData = {
        firstName: 'John Smith',
        lastName: 'Unknown',
        email: '',
        number: '1234567890',
        prefix: '+52'
      };

      expect(component.updateProfileEmergencyContact.emit)
        .toHaveBeenCalledWith(expectedEmergencyContact);
    });

    it('should return early if form is null or undefined', () => {
      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](null);
      component['saveEmergencyContact'](undefined);

      expect(component.updateProfileEmergencyContact.emit).not.toHaveBeenCalled();
    });

    it('should trim whitespace from complete name', () => {
      const mockForm = {
        completeName: '   Jane   Doe   ',
        phoneNumber: {
          prefix: '+1',
          phone: '5559876543'
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const emittedData = (component.updateProfileEmergencyContact.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.firstName).toBe('Jane   Doe');
    });
  });

  describe('cancelEmergencyContact Method', () => {
    it('should emit cancelForm with true when previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      component['cancelEmergencyContact'](true);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(true);
    });

    it('should emit cancelForm with false when no previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      component['cancelEmergencyContact'](false);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('createButtonsConfig Method', () => {
    it('should create buttons configuration with translated labels', () => {
      // Mock to return the key itself as translation to verify the structure
      mockTranslateService.instant.and.callFake((key: string) => `translated-${key}`);

      component['createButtonsConfig']();

      const buttonsConfig = component.buttonsConfig();

      // Verify that buttonsConfig was created and has the expected structure
      expect(buttonsConfig).toBeDefined();
      expect(buttonsConfig?.addButton?.label).toContain('translated-');
      expect(buttonsConfig?.saveButton?.label).toContain('translated-');
      expect(buttonsConfig?.cancelButton?.label).toContain('translated-');
      expect(buttonsConfig?.editButton?.label).toContain('translated-');

      // Verify that the labels contain expected key patterns
      expect(buttonsConfig?.addButton?.label).toContain('EmergencyForm');
      expect(buttonsConfig?.addButton?.label).toContain('AddEmergencyContactButton');
      expect(buttonsConfig?.saveButton?.label).toContain('ConfirmButton');
      expect(buttonsConfig?.cancelButton?.label).toContain('CancelButton');
      expect(buttonsConfig?.editButton?.label).toContain('EditButton');
    });

    it('should call translateService.instant for each button label', () => {
      // Reset the spy to track calls
      mockTranslateService.instant.calls.reset();

      component['createButtonsConfig']();

      // Verify that translateService.instant was called (the exact keys may vary)
      expect(mockTranslateService.instant).toHaveBeenCalledTimes(5);

      // Check if at least one call contains expected patterns
      const calls = mockTranslateService.instant.calls.all();
      const allCallArgs = calls.map(call => call.args[0]);

      // Verify calls were made with keys containing expected patterns
      expect(allCallArgs.some(key => key.includes('EmergencyForm') && key.includes('AddEmergencyContactButton'))).toBe(true);
      expect(allCallArgs.some(key => key.includes('ConfirmButton'))).toBe(true);
      expect(allCallArgs.some(key => key.includes('CancelButton'))).toBe(true);
      expect(allCallArgs.some(key => key.includes('EditButton'))).toBe(true);
    });
  });

  describe('internalInit Method', () => {
    it('should call createButtonsConfig', () => {
      spyOn(component as any, 'createButtonsConfig');

      component['internalInit']();

      expect((component as any).createButtonsConfig).toHaveBeenCalled();
    });

    it('should set formBuilderConfig', () => {
      component['internalInit']();

      expect(component.formBuilderConfig()).toBeDefined();
      // Config should be updated after internalInit
    });
  });

  describe('Input Validation', () => {
    it('should handle empty prefix options', () => {
      fixture.componentRef.setInput('prefixOptions', []);
      fixture.detectChanges();

      expect(component.prefixOptions()).toEqual([]);
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle null parentLabelledById', () => {
      fixture.componentRef.setInput('parentLabelledById', null);
      fixture.detectChanges();

      expect(component.parentLabelledById()).toBeNull();
    });

    it('should handle null ownLabelledById', () => {
      fixture.componentRef.setInput('ownLabelledById', null);
      fixture.detectChanges();

      expect(component.ownLabelledById()).toBeNull();
    });

    it('should handle loading state', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();

      expect(component.isLoading()).toBe(true);
    });
  });

  describe('FormSummary ViewChild', () => {
    it('should have formSummary viewChild reference', () => {
      fixture.detectChanges();
      // The viewChild will be undefined because we're using a mock template
      // but we can verify the property exists
      expect(component.formSummary).toBeDefined();
    });
  });

  describe('Signals and Models', () => {
    it('should have formBuilderConfig signal', () => {
      expect(component.formBuilderConfig).toBeDefined();
      expect(typeof component.formBuilderConfig()).toBe('object');
    });

    it('should have buttonsConfig model', () => {
      expect(component.buttonsConfig).toBeDefined();
    });

    it('should update buttonsConfig model', () => {
      const newConfig = {
        addButton: { label: 'New Add' },
        saveButton: { label: 'New Save' },
        cancelButton: { label: 'New Cancel' },
        editButton: { label: 'New Edit' }
      };

      component.buttonsConfig.set(newConfig);

      expect(component.buttonsConfig()).toEqual(newConfig);
    });
  });

  describe('Constants and Properties', () => {
    it('should have correct displayErrorMode', () => {
      expect(component['displayErrorMode']).toBeDefined();
    });

    it('should have FormSummaryViews', () => {
      expect(component['FormSummaryViews']).toBeDefined();
    });

    it('should have translationKeys', () => {
      expect(component['translationKeys']).toBeDefined();
    });

    it('should have bypassConfigToReplace object', () => {
      expect(component.bypassConfigToReplace).toBeDefined();
      expect(typeof component.bypassConfigToReplace).toBe('object');
    });

    it('should have bypassConfigSummaryToCreator object', () => {
      expect(component.bypassConfigSummaryToCreator).toBeDefined();
      expect(typeof component.bypassConfigSummaryToCreator).toBe('object');
    });

    it('should have previousValues Map', () => {
      expect(component.previousValues).toBeInstanceOf(Map);
    });
  });

  describe('Standalone Component', () => {
    it('should be properly configured as standalone', () => {
      expect(ProfileEmergencyContactComponent).toBeDefined();
    });

    it('should not require module declaration', () => {
      expect(fixture.componentInstance).toBeInstanceOf(ProfileEmergencyContactComponent);
    });

    it('should work without imports from NgModule', () => {
      expect(() => {
        TestBed.createComponent(ProfileEmergencyContactComponent);
      }).not.toThrow();
    });
  });

  describe('Output Events', () => {
    it('should have cancelForm output defined', () => {
      expect(component.cancelForm).toBeDefined();
    });

    it('should have updateProfileEmergencyContact output defined', () => {
      expect(component.updateProfileEmergencyContact).toBeDefined();
    });
  });

  describe('Input Properties - Additional Tests', () => {
    it('should have columns input with default value', () => {
      expect(component['columns']()).toBe(2);
    });

    it('should handle custom columns value', () => {
      fixture.componentRef.setInput('columns', 3);
      expect(component['columns']()).toBe(3);
    });

    it('should handle string parentLabelledById', () => {
      fixture.componentRef.setInput('parentLabelledById', 'parent-label-id');
      expect(component.parentLabelledById()).toBe('parent-label-id');
    });

    it('should handle string ownLabelledById', () => {
      fixture.componentRef.setInput('ownLabelledById', 'own-label-id');
      expect(component.ownLabelledById()).toBe('own-label-id');
    });

    it('should handle different culture values', () => {
      fixture.componentRef.setInput('culture', 'es-ES');
      expect(component.culture()).toBe('es-ES');
    });

    it('should update prefixOptions', () => {
      const newPrefixOptions = [
        { value: '+44', label: 'UK (+44)', content: 'UK (+44)' }
      ];
      fixture.componentRef.setInput('prefixOptions', newPrefixOptions);
      expect(component.prefixOptions()).toEqual(newPrefixOptions);
    });
  });

  describe('Public Properties Access', () => {
    it('should allow reading bypassConfigToReplace', () => {
      expect(component.bypassConfigToReplace).toEqual({});
    });

    it('should allow reading bypassConfigSummaryToCreator', () => {
      expect(component.bypassConfigSummaryToCreator).toEqual({});
    });

    it('should allow reading previousValues', () => {
      expect(component.previousValues).toBeInstanceOf(Map);
      expect(component.previousValues.size).toBe(0);
    });

    it('should allow setting values in previousValues Map', () => {
      const mockData: EmergencyContactData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        number: '123',
        prefix: '+1'
      };

      component.previousValues.set('key1', mockData);
      expect(component.previousValues.get('key1')).toEqual(mockData);
    });
  });

  describe('ViewChild Access', () => {
    it('should have formSummary viewChild accessible', () => {
      expect(component.formSummary).toBeDefined();
    });
  });

  describe('Signal Updates', () => {
    it('should update formBuilderConfig signal', () => {
      const newConfig = {};
      component.formBuilderConfig.set(newConfig);
      expect(component.formBuilderConfig()).toEqual(newConfig);
    });

    it('should maintain formBuilderConfig reactivity', () => {
      const initialConfig = component.formBuilderConfig();
      component['internalInit']();
      const updatedConfig = component.formBuilderConfig();

      // Config should be updated after internalInit
      expect(updatedConfig).not.toBe(initialConfig);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string in completeName', () => {
      const mockForm = {
        completeName: '',
        phoneNumber: {
          prefix: '+1',
          phone: '5551234567'
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const emittedData = (component.updateProfileEmergencyContact.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.firstName).toBe('');
    });

    it('should handle undefined phoneNumber prefix', () => {
      const mockForm = {
        completeName: 'Jane Doe',
        phoneNumber: {
          prefix: undefined,
          phone: '5551234567'
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const emittedData = (component.updateProfileEmergencyContact.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBeUndefined();
    });

    it('should handle undefined phoneNumber phone', () => {
      const mockForm = {
        completeName: 'Jane Doe',
        phoneNumber: {
          prefix: '+1',
          phone: undefined
        }
      };

      spyOn(component.updateProfileEmergencyContact, 'emit');

      component['saveEmergencyContact'](mockForm);

      const emittedData = (component.updateProfileEmergencyContact.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.number).toBeUndefined();
    });
  });
});
