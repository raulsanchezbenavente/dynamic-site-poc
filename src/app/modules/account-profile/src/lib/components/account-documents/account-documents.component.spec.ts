import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import {  AccountV2Models } from '@dcx/module/api-clients';
import { RfFormStore } from 'reactive-forms';
import { FormSummaryViews, RfFormSummaryStore } from '@dcx/ui/business-common';
import { signal } from '@angular/core';

import { AccountProfileDocumentsComponent } from './account-documents.component';

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

describe('AccountProfileDocumentsComponent', () => {
  let component: AccountProfileDocumentsComponent;
  let fixture: ComponentFixture<AccountProfileDocumentsComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockFormStore: any;
  let mockSummaryStore: any;

  const mockDocumentOptions = [
    { value: AccountV2Models.DocumentType.P, label: 'Passport', content: 'Passport' },
    { value: AccountV2Models.DocumentType.I, label: 'ID Card', content: 'ID Card' }
  ];

  const mockCountryOptions = [
    { value: 'US', label: 'United States', content: 'United States' },
    { value: 'MX', label: 'Mexico', content: 'Mexico' }
  ];

  const mockCulture = 'en-US';
  const mockFormName = 'documents-form';

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockFormStore = jasmine.createSpyObj('RfFormStore', ['getFormGroup']);
    mockSummaryStore = jasmine.createSpyObj('RfFormSummaryStore', ['getSelectedView']);

    mockTranslateService.instant.and.returnValue('Mocked Translation');
    mockFormStore.getFormGroup.and.returnValue(null);
    mockSummaryStore.getSelectedView.and.returnValue(signal(FormSummaryViews.SUMMARY));

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: RfFormStore, useValue: mockFormStore },
        { provide: RfFormSummaryStore, useValue: mockSummaryStore }
      ]
    }).compileComponents();

    TestBed.overrideComponent(AccountProfileDocumentsComponent, {
      set: {
        template: '<div>Mock Template</div>',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(AccountProfileDocumentsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('culture', mockCulture);
    fixture.componentRef.setInput('documentOptions', mockDocumentOptions);
    fixture.componentRef.setInput('countryOptions', mockCountryOptions);
    fixture.componentRef.setInput('hasDocuments', false);
    fixture.componentRef.setInput('formName', mockFormName);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have required inputs set', () => {
      expect(component.culture()).toBe(mockCulture);
      expect(component.documentOptions()).toEqual(mockDocumentOptions);
      expect(component.countryOptions()).toEqual(mockCountryOptions);
      expect(component.hasDocuments()).toBe(false);
    });

    it('should have default values', () => {
      expect(component['subtractions']).toEqual([]);
      expect(component['columns']()).toBe(2);
      expect(component.title()).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });

  describe('saveDocumentEdit', () => {
    it('should emit updateAccountDocumentsInfo with correct document data', () => {
      const mockForm = {
        documentType: AccountV2Models.DocumentType.P,
        documentNumber: 'AB123456',
        documentNationality: 'US',
        documentExpirationDate: '2025-12-31'
      };

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(mockForm);

      expect(component.updateAccountDocumentsInfo.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: AccountV2Models.DocumentType.P,
          number: 'AB123456',
          issuedCountry: 'US',
          expirationDate: '2025-12-31'
        })
      );
    });

    it('should handle ID document type', () => {
      const mockForm = {
        documentType: AccountV2Models.DocumentType.I,
        documentNumber: 'ID987654',
        documentNationality: 'MX',
        documentExpirationDate: undefined
      };

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(mockForm);

      const emittedData = (component.updateAccountDocumentsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.type).toBe(AccountV2Models.DocumentType.I);
      expect(emittedData.number).toBe('ID987654');
      expect(emittedData.issuedCountry).toBe('MX');
    });

    it('should return early when form is null', () => {
      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(null);

      expect(component.updateAccountDocumentsInfo.emit).not.toHaveBeenCalled();
    });

    it('should return early when form is undefined', () => {
      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(undefined);

      expect(component.updateAccountDocumentsInfo.emit).not.toHaveBeenCalled();
    });

    it('should handle missing optional fields', () => {
      const mockForm = {
        documentType: AccountV2Models.DocumentType.P,
        documentNumber: 'XY999999'
      };

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(mockForm);

      const emittedData = (component.updateAccountDocumentsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.type).toBe(AccountV2Models.DocumentType.P);
      expect(emittedData.number).toBe('XY999999');
      expect(emittedData.issuedCountry).toBeUndefined();
      expect(emittedData.expirationDate).toBeUndefined();
    });
  });

  describe('cancelDocumentEdit', () => {
    it('should emit cancelForm with true when previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelDocumentEdit(true);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(true);
    });

    it('should emit cancelForm with false when no previous data exists', () => {
      spyOn(component.cancelForm, 'emit');

      (component as any).cancelDocumentEdit(false);

      expect(component.cancelForm.emit).toHaveBeenCalledWith(false);
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

  describe('createButtonsConfig', () => {
    it('should create buttons configuration with translated labels', () => {
      mockTranslateService.instant.and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          'AccountProfile.DocumentsForm.AddDocumentButton_Label': 'Add Document',
          'AccountProfile.ConfirmButton_Label': 'Confirm',
          'AccountProfile.SavingButton_Label': 'Saving...',
          'AccountProfile.CancelButton_Label': 'Cancel',
          'AccountProfile.EditButton_Label': 'Edit'
        };
        return translations[key] || key;
      });

      (component as any).createButtonsConfig();

      const buttonsConfig = component.buttonsConfig();
      expect(buttonsConfig?.addButton?.label).toBe('Add Document');
      expect(buttonsConfig?.saveButton?.label).toBe('Confirm');
      expect(buttonsConfig?.saveButton?.loadingLabel).toBe('Saving...');
      expect(buttonsConfig?.cancelButton?.label).toBe('Cancel');
      expect(buttonsConfig?.editButton?.label).toBe('Edit');
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
      spyOn(component as any, 'setControlIds');

      (component as any).internalInit();

      expect((component as any).createButtonsConfig).toHaveBeenCalled();
    });

    it('should call setControlIds', () => {
      spyOn(component as any, 'createButtonsConfig');
      spyOn(component as any, 'setControlIds');

      (component as any).internalInit();

      expect((component as any).setControlIds).toHaveBeenCalled();
    });

    it('should set formBuilderConfig', () => {
      (component as any).internalInit();

      expect(component.formBuilderConfig()).toBeDefined();
      expect(Object.keys(component.formBuilderConfig()).length).toBeGreaterThan(0);
    });

    it('should handle empty documentOptions', () => {
      fixture.componentRef.setInput('documentOptions', []);

      expect(() => {
        (component as any).internalInit();
      }).not.toThrow();
    });

    it('should handle empty countryOptions', () => {
      fixture.componentRef.setInput('countryOptions', []);

      expect(() => {
        (component as any).internalInit();
      }).not.toThrow();
    });
  });

  describe('setControlIds', () => {
    it('should set summaryControlId correctly', () => {
      (component as any).setControlIds();

      const expectedId = `[data-summary-control-name-id="${mockFormName}-documentExpirationDate"]`;
      expect((component as any).summaryControlId()).toBe(expectedId);
    });

    it('should set formControlId correctly', () => {
      (component as any).setControlIds();

      const expectedId = `[data-form-control-name-id="${mockFormName}-documentExpirationDate"]`;
      expect((component as any).formControlId()).toBe(expectedId);
    });

    it('should handle different formNames', () => {
      fixture.componentRef.setInput('formName', 'custom-form');

      (component as any).setControlIds();

      const expectedSummaryId = `[data-summary-control-name-id="custom-form-documentExpirationDate"]`;
      const expectedFormId = `[data-form-control-name-id="custom-form-documentExpirationDate"]`;

      expect((component as any).summaryControlId()).toBe(expectedSummaryId);
      expect((component as any).formControlId()).toBe(expectedFormId);
    });
  });

  describe('updateDocumentVisibility', () => {
    it('should call toggleHiddenClass with correct parameters', () => {
      const mockElement = document.createElement('div');
      spyOn(document, 'querySelector').and.returnValue(mockElement);
      spyOn(component as any, 'toggleHiddenClass');

      (component as any).updateDocumentVisibility(AccountV2Models.DocumentType.P);

      expect((component as any).toggleHiddenClass).toHaveBeenCalledWith(
        mockElement,
        AccountV2Models.DocumentType.P
      );
    });

    it('should handle null element', () => {
      spyOn(document, 'querySelector').and.returnValue(null);
      spyOn(component as any, 'toggleHiddenClass');

      (component as any).updateDocumentVisibility(AccountV2Models.DocumentType.I);

      expect((component as any).toggleHiddenClass).toHaveBeenCalledWith(
        null,
        AccountV2Models.DocumentType.I
      );
    });
  });

  describe('toggleHiddenClass', () => {
    let mockFormGroup: any;
    let mockDateControl: any;

    beforeEach(() => {
      mockDateControl = jasmine.createSpyObj('FormControl', ['disable', 'enable']);
      mockFormGroup = jasmine.createSpyObj('FormGroup', ['get']);
      mockFormGroup.get.and.returnValue(mockDateControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);
    });

    it('should return early when element is null', () => {
      (component as any).toggleHiddenClass(null, AccountV2Models.DocumentType.P);

      expect(mockFormStore.getFormGroup).not.toHaveBeenCalled();
    });

    it('should disable control and set subtractions for ID document type', () => {
      const mockElement = document.createElement('div');

      (component as any).toggleHiddenClass(mockElement, AccountV2Models.DocumentType.I);

      expect(component['subtractions']).toEqual(['documentExpirationDate']);
      expect(mockDateControl.disable).toHaveBeenCalled();
    });

    it('should enable control and clear subtractions for Passport document type', () => {
      const mockElement = document.createElement('div');
      component['subtractions'] = ['documentExpirationDate'];

      (component as any).toggleHiddenClass(mockElement, AccountV2Models.DocumentType.P);

      expect(component['subtractions']).toEqual([]);
      expect(mockDateControl.enable).toHaveBeenCalled();
    });

    it('should handle different document types', () => {
      const mockElement = document.createElement('div');

      // Test with ID type
      (component as any).toggleHiddenClass(mockElement, AccountV2Models.DocumentType.I);
      expect(mockDateControl.disable).toHaveBeenCalledTimes(1);

      // Reset
      mockDateControl.disable.calls.reset();
      mockDateControl.enable.calls.reset();

      // Test with Passport type
      (component as any).toggleHiddenClass(mockElement, AccountV2Models.DocumentType.P);
      expect(mockDateControl.enable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Constructor Effect', () => {
    it('should subscribe to documentType control valueChanges', () => {
      const mockControl = jasmine.createSpyObj('FormControl', ['']);
      mockControl.valueChanges = jasmine.createSpyObj('Observable', ['subscribe']);
      
      const mockFormGroup = jasmine.createSpyObj('FormGroup', ['get']);
      mockFormGroup.get.and.returnValue(mockControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      // Create new instance to trigger constructor effect
      const newFixture = TestBed.createComponent(AccountProfileDocumentsComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.componentRef.setInput('formName', mockFormName);
      newFixture.componentRef.setInput('culture', mockCulture);
      newFixture.componentRef.setInput('documentOptions', mockDocumentOptions);
      newFixture.componentRef.setInput('countryOptions', mockCountryOptions);
      newFixture.componentRef.setInput('hasDocuments', false);

      newFixture.detectChanges();

      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith(mockFormName);
      expect(mockFormGroup.get).toHaveBeenCalledWith('documentType');
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

    it('should initialize formBuilderConfigForUpdates as empty object', () => {
      expect(component.formBuilderConfigForUpdates()).toEqual({});
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

    it('should handle hasDocuments as true', () => {
      fixture.componentRef.setInput('hasDocuments', true);
      expect(component.hasDocuments()).toBe(true);
    });
  });

  describe('Model Properties', () => {
    it('should allow setting title', () => {
      component.title.set('Test Title');
      expect(component.title()).toBe('Test Title');
    });

    it('should allow updating formBuilderConfig', () => {
      const newConfig = {};
      component.formBuilderConfig.set(newConfig);
      expect(component.formBuilderConfig()).toEqual(newConfig);
    });

    it('should allow updating formBuilderConfigForUpdates', () => {
      const newConfig = {};
      component.formBuilderConfigForUpdates.set(newConfig);
      expect(component.formBuilderConfigForUpdates()).toEqual(newConfig);
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

    it('should have focusEdit output defined', () => {
      expect(component.focusEdit).toBeDefined();
    });

    it('should have updateAccountDocumentsInfo output defined', () => {
      expect(component.updateAccountDocumentsInfo).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document number', () => {
      const mockForm = {
        documentType: AccountV2Models.DocumentType.P,
        documentNumber: '',
        documentNationality: 'US',
        documentExpirationDate: '2025-12-31'
      };

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(mockForm);

      const emittedData = (component.updateAccountDocumentsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.number).toBe('');
    });

    it('should handle null document nationality', () => {
      const mockForm = {
        documentType: AccountV2Models.DocumentType.I,
        documentNumber: 'TEST123',
        documentNationality: null,
        documentExpirationDate: null
      };

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).saveDocumentEdit(mockForm);

      const emittedData = (component.updateAccountDocumentsInfo.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedData.issuedCountry).toBeNull();
    });

    it('should handle configuration changes for documentOptions', () => {
      const newDocumentOptions = [
        { value: 'V', label: 'Visa', content: 'Visa' }
      ];
      
      fixture.componentRef.setInput('documentOptions', newDocumentOptions);
      
      expect(component.documentOptions()).toEqual(newDocumentOptions);
    });

    it('should handle configuration changes for countryOptions', () => {
      const newCountryOptions = [
        { value: 'CA', label: 'Canada', content: 'Canada' }
      ];
      
      fixture.componentRef.setInput('countryOptions', newCountryOptions);
      
      expect(component.countryOptions()).toEqual(newCountryOptions);
    });
  });
});
