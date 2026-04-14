import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';

import { AccountContactComponent } from './account-contact.component';

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

describe('AccountContactComponent', () => {
  let component: AccountContactComponent;
  let fixture: ComponentFixture<AccountContactComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockConfig = {
    culture: 'en-US',
    countryPrefixOptions: [
      { value: '+1', label: 'United States (+1)', content: 'United States (+1)' },
      { value: '+52', label: 'Mexico (+52)', content: 'Mexico (+52)' }
    ],
    hideEditDocumentsSection: false,
    parentLabelledById: 'parent-contact-id',
    ownLabelledById: 'contact-section-id'
  };

  const mockFormName = 'contact-form';

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

    TestBed.overrideComponent(AccountContactComponent, {
      set: {
        template: '<div>Mock Template</div>',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(AccountContactComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('formName', mockFormName);
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('isLoading', false);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required inputs set', () => {
      expect(component.formName()).toBe(mockFormName);
      expect(component.config()).toEqual(mockConfig);
      expect(component.isLoading()).toBe(false);
    });

    it('should have default columns set to 2', () => {
      expect(component['columns']()).toBe(2);
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });



  describe('saveContact', () => {
    it('should emit updateAccountContactInfo with correct contact data', () => {
      const mockForm = {
        phoneNumber: {
          prefix: '+1',
          phone: '5551234567'
        },
        email: 'test@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const expectedContact = {
        prefix: '+1',
        number: '5551234567',
        email: 'test@example.com'
      };

      expect(component.updateAccountContactInfo.emit).toHaveBeenCalledWith(expectedContact);
    });

    it('should handle missing phoneNumber prefix', () => {
      const mockForm = {
        phoneNumber: {
          phone: '5551234567'
        },
        email: 'test@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBe('');
      expect(emittedData.number).toBe('5551234567');
      expect(emittedData.email).toBe('test@example.com');
    });

    it('should handle missing phoneNumber phone', () => {
      const mockForm = {
        phoneNumber: {
          prefix: '+52'
        },
        email: 'test@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBe('+52');
      expect(emittedData.number).toBe('');
      expect(emittedData.email).toBe('test@example.com');
    });

    it('should handle missing phoneNumber object', () => {
      const mockForm = {
        email: 'test@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBe('');
      expect(emittedData.number).toBe('');
      expect(emittedData.email).toBe('test@example.com');
    });

    it('should return early when form is null', () => {
      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(null);

      expect(component.updateAccountContactInfo.emit).not.toHaveBeenCalled();
    });

    it('should return early when form is undefined', () => {
      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(undefined);

      expect(component.updateAccountContactInfo.emit).not.toHaveBeenCalled();
    });

    it('should handle form with only email', () => {
      const mockForm = {
        email: 'only-email@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBe('');
      expect(emittedData.number).toBe('');
      expect(emittedData.email).toBe('only-email@example.com');
    });
  });

  describe('cancelAccountContact', () => {
    it('should emit cancelForm with true when previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelAccountContact(true);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(true);
    });

    it('should emit cancelForm with false when no previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelAccountContact(false);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('createButtonsConfig', () => {
    it('should create buttons configuration with translated labels', () => {
      mockTranslateService.instant.and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          'AccountProfile.ContactForm.AddContactInformationButton_Label': 'Add Contact Information',
          'AccountProfile.ConfirmButton_Label': 'Confirm',
          'AccountProfile.SavingButton_Label': 'Saving...',
          'AccountProfile.CancelButton_Label': 'Cancel',
          'AccountProfile.EditButton_Label': 'Edit'
        };
        return translations[key] || key;
      });

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.addButton?.label).toBe('Add Contact Information');
      expect(buttonsConfig?.saveButton?.label).toBe('Confirm');
      expect(buttonsConfig?.saveButton?.loadingLabel).toBe('Saving...');
      expect(buttonsConfig?.cancelButton?.label).toBe('Cancel');
      expect(buttonsConfig?.editButton?.label).toBe('Edit');
    });

    it('should set hideEditButton from config', () => {
      const newConfig = { ...mockConfig, hideEditDocumentsSection: true };
      fixture.componentRef.setInput('config', newConfig);

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.hideEditButton).toBe(true);
    });

    it('should default hideEditButton to false when not provided', () => {
      const newConfig = { ...mockConfig };
      delete (newConfig as any).hideEditDocumentsSection;
      fixture.componentRef.setInput('config', newConfig);

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.hideEditButton).toBe(false);
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

    it('should set formBuilderConfig', () => {
      (component as any).internalInit();

      expect(component.formBuilderConfig()).toBeDefined();
      expect(Object.keys(component.formBuilderConfig()).length).toBeGreaterThan(0);
    });

    it('should set parentLabelledById from config', () => {
      (component as any).internalInit();

      expect(component.parentLabelledById()).toBe(mockConfig.parentLabelledById);
    });

    it('should set ownLabelledById from config', () => {
      (component as any).internalInit();

      expect(component.ownLabelledById()).toBe(mockConfig.ownLabelledById);
    });

    it('should handle empty countryPrefixOptions', () => {
      const newConfig = { ...mockConfig, countryPrefixOptions: [] };
      fixture.componentRef.setInput('config', newConfig);

      expect(() => {
        (component as any).internalInit();
      }).not.toThrow();
    });
  });

  describe('Component Properties', () => {
    it('should have correct FormSummaryViews reference', () => {
      expect(component['FormSummaryViews']).toBeDefined();
    });

    it('should have correct translateKeys reference', () => {
      expect(component['translateKeys']).toBeDefined();
    });

    it('should handle custom columns input', () => {
      fixture.componentRef.setInput('columns', 3);
      expect(component['columns']()).toBe(3);
    });

    it('should initialize formBuilderConfig as empty object', () => {
      expect(component.formBuilderConfig()).toEqual({});
    });

    it('should have formSummary viewChild defined', () => {
      expect(component.formSummary).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should handle null parentLabelledById in config', () => {
      const newConfig = { ...mockConfig, parentLabelledById: null };
      fixture.componentRef.setInput('config', newConfig);
      
      (component as any).internalInit();

      expect(component.parentLabelledById()).toBeNull();
    });

    it('should handle null ownLabelledById in config', () => {
      const newConfig = { ...mockConfig, ownLabelledById: null };
      fixture.componentRef.setInput('config', newConfig);
      
      (component as any).internalInit();

      expect(component.ownLabelledById()).toBeNull();
    });

    it('should handle empty formName', () => {
      fixture.componentRef.setInput('formName', '');
      expect(component.formName()).toBe('');
    });

    it('should handle isLoading as true', () => {
      fixture.componentRef.setInput('isLoading', true);
      expect(component.isLoading()).toBe(true);
    });
  });

  describe('Model Properties', () => {
    it('should allow updating formBuilderConfig', () => {
      const newConfig = {};
      component.formBuilderConfig.set(newConfig);
      expect(component.formBuilderConfig()).toEqual(newConfig);
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

    it('should have updateAccountContactInfo output defined', () => {
      expect(component.updateAccountContactInfo).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty email in saveContact', () => {
      const mockForm = {
        phoneNumber: {
          prefix: '+1',
          phone: '5551234567'
        },
        email: ''
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.email).toBe('');
    });

    it('should handle null phoneNumber in saveContact', () => {
      const mockForm = {
        phoneNumber: null,
        email: 'test@example.com'
      };

      spyOn(component.updateAccountContactInfo, 'emit');

      (component as any).saveContact(mockForm);

      const emittedData = (component.updateAccountContactInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.prefix).toBe('');
      expect(emittedData.number).toBe('');
    });

    it('should handle configuration changes', () => {
      const initialConfig = component.config();
      const newConfig = { ...mockConfig, hideEditDocumentsSection: true };
      
      fixture.componentRef.setInput('config', newConfig);
      
      expect(component.config()).not.toBe(initialConfig);
      expect(component.config().hideEditDocumentsSection).toBe(true);
    });
  });
});
