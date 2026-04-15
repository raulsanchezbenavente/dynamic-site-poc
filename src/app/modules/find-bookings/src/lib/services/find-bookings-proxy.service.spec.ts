import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FindBookingsProxyService } from './find-bookings-proxy.service';
import { ConfigService, IdleTimeoutService } from '@dcx/ui/libs';
import { AddBookingRequestDto, FindBookingsResponse } from '../api-models/find-bookings-response.model';
import { CommandResponse, VoidCommandResponse } from '../../../../api-layer/src/lib/CQRS';

describe('FindBookingsProxyService', () => {
  let service: FindBookingsProxyService;
  let httpMock: HttpTestingController;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockIdleTimeoutService: jasmine.SpyObj<IdleTimeoutService>;

  beforeEach(() => {
    mockConfigService = jasmine.createSpyObj('ConfigService', [
      'getInstanceId',
      'getDataModuleId',
      'getEndpointsConfig',
    ]);
    mockIdleTimeoutService = jasmine.createSpyObj('IdleTimeoutService', ['resetTimer']);

    mockConfigService.getInstanceId.and.returnValue('test-instance-id');
    mockConfigService.getDataModuleId.and.returnValue({ id: 'test-id', config: 'test-config', name: '' });
    mockConfigService.getEndpointsConfig.and.returnValue({
      apiURLBooking: 'https://fakeapi.com',
      apiURLAccounts: '',
      apiURLAuthentication: '',
      apiURLAuthorization: '',
      apiURLContacts: '',
      apiURLCustomer: '',
      apiURLConfiguration: '',
      apiURLLoyalty: '',
      apiURLFinance: '',
      apiURLOffers: '',
      apiURLPricing: '',
      apiURLResources: '',
      apiURLSchedules: '',
      apiURLSegmentStatus: '',
      apiURLServices: '',
      pricingApiKey: '',
      bookingApiKey: '',
      financeApiKey: '',
      contactsApiKey: '',
      accountsApiKey: '',
      resourcesApiKey: '',
      servicesApiKey: '',
      offersApiKey: '',
      shedulesApiKey: '',
      segmentStatusApiKey: '',
      loyaltyApiKey: '',
      customerApiKey: '',
      fliptUrl: '',
      fliptNamespace: '',
      fliptToken: '',
      apiURLRepositoryResources: ''
    });

    TestBed.configureTestingModule({
      providers: [
        FindBookingsProxyService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: mockConfigService },
        { provide: IdleTimeoutService, useValue: mockIdleTimeoutService },
      ],
    });

    service = TestBed.inject(FindBookingsProxyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getBookings() and return bookings', () => {
    const mockResponse: FindBookingsResponse = {
      success: true,
      result: {
        result: true,
        data: {
          segments: [
            {
              recordLocator: 'AB123',
              bookingStatus: 1,
              segmentStatus: 0,
              selectedFare: 'BASIC',
              departureRealDate: '2023-12-01T10:00:00Z',
              arrivalRealDate: '2023-12-01T12:00:00Z',
              durationReal: '02:00',
              duration: '02:00',
              origin: 'MAD',
              destination: 'BCN',
              departureDate: '2023-12-01T10:00:00Z',
              arrivalDate: '2023-12-01T12:00:00Z',
              carrierCode: 'UX',
              marketingCarrierCode: 'UX',
              transportNumber: '1001',
              transport: 'Airbus A320',
              originTerminal: 'T1',
              destinationTerminal: 'T2',
              operationDestinationTerminal: 'T2',
              operationOriginIata: 'MAD',
              operationDestinationIata: 'BAR'
            },
          ],
        },
      },
    };

    service.getBookings().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://fakeapi.com/booking/findFlights');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should call addBooking() with payload and return CommandResponse', () => {
    const payload: AddBookingRequestDto = {
      pnr: 'AB123',
      lastName: 'DOE',
      firstName: 'JOHN',
      dateOfBirth: '1990-01-01',
      loyaltyNumber: '12345',
      existsPnr: false,
      lastNameSession: 'DOE'
    };

    const mockResponse: CommandResponse<VoidCommandResponse> = {
      success: true,
      result: { data: {} },
    };

    service.addBooking(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://fakeapi.com/booking/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });
});
