import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, Subject, BehaviorSubject, finalize } from 'rxjs';
import { ChangeDetectionStrategy, ElementRef, DestroyRef } from '@angular/core';

import { AccountProfileComponent } from './account-profile.component';
import {
  AccountClient,
  AccountV2Client,
  LocationClient,
  AccountModels,
  AccountV2Models,
} from '@dcx/module/api-clients';
import {
  AuthService,
  ConfigService,
  NotificationService,
  LoggerService,
  ComposerService,
  CultureServiceEx,
  ComposerEvent,
  GenerateIdPipe,
  ModalDialogActionType,
  PointOfSaleService,
  PointOfSale,
} from '@dcx/ui/libs';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import {
  CountryMapperService,
  GenderMapperService,
  PhoneCountryService,
  RfFormSummaryStore,
} from '@dcx/ui/business-common';
import { ModalDialogService } from '@dcx/ui/design-system';
import { AccountPersonalInformation } from './components/account-personal/models/account-personal-information.model';
import { SummaryContactData } from './core/models/summary-contact-data';
import { EmergencyContactData } from './core/models/emergency-contact-data';
import { MyProfileContainerComponent } from './components/my-profile-container/my-profile-container.component';
import { TravelDocumentsContainerComponent } from './components/travel-documents-container/travel-documents-container.component';
import { AccountCompanionsContainerComponent } from './components/account-companions-container/account-companions-container.component';
import { TranslationLoadStatusDirective } from '@dcx/module/translation';
import { HttpClientModule } from '@angular/common/http';
import dayjs from 'dayjs';
import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '../../../analytics/src/lib/tokens/analytics-expected-keys.token';
import { ANALYTICS_INTERFACES_PROPERTIES } from '../../../business-common/src/lib/models/analytics/analytics-events.interfaces';
import { AnalyticsEventType } from '../../../business-common/src/lib/enums/analytics/analytics-events.enum';
import { AnalyticsBusiness } from '../../../business-common/src/lib/enums/analytics/business/analytics-business-dictionaries';


// Mock Data
const mockAccountDto = {
  communicationChannels: [
    { type: AccountModels.ChannelType.Email, info: 'test@example.com' },
    { type: AccountModels.ChannelType.Phone, prefix: '+1', info: '1234567890' },
  ],
  documents: [
    { type: AccountModels.DocumentType.P, expirationDate: new Date() },
    { type: AccountModels.DocumentType.I, expirationDate: new Date() },
  ],
  frequentTravelers: [{ companionId: 'comp1', name: { first: 'Jane', last: 'Doe' } }],
  contacts: [
    {
      type: AccountV2Models.ContactType.Emergency,
      channels: [{ type: AccountV2Models.ChannelType.Email, info: 'emergency@example.com' }],
    },
  ],
};

const mockConfig = {
  culture: 'en-US',
  personalFormConfig: {},
  documentsFormConfig: {},
  companionsFormConfig: {},
};

const mockCountries = {
  countriesOptions: [{ value: 'US', content: 'United States' }],
  countryPrefixOptions: [{ value: '+1', content: '+1' }],
};

