import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ConfigService,
  KeycloakAuthService,
  LoggerService,
  SessionIdService,
  StorageService,
} from '../../../public-api';

@Injectable({ providedIn: 'root' })
export class AuthHttpInterceptor implements HttpInterceptor {
  private readonly sessionIdService = inject(SessionIdService);
  protected readonly logger = inject(LoggerService);
  protected readonly keycloakAuthService = inject(KeycloakAuthService);
  protected readonly configService = inject(ConfigService);
  private readonly storageService = inject(StorageService);

  // tslint:disable-next-line: no-any
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const excludedUrls = [`/assets/config/config.json`];
    if (excludedUrls.some((url) => request.url.includes(url))) {
      return next.handle(request);
    }

    const token = this.keycloakAuthService.getTokenSync() || '';
    const headers: Record<string, string> = {};
    if (request.params.has('skipCredentials')) {
      request = request.clone({
        params: request.params.delete('skipCredentials'),
      });
      return next.handle(request);
    }
    const apiKey = this.getApiKeyForProductEndpoints(request.url);
    if (apiKey) {
      headers['apiKey'] = apiKey;
    }
    if (this.sessionIdService.sessionId !== '') {
      headers['tabsessionId'] = this.sessionIdService.sessionId;
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    headers['sessionref'] = this.sessionIdService.sessionref;

    request = request.clone({
      setHeaders: headers,
    });

    return next.handle(request);
  }

  /**
   * Returns the respective API key for the requested endpoint.
   *
   * Returns empty if the endpoint is not a Product endpoint or it does not require authentication
   * @param url The request url that is currently intercepted
   */
  private getApiKeyForProductEndpoints(url: string): string {
    const endpointConfiguration = this.configService.getEndpointsConfig();
    if (!endpointConfiguration) {
      return '';
    }

    if (url.search(endpointConfiguration.apiURLPricing) > -1) {
      return endpointConfiguration.pricingApiKey;
    }

    if (url.search(endpointConfiguration.apiURLBooking) > -1) {
      return endpointConfiguration.bookingApiKey;
    }

    if (url.search(endpointConfiguration.apiURLFinance) > -1) {
      return endpointConfiguration.financeApiKey;
    }

    if (url.search(endpointConfiguration.apiURLContacts) > -1) {
      return endpointConfiguration.contactsApiKey;
    }

    if (url.search(endpointConfiguration.apiURLResources) > -1) {
      return endpointConfiguration.resourcesApiKey;
    }

    if (url.search(endpointConfiguration.apiURLServices) > -1) {
      return endpointConfiguration.servicesApiKey;
    }

    if (url.search(endpointConfiguration.apiURLOffers) > -1) {
      return endpointConfiguration.offersApiKey;
    }

    if (url.search(endpointConfiguration.apiURLAccounts) > -1) {
      return endpointConfiguration.accountsApiKey;
    }

    if (url.search(endpointConfiguration.apiURLSchedules) > -1) {
      return endpointConfiguration.shedulesApiKey;
    }

    if (url.search(endpointConfiguration.apiURLSegmentStatus) > -1) {
      return endpointConfiguration.segmentStatusApiKey;
    }

    if (url.search(endpointConfiguration.apiURLLoyalty) > -1) {
      return endpointConfiguration.loyaltyApiKey;
    }

    if (url.search(endpointConfiguration.apiURLCustomer) > -1) {
      return endpointConfiguration.customerApiKey;
    }
    return '';
  }
}
