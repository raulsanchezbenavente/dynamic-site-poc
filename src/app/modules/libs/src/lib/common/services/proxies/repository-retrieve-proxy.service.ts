import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService, IdleTimeoutService, LoggerService } from '../../../core';
import { StorageService } from '../../../shared';
import { ProductApi } from '../../enums';
import { RepositoryDataApiResponse } from '../../models/repository-data-api-response';
import { RepositoryDataRequest } from '../../models/repository-data-request';
import { ResourcesDataResponse } from '../types';
import { Resource } from '../types/resource.type';

import { ResourceRetrieveBaseProxy } from './resource-retrieve-base.proxy';

@Injectable()
export class RepositoryRetrieveProxyService extends ResourceRetrieveBaseProxy {
  protected override storageKey = 'repositoryData';

  constructor(
    httpClient: HttpClient,
    idleTimeoutService: IdleTimeoutService,
    configService: ConfigService,
    loggerService: LoggerService,
    storageService: StorageService
  ) {
    super(httpClient, idleTimeoutService, configService, loggerService, storageService);
  }

  public retrieve(repositoryDataRequest: RepositoryDataRequest, ignoreCache: boolean = false): Observable<Resource[]> {
    return this.retrieveResource(repositoryDataRequest, ignoreCache);
  }

  protected apiCall = (repositoryRequest: RepositoryDataRequest): Observable<RepositoryDataApiResponse> =>
    this.get<any, RepositoryDataApiResponse>(
      ProductApi.CONFIGURATION,
      'repositories/' + repositoryRequest.repositoryType,
      repositoryRequest
    );

  /**
   * Map the response from CMS Repository to the expected model ResourcesDataResponse
   * @param response Response from CMS
   */
  protected override mapApiCallResponse = (response: RepositoryDataApiResponse): ResourcesDataResponse => ({
    data: response,
  });
}