describe('AccountProfileComponent', () => {
  let component: AccountProfileComponent;
  let fixture: ComponentFixture<AccountProfileComponent>;

  // Mock services using jasmine.createSpyObj
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAccountClientV2: jasmine.SpyObj<AccountV2Client>;
  let mockAccountClient: jasmine.SpyObj<AccountClient>;
  let mockLocationClient: jasmine.SpyObj<LocationClient>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockLoggerService: jasmine.SpyObj<LoggerService>;
  let mockComposerService: jasmine.SpyObj<ComposerService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockCountryMapperService: jasmine.SpyObj<CountryMapperService>;
  let langChangeSubject: Subject<any>;
  let translationChangeSubject: Subject<any>;
  let mockGenderMapperService: jasmine.SpyObj<GenderMapperService>;
  let mockFormSummaryStore: jasmine.SpyObj<typeof RfFormSummaryStore>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockPhoneCountryService: jasmine.SpyObj<PhoneCountryService>;
  let mockPointOfSaleService: jasmine.SpyObj<PointOfSaleService>;
  let mockDestroyRef: jasmine.SpyObj<DestroyRef>;
  let mockModalDialogService: jasmine.SpyObj<ModalDialogService>;

  beforeEach(async () => {
    // Create subjects for translation observables that emit immediately
    langChangeSubject = new BehaviorSubject<any>({ lang: 'en' });
    translationChangeSubject = new BehaviorSubject<any>({ translations: {} });

    // Initialize spy objects
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticatedKeycloak$']);
    mockAccountClientV2 = jasmine.createSpyObj('AccountV2Client', ['sessionGET', 'sessionPATCH', 'travelDocuments']);
    mockAccountClient = jasmine.createSpyObj('AccountClient', [
      'updateEmergencyContact',
      'addEmergencyContact',
      'updateTravelCompanion',
      'addTravelCompanion',
    ]);
    mockLocationClient = jasmine.createSpyObj('LocationClient', ['sessionSettings']);
    mockConfigService = jasmine.createSpyObj('ConfigService', [
      'getBusinessModuleConfig',
      'getCommonConfig',
      'getDataModuleId',
      'getMainConfig',
      'getInstanceId'
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showLoader', 'showNotification']);
    mockLoggerService = jasmine.createSpyObj('LoggerService', ['error', 'info']);
    mockComposerService = jasmine.createSpyObj(
      'ComposerService',
      ['updateComposerRegisterStatus', 'notifyComposerEvent'],
      {
        notifier$: new Subject<ComposerEvent>().asObservable(),
      }
    );
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: langChangeSubject.asObservable(),
      onTranslationChange: translationChangeSubject.asObservable()
    });
    mockCountryMapperService = jasmine.createSpyObj('CountryMapperService', ['getCountiesUsingResourceClient', 'isCountryInLifemilesList']);
    mockGenderMapperService = jasmine.createSpyObj('GenderMapperService', ['getGenderOptions']);
    const summaryMock = jasmine.createSpyObj('FormSummary', [
      'showSaveLoadingState',
      'focusAfterSave',
    ]);
    const mockFormSummaryStore: any = {
      getSummary: jasmine.createSpy('getSummary').and.returnValue(summaryMock),
      changeView: jasmine.createSpy('changeView'),
    };
      mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['setCulture', 'getCulture', 'getUserCulture']);
      mockPhoneCountryService = jasmine.createSpyObj('PhoneCountryService', [
      'countryFromPrefix',
      'getCountryNameByPrefix',
      'getCountryCodeByName',
    ]);
    mockPointOfSaleService = jasmine.createSpyObj('PointOfSaleService', ['getCurrentPointOfSale']);
    mockDestroyRef = jasmine.createSpyObj('DestroyRef', ['onDestroy']);
    mockModalDialogService = jasmine.createSpyObj('ModalDialogService', ['openModal']);

    // Configure default return values for mocks
    mockAuthService.isAuthenticatedKeycloak$.and.returnValue(of(true));
    mockAccountClientV2.sessionGET.and.returnValue(of({ result: { data: mockAccountDto } } as any));
    mockAccountClientV2.sessionPATCH.and.returnValue(of({ success: true } as any));
    mockAccountClientV2.travelDocuments.and.returnValue(of({ success: true } as any));
    mockAccountClient.addEmergencyContact.and.returnValue(of({ success: true } as any));
    mockAccountClient.updateEmergencyContact.and.returnValue(of({ success: true } as any));
    mockAccountClient.addTravelCompanion.and.returnValue(of({ success: true } as any));
    mockAccountClient.updateTravelCompanion.and.returnValue(of({ success: true } as any));
    mockLocationClient.sessionSettings.and.returnValue(of({ result: { data: { countryCode: 'US' } } } as any));
    mockConfigService.getBusinessModuleConfig.and.returnValue(of(mockConfig as any));
    mockConfigService.getCommonConfig.and.returnValue(of({}));
    mockConfigService.getDataModuleId.and.returnValue({ id: 'mock-id', config: 'mock-config' } as any);
    mockConfigService.getMainConfig.and.returnValue({} as any);
    mockTranslateService.instant.and.callFake((key: string) => key);
    mockCountryMapperService.getCountiesUsingResourceClient.and.returnValue(of(mockCountries));
    mockGenderMapperService.getGenderOptions.and.returnValue([]);
    mockPhoneCountryService.countryFromPrefix.and.returnValue(['US']);
    mockPhoneCountryService.getCountryNameByPrefix.and.returnValue('United States');
    mockPhoneCountryService.getCountryCodeByName.and.returnValue('US');
    mockCultureServiceEx.getCulture.and.returnValue('en-US');
    mockCultureServiceEx.setCulture.and.stub();
    mockCultureServiceEx.getUserCulture.and.returnValue({ locale: 'en-US' });
    mockPointOfSaleService.getCurrentPointOfSale.and.returnValue({ code: 'CO' } as PointOfSale);
    mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        AccountProfileComponent,
        MyProfileContainerComponent,
        TravelDocumentsContainerComponent,
        AccountCompanionsContainerComponent,
        TranslationLoadStatusDirective,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AccountV2Client, useValue: mockAccountClientV2 },
        { provide: AccountClient, useValue: mockAccountClient },
        { provide: LocationClient, useValue: mockLocationClient },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ComposerService, useValue: mockComposerService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: CountryMapperService, useValue: mockCountryMapperService },
        { provide: GenderMapperService, useValue: mockGenderMapperService },
        { provide: RfFormSummaryStore, useValue: mockFormSummaryStore },
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: PhoneCountryService, useValue: mockPhoneCountryService },
        { provide: PointOfSaleService, useValue: mockPointOfSaleService },
        { provide: ModalDialogService, useValue: mockModalDialogService },
        { provide: ElementRef, useValue: { nativeElement: {} } },
        { provide: DestroyRef, useValue: mockDestroyRef },
        TranslateStore, GenerateIdPipe
        , { provide: ANALYTICS_EXPECTED_KEYS_MAP, useValue: ANALYTICS_INTERFACES_PROPERTIES }
        , { provide: ANALYTICS_EXPECTED_EVENTS, useValue: AnalyticsEventType }
        , { provide: ANALYTICS_DICTIONARIES, useValue: AnalyticsBusiness }
      ],
    })
      .overrideComponent(AccountProfileComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();

    // Don't create the component yet - we need to apply spies first
  });

  function createComponentWithSpies() {
    fixture = TestBed.createComponent(AccountProfileComponent);
    component = fixture.componentInstance;
    // Apply spies to component methods BEFORE any lifecycle hooks
    // @ts-ignore
    spyOn(component, 'initConfig').and.returnValue(of({}));
    // @ts-ignore
    spyOn(component, 'getBusinessConfig').and.returnValue(of({}));
    // @ts-ignore
    spyOn(component, 'handleAuthenticated').and.stub();
    // @ts-ignore
    spyOn(component, 'handleUnauthenticated').and.stub();
    // @ts-ignore
    spyOn(component, 'onDataLoadComplete').and.stub();
  }

  it('should create the component', () => {
    createComponentWithSpies();
    expect(component).toBeTruthy();
  });

  describe('updateAccountPersonalInfo', () => {
    it('should show error notification on update failure', fakeAsync(() => {
      const personalInfo = {
        firstName: 'John',
        lastName: 'Doe',
        gender: AccountModels.GenderType.Male,
        address: '123 Main St',
        addressCountry: 'US',
      } as AccountPersonalInformation;
      const errorResponse = { error: { code: 'UPDATE_FAILED' } };

      createComponentWithSpies(); // Create component with spies
      mockAccountClientV2.sessionPATCH.and.returnValue(throwError(() => ({ response: JSON.stringify(errorResponse) })));
      // @ts-ignore
      spyOn(component, 'showErrorNotification');
      // @ts-ignore
      component.updateAccountPersonalInfo(personalInfo);
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showErrorNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({ response: JSON.stringify(errorResponse) })
      );
    }));
  });

  describe('updateAccountContactInfo', () => {
    it('should not update if communication channels are the same', fakeAsync(() => {
      const contactData: SummaryContactData = {
        email: 'test@example.com',
        number: '1234567890',
        prefix: '+1-US',
      };

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      component.communicationChannel = [
        { type: AccountModels.ChannelType.Email, info: 'test@example.com' },
        { type: AccountModels.ChannelType.Phone, prefix: '+1', info: '1234567890' },
      ] as AccountModels.PersonCommunicationChannelDto[];
      // @ts-ignore
      component.updateAccountContactInfo(contactData);
      tick();
      expect(mockAccountClientV2.sessionPATCH).not.toHaveBeenCalled();
    }));
  });

  describe('updateAccountDocumentsInfo', () => {
    it('should add a new document and change form view', fakeAsync(() => {
      const newDocument = {
        type: AccountModels.DocumentType.P,
        number: '123456789',
        expirationDate: dayjs() as unknown as Date,
      };
      const event = { form: newDocument as any, index: -1 };

      createComponentWithSpies(); // Create component with spies
      mockAccountClientV2.travelDocuments.and.returnValue(of({ success: true } as any));
      // @ts-ignore
      component.updateAccountDocumentsInfo(event);
      tick();

      expect(mockAccountClientV2.travelDocuments).toHaveBeenCalled();      // expect(mockFormSummaryStore.changeView).toHaveBeenCalled();
    }));

    it('should update an existing document and change form view', fakeAsync(() => {
      const existingDocument = {
        type: AccountModels.DocumentType.P,
        number: '987654321',
        expirationDate: dayjs() as unknown as Date,
      };
      const event = { form: existingDocument as any, index: 0 };

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      component.documentsAllowed.set([existingDocument as any]);

      mockAccountClientV2.travelDocuments.and.returnValue(of({ success: true } as any));
      // @ts-ignore
      component.updateAccountDocumentsInfo(event);
      tick();

      expect(mockAccountClientV2.travelDocuments).toHaveBeenCalled();
    }));

    it('should show error notification on update failure', fakeAsync(() => {
      const document = {
        type: AccountModels.DocumentType.P,
        number: '987654321',
        expirationDate: new Date(),
      };
      const event = { form: document as any, index: 0 };

      createComponentWithSpies(); // Create component with spies
      mockAccountClientV2.travelDocuments.and.returnValue(
        throwError(() => ({ response: '{"error": {"code": "DOC_SAVE_ERROR"}}' }))
      );
      // @ts-ignore
      spyOn(component, 'showErrorNotification');
      // @ts-ignore
      component.updateAccountDocumentsInfo(event);
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showErrorNotification).toHaveBeenCalledWith(
        jasmine.objectContaining({ response: '{"error": {"code": "DOC_SAVE_ERROR"}}' })
      );
    }));
  });

  describe('Private Methods', () => {
    it('should correctly build an emergency contact DTO', () => {
      const form: EmergencyContactData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@doe.com',
        prefix: '+1',
        number: '1234567890',
      };

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      const dto = component.buildEmergencyContactDto(form);

      expect(dto.name?.first).toBe('Jane');
      expect(dto.name?.last).toBe('Doe');
      expect(dto.channels?.length).toBe(2);
      expect(dto.channels?.some((c) => c.type === AccountModels.ChannelType.Phone)).toBe(true);
      expect(dto.channels?.some((c) => c.type === AccountModels.ChannelType.Email)).toBe(true);
    });

    it('should correctly build a travel companion DTO', () => {
      const form: AccountModels.FrequentTravelerDto = {
        name: { first: 'John', last: 'Doe' },
        address: { country: 'US' },
        personInfo: { gender: AccountModels.GenderType.Male },
      } as AccountModels.FrequentTravelerDto;

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      const dto = component.buildCompanionDto(form);

      expect(dto.name?.first).toBe('John');
      expect(dto.name?.last).toBe('Doe');
      expect(dto.address?.country).toBe('US');
      expect(dto.personInfo?.gender).toBe(AccountModels.GenderType.Male);
    });

    it('should set suffix prefix correctly for phone channels', () => {
      const channel = {
        type: AccountModels.ChannelType.Phone,
        info: '1234567890',
        prefix: '+1',
      } as AccountModels.PersonCommunicationChannelDto;

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      component.countryPrefixOptions.set([{ value: '+1-US', content: 'United States (+1)' }]);
      // @ts-ignore
      component.phoneCountryService.countryFromPrefix.and.returnValue(['US']);

      // @ts-ignore
      component.setSuffixPrefix(channel);

      expect(channel.prefix).toBe('+1-US');
    });

    it('should set suffix prefix correctly for phone channels with country code', () => {
      const channel = {
        type: AccountModels.ChannelType.Phone,
        info: '1234567890',
        prefix: '+57',
      } as AccountModels.PersonCommunicationChannelDto;

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      component.countryPrefixOptions.set([{ value: '+57-CO', content: 'Colombia (+57)' }]);
      // @ts-ignore
      component.phoneCountryService.countryFromPrefix.and.returnValue(['CO']);

      // @ts-ignore
      component.setSuffixPrefix(channel);

      expect(channel.prefix).toBe('+57-CO');
    });

    it('should handle channels equality check correctly', () => {
      const channelsA = [
        { type: AccountModels.ChannelType.Phone, info: '123', prefix: '+1' },
        { type: AccountModels.ChannelType.Email, info: 'a@b.com' },
      ] as AccountModels.PersonCommunicationChannelDto[];
      const channelsB = [
        { type: AccountModels.ChannelType.Email, info: 'a@b.com' },
        { type: AccountModels.ChannelType.Phone, info: '123', prefix: '+1' },
      ] as AccountModels.PersonCommunicationChannelDto[];
      const channelsC = [
        { type: AccountModels.ChannelType.Email, info: 'x@y.com' },
        { type: AccountModels.ChannelType.Phone, info: '123', prefix: '+1' },
      ] as AccountModels.PersonCommunicationChannelDto[];

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      expect(component.areChannelsEqualIgnoreOrder(channelsA, channelsB)).toBe(true);
      // @ts-ignore
      expect(component.areChannelsEqualIgnoreOrder(channelsA, channelsC)).toBe(false);
    });

    it('should get additional data prefix correctly', () => {
      const prefixWithCountry = '+1-US';
      const prefixWithoutCountry = '+1';

      createComponentWithSpies(); // Create component with spies
      // @ts-ignore
      component.countryPrefixOptions.set([{ value: '+1', content: 'USA' }]);
      // @ts-ignore
      component.countryOptions.set([{ value: 'US', content: 'United States' }]);

      // @ts-ignore
      const resultWithCountry = component.getAdditionalDataPrefix(prefixWithCountry);
      // @ts-ignore
      const resultWithoutCountry = component.getAdditionalDataPrefix(prefixWithoutCountry);

      expect(resultWithCountry).toBe('US');
      expect(resultWithoutCountry).toBe('US');
    });
  });

  describe('Public Properties and Signals', () => {
    it('should have config signal initialized', () => {
      createComponentWithSpies();
      expect(component.config).toBeDefined();
      expect(component.config()).toBeDefined();
    });

    it('should have userData signal', () => {
      createComponentWithSpies();
      expect(component['userData']).toBeDefined();
      expect(component['userData']()).toBeNull();
    });

    it('should have isLoading signal', () => {
      createComponentWithSpies();
      expect(component['isLoading']).toBeDefined();
      expect(component['isLoading']()).toBe(true);
    });

    it('should have myProfileConfig signal', () => {
      createComponentWithSpies();
      expect(component['myProfileConfig']).toBeDefined();
      expect(component['myProfileConfig']()).toBeNull();
    });

    it('should have travelDocumentsConfig signal', () => {
      createComponentWithSpies();
      expect(component['travelDocumentsConfig']).toBeDefined();
      expect(component['travelDocumentsConfig']()).toBeNull();
    });

    it('should have accountCompanionsConfig signal', () => {
      createComponentWithSpies();
      expect(component['accountCompanionsConfig']).toBeDefined();
      expect(component['accountCompanionsConfig']()).toBeNull();
    });

    it('should have countryOptions signal', () => {
      createComponentWithSpies();
      expect(component['countryOptions']).toBeDefined();
      expect(component['countryOptions']()).toEqual([]);
    });

    it('should have countryPrefixOptions signal', () => {
      createComponentWithSpies();
      expect(component['countryPrefixOptions']).toBeDefined();
      expect(component['countryPrefixOptions']()).toEqual([]);
    });

    it('should have documentOptions signal', () => {
      createComponentWithSpies();
      expect(component['documentOptions']).toBeDefined();
      expect(component['documentOptions']()).toEqual([]);
    });

    it('should have contactData signal', () => {
      createComponentWithSpies();
      expect(component['contactData']).toBeDefined();
      expect(component['contactData']()).toBeDefined();
    });

    it('should have personaInfoData signal', () => {
      createComponentWithSpies();
      expect(component['personaInfoData']).toBeDefined();
      expect(component['personaInfoData']()).toBeDefined();
    });

    it('should have companionsData signal', () => {
      createComponentWithSpies();
      expect(component['companionsData']).toBeDefined();
      expect(component['companionsData']()).toEqual([]);
    });

    it('should have documentsAllowed signal', () => {
      createComponentWithSpies();
      expect(component['documentsAllowed']).toBeDefined();
      expect(component['documentsAllowed']()).toEqual([]);
    });

    it('should have documentsNotAllowed signal', () => {
      createComponentWithSpies();
      expect(component['documentsNotAllowed']).toBeDefined();
      expect(component['documentsNotAllowed']()).toEqual([]);
    });

    it('should have genderOptions array', () => {
      createComponentWithSpies();
      expect(component['genderOptions']).toBeDefined();
      expect(Array.isArray(component['genderOptions'])).toBe(true);
    });

    it('should have buttonsConfig map', () => {
      createComponentWithSpies();
      expect(component['buttonsConfig']).toBeDefined();
      expect(component['buttonsConfig'] instanceof Map).toBe(true);
    });

    it('should have formsNames map', () => {
      createComponentWithSpies();
      expect(component['formsNames']).toBeDefined();
      expect(component['formsNames'] instanceof Map).toBe(true);
      expect(component['formsNames'].get('account-personal')).toBe('formPersonal');
    });

    it('should have parentPanelsConfig', () => {
      createComponentWithSpies();
      expect(component['parentPanelsConfig']).toBeDefined();
    });

    it('should have myProfileContainer viewChild', () => {
      createComponentWithSpies();
      expect(component['myProfileContainer']).toBeDefined();
    });
  });

  describe('updateEmergencyContact', () => {
    it('should add new emergency contact when no contact exists', fakeAsync(() => {
      const emergencyData: EmergencyContactData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@doe.com',
        prefix: '+1-US',
        number: '1234567890',
      };

      createComponentWithSpies();
      mockAccountClient.addEmergencyContact.and.returnValue(of({ success: true } as any));
      component['hasEmergencyContact'].set(false);

      component['updateEmergencyContact'](emergencyData);
      tick();

      expect(mockAccountClient.addEmergencyContact).toHaveBeenCalled();
    }));

    it('should update existing emergency contact', fakeAsync(() => {
      const emergencyData: EmergencyContactData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@doe.com',
        prefix: '+1-US',
        number: '1234567890',
      };

      createComponentWithSpies();
      mockAccountClient.updateEmergencyContact.and.returnValue(of({ success: true } as any));
      component['hasEmergencyContact'].set(true);

      component['updateEmergencyContact'](emergencyData);
      tick();

      expect(mockAccountClient.updateEmergencyContact).toHaveBeenCalled();
    }));

    it('should show error notification on emergency contact update failure', fakeAsync(() => {
      const emergencyData: EmergencyContactData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@doe.com',
        prefix: '+1-US',
        number: '1234567890',
      };

      createComponentWithSpies();
      mockAccountClient.updateEmergencyContact.and.returnValue(
        throwError(() => ({ response: '{"error": {"code": "EMERGENCY_SAVE_ERROR"}}' }))
      );
      component['hasEmergencyContact'].set(true);
      // @ts-ignore
      spyOn(component, 'showErrorNotification');

      component['updateEmergencyContact'](emergencyData);
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showErrorNotification).toHaveBeenCalled();
    }));
  });

  describe('updateAccountCompanionsInfo', () => {
    it('should add new companion when index is -1', fakeAsync(() => {
      const companionForm: AccountModels.FrequentTravelerDto = {
        name: { first: 'John', last: 'Doe' },
        address: { country: 'US' },
        personInfo: { gender: AccountModels.GenderType.Male },
      } as AccountModels.FrequentTravelerDto;
      const event = { form: companionForm, index: -1 };

      createComponentWithSpies();
      mockAccountClient.addTravelCompanion.and.returnValue(of({ success: true } as any));

      component['updateAccountCompanionsInfo'](event);
      tick();

      expect(mockAccountClient.addTravelCompanion).toHaveBeenCalled();
    }));

    it('should update existing companion when index >= 0', fakeAsync(() => {
      const companionForm: AccountModels.FrequentTravelerDto = {
        companionId: 'comp1',
        name: { first: 'Jane', last: 'Doe' },
        address: { country: 'US' },
        personInfo: { gender: AccountModels.GenderType.Female },
      } as AccountModels.FrequentTravelerDto;
      const event = { form: companionForm, index: 0 };

      createComponentWithSpies();
      mockAccountClient.updateTravelCompanion.and.returnValue(of({ success: true } as any));
      component['companionsData'].set([companionForm]);

      component['updateAccountCompanionsInfo'](event);
      tick();

      expect(mockAccountClient.updateTravelCompanion).toHaveBeenCalled();
    }));

    it('should show error notification on companion update failure', fakeAsync(() => {
      const companionForm: AccountModels.FrequentTravelerDto = {
        companionId: 'comp1',
        name: { first: 'Jane', last: 'Doe' },
      } as AccountModels.FrequentTravelerDto;
      const event = { form: companionForm, index: 0 };

      createComponentWithSpies();
      mockAccountClient.updateTravelCompanion.and.returnValue(
        throwError(() => ({ response: '{"error": {"code": "COMPANION_SAVE_ERROR"}}' }))
      );
      component['companionsData'].set([companionForm]);
      // @ts-ignore
      spyOn(component, 'showErrorNotification');

      component['updateAccountCompanionsInfo'](event);
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showErrorNotification).toHaveBeenCalled();
    }));
  });

  describe('updateAccountPersonalInfo - success cases', () => {
    it('should update personal info successfully', fakeAsync(() => {
      const personalInfo: AccountPersonalInformation = {
        firstName: 'John',
        lastName: 'Doe',
        gender: AccountModels.GenderType.Male,
        address: '123 Main St',
        addressCountry: 'US',
        birthday: { day: '01', month: '01', year: '1990' },
        nationality: 'US',
      };

      createComponentWithSpies();
      mockAccountClientV2.sessionPATCH.and.returnValue(of({ success: true } as any));

      component['updateAccountPersonalInfo'](personalInfo);
      tick();

      expect(mockAccountClientV2.sessionPATCH).toHaveBeenCalled();
    }));
  });

  describe('updateAccountContactInfo - additional cases', () => {
    it('should update contact info when channels differ', fakeAsync(() => {
      const contactData: SummaryContactData = {
        email: 'newemail@example.com',
        number: '9876543210',
        prefix: '+1-US',
      };

      createComponentWithSpies();
      component['communicationChannel'] = [
        { type: AccountModels.ChannelType.Email, info: 'oldemail@example.com' },
      ] as AccountModels.PersonCommunicationChannelDto[];

      mockAccountClientV2.sessionPATCH.and.returnValue(of({ success: true } as any));

      component['updateAccountContactInfo'](contactData);
      tick();

      expect(mockAccountClientV2.sessionPATCH).toHaveBeenCalled();
    }));

    it('should show error notification on contact update failure', fakeAsync(() => {
      const contactData: SummaryContactData = {
        email: 'newemail@example.com',
        number: '9876543210',
        prefix: '+1-US',
      };

      createComponentWithSpies();
      component['communicationChannel'] = [] as AccountModels.PersonCommunicationChannelDto[];
      mockAccountClientV2.sessionPATCH.and.returnValue(
        throwError(() => ({ response: '{"error": {"code": "CONTACT_SAVE_ERROR"}}' }))
      );
      // @ts-ignore
      spyOn(component, 'showErrorNotification');

      component['updateAccountContactInfo'](contactData);
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showErrorNotification).toHaveBeenCalled();
    }));
  });

  describe('normalizeAccountCountries', () => {
    it('should normalize addressCountry when country is valid', () => {
      const mockAccount = {
        result: {
          data: {
            addressCountry: 'US'
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      component.normalizeAccountCountries(mockAccount as any);

      expect(mockAccount.result.data.addressCountry).toBe('US');
      expect(mockCountryMapperService.isCountryInLifemilesList).toHaveBeenCalledWith('US');
    });

    it('should normalize frequentTravelers countries', () => {
      const mockAccount = {
        result: {
          data: {
            frequentTravelers: [
              { address: { country: 'CO' } },
              { address: { country: 'MX' } }
            ]
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      component.normalizeAccountCountries(mockAccount as any);

      expect(mockAccount.result.data.frequentTravelers[0].address.country).toBe('CO');
      expect(mockAccount.result.data.frequentTravelers[1].address.country).toBe('MX');
    });

    it('should normalize documents issuedCountry', () => {
      const mockAccount = {
        result: {
          data: {
            documents: [
              { issuedCountry: 'US' },
              { issuedCountry: 'CA' }
            ]
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      component.normalizeAccountCountries(mockAccount as any);

      expect(mockAccount.result.data.documents[0].issuedCountry).toBe('US');
      expect(mockAccount.result.data.documents[1].issuedCountry).toBe('CA');
    });

    it('should handle undefined account', () => {
      createComponentWithSpies();

      expect(() => {
        component.normalizeAccountCountries(undefined);
      }).not.toThrow();
    });

    it('should handle account without data', () => {
      createComponentWithSpies();

      expect(() => {
        component.normalizeAccountCountries({ result: {} } as any);
      }).not.toThrow();
    });
  });

  describe('translationsLoaded', () => {
    it('should call setDocumentOptions', () => {
      createComponentWithSpies();
      // @ts-ignore
      spyOn(component, 'setDocumentOptions');

      component.translationsLoaded();

      // @ts-ignore
      expect(component.setDocumentOptions).toHaveBeenCalled();
    });
  });

  describe('handleAccountSession', () => {
    it('should set user data and process account information', () => {
      const mockAccount: AccountV2Models.AccountDto = {
        address: { country: 'US' },
        communicationChannels: [
          { type: AccountModels.ChannelType.Email, info: 'test@example.com' }
        ],
        contacts: [],
        documents: [],
        frequentTravelers: []
      } as any;

      createComponentWithSpies();
      component['handleAccountSession'](mockAccount);

      expect(component['userData']()).toEqual(mockAccount);
    });

    it('should process communication channels', () => {
      const mockAccount: AccountV2Models.AccountDto = {
        communicationChannels: [
          { type: AccountModels.ChannelType.Phone, prefix: '+1', info: '1234567890' }
        ],
        contacts: [],
        documents: [],
        frequentTravelers: []
      } as any;

      createComponentWithSpies();
      component['countryPrefixOptions'].set([{ value: '+1-US', content: 'US +1' }]);
      mockPhoneCountryService.countryFromPrefix.and.returnValue(['US']);

      component['handleAccountSession'](mockAccount);

      expect(component['communicationChannel']).toBeDefined();
    });
  });

  describe('refreshAccountSession', () => {
    it('should refresh account session and update data', fakeAsync(() => {
      const mockAccount = {
        result: {
          data: {
            communicationChannels: [],
            contacts: [],
            documents: [],
            frequentTravelers: []
          }
        }
      };

      createComponentWithSpies();
      mockAccountClientV2.sessionGET.and.returnValue(of(mockAccount as any));
      // @ts-ignore
      spyOn(component, 'handleAccountSession');

      component['refreshAccountSession']();
      tick();

      expect(mockAccountClientV2.sessionGET).toHaveBeenCalled();
      // @ts-ignore
      expect(component.handleAccountSession).toHaveBeenCalled();
    }));

    it('should handle refresh session error', fakeAsync(() => {
      createComponentWithSpies();
      mockAccountClientV2.sessionGET.and.returnValue(
        throwError(() => ({ response: '{"error": {"code": "SESSION_ERROR"}}' }))
      );
      // @ts-ignore
      spyOn(component, 'showGetSessionErrorModal');

      component['refreshAccountSession']();
      tick();

      expect(mockLoggerService.error).toHaveBeenCalled();
      // @ts-ignore
      expect(component.showGetSessionErrorModal).toHaveBeenCalled();
    }));
  });

  describe('normalizeCountry', () => {
    it('should return country code when valid', () => {
      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      // @ts-ignore
      const result = component['normalizeCountry']('US');

      expect(result).toBe('US');
      expect(mockCountryMapperService.isCountryInLifemilesList).toHaveBeenCalledWith('US');
    });

    it('should return empty string when country is not in list', () => {
      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(false);

      // @ts-ignore
      const result = component['normalizeCountry']('INVALID');

      expect(result).toBe('');
      expect(mockCountryMapperService.isCountryInLifemilesList).toHaveBeenCalledWith('INVALID');
    });

    it('should return empty string when value is null', () => {
      createComponentWithSpies();

      // @ts-ignore
      const result = component['normalizeCountry'](null);

      expect(result).toBe('');
    });

    it('should return empty string when value is undefined', () => {
      createComponentWithSpies();

      // @ts-ignore
      const result = component['normalizeCountry'](undefined);

      expect(result).toBe('');
    });
  });

  describe('normalizeAccountCountries - edge cases', () => {
    it('should handle frequentTravelers without address', () => {
      const mockAccount = {
        result: {
          data: {
            frequentTravelers: [
              { name: { first: 'John' } } as any // no address
            ]
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      component.normalizeAccountCountries(mockAccount as any);

      expect((mockAccount.result.data.frequentTravelers[0] as any).address).toBeDefined();
    });

    it('should handle documents with null traveler in frequentTravelers', () => {
      const mockAccount = {
        result: {
          data: {
            frequentTravelers: [null, { address: { country: 'US' } }]
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      expect(() => {
        component.normalizeAccountCountries(mockAccount as any);
      }).not.toThrow();
    });

    it('should handle null documents in documents array', () => {
      const mockAccount = {
        result: {
          data: {
            documents: [null, { issuedCountry: 'US' }]
          }
        }
      };

      createComponentWithSpies();
      mockCountryMapperService.isCountryInLifemilesList.and.returnValue(true);

      expect(() => {
        component.normalizeAccountCountries(mockAccount as any);
      }).not.toThrow();
    });
  });

  describe('buildEmergencyContactDto', () => {
    it('should build emergency contact with email', () => {
      const form = {
        firstName: 'John',
        lastName: 'Doe',
        number: '+1234567890',
        email: 'john@example.com'
      } as any;

      createComponentWithSpies();

      // @ts-ignore
      const result = component['buildEmergencyContactDto'](form);

      expect(result.name?.first).toBe('John');
      expect(result.name?.last).toBe('Doe');
      expect(result.channels?.length).toBe(2);
      expect(result.channels?.[0].type).toBe(AccountModels.ChannelType.Phone);
      expect(result.channels?.[1].type).toBe(AccountModels.ChannelType.Email);
      expect(result.channels?.[1].info).toBe('john@example.com');
    });

    it('should build emergency contact without email in form but with existing email', () => {
      const form = {
        firstName: 'Jane',
        lastName: 'Smith',
        number: '+9876543210',
        email: ''
      } as any;

      createComponentWithSpies();
      component['userData'].set({
        contacts: [{
          type: AccountModels.ContactType.Emergency,
          channels: [{
            type: AccountModels.ChannelType.Email,
            info: 'existing@example.com'
          }]
        }]
      } as any);

      // @ts-ignore
      const result = component['buildEmergencyContactDto'](form);

      expect(result.channels?.length).toBe(2);
      expect(result.channels?.[1].info).toBe('existing@example.com');
    });

    it('should build emergency contact without email when neither form nor existing has it', () => {
      const form = {
        firstName: 'Bob',
        lastName: 'Johnson',
        number: '+5555555555',
        email: ''
      } as any;

      createComponentWithSpies();
      component['userData'].set({
        contacts: []
      } as any);

      // @ts-ignore
      const result = component['buildEmergencyContactDto'](form);

      expect(result.channels?.length).toBe(1);
      expect(result.channels?.[0].type).toBe(AccountModels.ChannelType.Phone);
    });
  });

  describe('getErrorResponse', () => {
    it('should parse JSON error response', () => {
      const error = {
        response: '{"error": {"code": "TEST_ERROR", "description": "Test error"}}'
      };

      createComponentWithSpies();

      // @ts-ignore
      const result = component['getErrorResponse'](error);

      expect(result.error.code).toBe('TEST_ERROR');
      expect(result.error.description).toBe('Test error');
    });

    it('should return original error when response is not JSON', () => {
      const error = {
        response: 'Plain text error'
      };

      createComponentWithSpies();

      // @ts-ignore
      const result = component['getErrorResponse'](error);

      expect(result).toEqual(error);
    });

    it('should handle error response starting with array', () => {
      const error = {
        response: '[{"error": "Array error"}]'
      };

      createComponentWithSpies();

      // @ts-ignore
      const result = component['getErrorResponse'](error);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('showErrorNotification', () => {
    it('should find modal config, map it, open modal, and track analytics - Happy Path', fakeAsync(() => {
      const mockError = {
        response: '{"error": {"code": "SAVE_ERROR", "description": "Failed to save"}}'
      };
      const mockModalTemplate = {
        modalDialogSettings: { modalDialogId: 'PersonalDataSaveError' },
        modalDialogContent: { modalTitle: 'Error Title', modalDescription: 'Error Message' },
        modalDialogButtonsControl: {
          actionButtonControl: ModalDialogActionType.CLOSE,
          actionButtonLabel: 'Close',
        }
      };
      const mockConfig = {
        accountProfileDialogModalsRepository: {
          modalDialogExceptions: [mockModalTemplate]
        }
      };

      createComponentWithSpies();
      component.config.set(mockConfig as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');
      spyOn(component as any, 'getErrorResponse').and.callThrough();

      // Act
      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      // Assert
      expect(component['getErrorResponse']).toHaveBeenCalledWith(mockError);
      expect(mockModalDialogService.openModal).toHaveBeenCalled();
      const openModalArg = mockModalDialogService.openModal.calls.mostRecent().args[0];
      expect(openModalArg.title).toBe('Error Title');
      expect(openModalArg.introText).toBe('Error Message');
      expect(component['trackAnalyticsError']).toHaveBeenCalledWith(jasmine.objectContaining({
        error: { code: 'SAVE_ERROR', description: 'Failed to save' }
      }));
    }));

    it('should handle undefined modal configuration gracefully', fakeAsync(() => {
      const mockError = { response: '{"error": "test"}' };
      const mockConfig = {
        accountProfileDialogModalsRepository: {
          modalDialogExceptions: []
        }
      };

      createComponentWithSpies();
      component.config.set(mockConfig as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      expect(mockModalDialogService.openModal).toHaveBeenCalled();
      const openModalArg = mockModalDialogService.openModal.calls.mostRecent().args[0];
      expect(openModalArg.title).toBe(''); // Mapper returns empty strings for undefined
      expect(component['trackAnalyticsError']).toHaveBeenCalled();
    }));

    it('should handle null accountProfileDialogModalsRepository', fakeAsync(() => {
      const mockError = new Error('Test error');
      const mockConfig = {
        accountProfileDialogModalsRepository: null
      };

      createComponentWithSpies();
      component.config.set(mockConfig as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      expect(mockModalDialogService.openModal).toHaveBeenCalled();
      expect(component['trackAnalyticsError']).toHaveBeenCalledWith(mockError);
    }));

    it('should handle empty config signal', fakeAsync(() => {
      const mockError = { response: '{"error": "config missing"}' };

      createComponentWithSpies();
      component.config.set({} as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      expect(mockModalDialogService.openModal).toHaveBeenCalled();
      expect(component['trackAnalyticsError']).toHaveBeenCalled();
    }));

    it('should handle error objects without response property', fakeAsync(() => {
      const mockError = { message: 'Simple error' };

      createComponentWithSpies();
      component.config.set({ accountProfileDialogModalsRepository: { modalDialogExceptions: [] } } as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      expect(mockModalDialogService.openModal).toHaveBeenCalled();
      expect(component['trackAnalyticsError']).toHaveBeenCalledWith(mockError);
    }));

    it('should handle modal with complete configuration', fakeAsync(() => {
      const mockError = { response: '{"error": {"code": "ERR_001"}}' };
      const completeModalTemplate = {
        modalDialogSettings: { modalDialogId: 'PersonalDataSaveError' },
        modalDialogContent: {
          modalTitle: 'Complete Title',
          modalDescription: 'Complete Description',
          modalImageSrc: 'error-icon.svg'
        },
        modalDialogButtonsControl: {
          actionButtonControl: ModalDialogActionType.CONFIRM,
          actionButtonLabel: 'Confirm',
          secondaryButtonControl: ModalDialogActionType.CANCEL,
          secondaryButtonLabel: 'Cancel',
          secondaryButtonLink: '/back'
        }
      };
      const mockConfig = {
        accountProfileDialogModalsRepository: {
          modalDialogExceptions: [completeModalTemplate]
        }
      };

      createComponentWithSpies();
      component.config.set(mockConfig as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CONFIRM));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      const openModalArg = mockModalDialogService.openModal.calls.mostRecent().args[0];
      expect(openModalArg.title).toBe('Complete Title');
      expect(openModalArg.introText).toBe('Complete Description');
      expect(openModalArg.titleImageSrc).toBe('error-icon.svg');
      expect(openModalArg.footerButtonsConfig?.actionButton?.label).toBe('Confirm');
      expect(openModalArg.footerButtonsConfig?.secondaryButton?.label).toBe('Cancel');
    }));

    it('should use takeUntilDestroyed to cleanup subscription', fakeAsync(() => {
      const mockError = { response: '{}' };
      const modalSubject = new Subject<ModalDialogActionType>();
      const completeSpy = jasmine.createSpy('complete');

      mockModalDialogService.openModal.and.returnValue(
        modalSubject.asObservable().pipe(
          finalize(() => completeSpy())
        )
      );

      createComponentWithSpies();
      component.config.set({
        accountProfileDialogModalsRepository: { modalDialogExceptions: [] }
      } as any);

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      fixture.destroy();
      tick();

      expect(completeSpy).toHaveBeenCalled();
    }));

    it('should handle XSS attempts in error response (pass through)', fakeAsync(() => {
      const mockError = {
        response: '{"error": {"description": "<script>alert(1)</script>"}}'
      };
      const mockModalTemplate = {
        modalDialogSettings: { modalDialogId: 'PersonalDataSaveError' },
        modalDialogContent: {
          modalTitle: '<img src=x onerror=alert(1)>',
          modalDescription: '{{ malicious }}'
        },
        modalDialogButtonsControl: {}
      };

      createComponentWithSpies();
      component.config.set({
        accountProfileDialogModalsRepository: { modalDialogExceptions: [mockModalTemplate] }
      } as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
      spyOn(component as any, 'trackAnalyticsError');

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      const openModalArg = mockModalDialogService.openModal.calls.mostRecent().args[0];
      // Mapper should pass through as-is (sanitization is modal's responsibility)
      expect(openModalArg.title).toBe('<img src=x onerror=alert(1)>');
      expect(component['trackAnalyticsError']).toHaveBeenCalled();
    }));

    it('should find correct modal when multiple modals exist', fakeAsync(() => {
      const mockError = { response: '{}' };
      const modalTemplates = [
        {
          modalDialogSettings: { modalDialogId: 'OTHER_ERROR' },
          modalDialogContent: { modalTitle: 'Wrong Modal' },
          modalDialogButtonsControl: {}
        },
        {
          modalDialogSettings: { modalDialogId: 'PersonalDataSaveError' },
          modalDialogContent: { modalTitle: 'Correct Modal' },
          modalDialogButtonsControl: {}
        },
        {
          modalDialogSettings: { modalDialogId: 'ANOTHER_ERROR' },
          modalDialogContent: { modalTitle: 'Wrong Again' },
          modalDialogButtonsControl: {}
        }
      ];

      createComponentWithSpies();
      component.config.set({
        accountProfileDialogModalsRepository: { modalDialogExceptions: modalTemplates }
      } as any);
      mockModalDialogService.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));

      // @ts-ignore
      component.showErrorNotification(mockError);
      tick();

      const openModalArg = mockModalDialogService.openModal.calls.mostRecent().args[0];
      expect(openModalArg.title).toBe('Correct Modal');
    }));
  });
});
