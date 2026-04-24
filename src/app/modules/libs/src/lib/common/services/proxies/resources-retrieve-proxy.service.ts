import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService, IdleTimeoutService, LoggerService, ProductApi } from '../../../../public-api';
import { AccountServiceResponse, StorageService } from '../../../shared';
import { ResourceApiResponse } from '../../../shared/model/common-models';
import { RepositoryDataRequest } from '../../models/repository-data-request';
import { Resource } from '../types';

import { ResourceRetrieveBaseProxy } from './resource-retrieve-base.proxy';

@Injectable()
export class ResourcesRetrieveProxyService extends ResourceRetrieveBaseProxy {
  protected override storageKey = 'data';

  constructor(
    httpClient: HttpClient,
    idleTimeoutService: IdleTimeoutService,
    configService: ConfigService,
    loggerService: LoggerService,
    storageService: StorageService
  ) {
    super(httpClient, idleTimeoutService, configService, loggerService, storageService);
  }

  public GetAccountServices(): Observable<AccountServiceResponse> {
    return this.get<any, AccountServiceResponse>(ProductApi.ACCOUNTS, 'services');
  }

  public retrieve(repositoryRequest: RepositoryDataRequest, ignoreCache: boolean = false): Observable<Resource[]> {
    return this.retrieveResource(repositoryRequest, ignoreCache);
  }

  protected apiCall = (repositoryRequest: RepositoryDataRequest): Observable<ResourceApiResponse> =>
    this.get<any, ResourceApiResponse>(
      ProductApi.RESOURCES,
      'resource/' + repositoryRequest.repositoryType,
      repositoryRequest
    );
}
