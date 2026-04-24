import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { AccountModels } from '@dcx/module/api-clients';
import { ToastService, PanelAppearance } from '@dcx/ui/design-system';
import { RfFormStore } from 'reactive-forms';
import { FormSummaryViews, RfFormSummaryStore } from '@dcx/ui/business-common';

import { TravelDocumentsContainerComponent } from './travel-documents-container.component';
import { TravelDocumentsConfig } from '../../core/models/travel-documents.config';

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

describe('TravelDocumentsContainerComponent', () => {
  let component: TravelDocumentsContainerComponent;
  let fixture: ComponentFixture<TravelDocumentsContainerComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockFormStore: jasmine.SpyObj<any>;
  let mockSummaryStore: jasmine.SpyObj<any>;
  let mockChangeDetector: jasmine.SpyObj<ChangeDetectorRef>;

  const mockTravelDocumentsConfig: TravelDocumentsConfig = {
    culture: 'en-US',
    documentOptions: [
      { value: 'PASSPORT', content: 'Passport' },
      { value: 'ID', content: 'ID Card' }
    ],
    countryOptions: [
      { value: 'US', content: 'United States' },
      { value: 'MX', content: 'Mexico' }
    ],
    documentsFormConfig: {
      title: 'Travel Documents',
      description: 'Manage your travel documents'
    }
  };

  const mockDocuments = [
    {
      type: 'PASSPORT' as any,
      number: '123456789',
      issuedCountry: 'US',
      expirationDate: new Date('2025-12-31'),
      init: jasmine.createSpy('init'),
      toJSON: jasmine.createSpy('toJSON')
    },
    {
      type: 'ID' as any,
      number: '987654321',
      issuedCountry: 'MX',
      expirationDate: new Date('2024-06-15'),
      init: jasmine.createSpy('init'),
      toJSON: jasmine.createSpy('toJSON')
    }
  ] as AccountModels.PersonDocumentDto[];

  const mockFormsNames = new Map([
    ['account-profile-documents', 'Documents']
  ]);

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockFormStore = jasmine.createSpyObj('RfFormStore', ['getFormGroup', 'removeFormGroup', 'resetForm']);
    mockSummaryStore = jasmine.createSpyObj('RfFormSummaryStore', ['changeView', 'forceParseConfig', 'isAnyFormBuilderActive']);
    mockChangeDetector = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockTranslateService.instant.and.returnValue('Mocked Translation');
    mockSummaryStore.isAnyFormBuilderActive.and.returnValue(jasmine.createSpy().and.returnValue(false));

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: RfFormStore, useValue: mockFormStore },
        { provide: RfFormSummaryStore, useValue: mockSummaryStore },
        { provide: ChangeDetectorRef, useValue: mockChangeDetector }
      ]
    }).compileComponents();

    TestBed.overrideComponent(TravelDocumentsContainerComponent, {
      set: {
        template: '<div>Mock Template</div>',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(TravelDocumentsContainerComponent);
    component = fixture.componentInstance;

    // Mock private properties
    (component as any)['changeDetector'] = mockChangeDetector;
    (component as any)['formStore'] = mockFormStore;
    (component as any)['summaryStore'] = mockSummaryStore;

    fixture.componentRef.setInput('config', mockTravelDocumentsConfig);
    fixture.componentRef.setInput('data', mockDocuments);
    fixture.componentRef.setInput('formsNames', mockFormsNames);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct default values', () => {
      expect(component.documents()).toEqual([]);
      expect(component['MAX_DOCUMENTS']).toBe(2);
      expect(component['parentPanelsConfig'].appearance).toBe(PanelAppearance.SHADOW);
    });
  });

  describe('ngOnChanges', () => {
    it('should update documents when data changes', () => {
      const changes = {
        data: {
          currentValue: mockDocuments,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      };

      spyOn(component as any, 'setTravelDocuments');

      component.ngOnChanges(changes);

      expect(component.documents()).toEqual(mockDocuments);
      expect((component as any).setTravelDocuments).toHaveBeenCalledWith(mockDocuments);
    });

    it('should update add button label when config changes', () => {
      const changes = {
        config: {
          currentValue: mockTravelDocumentsConfig,
          previousValue: {},
          firstChange: false,
          isFirstChange: () => false
        }
      };

      const initialButton = component['addButtonDocument']();

      component.ngOnChanges(changes);

      expect(mockTranslateService.instant).toHaveBeenCalled();
      expect(component['addButtonDocument']().label).toBe('Mocked Translation');
    });

    it('should handle both data and config changes simultaneously', () => {
      const changes = {
        data: {
          currentValue: mockDocuments,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        },
        config: {
          currentValue: mockTravelDocumentsConfig,
          previousValue: {},
          firstChange: false,
          isFirstChange: () => false
        }
      };

      spyOn(component as any, 'setTravelDocuments');

      component.ngOnChanges(changes);

      expect(component.documents()).toEqual(mockDocuments);
      expect((component as any).setTravelDocuments).toHaveBeenCalledWith(mockDocuments);
      expect(mockTranslateService.instant).toHaveBeenCalled();
    });
  });

  describe('onAddDocument', () => {
    it('should add new document and trigger change detection', () => {
      const mockEvent = { clientX: 100, clientY: 100 } as MouseEvent;
      component.documents.set([mockDocuments[0]]);

      (component as any).onAddDocument(mockEvent);

      expect(component.documents().length).toBe(2);
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
    });

    it('should change view to form builder for new document', (done) => {
      const mockEvent = { clientX: 100, clientY: 100 } as MouseEvent;
      component.documents.set([]);

      (component as any).onAddDocument(mockEvent);

      // Wait for requestAnimationFrame
      requestAnimationFrame(() => {
        expect(mockSummaryStore.changeView).toHaveBeenCalledWith('Documents0', FormSummaryViews.FORM_BUILDER);
        done();
      });
    });

    it('should focus first control when event has no coordinates (keyboard trigger)', (done) => {
      const mockEvent = { clientX: 0, clientY: 0 } as MouseEvent;
      const mockFormControl = jasmine.createSpyObj('RfFormControl', ['rfComponent']);
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      mockFormControl.rfComponent = jasmine.createSpyObj('RfBaseReactiveComponent', ['focus']);
      mockFormGroup.get.and.returnValue(mockFormControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      component.documents.set([]);

      (component as any).onAddDocument(mockEvent);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('Documents0');
          expect(mockFormGroup.get).toHaveBeenCalledWith('documentType');
          expect(mockFormControl.rfComponent.focus).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('onCancelDocument', () => {
    it('should remove document when no previous data and document is empty', () => {
      component.documents.set([{} as AccountModels.PersonDocumentDto, mockDocuments[0]]);

      (component as any).onCancelDocument(false, 1);

      expect(component.documents().length).toBe(1);
      expect(mockFormStore.removeFormGroup).toHaveBeenCalledWith('Documents1');
    });

    it('should remove document when previous data exists but document is empty', () => {
      component.documents.set([{} as AccountModels.PersonDocumentDto]);

      (component as any).onCancelDocument(true, 0);

      expect(component.documents().length).toBe(0);
      expect(mockFormStore.removeFormGroup).toHaveBeenCalledWith('Documents0');
    });
  });

  describe('onUpdateAccountDocumentsInfo', () => {
    it('should set toast section and emit update event', () => {
      const mockForm = mockDocuments[0];
      const index = 1;

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).onUpdateAccountDocumentsInfo(mockForm, index);

      expect(component.updateAccountDocumentsInfo.emit).toHaveBeenCalledWith({ form: mockForm, index });
    });

    it('should handle different indices correctly', () => {
      const mockForm = mockDocuments[1];
      const index = 0;

      spyOn(component.updateAccountDocumentsInfo, 'emit');

      (component as any).onUpdateAccountDocumentsInfo(mockForm, index);

      expect(component.updateAccountDocumentsInfo.emit).toHaveBeenCalledWith({ form: mockForm, index });
    });
  });

  describe('getDocumentsFormName', () => {
    it('should return correct form name from formsNames map', () => {
      const result = (component as any).getDocumentsFormName();

      expect(result).toBe('Documents');
    });
  });

  describe('setTravelDocuments', () => {
    it('should call setDocument for each document', (done) => {
      spyOn(component as any, 'setDocument');

      (component as any).setTravelDocuments(mockDocuments);

      requestAnimationFrame(() => {
        expect((component as any).setDocument).toHaveBeenCalledTimes(2);
        expect((component as any).setDocument).toHaveBeenCalledWith('Documents', 0, mockDocuments[0]);
        expect((component as any).setDocument).toHaveBeenCalledWith('Documents', 1, mockDocuments[1]);
        done();
      });
    });

    it('should handle empty documents array', (done) => {
      spyOn(component as any, 'setDocument');

      (component as any).setTravelDocuments([]);

      requestAnimationFrame(() => {
        expect((component as any).setDocument).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle undefined documents parameter', (done) => {
      spyOn(component as any, 'setDocument');

      (component as any).setTravelDocuments();

      requestAnimationFrame(() => {
        expect((component as any).setDocument).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('setDocument', () => {
    it('should set form values correctly when form exists', () => {
      const mockFormControl = jasmine.createSpyObj('FormControl', ['setValue']);
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      mockFormGroup.get.and.returnValue(mockFormControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      const document = mockDocuments[0];

      (component as any).setDocument('Documents', 0, document);

      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('Documents0');
      expect(mockFormGroup.get).toHaveBeenCalledWith('documentType');
      expect(mockFormGroup.get).toHaveBeenCalledWith('documentNumber');
      expect(mockFormGroup.get).toHaveBeenCalledWith('documentNationality');
      expect(mockFormGroup.get).toHaveBeenCalledWith('documentExpirationDate');
      expect(mockFormControl.setValue).toHaveBeenCalledWith('PASSPORT');
      expect(mockFormControl.setValue).toHaveBeenCalledWith('123456789');
      expect(mockFormControl.setValue).toHaveBeenCalledWith('US');
      expect(mockSummaryStore.forceParseConfig).toHaveBeenCalledWith('Documents0');
    });

    it('should handle document with undefined expiration date', () => {
      const mockFormControl = jasmine.createSpyObj('FormControl', ['setValue']);
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      mockFormGroup.get.and.returnValue(mockFormControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      const documentWithoutExpiration = {
        ...mockDocuments[0],
        expirationDate: undefined
      };

      (component as any).setDocument('Documents', 0, documentWithoutExpiration);

      expect(mockFormControl.setValue).toHaveBeenCalledTimes(3);
      expect(mockFormControl.setValue).toHaveBeenCalledWith('PASSPORT');
      expect(mockFormControl.setValue).toHaveBeenCalledWith('123456789');
      expect(mockFormControl.setValue).toHaveBeenCalledWith('US');
    });

    it('should handle when form does not exist', () => {
      mockFormStore.getFormGroup.and.returnValue(null);

      expect(() => {
        (component as any).setDocument('Documents', 0, mockDocuments[0]);
      }).not.toThrow();

      expect(mockSummaryStore.forceParseConfig).not.toHaveBeenCalled();
    });
  });

  describe('Input Properties', () => {
    it('should have config input', () => {
      expect(component.config()).toBeDefined();
      expect(component.config()).toEqual(mockTravelDocumentsConfig);
    });

    it('should have data input', () => {
      expect(component.data()).toBeDefined();
    });

    it('should have formsNames input', () => {
      expect(component.formsNames()).toBeDefined();
      expect(component.formsNames()).toEqual(mockFormsNames);
    });

    it('should handle config changes', () => {
      const newConfig: TravelDocumentsConfig = {
        ...mockTravelDocumentsConfig,
        documentOptions: []
      };
      fixture.componentRef.setInput('config', newConfig);
      expect(component.config().documentOptions).toEqual([]);
    });

    it('should handle data changes', () => {
      const newData = [...mockDocuments];
      fixture.componentRef.setInput('data', newData);
      expect(component.data()).toEqual(newData);
    });

    it('should handle empty data array', () => {
      fixture.componentRef.setInput('data', []);
      expect(component.data()).toEqual([]);
    });
  });

  describe('Output Events', () => {
    it('should have updateAccountDocumentsInfo output defined', () => {
      expect(component.updateAccountDocumentsInfo).toBeDefined();
    });

    it('should emit updateAccountDocumentsInfo with form and index', () => {
      spyOn(component.updateAccountDocumentsInfo, 'emit');
      const mockForm = mockDocuments[0];
      const index = 0;

      component.updateAccountDocumentsInfo.emit({ form: mockForm, index });

      expect(component.updateAccountDocumentsInfo.emit).toHaveBeenCalledWith({
        form: mockForm,
        index: index
      });
    });
  });

  describe('ViewChild Properties', () => {
    it('should have buttonAdd viewChild defined', () => {
      expect(component.buttonAdd).toBeDefined();
    });
  });

  describe('Public Properties and Signals', () => {
    it('should have documents signal initialized', () => {
      expect(component.documents).toBeDefined();
      expect(component.documents()).toEqual([]);
    });

    it('should update documents signal', () => {
      component.documents.set(mockDocuments);
      expect(component.documents()).toEqual(mockDocuments);
    });

    it('should have hasDocuments signal initialized', () => {
      expect(component['hasDocuments']()).toBe(true);
    });

    it('should have addButtonDocument signal initialized', () => {
      expect(component['addButtonDocument']()).toBeDefined();
      expect(component['addButtonDocument']().icon).toBeDefined();
      expect(component['addButtonDocument']().icon?.name).toBe('plus-circle-filled');
    });

    it('should have MAX_DOCUMENTS constant', () => {
      expect(component['MAX_DOCUMENTS']).toBe(2);
    });
  });

  describe('Public Method - filterDocumentOptions', () => {
    it('should return all options when selectedType is provided', () => {
      const options = mockTravelDocumentsConfig.documentOptions;
      const result = component.filterDocumentOptions(options, 'PASSPORT');

      expect(result).toEqual(options);
      expect(result.length).toBe(2);
    });

    it('should filter out first document type when no selectedType', () => {
      component.documents.set([mockDocuments[0]]);
      const options = mockTravelDocumentsConfig.documentOptions;
      
      const result = component.filterDocumentOptions(options, undefined);

      expect(result.length).toBe(1);
      expect(result[0].value).toBe('ID');
    });

    it('should return all options when documents array is empty', () => {
      component.documents.set([]);
      const options = mockTravelDocumentsConfig.documentOptions;
      
      const result = component.filterDocumentOptions(options, undefined);

      expect(result).toEqual(options);
    });

    it('should handle empty options array', () => {
      const result = component.filterDocumentOptions([], 'PASSPORT');

      expect(result).toEqual([]);
    });

    it('should handle undefined selectedType with multiple documents', () => {
      component.documents.set(mockDocuments);
      const options = mockTravelDocumentsConfig.documentOptions;
      
      const result = component.filterDocumentOptions(options, undefined);

      expect(result.length).toBe(1);
      expect(result[0].value).toBe('ID');
    });
  });

  describe('Protected Method - focusEditAction', () => {
    it('should focus buttonAdd when success is false', (done) => {
      const mockButton = jasmine.createSpyObj('DsButtonComponent', ['focus']);
      Object.defineProperty(component, 'buttonAdd', {
        get: () => () => mockButton,
        configurable: true
      });

      component['focusEditAction'](false);

      requestAnimationFrame(() => {
        expect(mockButton.focus).toHaveBeenCalled();
        done();
      });
    });

    it('should not focus buttonAdd when success is true', (done) => {
      const mockButton = jasmine.createSpyObj('DsButtonComponent', ['focus']);
      Object.defineProperty(component, 'buttonAdd', {
        get: () => () => mockButton,
        configurable: true
      });

      component['focusEditAction'](true);

      requestAnimationFrame(() => {
        expect(mockButton.focus).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data gracefully', () => {
      fixture.componentRef.setInput('data', null as any);
      expect(() => {
        (component as any).setTravelDocuments();
      }).not.toThrow();
    });

    it('should handle document with null type in filterDocumentOptions', () => {
      component.documents.set([{ type: null } as any]);
      const options = mockTravelDocumentsConfig.documentOptions;
      
      const result = component.filterDocumentOptions(options, undefined);

      expect(result.length).toBe(2);
    });
  });
});
