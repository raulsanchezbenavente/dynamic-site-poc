import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  AuthenticationStorageService,
  ConfigService,
  CookiesStore,
  EnumHttpErrorCode,
  EventBusService,
  IbeEventRedirectType,
  IbeEventTypeEnum,
  LoggerService,
} from '../../../public-api';

@Injectable({ providedIn: 'root' })
export class ErrorHttpInterceptor implements HttpInterceptor {
  constructor(
    protected cookiesStore: CookiesStore,
    protected logger: LoggerService,
    protected authenticationStorageService: AuthenticationStorageService,
    protected eventBusService: EventBusService,
    protected configService: ConfigService
  ) {}

  // tslint:disable-next-line: no-any
  public intercept(request: HttpRequest<any>, next: HttpHandler): any {
    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === EnumHttpErrorCode.FORBIDDEN) {
          this.cookiesStore.cleanCookies();
          this.logger.info('ErrorHttpInterceptor', 'Cookies cleanned, retrying');
          return next.handle(request);
        } else if (err instanceof HttpErrorResponse && err.status === EnumHttpErrorCode.UNAUTHORIZED) {
          this.handleUnauthorizedResponse(request);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Handle 401 exception for all endpoints except authentication and authorize
   */
  // tslint:disable-next-line: no-any
  private handleUnauthorizedResponse(request: HttpRequest<any>): void {
    const endpointConfiguration = this.configService.getEndpointsConfig();
    if (
      endpointConfiguration &&
      request.url.search(endpointConfiguration.apiURLAuthorization) === -1 &&
      request.url.search(endpointConfiguration.apiURLAuthentication) === -1
    ) {
      this.handleCommonApiUnauthorizedResponse();
    }
  }

  /**
   * Redirect to home when unathorized response was received from any non-auth API
   */
  private handleCommonApiUnauthorizedResponse(): void {
    this.eventBusService.notifyEvent({
      type: IbeEventTypeEnum.pageRedirected,
      redirectUrl: {
        type: IbeEventRedirectType.internalRedirect,
        url: '/',
      },
    });
  }
}
