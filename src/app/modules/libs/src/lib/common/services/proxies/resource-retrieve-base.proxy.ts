import { HttpClient } from '@angular/common/http';
import { Observable, PartialObserver, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService, IdleTimeoutService, LoggerService } from '../../../core';
import { HttpClientService, StorageService, urlHelpers } from '../../../shared';
import { ResourceType } from '../../../shared/enums/enum-resource-type';
import { ResourceApiResponse, Resources } from '../../../shared/model/common-models';
import { RepositoryDataRequest } from '../../models/repository-data-request';
import { ResourcesDataResponse } from '../types';
import { Resource } from '../types/resource.type';

/**
 * Base proxy for retrieving Resources. It defines the common steps for any ResourceProxy and allows the subclasses to overwrite any method
 */
export abstract class ResourceRetrieveBaseProxy extends HttpClientService {
  protected storageKey!: string;
  protected data!: Resources;

  constructor(
    httpClient: HttpClient,
    idleTimeoutService: IdleTimeoutService,
    configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly storageService: StorageService
  ) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Method to call API for the requested resources. This method must be implemented by each subclass
   * @param repositoryRequest
   * @returns
   */
  protected abstract apiCall: (repositoryRequest: RepositoryDataRequest) => Observable<ResourcesDataResponse>;

  handleApiCallResponse(
    outerSubscriber: Subscriber<Resource[]>,
    repositoryDataRequest: RepositoryDataRequest
  ): PartialObserver<ResourcesDataResponse> {
    const cultureKey = this.getKey(repositoryDataRequest.culture);
    return {
      next: (response: ResourcesDataResponse) => {
        this.data = this.storageService.getSessionStorage(cultureKey);
        if (this.data) {
          (this.data as any)[repositoryDataRequest.repositoryType] = (
            (response as ResourceApiResponse).result!.data as any
          )[repositoryDataRequest.repositoryType];
          this.storageService.setSessionStorage(cultureKey, this.data);
          outerSubscriber.next((this.data as any)[repositoryDataRequest.repositoryType]);
        } else {
          this.storageService.setSessionStorage(cultureKey, (response as ResourceApiResponse).result!.data);
          outerSubscriber.next(
            ((response as ResourceApiResponse).result!.data as any)[repositoryDataRequest.repositoryType]
          );
        }
      },
      error: (error) => {
        this.loggerService.error('Cannot retrieve resource: ' + repositoryDataRequest.repositoryType, error);
        outerSubscriber.next([]);
        outerSubscriber.complete();
      },
      complete: () => outerSubscriber.complete(),
    };
  }

  /**
   *
   * @param repositoryDataRequest
   * @returns
   */
  protected retrieveResource(
    repositoryDataRequest: RepositoryDataRequest,
    ignoreCache: boolean
  ): Observable<Resource[]> {
    return new Observable((subscriber) => {
      let data: Resources;
      data = this.storageService.getSessionStorage(this.getKey(repositoryDataRequest.culture));

      if (
        !ignoreCache &&
        data &&
        (data as any)[repositoryDataRequest.repositoryType] &&
        repositoryDataRequest.repositoryType !== ResourceType.ROUTES_LOWEST_PRICE
      ) {
        subscriber.next((data as any)[repositoryDataRequest.repositoryType]);
        subscriber.complete();
      } else {
        this.apiCall(repositoryDataRequest)
          .pipe(map((x) => this.mapApiCallResponse(x)))
          .subscribe(this.handleApiCallResponse(subscriber, repositoryDataRequest));
      }
    });
  }

  /**
   * Method to map the data retrieved by the specific subclasses to the expected model of ResourcesDataResponse
   * @param response ResourcesDataResponse
   * @returns
   */
  protected mapApiCallResponse(response: ResourcesDataResponse): ResourcesDataResponse {
    return response;
  }

  /**
   * Return the storage key concatenated with a culture.
   * Culture is obtained from parameter.
   */
  private getKey(culture?: string) {
    culture = culture ?? urlHelpers.getCultureFromCurrentUrl();
    culture = culture.toLowerCase();
    return `${this.storageKey}_${culture}`;
  }
}
