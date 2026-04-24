import { TestBed } from '@angular/core/testing';
import { HttpClientService } from './http-client.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService, IdleTimeoutService, ProductApi } from '../../../public-api';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpMock: HttpTestingController;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  let idleTimeoutSpy: jasmine.SpyObj<IdleTimeoutService>;

  const mockEndpoints = {
    apiURLAccounts: 'accounts',
    apiURLAuthentication: 'auth',
    apiURLAuthorization: 'authorization',
    apiURLBooking: 'booking',
    apiURLContacts: 'contacts',
    apiURLCustomer: 'customer',
    apiURLConfiguration: 'configuration',
    apiURLLoyalty: 'loyalty',
    apiURLFinance: 'finance',
    apiURLOffers: 'offers',
    apiURLPricing: 'pricing',
    apiURLResources: 'resources',
    apiURLSchedules: 'schedules',
    apiURLSegmentStatus: 'segment-status',
    apiURLServices: 'services',
    apiURLRepositoryResources: 'repository-resources',
    pricingApiKey: '',
    bookingApiKey: '',
    financeApiKey: '',
    contactsApiKey: '',
    customerApiKey: '',
    loyaltyApiKey: '',
    offersApiKey: '',
    resourcesApiKey: '',
    shedulesApiKey: '',
    segmentStatusApiKey: '',
    servicesApiKey: '',
    accountsApiKey: '',
    fliptUrl: '',
    fliptNamespace: '',
    fliptToken: '',
  };

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj('ConfigService', ['getEndpointsConfig']);
    idleTimeoutSpy = jasmine.createSpyObj('IdleTimeoutService', ['resetTimer']);

    configServiceSpy.getEndpointsConfig.and.returnValue(mockEndpoints);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: IdleTimeoutService, useValue: idleTimeoutSpy },
        {
          provide: HttpClientService,
          useFactory: (http: HttpClient, idle: IdleTimeoutService, config: ConfigService) => {
            return new HttpClientService(http, idle, config);
          },
          deps: [HttpClient, IdleTimeoutService, ConfigService]
        }
      ]
    });

    service = TestBed.inject(HttpClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should call POST and return data', () => {
      const mockData = { success: true };
      const command = { id: 1 };

      (service as any).post(ProductApi.ACCOUNTS, '/test', command).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockData);
    });

    it('should call PATCH and return data', () => {
      const mockData = { success: true };
      const command = { id: 1 };

      (service as any).patch(ProductApi.ACCOUNTS, '/test', command).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(command);
      req.flush(mockData);
    });

    it('should call PUT and return data', () => {
      const mockData = { success: true };
      const command = { id: 1 };

      (service as any).put(ProductApi.ACCOUNTS, '/test', command).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(command);
      req.flush(mockData);
    });

    it('should call GET and return data', () => {
      const mockData = { success: true };
      
      (service as any).get(ProductApi.ACCOUNTS, '/test').subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should call GET with query params', () => {
      const mockData = { success: true };
      const query = { page: '1', sort: 'asc' };

      (service as any).get(ProductApi.ACCOUNTS, '/test', query).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(req => req.url === 'accounts/test' && req.params.has('page') && req.params.has('sort'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('sort')).toBe('asc');
      req.flush(mockData);
    });

    it('should call DELETE and return data', () => {
      const mockData = { success: true };
      const command = { id: 1 };

      (service as any).delete(ProductApi.ACCOUNTS, '/test', command).subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(command);
      req.flush(mockData);
    });

    it('should call DELETE without command', () => {
      const mockData = { success: true };

      (service as any).delete(ProductApi.ACCOUNTS, '/test').subscribe((data: any) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('accounts/test');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(mockData);
    });
  });

  describe('Endpoint Building', () => {
     it('should build full endpoint correctly with leading slash', () => {
        (service as any).get(ProductApi.ACCOUNTS, '/test').subscribe();
        const req = httpMock.expectOne('accounts/test');
        req.flush({});
     });

     it('should build full endpoint correctly without leading slash', () => {
        (service as any).get(ProductApi.ACCOUNTS, 'test').subscribe();
        const req = httpMock.expectOne('accounts/test');
        req.flush({});
     });

     it('should handle all ProductApi enums', () => {
        const apiMap = [
            { api: ProductApi.ACCOUNTS, url: 'accounts' },
            { api: ProductApi.AUTHENTICATION, url: 'auth' },
            { api: ProductApi.AUTHORIZATION, url: 'authorization' },
            { api: ProductApi.BOOKING, url: 'booking' },
            { api: ProductApi.CONTACTS, url: 'contacts' },
            { api: ProductApi.CUSTOMER, url: 'customer' },
            { api: ProductApi.CONFIGURATION, url: 'configuration' },
            { api: ProductApi.LOYALTY, url: 'loyalty' },
            { api: ProductApi.FINANCE, url: 'finance' },
            { api: ProductApi.OFFERS, url: 'offers' },
            { api: ProductApi.PRICING, url: 'pricing' },
            { api: ProductApi.RESOURCES, url: 'resources' },
            { api: ProductApi.SCHEDULES, url: 'schedules' },
            { api: ProductApi.SEGMENT_STATUS, url: 'segment-status' },
            { api: ProductApi.SERVICES, url: 'services' },
        ];

        apiMap.forEach(({ api, url }) => {
            (service as any).get(api, 'test').subscribe();
            const req = httpMock.expectOne(`${url}/test`);
            req.flush({});
        });
     });
  });
});
