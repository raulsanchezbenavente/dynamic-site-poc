import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccountServiceResponse,
  ConfigService,
  IdleTimeoutService,
  LoggerService,
  ProductApi,
  RepositoryDataRequest,
  Resource,
  ResourceApiResponse,
  ResourceRetrieveBaseProxy,
  StorageService,
} from '@dcx/ui/libs';
import { Observable } from 'rxjs';

@Injectable()
export class ResourcesRetrieveProxyServiceFake extends ResourceRetrieveBaseProxy {
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
    return this.get<any, AccountServiceResponse>(ProductApi.CONFIGURATION, 'services');
  }

  public retrieve(repositoryRequest: RepositoryDataRequest, ignoreCache: boolean = false): Observable<Resource[]> {
    return this.retrieveResource(repositoryRequest, ignoreCache);
  }

  protected apiCall = (repositoryRequest: RepositoryDataRequest): Observable<ResourceApiResponse> =>
    this.get<any, ResourceApiResponse>(
      ProductApi.CONFIGURATION,
      'resource/' + repositoryRequest.repositoryType,
      repositoryRequest
    );
}
