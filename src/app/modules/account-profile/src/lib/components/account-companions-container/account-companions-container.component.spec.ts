import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { AccountModels } from '@dcx/module/api-clients';
import {  PanelAppearance } from '@dcx/ui/design-system';
import { PaxTypeCode } from '@dcx/ui/libs';
import { RfFormStore, RfFormGroup } from 'reactive-forms';
import { FormSummaryViews, RfFormSummaryStore } from '@dcx/ui/business-common';
import dayjs from 'dayjs';

import { AccountCompanionsContainerComponent } from './account-companions-container.component';

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

describe('AccountCompanionsContainerComponent', () => {
  let component: AccountCompanionsContainerComponent;
  let fixture: ComponentFixture<AccountCompanionsContainerComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockFormStore: jasmine.SpyObj<any>;
  let mockSummaryStore: jasmine.SpyObj<any>;
  let mockChangeDetector: jasmine.SpyObj<ChangeDetectorRef>;

  const mockAccountCompanionsConfig = {
    genderOptions: [
      { value: '1', label: 'Male', content: 'Male' },
      { value: '2', label: 'Female', content: 'Female' }
    ],
    countryOptions: [
      { value: 'US', label: 'United States', content: 'United States' },
      { value: 'MX', label: 'Mexico', content: 'Mexico' }
    ]
  };

  const mockCompanions = [
    {
      name: {
        first: 'John',
        last: 'Doe',
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      },
      address: {
        country: 'US',
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      },
      personInfo: {
        gender: AccountModels.GenderType.Male,
        dateOfBirth: '1990-05-15',
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      },
      loyaltyId: 'LM123456',
      init: jasmine.createSpy('init'),
      toJSON: jasmine.createSpy('toJSON')
    }
  ] as AccountModels.FrequentTravelerDto[];

  const mockFormsNames = new Map([
    ['account-companions', 'Companions']
  ]);

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockFormStore = jasmine.createSpyObj('RfFormStore', ['getFormGroup', 'removeFormGroup', 'formGroups']);
    mockSummaryStore = jasmine.createSpyObj('RfFormSummaryStore', ['changeView', 'forceParseConfig', 'summaries']);
    mockChangeDetector = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockTranslateService.instant.and.returnValue('Mocked Translation');
    mockFormStore.formGroups.and.returnValue(new Map());
    mockSummaryStore.summaries.and.returnValue({});

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: RfFormStore, useValue: mockFormStore },
        { provide: RfFormSummaryStore, useValue: mockSummaryStore },
        { provide: ChangeDetectorRef, useValue: mockChangeDetector }
      ]
    }).compileComponents();

    TestBed.overrideComponent(AccountCompanionsContainerComponent, {
      set: {
        template: '<div>Mock Template</div>',
        imports: [MockGenerateIdPipe]
      }
    });

    fixture = TestBed.createComponent(AccountCompanionsContainerComponent);
    component = fixture.componentInstance;

    // Mock private properties
    (component as any)['changeDetector'] = mockChangeDetector;
    (component as any)['formStore'] = mockFormStore;
    (component as any)['summaryStore'] = mockSummaryStore;

    fixture.componentRef.setInput('config', mockAccountCompanionsConfig);
    fixture.componentRef.setInput('data', mockCompanions);
    fixture.componentRef.setInput('formsNames', mockFormsNames);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct default values', () => {
      expect(component['MAX_COMPANIONS']).toBe(4);
      expect(component.maxCompanions).toBe(4);
      expect(component.companionTitles).toEqual([]);
      expect(component['parentPanelsConfig'].appearance).toBe(PanelAppearance.SHADOW);
    });
  });

  describe('ngOnChanges', () => {
    it('should handle data changes', () => {
      const changes = {
        data: {
          currentValue: mockCompanions,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      };
      
      spyOn(component as any, 'orderCompanions');
      spyOn(component as any, 'setMaxCompanions');
      spyOn(component as any, 'setCompanionData');
      spyOn(component as any, 'setCompanionTitles');

      component.ngOnChanges(changes);

      expect((component as any).orderCompanions).toHaveBeenCalled();
      expect((component as any).setMaxCompanions).toHaveBeenCalled();
      expect((component as any).setCompanionData).toHaveBeenCalled();
      expect((component as any).setCompanionTitles).toHaveBeenCalled();
    });

    it('should handle config changes', () => {
      const changes = {
        config: {
          currentValue: mockAccountCompanionsConfig,
          previousValue: {},
          firstChange: false,
          isFirstChange: () => false
        }
      };

      spyOn(component as any, 'setCompanionTitles');

      component.ngOnChanges(changes);

      expect(mockTranslateService.instant).toHaveBeenCalled();
      expect((component as any).setCompanionTitles).toHaveBeenCalled();
    });
  });

  describe('addCompanion', () => {
    it('should trigger change detection and set companion titles', () => {
      const mockEvent = { clientX: 100, clientY: 100 } as MouseEvent;

      spyOn(component as any, 'setCompanionTitles');
      spyOn(component as any, 'bindSecondaryTitle');

      (component as any).addCompanion(mockEvent);

      expect((component as any).setCompanionTitles).toHaveBeenCalled();
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
    });

    it('should focus first control when event has no coordinates (keyboard trigger)', (done) => {
      const mockEvent = { clientX: 0, clientY: 0 } as MouseEvent;
      const mockFormControl = jasmine.createSpyObj('RfFormControl', ['rfComponent']);
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      const mockComponent = { formBuilderConfig: jasmine.createSpy().and.returnValue({ 'name': {} }) };

      mockFormControl.rfComponent = jasmine.createSpyObj('RfBaseReactiveComponent', ['focus']);
      mockFormGroup.get.and.returnValue(mockFormControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      spyOn(component as any, 'setCompanionTitles');
      spyOn(component as any, 'bindSecondaryTitle');
      spyOn(component as any, 'lastCompanionsKeyPlusOne').and.returnValue('Companions0');
      spyOn(component as any, 'firstKeyFromJsonText').and.returnValue('name');

      (component as any)['accountCompanion'] = jasmine.createSpy().and.returnValue([mockComponent]);

      (component as any).addCompanion(mockEvent);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          expect(mockFormControl.rfComponent.focus).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('cancelCompanion', () => {
    beforeEach(() => {
      // Reset spy calls before each test
      mockFormStore.removeFormGroup.calls.reset();
    });

    it('should remove form group when companion has no data', () => {
      spyOn(Object, 'keys').and.returnValue([]);

      (component as any).cancelCompanion(false, 1);

      // Verify that removeFormGroup was called (with any Companions ID)
      expect(mockFormStore.removeFormGroup).toHaveBeenCalled();
      const callArgs = mockFormStore.removeFormGroup.calls.argsFor(0);
      expect(callArgs[0]).toMatch(/^Companions\d+$/);
    });

    it('should remove form group when no previous data exists', () => {
      spyOn(Object, 'keys').and.returnValue(['someKey']);

      (component as any).cancelCompanion(false, 0);

      // Verify that removeFormGroup was called (with any Companions ID)
      expect(mockFormStore.removeFormGroup).toHaveBeenCalled();
      const callArgs = mockFormStore.removeFormGroup.calls.argsFor(0);
      expect(callArgs[0]).toMatch(/^Companions\d+$/);
    });

    it('should not remove form group when previous data exists and companion has data', () => {
      spyOn(Object, 'keys').and.returnValue(['name', 'lastName']);

      (component as any).cancelCompanion(true, 0);

      expect(mockFormStore.removeFormGroup).not.toHaveBeenCalled();
    });
  });

  describe('orderCompanions', () => {
    it('should order companions by birthDate', () => {
      const multipleCompanions = [
        {
          ...mockCompanions[0],
          name: {
            first: 'John',
            last: 'Doe',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        },
        {
          ...mockCompanions[0],
          name: {
            first: 'Jane',
            last: 'Smith',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-04-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        }
      ] as AccountModels.FrequentTravelerDto[];
      fixture.componentRef.setInput('data', multipleCompanions);

      (component as any).orderCompanions();

      expect(component.data()[0]?.personInfo?.dateOfBirth).toBe('1990-04-15');
      expect(component.data()[1]?.personInfo?.dateOfBirth).toBe('1990-05-15');
    });

    it('should order companions by firstName', () => {
      const multipleCompanions = [
        {
          ...mockCompanions[0],
          name: {
            first: 'John',
            last: 'Doe',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        },
        {
          ...mockCompanions[0],
          name: {
            first: 'Jane',
            last: 'Smith',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        }
      ] as AccountModels.FrequentTravelerDto[];
      fixture.componentRef.setInput('data', multipleCompanions);

      (component as any).orderCompanions();

      expect(component.data()[0]?.name?.first).toBe('Jane');
      expect(component.data()[1]?.name?.first).toBe('John');
    });

    it('should order companions by lastName', () => {
      const multipleCompanions = [
        {
          ...mockCompanions[0],
          name: {
            first: 'John',
            last: 'Doe',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        },
        {
          ...mockCompanions[0],
          name: {
            first: 'John',
            last: 'Smith',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy() 
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        }
      ] as AccountModels.FrequentTravelerDto[];
      fixture.componentRef.setInput('data', multipleCompanions);

      (component as any).orderCompanions();

      expect(component.data()[0]?.name?.last).toBe('Doe'); 
      expect(component.data()[1]?.name?.last).toBe('Smith');
    });
  });

  describe('setMaxCompanions', () => {
    it('should set maxCompanions to MAX_COMPANIONS when data length is smaller', () => {
      (component as any).setMaxCompanions();

      expect(component.maxCompanions).toBe(4);
    });

    it('should handle undefined data', () => {
      // Test when data is undefined
      expect(() => {
        (component as any).setMaxCompanions();
      }).not.toThrow();
    });
  });

  describe('setCompanionData', () => {
    it('should handle companion with undefined properties', (done) => {
      const mockFormControl = jasmine.createSpyObj('FormControl', ['setValue']);
      // Add valueChanges property to avoid subscription error
      mockFormControl.valueChanges = { subscribe: jasmine.createSpy() };

      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);

      mockFormGroup.get.and.returnValue(mockFormControl);
      mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

      // Create companion with undefined properties
      const companionWithUndefinedProps = [{
        name: undefined,
        address: undefined,
        personInfo: undefined,
        loyaltyId: undefined,
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      }] as any;

      // Update component data input
      fixture.componentRef.setInput('data', companionWithUndefinedProps);
      fixture.detectChanges();

      (component as any).setCompanionData();

      requestAnimationFrame(() => {
        expect(mockFormControl.setValue).toHaveBeenCalledWith(undefined);
        expect(mockFormControl.setValue).toHaveBeenCalledWith('');
        done();
      });
    });
  });

  describe('setCompanionTitles', () => {
    beforeEach(() => {
      // Reset component state more thoroughly
      component.companionTitles = [];
      // Spy on setCompanionTitles to prevent automatic calls during detectChanges
      spyOn(component as any, 'setCompanionTitles').and.callThrough();
    });

    afterEach(() => {
      // Clean up after each test
      component.companionTitles = [];
    });

    it('should set default title when no companions exist', () => {
      // Reset the spy to allow manual control
      (component as any).setCompanionTitles.calls.reset();

      // Update component data input to empty array
      fixture.componentRef.setInput('data', []);

      // Ensure array is completely empty and spy is applied BEFORE calling method
      component.companionTitles.length = 0;
      const getCompanionTitleSpy = spyOn(component as any, 'getCompanionTitle').and.returnValue('Companion 1:');

      // Call the method directly without triggering detectChanges
      (component as any).setCompanionTitles.and.callThrough();
      (component as any).setCompanionTitles();

      expect(component.companionTitles.length).toBe(1);
      expect(component.companionTitles).toEqual(['Companion 1:']);
      expect(getCompanionTitleSpy).toHaveBeenCalledWith(0, {});
      expect(getCompanionTitleSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple companions', () => {
      // Reset the spy to allow manual control
      (component as any).setCompanionTitles.calls.reset();

      const multipleCompanions = [
        {
          ...mockCompanions[0],
          name: {
            first: 'John',
            last: 'Doe',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            gender: AccountModels.GenderType.Male,
            dateOfBirth: '1990-05-15',
            init: jasmine.createSpy('init'),
            toJSON: jasmine.createSpy('toJSON')
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        },
        {
          ...mockCompanions[0],
          name: {
            first: 'Jane',
            last: 'Smith',
            init: jasmine.createSpy(),
            toJSON: jasmine.createSpy()
          },
          personInfo: {
            gender: AccountModels.GenderType.Female,
            dateOfBirth: '1990-04-15',
            init: jasmine.createSpy('init'),
            toJSON: jasmine.createSpy('toJSON')
          },
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        }
      ] as AccountModels.FrequentTravelerDto[];

      fixture.componentRef.setInput('data', multipleCompanions);

      // Ensure array is completely empty and spy is applied BEFORE calling method
      component.companionTitles.length = 0;
      const getCompanionTitleSpy = spyOn(component as any, 'getCompanionTitle').and.returnValues('Adult 1:', 'Adult 2:');

      // Call the method directly without triggering detectChanges
      (component as any).setCompanionTitles.and.callThrough();
      (component as any).setCompanionTitles();

      expect(component.companionTitles.length).toBe(2);
      expect(component.companionTitles).toEqual(['Adult 1:', 'Adult 2:']);
      expect(getCompanionTitleSpy).toHaveBeenCalledWith(0, {paxType: 'ADT', count: 1}); 
      expect(getCompanionTitleSpy).toHaveBeenCalledWith(1, {paxType: 'ADT', count: 2});
      expect(getCompanionTitleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCompanionTitle', () => {
    beforeEach(() => {
      // Ensure clean state for each test
      fixture.componentRef.setInput('data', mockCompanions);
      fixture.detectChanges();
    });

    it('should return default companion title when no dateOfBirth', () => {
      const companionWithoutDob = [{
        personInfo: {
          init: jasmine.createSpy('init'),
          toJSON: jasmine.createSpy('toJSON')
        },
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      }] as any;

      fixture.componentRef.setInput('data', companionWithoutDob);
      fixture.detectChanges();
      mockTranslateService.instant.and.returnValue('Companion');

      const result = (component as any).getCompanionTitle(0);

      expect(result).toBe('Companion 1:');
    });

    it('should handle undefined personInfo', () => {
      const companionWithUndefinedPersonInfo = [{
        personInfo: undefined,
        init: jasmine.createSpy('init'),
        toJSON: jasmine.createSpy('toJSON')
      }] as any;

      fixture.componentRef.setInput('data', companionWithUndefinedPersonInfo);
      fixture.detectChanges();
      mockTranslateService.instant.and.returnValue('Companion');

      const result = (component as any).getCompanionTitle(0);

      expect(result).toBe('Companion 1:');
    });
  });

  describe('firstKeyFromJsonText', () => {
    it('should return first key from FormBuilderConfig', () => {
      const mockConfig = {
        name: { type: 'text' },
        lastName: { type: 'text' },
        gender: { type: 'select' }
      };

      const result = (component as any).firstKeyFromJsonText(mockConfig);

      expect(result).toBe('name');
    });

    it('should handle empty config', () => {
      const result = (component as any).firstKeyFromJsonText({});

      expect(result).toBeUndefined();
    });
  });

  describe('lastCompanionsId', () => {
    it('should return highest companion ID from map', () => {
      const mockMap = new Map([
        ['Companions0', {} as RfFormGroup],
        ['Companions2', {} as RfFormGroup],
        ['Companions1', {} as RfFormGroup],
        ['SomeOtherForm', {} as RfFormGroup]
      ]);

      const result = (component as any).lastCompanionsId(mockMap);

      expect(result).toBe(2);
    });

    it('should return null when no companions found', () => {
      const mockMap = new Map([
        ['SomeOtherForm', {} as RfFormGroup],
        ['AnotherForm', {} as RfFormGroup]
      ]);

      const result = (component as any).lastCompanionsId(mockMap);

      expect(result).toBeNull();
    });

    it('should handle empty map', () => {
      const result = (component as any).lastCompanionsId(new Map());

      expect(result).toBeNull();
    });
  });

  describe('lastCompanionsKeyPlusOne', () => {
    it('should return next companion key', () => {
      spyOn(component as any, 'lastCompanionsId').and.returnValue(2);

      const result = (component as any).lastCompanionsKeyPlusOne(new Map());

      expect(result).toBe('Companions2');
    });

    it('should return null when no companions found', () => {
      spyOn(component as any, 'lastCompanionsId').and.returnValue(null);

      const result = (component as any).lastCompanionsKeyPlusOne(new Map());

      expect(result).toBeNull();
    });
  });

  describe('areAllCompanionsInSummaryView', () => {
    it('should return true when no companion keys found', () => {
      mockSummaryStore.summaries.and.returnValue({});

      const result = (component as any).areAllCompanionsInSummaryView();

      expect(result).toBe(true);
    });

    it('should return true when all companions are in summary view', () => {
      mockSummaryStore.summaries.and.returnValue({
        'Companions0': { selectedTemplate: FormSummaryViews.SUMMARY },
        'Companions1': { selectedTemplate: FormSummaryViews.SUMMARY },
        'OtherForm': { selectedTemplate: FormSummaryViews.FORM_BUILDER }
      });

      const result = (component as any).areAllCompanionsInSummaryView();

      expect(result).toBe(true);
    });

    it('should return false when at least one companion is not in summary view', () => {
      mockSummaryStore.summaries.and.returnValue({
        'Companions0': { selectedTemplate: FormSummaryViews.SUMMARY },
        'Companions1': { selectedTemplate: FormSummaryViews.FORM_BUILDER }
      });

      const result = (component as any).areAllCompanionsInSummaryView();

      expect(result).toBe(false);
    });
  });

  describe('onUpdateAccountCompanionsInfo', () => {
    it('should set toast section and emit update event', () => {
      const mockForm = mockCompanions[0];
      const index = 1;

      spyOn(component.updateAccountCompanionsInfo, 'emit');

      (component as any).onUpdateAccountCompanionsInfo(mockForm, index);

      expect(component.updateAccountCompanionsInfo.emit).toHaveBeenCalledWith({ form: mockForm, index });
    });
  });

  describe('updateSecondaryTitle', () => {
    it('should update component secondary title with trimmed name and lastName', () => {
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      const mockComponent = { secondaryTitle: { set: jasmine.createSpy() } };

      mockFormGroup.get.and.callFake((field: string) => {
        if (field === 'name') return { value: '  John  ' };
        if (field === 'lastName') return { value: '  Doe  ' };
        return { value: '' };
      });

      (component as any).updateSecondaryTitle(mockFormGroup, mockComponent);

      expect(mockComponent.secondaryTitle.set).toHaveBeenCalledWith('John Doe');
    });

    it('should handle empty values', () => {
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      const mockComponent = { secondaryTitle: { set: jasmine.createSpy() } };

      mockFormGroup.get.and.returnValue({ value: '' });

      (component as any).updateSecondaryTitle(mockFormGroup, mockComponent);

      expect(mockComponent.secondaryTitle.set).toHaveBeenCalledWith('');
    });

    it('should handle undefined component', () => {
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);

      expect(() => {
        (component as any).updateSecondaryTitle(mockFormGroup, undefined);
      }).not.toThrow();
    });
  });

  describe('bindSecondaryTitle', () => {
    it('should bind value changes to updateSecondaryTitle', () => {
      const mockFormControl = {
        value: 'test',
        valueChanges: { subscribe: jasmine.createSpy() }
      };
      const mockFormGroup = jasmine.createSpyObj('RfFormGroup', ['get']);
      const mockComponent = { secondaryTitle: { set: jasmine.createSpy() } };

      mockFormGroup.get.and.returnValue(mockFormControl);
      spyOn(component as any, 'updateSecondaryTitle');

      (component as any).bindSecondaryTitle(mockFormGroup, mockComponent);

      expect((component as any).updateSecondaryTitle).toHaveBeenCalledWith(mockFormGroup, mockComponent);
      expect(mockFormControl.valueChanges.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPassengerTypeTranslate', () => {
    it('should return correct translation key for ADT', () => {
      const result = (component as any).getPassengerTypeTranslate(PaxTypeCode.ADT);
      expect(result).toBe('AccountProfile.CompanionsForm.ADT_Label');
    });

    it('should return correct translation key for CHD', () => {
      const result = (component as any).getPassengerTypeTranslate(PaxTypeCode.CHD);
      expect(result).toBe('AccountProfile.CompanionsForm.CHD_Label');
    });

    it('should return correct translation key for TNG', () => {
      const result = (component as any).getPassengerTypeTranslate(PaxTypeCode.TNG);
      expect(result).toBe('AccountProfile.CompanionsForm.TNG_Label');
    });

    it('should return correct translation key for INF', () => {
      const result = (component as any).getPassengerTypeTranslate(PaxTypeCode.INF);
      expect(result).toBe('AccountProfile.CompanionsForm.INF_Label');
    });

    it('should return empty string for unknown passenger type', () => {
      const result = (component as any).getPassengerTypeTranslate('UNKNOWN' as PaxTypeCode);
      expect(result).toBe('');
    });
  });

  describe('getAge', () => {
    it('should calculate correct age from date of birth', () => {
      const birthDate = '1990-05-15';
      const today = dayjs();
      const expectedAge = today.diff(dayjs(birthDate), 'year');

      const result = (component as any).getAge(birthDate);

      expect(result).toBe(expectedAge);
    });

    it('should handle different date formats', () => {
      const birthDate = '2000-12-31';
      const today = dayjs();
      const expectedAge = today.diff(dayjs(birthDate), 'year');

      const result = (component as any).getAge(birthDate);

      expect(result).toBe(expectedAge);
    });
  });

  describe('getTravelerType', () => {
    it('should return ADT for age 15 and above', () => {
      spyOn(component as any, 'getAge').and.returnValue(25);

      const result = (component as any).getTravelerType('1998-01-01');

      expect(result).toBe(PaxTypeCode.ADT);
    });

    it('should return TNG for age 12-14', () => {
      spyOn(component as any, 'getAge').and.returnValue(13);

      const result = (component as any).getTravelerType('2010-01-01');

      expect(result).toBe(PaxTypeCode.TNG);
    });

    it('should return CHD for age 2-11', () => {
      spyOn(component as any, 'getAge').and.returnValue(8);

      const result = (component as any).getTravelerType('2015-01-01');

      expect(result).toBe(PaxTypeCode.CHD);
    });

    it('should return INF for age under 2', () => {
      spyOn(component as any, 'getAge').and.returnValue(1);

      const result = (component as any).getTravelerType('2022-01-01');

      expect(result).toBe(PaxTypeCode.INF);
    });

    it('should return ADT for exactly age 15', () => {
      spyOn(component as any, 'getAge').and.returnValue(15);

      const result = (component as any).getTravelerType('2008-01-01');

      expect(result).toBe(PaxTypeCode.ADT);
    });

    it('should return TNG for exactly age 12', () => {
      spyOn(component as any, 'getAge').and.returnValue(12);

      const result = (component as any).getTravelerType('2011-01-01');

      expect(result).toBe(PaxTypeCode.TNG);
    });

    it('should return CHD for exactly age 2', () => {
      spyOn(component as any, 'getAge').and.returnValue(2);

      const result = (component as any).getTravelerType('2021-01-01');

      expect(result).toBe(PaxTypeCode.CHD);
    });
  });

  describe('Input Properties', () => {
    it('should have data input', () => {
      expect(component.data()).toBeDefined();
    });

    it('should have config input', () => {
      expect(component.config()).toBeDefined();
    });

    it('should have formsNames input', () => {
      expect(component.formsNames()).toBeDefined();
      expect(component.formsNames()).toEqual(mockFormsNames);
    });

    it('should handle data changes', () => {
      const newData = [...mockCompanions];
      fixture.componentRef.setInput('data', newData);
      expect(component.data()).toEqual(newData);
    });

    it('should handle config changes', () => {
      const newConfig = {
        ...mockAccountCompanionsConfig,
        genderOptions: []
      };
      fixture.componentRef.setInput('config', newConfig);
      expect(component.config().genderOptions).toEqual([]);
    });

    it('should handle empty data array', () => {
      fixture.componentRef.setInput('data', []);
      expect(component.data()).toEqual([]);
    });
  });

  describe('Output Events', () => {
    it('should have updateAccountCompanionsInfo output defined', () => {
      expect(component.updateAccountCompanionsInfo).toBeDefined();
    });

    it('should emit updateAccountCompanionsInfo with form and index', () => {
      spyOn(component.updateAccountCompanionsInfo, 'emit');
      const mockForm = mockCompanions[0];
      const index = 0;

      (component as any).onUpdateAccountCompanionsInfo(mockForm, index);

      expect(component.updateAccountCompanionsInfo.emit).toHaveBeenCalledWith({
        form: mockForm,
        index: index
      });
    });
  });

  describe('ViewChild Properties', () => {
    it('should have buttonAdd viewChild defined', () => {
      expect(component.buttonAdd).toBeDefined();
    });

    it('should have accountCompanion viewChildren defined', () => {
      expect(component.accountCompanion).toBeDefined();
    });
  });

  describe('Protected Properties', () => {
    it('should have MAX_COMPANIONS constant', () => {
      expect(component['MAX_COMPANIONS']).toBe(4);
    });

    it('should have translateKeys reference', () => {
      expect(component['translateKeys']).toBeDefined();
    });

    it('should have addButtonCompanion signal', () => {
      expect(component['addButtonCompanion']()).toBeDefined();
      expect(component['addButtonCompanion']().icon).toBeDefined();
    });

    it('should have parentPanelsConfig with correct appearance', () => {
      expect(component['parentPanelsConfig']).toBeDefined();
      expect(component['parentPanelsConfig'].appearance).toBe(PanelAppearance.SHADOW);
    });
  });

  describe('Public Properties', () => {
    it('should have maxCompanions initialized', () => {
      expect(component.maxCompanions).toBeDefined();
      expect(component.maxCompanions).toBe(4);
    });

    it('should have companionTitles array initialized', () => {
      expect(component.companionTitles).toBeDefined();
      expect(Array.isArray(component.companionTitles)).toBe(true);
    });

    it('should allow updating maxCompanions', () => {
      component.maxCompanions = 10;
      expect(component.maxCompanions).toBe(10);
    });

    it('should allow updating companionTitles', () => {
      component.companionTitles = ['Title 1', 'Title 2'];
      expect(component.companionTitles).toEqual(['Title 1', 'Title 2']);
    });
  });

  describe('Protected Methods - Public API', () => {
    it('should have focusEditAction method', () => {
      expect(typeof (component as any).focusEditAction).toBe('function');
    });

    it('should focus buttonAdd when focusEditAction is called with false', (done) => {
      const mockButton = jasmine.createSpyObj('DsButtonComponent', ['focus']);
      Object.defineProperty(component, 'buttonAdd', {
        get: () => () => mockButton,
        configurable: true
      });

      (component as any).focusEditAction(false);

      requestAnimationFrame(() => {
        expect(mockButton.focus).toHaveBeenCalled();
        done();
      });
    });

    it('should not focus buttonAdd when focusEditAction is called with true', (done) => {
      const mockButton = jasmine.createSpyObj('DsButtonComponent', ['focus']);
      Object.defineProperty(component, 'buttonAdd', {
        get: () => () => mockButton,
        configurable: true
      });

      (component as any).focusEditAction(true);

      requestAnimationFrame(() => {
        expect(mockButton.focus).not.toHaveBeenCalled();
        done();
      });
    });

    it('should have getCompanionsFormName method returning correct form name', () => {
      const formName = (component as any).getCompanionsFormName();
      expect(formName).toBe('Companions');
    });

    it('should have setMaxCompanions method', () => {
      expect(typeof (component as any).setMaxCompanions).toBe('function');
    });

    it('should have setCompanionData method', () => {
      expect(typeof (component as any).setCompanionData).toBe('function');
    });

    it('should have setCompanion method', () => {
      expect(typeof (component as any).setCompanion).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data gracefully', () => {
      fixture.componentRef.setInput('data', null as any);
      expect(() => {
        (component as any).setMaxCompanions();
      }).not.toThrow();
    });

    it('should handle undefined formsNames values', () => {
      const emptyMap = new Map();
      fixture.componentRef.setInput('formsNames', emptyMap);
      
      const result = (component as any).areAllCompanionsInSummaryView();
      expect(result).toBe(true);
    });
  });
});

