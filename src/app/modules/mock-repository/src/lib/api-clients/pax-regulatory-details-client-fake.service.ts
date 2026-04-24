import { Injectable } from '@angular/core';
import { IPaxRegulatoryDetailsClient, UpdatePaxRegulatoryDetailsCommand } from '@dcx/module/booking-api-client';
import { PaxRegulatoryDetailsVM } from '@dcx/ui/business-common';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface FakePaxRegulatoryDetailsOptions {
  simulateError?: boolean;
  errorType?: 'api_error' | 'network_error' | 'timeout' | 'validation_error';
  delay?: number;
  shouldSucceed?: boolean;
}

@Injectable()
export class FakePaxRegulatoryDetailsClient implements IPaxRegulatoryDetailsClient {
  private options: FakePaxRegulatoryDetailsOptions = {
    simulateError: false,
    delay: 500,
    shouldSucceed: true,
  };

  public setOptions(options: Partial<FakePaxRegulatoryDetailsOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Fake implementation of regulatory details endpoint
   * @param command - The regulatory details command
   * @param version - API version
   * @returns Observable with fake response
   */
  public regulatoryDetails(
    command: UpdatePaxRegulatoryDetailsCommand,
    version: string
  ): Observable<PaxRegulatoryDetailsVM> {
    if (this.options.simulateError) {
      return this.simulateErrorResponse().pipe(delay(this.options.delay || 500));
    }

    return this.simulateSuccessResponse(command).pipe(delay(this.options.delay || 500));
  }

  private simulateSuccessResponse(command: UpdatePaxRegulatoryDetailsCommand): Observable<PaxRegulatoryDetailsVM> {
    const successResponse: PaxRegulatoryDetailsVM = {
      paxId: command.request?.paxId ?? '',
      statusCleared: true,
      missingDetails: [],
    };

    return of(successResponse);
  }

  private simulateErrorResponse(): Observable<PaxRegulatoryDetailsVM> {
    const errorType = this.options.errorType || 'api_error';

    switch (errorType) {
      case 'network_error':
        return throwError(() => ({
          name: 'NetworkError',
          message: 'Failed to fetch',
          status: 0,
        }));

      case 'timeout':
        return throwError(() => ({
          name: 'TimeoutError',
          message: 'Request timeout',
          status: 408,
        }));

      case 'validation_error':
        return throwError(() => ({
          name: 'ValidationError',
          message: 'Invalid passenger regulatory details',
          status: 400,
          code: 'VALIDATION_ERROR',
        }));

      case 'api_error':
      default:
        return throwError(() => ({
          name: 'ApiError',
          message: 'Failed to process regulatory details',
          status: 500,
          code: 'REGULATORY_DETAILS_ERROR',
        }));
    }
  }
}
