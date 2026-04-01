import { Injectable } from '@angular/core';
import { BooleanEvaluationResponse, FliptClient, VariantEvaluationResponse } from '@flipt-io/flipt-client-js';
import { from, Observable } from 'rxjs';

import { LoggerService } from './logger.service';

/**
 * Flip Service
 * Handle Feature Flags
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class FliptService {
  private _client: FliptClient = undefined!;

  constructor(private readonly _logger: LoggerService) {}

  public init(namespace: string, url: string): Observable<undefined> {
    return new Observable((result) => {
      from(
        FliptClient.init({
          namespace: namespace,
          url: url,
          // authentication: {
          //   clientToken: 'secret',
          // },
        })
      ).subscribe({
        next: (v) => {
          this._client = v;

          result.next(undefined);
          result.complete();
        },
        error: (e) => {
          this._logger.warn('FliptService', 'Init Error: ', e);

          result.next(undefined);
          result.complete();
        },
        complete: () => {
          result.next(undefined);
          result.complete();
        },
      });
    });
  }

  public evaluateBoolean(
    flagKey: string,
    entityId: string,
    context: Record<string, unknown>
  ): BooleanEvaluationResponse {
    let response: BooleanEvaluationResponse = undefined!;

    try {
      response = this._client.evaluateBoolean({
        flagKey: flagKey,
        entityId: entityId,
        context: context,
      });
    } catch (e) {
      this._logger.warn('FliptService', 'Evaluate Boolean', e);
    }

    return response;
  }

  public evaluateVariant(
    flagKey: string,
    entityId: string,
    context: Record<string, unknown>
  ): VariantEvaluationResponse {
    let response: VariantEvaluationResponse = undefined!;

    try {
      response = this._client.evaluateVariant({
        flagKey: flagKey,
        entityId: entityId,
        context: context,
      });
    } catch (e) {
      this._logger.warn('FliptService', 'Evaluate Variant', e);
    }

    return response;
  }
}
