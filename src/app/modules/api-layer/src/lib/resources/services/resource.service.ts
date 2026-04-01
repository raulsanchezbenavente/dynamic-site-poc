import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi, ResourceType } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import {
  Alert,
  City,
  Country,
  GetResourceQuery,
  Market,
  ResourcesPointOfSale,
  SegmentEntranceDocuments,
  SegmentTravelDocuments,
  Station,
} from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class ResourceService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public retrieveResource(
    resourceType: ResourceType,
    query: GetResourceQuery
  ): Observable<QueryResponse<Record<string, unknown>>> {
    return this.get(ProductApi.RESOURCES, `/resource/${resourceType}`, query);
  }

  public retrieveStations(query: GetResourceQuery): Observable<QueryResponse<Station[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/stations', query);
  }

  public retrieveMarkets(query: GetResourceQuery): Observable<QueryResponse<Market[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/markets', query);
  }

  public retrieveCountries(query: GetResourceQuery): Observable<QueryResponse<Country[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/countries', query);
  }

  public retrieveAlerts(query: GetResourceQuery): Observable<QueryResponse<Alert[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/alerts', query);
  }

  public retrieveCities(query: GetResourceQuery): Observable<QueryResponse<City[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/cities', query);
  }

  public retrievePointOfSales(query: GetResourceQuery): Observable<QueryResponse<ResourcesPointOfSale[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/pointsofsale', query);
  }

  public retrieveTravelDocuments(query: GetResourceQuery): Observable<QueryResponse<SegmentTravelDocuments[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/travelDocuments', query);
  }

  public retrieveEntranceDocuments(query: GetResourceQuery): Observable<QueryResponse<SegmentEntranceDocuments[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/entrancedocuments', query);
  }

  public retrieveDocuments(query: GetResourceQuery): Observable<QueryResponse<Document[]>> {
    return this.get(ProductApi.RESOURCES, '/resource/documents', query);
  }

  public retrieveDictionaries(
    query: GetResourceQuery
  ): Observable<QueryResponse<Record<string, Record<string, string>>>> {
    return this.get(ProductApi.RESOURCES, '/resource/dictionaries', query);
  }

  public retrieveOffers(query: GetResourceQuery): Observable<QueryResponse<Record<string, unknown>>> {
    return this.get(ProductApi.RESOURCES, '/resource/offers', query);
  }
}
