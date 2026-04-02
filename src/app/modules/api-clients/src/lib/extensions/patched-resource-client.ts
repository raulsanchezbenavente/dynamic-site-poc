import { HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of as _observableOf, Observable } from 'rxjs';
import { mergeMap as _observableMergeMap } from 'rxjs/operators';

import {
  Country,
  QueryResponse_1OfOfList_1OfOfCountryAndDomainAnd_0AndCulture_neutralAndPublicKeyToken_nullAndCoreLibAnd_0AndCulture_neutralAndPublicKeyToken_7cec85d7bea7798e,
} from '../models/resources';
import { ResourcesClient } from '../resources-api';

@Injectable()
export class PatchedResourcesClient extends ResourcesClient {
  public override countries(
    ...args: Parameters<ResourcesClient['countries']>
  ): ReturnType<ResourcesClient['countries']> {
    return super.countries(...args);
  }

  private blobToText(blob: Blob | null): Observable<string> {
    return new Observable<string>((observer) => {
      if (!blob) {
        observer.next('');
        observer.complete();
      } else {
        const reader = new FileReader();
        reader.onload = (event): void => {
          observer.next((event.target as FileReader).result as string);
          observer.complete();
        };
        reader.readAsText(blob);
      }
    });
  }

  //   HTTP GET /countries
  //         ↓
  // Get Blob de response
  //         ↓
  // PatchedResourcesClient.processCountries (OVERRIDE)
  //         ↓
  // blobToText → JSON.parse → (transform)
  //         ↓
  // Model.fromJS (deserialize)
  //         ↓
  // Fixed Response

  protected override processCountries(
    response: HttpResponseBase
  ): Observable<QueryResponse_1OfOfList_1OfOfCountryAndDomainAnd_0AndCulture_neutralAndPublicKeyToken_nullAndCoreLibAnd_0AndCulture_neutralAndPublicKeyToken_7cec85d7bea7798e> {
    const status = response.status;
    let responseBlob: Blob | null = null;

    if (response instanceof HttpResponse) {
      responseBlob = response.body;
    } else {
      const errorResponse = response as { error?: Blob };
      if (errorResponse.error instanceof Blob) {
        responseBlob = errorResponse.error;
      }
    }

    if (status === 200) {
      return this.blobToText(responseBlob).pipe(
        _observableMergeMap((_responseText: string) => {
          const resultData200 = _responseText === '' ? null : JSON.parse(_responseText);

          if (
            resultData200?.result?.data &&
            typeof resultData200.result.data === 'object' &&
            resultData200.result.data.countries &&
            Array.isArray(resultData200.result.data.countries)
          ) {
            resultData200.result.data = resultData200.result.data.countries;
          }

          const result200 =
            QueryResponse_1OfOfList_1OfOfCountryAndDomainAnd_0AndCulture_neutralAndPublicKeyToken_nullAndCoreLibAnd_0AndCulture_neutralAndPublicKeyToken_7cec85d7bea7798e.fromJS(
              resultData200
            );

          if (result200.result && result200.result.result === true && !result200.result.data) {
            const mockCountries = [
              Country.fromJS({
                name: 'Bangladesh (Fallback)',
                code: 'BD',
                currencyCode: 'EUR',
                phonePrefix: '880',
                order: '',
                languages: {
                  'en-US': 'Bangladesh',
                  'es-ES': 'Bangladés',
                  'pt-BR': 'Bangladesch',
                  'fr-FR': 'Bangladesh',
                },
              }),
              Country.fromJS({
                name: 'Belgium (Fallback)',
                code: 'BE',
                currencyCode: 'EUR',
                phonePrefix: '32',
                order: '',
                languages: {
                  'en-US': 'Belgium',
                  'es-ES': 'Bélgica',
                  'pt-BR': 'Belgien',
                  'fr-FR': 'Belgique',
                },
              }),
            ];
            result200.result.data = mockCountries;
          }

          return _observableOf(result200);
        })
      );
    } else {
      return super.processCountries(response);
    }
  }
}
