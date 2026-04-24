import { Injectable } from '@angular/core';
import {
  CommandResponseOfVoidCommandResponse,
  IPaxRegulatoryDetailsClient,
  ResponseObjectOfVoidCommandResponse,
  UpdatePaxRegulatoryDetailsCommand,
  VoidCommandResponse,
} from '@dcx/module/booking-api-client';
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
  ): Observable<CommandResponseOfVoidCommandResponse> {
    console.log('FakePaxRegulatoryDetailsClient: Processing regulatory details', {
      command,
      version,
      options: this.options,
    });

    // Simulate different error scenarios
    if (this.options.simulateError) {
      return this.simulateErrorResponse().pipe(delay(this.options.delay || 500));
    }

    // Simulate successful response
    return this.simulateSuccessResponse().pipe(delay(this.options.delay || 500));
  }

  private simulateSuccessResponse(): Observable<CommandResponseOfVoidCommandResponse> {
    const successResponse: CommandResponseOfVoidCommandResponse = {
      error: undefined,
      success: true,
      result: {
        result: true,
        data: {} as VoidCommandResponse,
      } as ResponseObjectOfVoidCommandResponse,
      init: () => {},
      toJSON: () => ({}),
    };

    console.log('FakePaxRegulatoryDetailsClient: Returning success response', successResponse);
    return of(successResponse);
  }

  private simulateErrorResponse(): Observable<CommandResponseOfVoidCommandResponse> {
    const errorType = this.options.errorType || 'api_error';

    switch (errorType) {
      case 'network_error':
        console.log('FakePaxRegulatoryDetailsClient: Simulating network error');
        return throwError(() => ({
          name: 'NetworkError',
          message: 'Failed to fetch',
          status: 0,
        }));

      case 'timeout':
        console.log('FakePaxRegulatoryDetailsClient: Simulating timeout error');
        return throwError(() => ({
          name: 'TimeoutError',
          message: 'Request timeout',
          status: 408,
        }));

      case 'validation_error':
        console.log('FakePaxRegulatoryDetailsClient: Simulating validation error');
        return of({
          error: {
            code: 'VALIDATION_ERROR',
            description: 'Invalid passenger regulatory details',
            type: 'ValidationError' as any,
          },
          success: false,
          result: undefined,
        } as CommandResponseOfVoidCommandResponse);

      case 'api_error':
      default:
        console.log('FakePaxRegulatoryDetailsClient: Simulating API error');
        return of({
          error: {
            code: 'REGULATORY_DETAILS_ERROR',
            description: 'Failed to process regulatory details',
            type: 'ApiError' as any,
          },
          success: false,
          result: undefined,
        } as CommandResponseOfVoidCommandResponse);
    }
  }
}
