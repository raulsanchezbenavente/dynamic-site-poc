import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { AccountCompanionsComponent } from './account-companions.component';
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

describe('AccountCompanionsComponent', () => {
  let component: AccountCompanionsComponent;
  let fixture: ComponentFixture<AccountCompanionsComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockGenderOptions = [
    { value: '1', label: 'Male', content: 'Male' },
    { value: '2', label: 'Female', content: 'Female' }
  ];

  const mockCountryOptions = [
    { value: 'US', label: 'United States', content: 'United States' },
    { value: 'MX', label: 'Mexico', content: 'Mexico' }
  ];

  const mockCulture = 'en-US';

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

    TestBed.overrideComponent(AccountCompanionsComponent, {
      set: {
        template: '<div>Mock Template</div>',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(AccountCompanionsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('culture', mockCulture);
    fixture.componentRef.setInput('genderOptions', mockGenderOptions);
    fixture.componentRef.setInput('countryOptions', mockCountryOptions);
    fixture.componentRef.setInput('formName', 'companions-form');
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct default values', () => {
      expect(component.additions).toEqual({});
      expect(component.subtractions).toEqual(['name', 'lastName']);
      expect(component.customFields['genderName']).toEqual({ keys: ['gender', 'name'] });
    });

    it('should have required inputs set', () => {
      expect(component.culture()).toBe(mockCulture);
      expect(component.genderOptions()).toEqual(mockGenderOptions);
      expect(component.countryOptions()).toEqual(mockCountryOptions);
      expect(component.formName()).toBe('companions-form');
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });

  describe('cancelCompanion', () => {
    it('should emit cancelForm with true when previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelCompanion(true);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(true);
    });

    it('should emit cancelForm with false when no previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelCompanion(false);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('saveCompanion', () => {
    it('should emit updateAccountCompanionsInfo with correct companion data', () => {
      const mockForm = {
        name: 'John',
        lastName: 'Doe',
        country: 'US',
        gender: '1',
        birthday: dayjs('1990-05-15'),
        lifemilesNumber: 'LM123456'
      };

      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).saveCompanion(mockForm);

      const expectedCompanion = jasmine.objectContaining({
        name: jasmine.objectContaining({
          first: 'John',
          last: 'Doe'
        }),
        address: jasmine.objectContaining({
          country: 'US'
        }),
        personInfo: jasmine.objectContaining({
          gender: '1',
          dateOfBirth: '1990-05-15'
        }),
        loyaltyId: 'LM123456'
      });

      expect(component.updateAccountCompanionsInfo.emit).toHaveBeenCalledWith(expectedCompanion);
    });

    it('should handle different date formats correctly', () => {
      const mockForm = {
        name: 'Jane',
        lastName: 'Smith',
        country: 'MX',
        gender: '2',
        birthday: dayjs('2000-12-31'),
        lifemilesNumber: 'LM789012'
      };

      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).saveCompanion(mockForm);

      const emittedData = (component.updateAccountCompanionsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.personInfo.dateOfBirth).toBe('2000-12-31');
    });

    it('should return early when form is null', () => {
      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).saveCompanion(null);

      expect(component.updateAccountCompanionsInfo.emit).not.toHaveBeenCalled();
    });

    it('should return early when form is undefined', () => {
      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).saveCompanion(undefined);

      expect(component.updateAccountCompanionsInfo.emit).not.toHaveBeenCalled();
    });

    it('should handle form with missing optional fields', () => {
      const mockForm = {
        name: 'Test',
        lastName: 'User',
        country: 'US',
        gender: '1',
        birthday: dayjs('1985-01-01')
        // lifemilesNumber is missing
      };

      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).saveCompanion(mockForm);

      const emittedData = (component.updateAccountCompanionsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.loyaltyId).toBeUndefined();
      expect(emittedData.name.first).toBe('Test');
      expect(emittedData.name.last).toBe('User');
    });
  });

  describe('createButtonsConfig', () => {
    it('should create buttons configuration with translated labels', () => {
      mockTranslateService.instant.and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          [TranslationKeys.AccountProfile_CompanionsForm_AddCompanionButton_Label]: 'Add Companion',
          [TranslationKeys.AccountProfile_ConfirmButton_Label]: 'Confirm',
          [TranslationKeys.AccountProfile_CancelButton_Label]: 'Cancel',
          [TranslationKeys.AccountProfile_EditButton_Label]: 'Edit'
        };
        return translations[key] || key;
      });

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.addButton?.label).toBe('Add Companion');
      expect(buttonsConfig?.saveButton?.label).toBe('Confirm');
      expect(buttonsConfig?.cancelButton?.label).toBe('Cancel');
      expect(buttonsConfig?.editButton?.label).toBe('Edit');
    });

    it('should call translateService.instant for each button label', () => {
      mockTranslateService.instant.calls.reset();

      (component as any).createButtonsConfig();

      expect(mockTranslateService.instant).toHaveBeenCalledTimes(5);
    });

    it('should handle translation service returning empty strings', () => {
      mockTranslateService.instant.and.returnValue('');

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.addButton?.label).toBe('');
      expect(buttonsConfig?.saveButton?.label).toBe('');
      expect(buttonsConfig?.cancelButton?.label).toBe('');
      expect(buttonsConfig?.editButton?.label).toBe('');
    });
  });

  describe('internalInit', () => {
    it('should set formBuilderConfig with correct parameters', () => {
      spyOn(component as any, 'createButtonsConfig');
      spyOn(component as any, 'createAdditions');

      (component as any).internalInit();

      expect(component.formBuilderConfig()).toBeDefined();
    });

    it('should call createButtonsConfig', () => {
      spyOn(component as any, 'createButtonsConfig');
      spyOn(component as any, 'createAdditions');

      (component as any).internalInit();

      expect((component as any).createButtonsConfig).toHaveBeenCalled();
    });

    it('should call createAdditions', () => {
      spyOn(component as any, 'createButtonsConfig');
      spyOn(component as any, 'createAdditions');

      (component as any).internalInit();

      expect((component as any).createAdditions).toHaveBeenCalled();
    });

    it('should handle empty gender and country options', () => {
      fixture.componentRef.setInput('genderOptions', []);
      fixture.componentRef.setInput('countryOptions', []);

      expect(() => {
        (component as any).internalInit();
      }).not.toThrow();

      expect(component.formBuilderConfig()).toBeDefined();
    });
  });

  describe('createAdditions', () => {
    beforeEach(() => {
      mockTranslateService.instant.and.returnValue('Complete Name');
    });

    it('should create completeName addition with correct structure', () => {
      (component as any).createAdditions();

      expect(component.additions['completeName']).toBeDefined();
      expect(component.additions['completeName'].position).toEqual({ key: 'birthday' });
    });

    it('should create label function that calls translateService', () => {
      (component as any).createAdditions();

      const labelFunction = component.additions['completeName'].label;
      // Based on the reactive-forms types, label function expects a parameter
      const result = labelFunction(null);

      expect(mockTranslateService.instant).toHaveBeenCalled();
      expect(result).toBe('Complete Name');
    });

    it('should create value function that concatenates name and lastName', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const mockData = { name: 'John', lastName: 'Doe' };
      const result = valueFunction(mockData);

      expect(result).toBe('John Doe');
    });

    it('should handle missing name in value function', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const mockData = { lastName: 'Doe' };
      const result = valueFunction(mockData);

      expect(result).toBe('Doe');
    });

    it('should handle missing lastName in value function', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const mockData = { name: 'John' };
      const result = valueFunction(mockData);

      expect(result).toBe('John');
    });

    it('should handle empty object in value function', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const result = valueFunction({});

      expect(result).toBe('');
    });

    it('should handle null data in value function', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const result = valueFunction(null);

      expect(result).toBe('');
    });

    it('should handle undefined data in value function', () => {
      (component as any).createAdditions();

      const valueFunction = component.additions['completeName'].value;
      const result = valueFunction(undefined);

      expect(result).toBe('');
    });
  });

  describe('Input Validation', () => {
    it('should handle null parentLabelledById', () => {
      fixture.componentRef.setInput('parentLabelledById', null);
      expect(component.parentLabelledById()).toBeNull();
    });

    it('should handle null ownLabelledById', () => {
      fixture.componentRef.setInput('ownLabelledById', null);
      expect(component.ownLabelledById()).toBeNull();
    });

    it('should handle empty formName', () => {
      fixture.componentRef.setInput('formName', '');
      expect(component.formName()).toBe('');
    });

    it('should handle empty culture', () => {
      fixture.componentRef.setInput('culture', '');
      expect(component.culture()).toBe('');
    });
  });

  describe('Component Properties', () => {
    it('should have correct FormSummaryViews reference', () => {
      expect(component['FormSummaryViews']).toBeDefined();
    });

    it('should have correct columns default value', () => {
      expect(component['columns']()).toBe(2);
    });

    it('should handle custom columns input', () => {
      fixture.componentRef.setInput('columns', 3);
      expect(component['columns']()).toBe(3);
    });
  });

  describe('Model Properties', () => {
    it('should initialize title as empty string', () => {
      expect(component.title()).toBe('');
    });

    it('should initialize secondaryTitle as empty string', () => {
      expect(component.secondaryTitle()).toBe('');
    });

    it('should allow setting title', () => {
      component.title.set('Test Title');
      expect(component.title()).toBe('Test Title');
    });

    it('should allow setting secondaryTitle', () => {
      component.secondaryTitle.set('Test Secondary Title');
      expect(component.secondaryTitle()).toBe('Test Secondary Title');
    });
  });

  describe('focusEditAction', () => {
    it('should emit focusEdit with true on success', () => {
      spyOn(component.focusEdit, 'emit');

      (component as any).focusEditAction(true);

      expect(component.focusEdit.emit).toHaveBeenCalledWith(true);
    });

    it('should emit focusEdit with false on failure', () => {
      spyOn(component.focusEdit, 'emit');

      (component as any).focusEditAction(false);

      expect(component.focusEdit.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('hideEditButton Input', () => {
    it('should default to false', () => {
      expect(component.hideEditButton()).toBe(false);
    });

    it('should accept true value', () => {
      fixture.componentRef.setInput('hideEditButton', true);
      expect(component.hideEditButton()).toBe(true);
    });

    it('should be reflected in buttonsConfig', () => {
      fixture.componentRef.setInput('hideEditButton', true);

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.hideEditButton).toBe(true);
    });
  });

  describe('Output Events', () => {
    it('should have cancelForm output defined', () => {
      expect(component.cancelForm).toBeDefined();
    });

    it('should have updateAccountCompanionsInfo output defined', () => {
      expect(component.updateAccountCompanionsInfo).toBeDefined();
    });

    it('should have focusEdit output defined', () => {
      expect(component.focusEdit).toBeDefined();
    });
  });

  describe('ViewChild', () => {
    it('should have formSummary viewChild defined', () => {
      expect(component.formSummary).toBeDefined();
    });
  });
});
