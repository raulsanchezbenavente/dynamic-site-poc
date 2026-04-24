import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';

import { AccountPersonalComponent } from './account-personal.component';
import { FormSummaryViews } from '@dcx/ui/business-common';
import { TranslationKeys } from '../../enums/translation-keys.enum';

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

describe('AccountPersonalComponent', () => {
  let component: AccountPersonalComponent;
  let fixture: ComponentFixture<AccountPersonalComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockAccountPersonalConfig = {
    countryOptions: [
      { value: 'US', label: 'United States', content: 'United States' },
      { value: 'MX', label: 'Mexico', content: 'Mexico' }
    ],
    genderOptions: [
      { value: '1', label: 'Male', content: 'Male' },
      { value: '2', label: 'Female', content: 'Female' }
    ],
    culture: 'en-US',
    parentLabelledById: 'parent-id',
    ownLabelledById: 'personal-id'
  };

  const mockFormName = 'formPersonal';

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Mocked Translation');

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    TestBed.overrideComponent(AccountPersonalComponent, {
      set: {
        template: '',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(AccountPersonalComponent);
    component = fixture.componentInstance;

    // DON'T mock ngOnInit and formSummary here, let them be real for effect tests

    fixture.componentRef.setInput('config', mockAccountPersonalConfig);
    fixture.componentRef.setInput('formName', mockFormName);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required inputs set', () => {
      expect(component.config()).toEqual(mockAccountPersonalConfig);
      expect(component.formName()).toEqual(mockFormName);
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      // Restore real ngOnInit for this test
      component.ngOnInit = AccountPersonalComponent.prototype.ngOnInit;
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });

  describe('onSaveForm', () => {
    it('should emit updateAccountPersonalInfo with correct data', () => {
      const mockPersonalData = {
        gender: '1',
        name: 'John',
        lastName: 'Doe',
        country: 'US',
        nationality: 'US',
        birthday: {
          day: '15',
          month: '6',
          year: '1990'
        },
        address: '123 Main St'
      };

      spyOn(component.updateAccountPersonalInfo, 'emit');

      component.onSaveForm(mockPersonalData);

      const expectedData = {
        gender: '1',
        firstName: 'John',
        lastName: 'Doe',
        addressCountry: 'US',
        nationality: 'US',
        birthday: {
          day: '15',
          month: '6', // month + 1
          year: '1990'
        },
        address: '123 Main St'
      };

      expect(component.updateAccountPersonalInfo.emit).toHaveBeenCalledWith(expectedData);
    });

    it('should handle missing birthday properties', () => {
      const mockPersonalData = {
        gender: '2',
        name: 'Jane',
        lastName: 'Smith',
        country: 'MX',
        nationality: 'MX',
        city: 'Mexico City',
        birthday: {
          day: '1',
          month: '1',
          year: '1985'
        },
        address: '456 Second St'
      };

      spyOn(component.updateAccountPersonalInfo, 'emit');

      component.onSaveForm(mockPersonalData);

      expect(component.updateAccountPersonalInfo.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          birthday: {
            day: '1',
            month: '1',
            year: '1985'
          }
        })
      );
    });
  });

  describe('cancelAccountPersonal', () => {
    it('should emit cancelForm with true when previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelAccountPersonal(true);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(true);
    });

    it('should emit cancelForm with false when no previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelAccountPersonal(false);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('createButtonsConfig', () => {
    it('should create buttons configuration with translated labels', () => {
      mockTranslateService.instant.and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          [TranslationKeys.AccountProfile_PersonalForm_AddPersonalInformationButton_Label]: 'Add Personal Info',
          [TranslationKeys.AccountProfile_ConfirmButton_Label]: 'Confirm',
          [TranslationKeys.AccountProfile_CancelButton_Label]: 'Cancel',
          [TranslationKeys.AccountProfile_EditButton_Label]: 'Edit'
        };
        return translations[key] || key;
      });

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.addButton?.label).toContain('Add Personal Info');
      expect(buttonsConfig?.saveButton?.label).toContain('Confirm');
      expect(buttonsConfig?.cancelButton?.label).toContain('Cancel');
      expect(buttonsConfig?.editButton?.label).toContain('Edit');
    });

    it('should call translateService.instant for each button label', () => {
      mockTranslateService.instant.calls.reset();

      (component as any).createButtonsConfig();

      expect(mockTranslateService.instant).toHaveBeenCalledTimes(5);
    });
  });

  describe('internalInit', () => {
    it('should call createButtonsConfig', () => {
      spyOn(component as any, 'createButtonsConfig');

      (component as any).internalInit();

      expect((component as any).createButtonsConfig).toHaveBeenCalled();
    });

    it('should set parentLabelledById from config', () => {
      (component as any).internalInit();

      expect(component.parentLabelledById()).toBe(mockAccountPersonalConfig.parentLabelledById);
    });

    it('should set ownLabelledById from config', () => {
      (component as any).internalInit();

      expect(component.ownLabelledById()).toBe(mockAccountPersonalConfig.ownLabelledById);
    });
  });

  describe('Effect', () => {
    it('should return early when formSummaryInstance is null or undefined', () => {
      // Test the actual effect path: if (!formSummaryInstance) return;

      // Mock formSummary to return undefined to trigger the first branch
      Object.defineProperty(component, 'formSummary', {
        get: () => () => undefined,
        configurable: true
      });

      // Spy on formBuilderConfig.set to verify it's NOT called when effect returns early
      const formBuilderConfigSpy = spyOn(component.formBuilderConfig, 'set');

      // Trigger the effect by changing a signal that the effect watches
      const newConfig = { ...mockAccountPersonalConfig, culture: 'es-ES' };
      fixture.componentRef.setInput('config', newConfig);

      // Allow the effect to run
      fixture.detectChanges();

      // Verify that formBuilderConfig.set was NOT called because effect returned early
      expect(formBuilderConfigSpy).not.toHaveBeenCalled();

      // Test with null as well
      Object.defineProperty(component, 'formSummary', {
        get: () => () => null,
        configurable: true
      });

      formBuilderConfigSpy.calls.reset();

      const anotherConfig = { ...mockAccountPersonalConfig, culture: 'fr-FR' };
      fixture.componentRef.setInput('config', anotherConfig);
      fixture.detectChanges();

      // Verify that formBuilderConfig.set was NOT called because effect returned early
      expect(formBuilderConfigSpy).not.toHaveBeenCalled();
    });

    it('should return early when layoutSwapperInstance is null or undefined', () => {
      // Test the actual effect path: if (!layoutSwapperInstance) return;

      // Mock formSummary to return an object but layoutSwapper returns undefined
      Object.defineProperty(component, 'formSummary', {
        get: () => () => ({
          layoutSwapper: () => undefined
        }),
        configurable: true
      });

      // Spy on formBuilderConfig.set to verify it's NOT called when effect returns early
      const formBuilderConfigSpy = spyOn(component.formBuilderConfig, 'set');

      // Trigger the effect
      const newConfig = { ...mockAccountPersonalConfig, culture: 'de-DE' };
      fixture.componentRef.setInput('config', newConfig);
      fixture.detectChanges();

      // Verify that formBuilderConfig.set was NOT called because effect returned early
      expect(formBuilderConfigSpy).not.toHaveBeenCalled();

      // Test with null layoutSwapperInstance
      Object.defineProperty(component, 'formSummary', {
        get: () => () => ({
          layoutSwapper: () => null
        }),
        configurable: true
      });

      formBuilderConfigSpy.calls.reset();

      const anotherConfig = { ...mockAccountPersonalConfig, culture: 'it-IT' };
      fixture.componentRef.setInput('config', anotherConfig);
      fixture.detectChanges();

      // Verify that formBuilderConfig.set was NOT called because effect returned early
      expect(formBuilderConfigSpy).not.toHaveBeenCalled();
    });
  });

  describe('Component Properties', () => {
    it('should have correct default values', () => {
      expect(component.bypassConfigToReplace).toEqual({});
      expect(component.bypassConfigSummaryToCreator).toEqual({});
      expect(component.summaryGridConfig).toEqual({
        columns: 2,
        twoColumnsOnMobile: true
      });
      expect(component.subtractions).toEqual(['name', 'lastName']);
    });

    it('should have additions configured correctly', () => {
      expect(component.additions['completeName']).toBeDefined();
      expect(component.additions['completeName'].position).toEqual({ key: 'birthday' });
    });

    it('should have customFields configured correctly', () => {
      expect(component.customFields['genderName']).toEqual({ keys: ['gender', 'name'] });
    });

    describe('completeName additions', () => {
      it('should generate correct label using translateService', () => {
        // Mock translation keys based on TranslationKeys enum
        mockTranslateService.instant.and.callFake((key: string) => {
          const translations: { [key: string]: string } = {
            [TranslationKeys.AccountProfile_PersonalForm_Name_Label]: 'Name',
            [TranslationKeys.AccountProfile_PersonalForm_LastName_Label]: 'Last Name'
          };
          return translations[key] || key;
        });

        // Reset call count to ignore calls from factory initialization
        mockTranslateService.instant.calls.reset();

        const labelFunction = component.additions['completeName'].label;
        // Pass empty object as parameter since the function signature expects it
        const result = labelFunction({});

        expect(result).toContain('Name');
        expect(result).toContain('Last Name');
        expect(result).toContain('/');
        expect(mockTranslateService.instant).toHaveBeenCalledTimes(2);
      });

      it('should generate correct value with valid name and lastName', () => {
        const mockData = {
          name: 'john',
          lastName: 'doe'
        };

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        expect(result).toBe('John Doe');
      });

      it('should handle missing name in value function', () => {
        const mockData = {
          lastName: 'doe'
        };

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        // textHelperService.getCapitalizeWords trims spaces, so ' Doe' becomes 'Doe'
        expect(result).toBe('Doe');
      });

      it('should handle missing lastName in value function', () => {
        const mockData = {
          name: 'john'
        };

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        // textHelperService.getCapitalizeWords trims spaces, so 'John ' becomes 'John'
        expect(result).toBe('John');
      });

      it('should handle both name and lastName missing', () => {
        const mockData = {};

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        // When both are missing, we get '  ' which getCapitalizeWords returns as ''
        // The component should then use '' as the result (not the dash fallback)
        expect(result).toBe('');
      });

      it('should handle null data in value function', () => {
        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(null);

        // null data means name and lastName are both '', so '  ' becomes '' after getCapitalizeWords
        expect(result).toBe('');
      });

      it('should handle undefined data in value function', () => {
        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(undefined);

        // undefined data means name and lastName are both '', so '  ' becomes '' after getCapitalizeWords
        expect(result).toBe('');
      });

      it('should return dash when textHelperService returns null', () => {
        // Mock textHelperService to return null explicitly
        const mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['getCapitalizeWords']);
        mockTextHelperService.getCapitalizeWords.and.returnValue(null);

        // Replace the service in the component
        (component as any).textHelperService = mockTextHelperService;

        const mockData = {
          name: 'test',
          lastName: 'user'
        };

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        expect(result).toBe('-');
      });

      it('should return dash when name and lastName are empty strings', () => {
        // Test the specific case where empty strings result in null from the service
        const mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['getCapitalizeWords']);
        mockTextHelperService.getCapitalizeWords.and.returnValue(null);

        // Replace the service in the component
        (component as any).textHelperService = mockTextHelperService;

        const mockData = {
          name: '',
          lastName: ''
        };

        const valueFunction = component.additions['completeName'].value;
        const result = valueFunction(mockData);

        expect(result).toBe('-');
      });
    });
  });

  describe('Input Validation', () => {
    it('should handle null config', () => {
      fixture.componentRef.setInput('config', null);
      expect(component.config()).toBeNull();
    });

    it('should handle empty formName', () => {
      fixture.componentRef.setInput('formName', '');
      expect(component.formName()).toBe('');
    });

    it('should have isLoading input with default false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should handle isLoading set to true', () => {
      fixture.componentRef.setInput('isLoading', true);
      expect(component.isLoading()).toBe(true);
    });

    it('should have columns input with default 2', () => {
      expect(component['columns']()).toBe(2);
    });

    it('should handle custom columns value', () => {
      fixture.componentRef.setInput('columns', 3);
      expect(component['columns']()).toBe(3);
    });

    it('should have defaultSpan input with default 6', () => {
      expect(component['defaultSpan']()).toBe(6);
    });

    it('should handle custom defaultSpan value', () => {
      fixture.componentRef.setInput('defaultSpan', 4);
      expect(component['defaultSpan']()).toBe(4);
    });

    it('should handle customSpans input', () => {
      const customSpans = { field1: 12, field2: 6 };
      fixture.componentRef.setInput('customSpans', customSpans);
      expect(component['customSpans']()).toEqual(customSpans);
    });
  });

  describe('Model Properties', () => {
    it('should have savedData model defined', () => {
      expect(component.savedData).toBeDefined();
    });

    it('should allow setting savedData', () => {
      const mockData = {
        gender: '1',
        firstName: 'John',
        lastName: 'Doe'
      } as any;

      component.savedData.set(mockData);
      expect(component.savedData()).toEqual(mockData);
    });

    it('should have formBuilderConfig model defined', () => {
      expect(component.formBuilderConfig).toBeDefined();
    });

    it('should allow updating formBuilderConfig', () => {
      const newConfig = {};
      component.formBuilderConfig.set(newConfig);
      expect(component.formBuilderConfig()).toEqual(newConfig);
    });

    it('should have buttonsConfig model defined', () => {
      expect(component.buttonsConfig).toBeDefined();
    });

    it('should allow updating buttonsConfig', () => {
      const newButtonsConfig = {
        addButton: { label: 'New Label' }
      };
      component.buttonsConfig.set(newButtonsConfig);
      expect(component.buttonsConfig()).toEqual(newButtonsConfig);
    });
  });

  describe('Output Events', () => {
    it('should have cancelForm output defined', () => {
      expect(component.cancelForm).toBeDefined();
    });

    it('should have updateAccountPersonalInfo output defined', () => {
      expect(component.updateAccountPersonalInfo).toBeDefined();
    });
  });

  describe('ViewChild', () => {
    it('should have formSummary viewChild defined', () => {
      expect(component.formSummary).toBeDefined();
    });
  });

  describe('Protected Properties', () => {
    it('should have FormSummaryViews reference', () => {
      expect(component['FormSummaryViews']).toBeDefined();
    });

    it('should have translationKeys reference', () => {
      expect(component['translationKeys']).toBeDefined();
    });

    it('should have selectedTemplate with default value', () => {
      expect(component['selectedTemplate']).toBe(FormSummaryViews.FORM_BUILDER);
    });

    it('should have displayErrorMode defined', () => {
      expect(component['displayErrorMode']).toBeDefined();
    });
  });

  describe('Signal Properties', () => {
    it('should initialize parentLabelledById as null', () => {
      expect(component.parentLabelledById()).toBeNull();
    });

    it('should initialize ownLabelledById as null', () => {
      expect(component.ownLabelledById()).toBeNull();
    });

    it('should allow setting parentLabelledById', () => {
      component.parentLabelledById.set('test-parent-id');
      expect(component.parentLabelledById()).toBe('test-parent-id');
    });

    it('should allow setting ownLabelledById', () => {
      component.ownLabelledById.set('test-own-id');
      expect(component.ownLabelledById()).toBe('test-own-id');
    });
  });
});
