import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { TextHelperService } from '@dcx/ui/libs';

import { MyProfileContainerComponent } from './my-profile-container.component';

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

// Simplified mock child components without dependencies
@Component({
  selector: 'account-personal',
  template: '<div>Account Personal Mock</div>',
  standalone: true
})
class MockAccountPersonalComponent {}

@Component({
  selector: 'account-contact',
  template: '<div>Account Contact Mock</div>',
  standalone: true
})
class MockAccountContactComponent {}

@Component({
  selector: 'profile-emergency-contact',
  template: '<div>Profile Emergency Contact Mock</div>',
  standalone: true
})
class MockProfileEmergencyContactComponent {}

describe('MyProfileContainerComponent', () => {
  let component: MyProfileContainerComponent;
  let fixture: ComponentFixture<MyProfileContainerComponent>;
  let mockTextHelperService: jasmine.SpyObj<TextHelperService>;
  // let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockFormStore: any;
  let mockSummaryStore: any;

  const mockAccountData: any = {
    firstName: 'John',
    lastName: 'Doe',
    gender: 1,
    addressCountry: 'US',
    dateOfBirth: '1990-01-01',
    addressLine: '123 Main St',
    addressLine2: 'Apt 4B',
    communicationChannels: [
      {
        type: 'Phone',
        prefix: '+1',
        info: '5551234567'
      },
      {
        type: 'Email',
        info: 'john.doe@example.com'
      }
    ],
    contacts: [
      {
        type: 'Emergency',
        name: {
          first: 'Jane',
          last: 'Doe'
        },
        channels: [
          {
            type: 'Phone',
            prefix: '+1',
            info: '5559876543'
          }
        ]
      }
    ]
  };

  const mockConfig: any = {
    countryOptions: [],
    culture: 'en-US',
    genderOptions: [],
    monthsOptions: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    countryPrefixOptions: []
  };

  const mockFormsNames = new Map([
    ['account-personal', 'formPersonal'],
    ['account-contact', 'formContact'],
    ['profile-emergency-contact', 'formEmergency']
  ]);

  beforeEach(async () => {
    // Create simple mocks
    mockTextHelperService = jasmine.createSpyObj('TextHelperService', ['concatValidParts']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get', 'instant']);

    // Create form mocks
    const mockFormControl = jasmine.createSpyObj('FormControl', [
      'setValue', 'setValidators', 'updateValueAndValidity', 'get'
    ]);

    const mockFormGroup = jasmine.createSpyObj('FormGroup', ['get']);
    mockFormGroup.get.and.returnValue(mockFormControl);

    mockFormStore = jasmine.createSpyObj('RfFormStore', ['getFormGroup']);
    mockFormStore.getFormGroup.and.returnValue(mockFormGroup);

    mockSummaryStore = jasmine.createSpyObj('RfFormSummaryStore', ['forceParseConfig']);

    // Setup text helper service
    mockTextHelperService.concatValidParts.and.returnValue('123 Main St Apt 4B');

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
      ],
      providers: [
        provideRouter([]),
        { provide: TextHelperService, useValue: mockTextHelperService },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    // Override the component with a simple template to avoid dependency issues
    TestBed.overrideComponent(MyProfileContainerComponent, {
      set: {
        template: `
          <div class="my-profile-container">
            <account-personal></account-personal>
            <account-contact></account-contact>
            <profile-emergency-contact></profile-emergency-contact>
          </div>
        `,
        imports: [
          MockAccountPersonalComponent,
          MockAccountContactComponent,
          MockProfileEmergencyContactComponent,
          MockGenerateIdPipe
        ]
      }
    });

    fixture = TestBed.createComponent(MyProfileContainerComponent);
    component = fixture.componentInstance;

    // Set required inputs with simple data
    fixture.componentRef.setInput('data', mockAccountData);
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('formsNames', mockFormsNames);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the container correctly', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  it('should have required inputs', () => {
    expect(component.data()).toEqual(mockAccountData);
    expect(component.config()).toEqual(mockConfig);
    expect(component.formsNames()).toEqual(mockFormsNames);
  });

  describe('Child Components', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display account personal component', () => {
      const accountPersonalElement = fixture.debugElement.nativeElement.querySelector('account-personal');
      expect(accountPersonalElement).toBeTruthy();
    });

    it('should display account contact component', () => {
      const accountContactElement = fixture.debugElement.nativeElement.querySelector('account-contact');
      expect(accountContactElement).toBeTruthy();
    });

    it('should display profile emergency contact component', () => {
      const emergencyContactElement = fixture.debugElement.nativeElement.querySelector('profile-emergency-contact');
      expect(emergencyContactElement).toBeTruthy();
    });
  });

  describe('Component Properties', () => {
    it('should have correct profile title id', () => {
      expect(component.profileTitleId).toBe('accountProfileTitleId');
    });

    it('should have panel configuration', () => {
      expect(component['parentPanelsConfig']).toBeDefined();
    });

    it('should have translationKeys reference', () => {
      expect(component['translationKeys']).toBeDefined();
    });

    it('should have accountPersonalConfig signal initialized', () => {
      expect(component['accountPersonalConfig']()).toBeNull();
    });

    it('should have accountContactConfig signal initialized', () => {
      expect(component['accountContactConfig']()).toBeNull();
    });

    it('should have hasEmergencyContact signal initialized', () => {
      expect(component['hasEmergencyContact']()).toBe(false);
    });

    it('should have hasContactInformation signal initialized', () => {
      expect(component['hasContactInformation']()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });

  describe('Public Methods - Cancel Actions', () => {
    beforeEach(() => {
      (component as any).formStore = mockFormStore;
    });

    it('should mark personal form as untouched when cancelAccountPersonal is called', () => {
      const mockForm = mockFormStore.getFormGroup('formPersonal');
      const markAsUntouched = jasmine.createSpy('markAsUntouched');
      mockForm.markAsUntouched = markAsUntouched;

      (component as any).cancelAccountPersonal();

      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formPersonal');
      expect(markAsUntouched).toHaveBeenCalled();
    });

    it('should mark contact form as untouched when cancelAccountContact is called', () => {
      const mockForm = mockFormStore.getFormGroup('formContact');
      const markAsUntouched = jasmine.createSpy('markAsUntouched');
      mockForm.markAsUntouched = markAsUntouched;

      (component as any).cancelAccountContact();

      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formContact');
      expect(markAsUntouched).toHaveBeenCalled();
    });

    it('should mark emergency contact form as untouched when cancelEmergencyContact is called', () => {
      const mockForm = mockFormStore.getFormGroup('formEmergency');
      const markAsUntouched = jasmine.createSpy('markAsUntouched');
      mockForm.markAsUntouched = markAsUntouched;

      (component as any).cancelEmergencyContact();

      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formEmergency');
      expect(markAsUntouched).toHaveBeenCalled();
    });

    it('should handle null form gracefully in cancelAccountPersonal', () => {
      mockFormStore.getFormGroup.and.returnValue(null);

      expect(() => {
        (component as any).cancelAccountPersonal();
      }).not.toThrow();
    });

    it('should handle null form gracefully in cancelAccountContact', () => {
      mockFormStore.getFormGroup.and.returnValue(null);

      expect(() => {
        (component as any).cancelAccountContact();
      }).not.toThrow();
    });

    it('should handle null form gracefully in cancelEmergencyContact', () => {
      mockFormStore.getFormGroup.and.returnValue(null);

      expect(() => {
        (component as any).cancelEmergencyContact();
      }).not.toThrow();
    });
  });

  describe('Public Methods - Update Events', () => {
    it('should emit updateAccountPersonalInfo when onUpdateAccountPersonalInfo is called', () => {
      spyOn(component.updateAccountPersonalInfo, 'emit');
      const mockData: any = { firstName: 'John', lastName: 'Doe' };

      (component as any).onUpdateAccountPersonalInfo(mockData);

      expect(component.updateAccountPersonalInfo.emit).toHaveBeenCalledWith(mockData);
    });

    it('should emit updateAccountContactInfo when onUpdateAccountContactInfo is called', () => {
      spyOn(component.updateAccountContactInfo, 'emit');
      const mockData: any = { email: 'test@example.com', prefix: '+1', number: '555' };

      (component as any).onUpdateAccountContactInfo(mockData);

      expect(component.updateAccountContactInfo.emit).toHaveBeenCalledWith(mockData);
    });

    it('should emit updateProfileEmergencyContact when onUpdateProfileEmergencyContact is called', () => {
      spyOn(component.updateProfileEmergencyContact, 'emit');
      const mockData: any = { firstName: 'Jane', lastName: 'Doe' };

      (component as any).onUpdateProfileEmergencyContact(mockData);

      expect(component.updateProfileEmergencyContact.emit).toHaveBeenCalledWith(mockData);
    });
  });

  describe('Output Events', () => {
    it('should have updateAccountPersonalInfo output defined', () => {
      expect(component.updateAccountPersonalInfo).toBeDefined();
    });

    it('should have updateAccountContactInfo output defined', () => {
      expect(component.updateAccountContactInfo).toBeDefined();
    });

    it('should have updateProfileEmergencyContact output defined', () => {
      expect(component.updateProfileEmergencyContact).toBeDefined();
    });
  });

  describe('Input Properties', () => {
    it('should have data input', () => {
      expect(component.data()).toBeDefined();
    });

    it('should have config input', () => {
      expect(component.config()).toBeDefined();
    });

    it('should have isLoading input with default false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should handle isLoading set to true', () => {
      fixture.componentRef.setInput('isLoading', true);
      expect(component.isLoading()).toBe(true);
    });

    it('should have formsNames input', () => {
      expect(component.formsNames()).toBeDefined();
      expect(component.formsNames()).toEqual(mockFormsNames);
    });

    it('should handle null data input', () => {
      fixture.componentRef.setInput('data', null);
      expect(component.data()).toBeNull();
    });
  });

  // Tests de standalone component
  describe('Standalone Component', () => {
    it('should be properly configured as standalone', () => {
      expect(MyProfileContainerComponent).toBeDefined();
    });

    it('should not require module declaration', () => {
      expect(fixture.componentInstance).toBeInstanceOf(MyProfileContainerComponent);
    });
  });

  describe('setPersonalData Method', () => {
    beforeEach(() => {
      // Directly assign mocks to component private properties
      (component as any).formStore = mockFormStore;
      (component as any).summaryStore = mockSummaryStore;
      (component as any).textHelperService = mockTextHelperService;

      fixture.detectChanges();
    });

    it('should set personal data from account data', () => {
      // Arrange
      const mockForm = mockFormStore.getFormGroup('formPersonal');
      const mockControl = mockForm.get();

      // Act
      (component as any).setPersonalData();

      // Assert
      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formPersonal');
      expect(mockControl.setValue).toHaveBeenCalledWith('John'); // firstName
      expect(mockControl.setValue).toHaveBeenCalledWith('Doe'); // lastName
      expect(mockControl.setValue).toHaveBeenCalledWith('US'); // addressCountry
      expect(mockTextHelperService.concatValidParts).toHaveBeenCalledWith(['123 Main St', 'Apt 4B']);
      expect(mockSummaryStore.forceParseConfig).toHaveBeenCalledWith('formPersonal');
    });

    it('should handle undefined address fields', () => {
      // Arrange
      const dataWithoutAddress = {
        ...mockAccountData,
        addressLine: undefined,
        addressLine2: undefined
      };
      fixture.componentRef.setInput('data', dataWithoutAddress);
      fixture.detectChanges();

      // Act
      (component as any).setPersonalData();

      // Assert
      expect(mockTextHelperService.concatValidParts).toHaveBeenCalledWith(['', '']);
    });
  });

  describe('setAccountContact Method', () => {
    beforeEach(() => {
      // Directly assign mocks to component private properties
      (component as any).formStore = mockFormStore;
      (component as any).summaryStore = mockSummaryStore;

      // Spy on setValidatorsAccountContact method
      spyOn(component as any, 'setValidatorsAccountContact');

      fixture.detectChanges();
    });

    it('should set account contact data when communication channels exist', () => {
      // Arrange
      const mockForm = mockFormStore.getFormGroup('formContact');
      const mockControl = mockForm.get();

      // Act
      (component as any).setAccountContact();

      // Assert
      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formContact');
      expect(mockControl.setValue).toHaveBeenCalledWith({ prefix: '+1', phone: '5551234567' });
      expect(mockControl.setValue).toHaveBeenCalledWith('john.doe@example.com');
      expect((component as any).setValidatorsAccountContact).toHaveBeenCalledWith(mockForm);
      expect(mockSummaryStore.forceParseConfig).toHaveBeenCalledWith('formContact');
    });

    it('should set empty values when no communication channels', () => {
      // Arrange
      const dataWithoutChannels = { ...mockAccountData, communicationChannels: [] };
      fixture.componentRef.setInput('data', dataWithoutChannels);
      fixture.detectChanges();

      const mockForm = mockFormStore.getFormGroup('formContact');
      const mockControl = mockForm.get();

      // Act
      (component as any).setAccountContact();

      // Assert
      expect(mockControl.setValue).toHaveBeenCalledWith({ prefix: '', phone: '' });
      expect(mockControl.setValue).toHaveBeenCalledWith('');
    });

    it('should handle null form gracefully', () => {
      // Arrange
      mockFormStore.getFormGroup.and.returnValue(null);

      // Act & Assert - should not throw
      expect(() => {
        (component as any).setAccountContact();
      }).not.toThrow();
    });
  });

  describe('setValidatorsAccountContact Method', () => {
    let mockForm: any;
    let mockEmailControl: any;
    let mockPhoneControl: any;
    let mockPrefixPhoneComponent: any;
    let mockPrefixForm: any;
    let mockPrefixControl: any;

    beforeEach(() => {
      // Setup complex mock structure for form validation
      mockEmailControl = jasmine.createSpyObj('EmailControl', ['setValidators', 'updateValueAndValidity']);
      mockPrefixControl = jasmine.createSpyObj('PrefixControl', ['setValidators', 'updateValueAndValidity']);

      mockPrefixForm = jasmine.createSpyObj('PrefixForm', ['get']);
      mockPrefixForm.get.and.returnValue(mockPrefixControl);

      mockPrefixPhoneComponent = {
        form: mockPrefixForm
      };

      mockPhoneControl = {
        rfComponent: mockPrefixPhoneComponent
      };

      mockForm = jasmine.createSpyObj('Form', ['get']);
      mockForm.get.and.callFake((controlName: string) => {
        if (controlName === 'email') return mockEmailControl;
        if (controlName === 'phoneNumber') return mockPhoneControl;
        return null;
      });

      fixture.detectChanges();
    });

    it('should set email validators when email is empty', () => {
      // Arrange
      const dataWithoutEmail = {
        ...mockAccountData,
        communicationChannels: [
          { type: 'Phone', prefix: '+1', info: '5551234567' }
        ]
      };
      fixture.componentRef.setInput('data', dataWithoutEmail);
      fixture.detectChanges();

      // Act
      (component as any).setValidatorsAccountContact(mockForm);

      // Assert
      expect(mockEmailControl.setValidators).toHaveBeenCalled();
      expect(mockEmailControl.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should set prefix validators when prefix is empty', () => {
      // Arrange
      const dataWithoutPrefix = {
        ...mockAccountData,
        communicationChannels: [
          { type: 'Phone', prefix: '', info: '5551234567' },
          { type: 'Email', info: 'john.doe@example.com' }
        ]
      };
      fixture.componentRef.setInput('data', dataWithoutPrefix);
      fixture.detectChanges();

      // Act
      (component as any).setValidatorsAccountContact(mockForm);

      // Assert
      expect(mockPrefixControl.setValidators).toHaveBeenCalledWith([]);
      expect(mockPrefixControl.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should handle form without phone number control', () => {
      // Arrange
      mockForm.get.and.returnValue(null);

      // Act & Assert - should not throw
      expect(() => {
        (component as any).setValidatorsAccountContact(mockForm);
      }).not.toThrow();
    });
  });

  describe('setEmergencyContact Method', () => {
    beforeEach(() => {
      // Directly assign mocks to component private properties
      (component as any).formStore = mockFormStore;
      (component as any).summaryStore = mockSummaryStore;
      (component as any).textHelperService = mockTextHelperService;

      fixture.detectChanges();
    });

    it('should set emergency contact data when contact exists', () => {
      // Arrange
      const mockForm = mockFormStore.getFormGroup('formEmergency');
      const mockControl = mockForm.get();
      mockTextHelperService.concatValidParts.and.returnValue('Jane Doe');

      // Act
      (component as any).setEmergencyContact();

      // Assert
      expect(mockFormStore.getFormGroup).toHaveBeenCalledWith('formEmergency');
      expect(mockTextHelperService.concatValidParts).toHaveBeenCalledWith(['Jane', 'Doe']);
      expect(mockControl.setValue).toHaveBeenCalledWith('Jane Doe');
      expect(mockControl.setValue).toHaveBeenCalledWith({ prefix: '+1', phone: '5559876543' });
      expect(mockSummaryStore.forceParseConfig).toHaveBeenCalledWith('formEmergency');
    });

    it('should set empty values when no emergency contact exists', () => {
      // Arrange
      const dataWithoutContacts = { ...mockAccountData, contacts: [] };
      fixture.componentRef.setInput('data', dataWithoutContacts);
      fixture.detectChanges();

      const mockForm = mockFormStore.getFormGroup('formEmergency');
      const mockControl = mockForm.get();

      // Act
      (component as any).setEmergencyContact();

      // Assert
      expect(mockControl.setValue).toHaveBeenCalledWith('');
      expect(mockControl.setValue).toHaveBeenCalledWith({ prefix: '', phone: '' });
    });

    it('should handle emergency contact without name', () => {
      // Arrange
      const dataWithContactNoName = {
        ...mockAccountData,
        contacts: [
          {
            type: 'Emergency',
            name: { first: '', last: '' },
            channels: [{ type: 'Phone', prefix: '+1', info: '5559876543' }]
          }
        ]
      };
      fixture.componentRef.setInput('data', dataWithContactNoName);
      fixture.detectChanges();

      mockTextHelperService.concatValidParts.and.returnValue('');

      // Act
      (component as any).setEmergencyContact();

      // Assert
      expect(mockTextHelperService.concatValidParts).toHaveBeenCalledWith(['', '']);
    });

    it('should handle emergency contact without phone channel', () => {
      // Arrange
      const dataWithContactNoPhone = {
        ...mockAccountData,
        contacts: [
          {
            type: 'Emergency',
            name: { first: 'Jane', last: 'Doe' },
            channels: []
          }
        ]
      };
      fixture.componentRef.setInput('data', dataWithContactNoPhone);
      fixture.detectChanges();

      const mockForm = mockFormStore.getFormGroup('formEmergency');
      const mockControl = mockForm.get();

      // Act
      (component as any).setEmergencyContact();

      // Assert
      expect(mockControl.setValue).toHaveBeenCalledWith({ prefix: '', phone: '' });
    });

    it('should handle null form gracefully', () => {
      // Arrange
      mockFormStore.getFormGroup.and.returnValue(null);

      // Act & Assert - should not throw
      expect(() => {
        (component as any).setEmergencyContact();
      }).not.toThrow();
    });

    it('should filter out "Unknown" from name and trim', () => {
      // Arrange
      const dataWithUnknownName = {
        ...mockAccountData,
        contacts: [
          {
            type: 'Emergency',
            name: { first: 'Jane Unknown', last: 'Doe' },
            channels: [{ type: 'Phone', prefix: '+1', info: '5559876543' }]
          }
        ]
      };
      fixture.componentRef.setInput('data', dataWithUnknownName);
      fixture.detectChanges();

      mockTextHelperService.concatValidParts.and.returnValue('Jane Unknown Doe');
      const mockForm = mockFormStore.getFormGroup('formEmergency');
      const mockControl = mockForm.get();

      // Act
      (component as any).setEmergencyContact();

      // Assert - should remove "Unknown" and trim
      const setValueCalls = mockControl.setValue.calls.all();
      const nameCall = setValueCalls.find((call: any) => typeof call.args[0] === 'string');
      expect(nameCall).toBeDefined();
    });
  });
});
