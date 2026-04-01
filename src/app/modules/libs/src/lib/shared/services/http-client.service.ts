import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService, HttpMethod, IdleTimeoutService, ProductApi } from '../../../public-api';
import { Command, Query } from '../api-models';
import { httpOptions } from '../helpers';

/**
 * This is the http client base-service. It use the HttpClient module to make HTTP requests.
 * The HttpClient's generic methods ensure that strongly typed objects are returned to components that use the service.
 * Now each module should implement a service extended from this class
 */

export class HttpClientService {
  constructor(
    protected httpClient: HttpClient,
    protected idleTimeoutService: IdleTimeoutService,
    protected configService: ConfigService
  ) {}

  /**
   * Method which sends a POST request to the server
   */
  protected post<T extends Command, U>(api: ProductApi, endpoint: string, command?: T): Observable<U> {
    return this.httpClient.post<U>(this.buildFullEndpoint(api, endpoint, HttpMethod.POST), command, httpOptions);
  }

  /**
   * Method which sends a PATCH request to the server
   */
  protected patch<T extends Command, U>(api: ProductApi, endpoint: string, command?: T): Observable<U> {
    return this.httpClient.patch<U>(this.buildFullEndpoint(api, endpoint, HttpMethod.PATCH), command, httpOptions);
  }

  /**
   * Method which sends a PUT request to the server
   */
  protected put<T extends Command, U>(api: ProductApi, endpoint: string, command?: T): Observable<U> {
    return this.httpClient.put<U>(this.buildFullEndpoint(api, endpoint, HttpMethod.PUT), command, httpOptions);
  }

  /**
   * Method which sends a GET request to the server
   */
  protected get<T extends Query, U>(api: ProductApi, endpoint: string, query?: T): Observable<U> {
    const options = {
      headers: httpOptions.headers,
      params: new HttpParams(),
    };

    if (query) {
      for (const key of Object.keys(query)) {
        options.params = options.params.append(key, (query as any)[key]);
      }
    }

    return this.httpClient.get<U>(this.buildFullEndpoint(api, endpoint, HttpMethod.GET), options);
  }

  /**
   * Method which sends a DELETE request to the server
   */
  protected delete<T extends Command, U>(api: ProductApi, endpoint: string, command?: T): Observable<U> {
    const options = {
      headers: httpOptions.headers,
      body: command,
    };

    return this.httpClient.delete<U>(this.buildFullEndpoint(api, endpoint, HttpMethod.DELETE), options);
  }

  private buildFullEndpoint(api: ProductApi, endpoint: string, method: HttpMethod): string {
    const endpointConfiguration = this.configService.getEndpointsConfig();

    let url = '';

    switch (api) {
      case ProductApi.ACCOUNTS:
        url = endpointConfiguration.apiURLAccounts;
        break;
      case ProductApi.AUTHENTICATION:
        url = endpointConfiguration.apiURLAuthentication;
        break;
      case ProductApi.AUTHORIZATION:
        url = endpointConfiguration.apiURLAuthorization;
        break;
      case ProductApi.BOOKING:
        url = endpointConfiguration.apiURLBooking;
        break;
      case ProductApi.CONTACTS:
        url = endpointConfiguration.apiURLContacts;
        break;
      case ProductApi.CUSTOMER:
        url = endpointConfiguration.apiURLCustomer;
        break;
      case ProductApi.CONFIGURATION:
        url = endpointConfiguration.apiURLConfiguration;
        break;
      case ProductApi.LOYALTY:
        url = endpointConfiguration.apiURLLoyalty;
        break;
      case ProductApi.FINANCE:
        url = endpointConfiguration.apiURLFinance;
        break;
      case ProductApi.OFFERS:
        url = endpointConfiguration.apiURLOffers;
        break;
      case ProductApi.PRICING:
        url = endpointConfiguration.apiURLPricing;
        break;
      case ProductApi.RESOURCES:
        url = endpointConfiguration.apiURLResources;
        break;
      case ProductApi.SCHEDULES:
        url = endpointConfiguration.apiURLSchedules;
        break;
      case ProductApi.SEGMENT_STATUS:
        url = endpointConfiguration.apiURLSegmentStatus;
        break;
      case ProductApi.SERVICES:
        url = endpointConfiguration.apiURLServices;
        break;
    }

    // Remove leading slash from endpoint to prevent double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    return `${url}/${cleanEndpoint}`;
  }
}
