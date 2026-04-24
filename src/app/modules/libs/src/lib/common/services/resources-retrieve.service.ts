import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { CultureServiceEx } from '../../core/services/culture-service-ex/culture-ex.service';
import { Alert, Country, Market, Station, ValidDocuments } from '../../shared';
import { ResourceType } from '../../shared/enums/enum-resource-type';
import { EnumResourcesCmsProperties } from '../enums/enum-resources-cms-properties';
import { ResourcesDataOrigin } from '../enums/enum-resources-data-origin';
import {
  RETRIEVE_ALERTS_DATA_SERVICE,
  RETRIEVE_MARKETS_DATA_SERVICE,
  RETRIEVE_STATIONS_DATA_SERVICE,
} from '../injection-tokens/injection-tokens';

import { IRetrieveAlertsData, IRetrieveMarketsData, IRetrieveStationsData } from './contracts';
import { ResourcesRetrieveProxyService } from './proxies/resources-retrieve-proxy.service';

@Injectable()
export class ResourcesRetrieveService {
  private readonly stationDataOrigins: Observable<Station[]>[] = [];
  private readonly marketDataOrigins: Observable<Market[]>[] = [];

  constructor(
    @Inject(RETRIEVE_STATIONS_DATA_SERVICE)
    protected readonly retrieveStationsDataServices: readonly IRetrieveStationsData[],
    protected readonly resourcesRetrieveProxyService: ResourcesRetrieveProxyService,
    @Inject(RETRIEVE_MARKETS_DATA_SERVICE)
    protected readonly retrieveMarketsDataServices: readonly IRetrieveMarketsData[],
    @Inject(RETRIEVE_ALERTS_DATA_SERVICE) protected readonly retrieveAlertsDataServices: readonly IRetrieveAlertsData[],
    protected readonly cultureServiceEx: CultureServiceEx
  ) {}

  public GetStations(culture: string, resourcesDataOrigin: ResourcesDataOrigin[] = []): Observable<Station[]> {
    if (!resourcesDataOrigin || resourcesDataOrigin.length === 0) {
      resourcesDataOrigin.push(ResourcesDataOrigin.PSS);
    }
    return new Observable<Station[]>((x) => {
      let stations: Station[] = [];
      this.setStationDataOriginsList(resourcesDataOrigin, culture);
      forkJoin(this.stationDataOrigins).subscribe((stationList: Station[][]) => {
        for (const station of stationList) {
          stations.push(...station);
        }
        stations = this.processStations(stations);
        x.next(stations);
        x.complete();
      });
    });
  }

  public GetMarkets(resourcesDataOrigin: ResourcesDataOrigin[] = []): Observable<Market[]> {
    if (!resourcesDataOrigin || resourcesDataOrigin.length === 0) {
      resourcesDataOrigin.push(ResourcesDataOrigin.PSS);
    }
    return new Observable<Market[]>((x) => {
      let markets: Market[] = [];
      this.setMarketDataOriginsList(resourcesDataOrigin);
      forkJoin(this.marketDataOrigins).subscribe((marketList: Market[][]) => {
        for (const market of marketList) {
          markets.push(...market);
        }
        markets = this.processMarkets(markets);
        x.next(markets);
        x.complete();
      });
    });
  }

  public GetCountries(culture: string): Observable<Country[]> {
    return this.resourcesRetrieveProxyService.retrieve({
      repositoryType: ResourceType.COUNTRIES,
      culture: culture ?? this.cultureServiceEx.getCulture(),
    }) as Observable<Country[]>;
  }

  /**
   * Get list of person documents from resources API
   */
  public GetDocuments(culture?: string): Observable<ValidDocuments[]> {
    return this.resourcesRetrieveProxyService.retrieve({
      repositoryType: ResourceType.DOCUMENTS,
      culture: culture ?? this.cultureServiceEx.getCulture(),
    }) as Observable<ValidDocuments[]>;
  }

  public GetAlerts(rootNodeId?: number, resourcesDataOrigin: ResourcesDataOrigin[] = []): Observable<Alert[]> {
    if (resourcesDataOrigin?.[0] !== ResourcesDataOrigin.CMS) {
      return new Observable<Alert[]>();
    }
    return new Observable<Alert[]>((x) => {
      this.retrieveAlertsDataServices
        .find((service) => service.originType === resourcesDataOrigin[0])!
        .retrieve(rootNodeId)
        .subscribe((response) => {
          x.next(response);
          x.complete();
        });
    });
  }

  protected setStationDataOriginsList(resourcesDataOrigin: ResourcesDataOrigin[], culture: string) {
    for (const dataOrigin of resourcesDataOrigin) {
      this.stationDataOrigins.push(
        this.retrieveStationsDataServices.find((x) => x.originType === dataOrigin)!.retrieve(culture)
      );
    }
  }

  protected setMarketDataOriginsList(resourcesDataOrigin: ResourcesDataOrigin[]) {
    for (const dataOrigin of resourcesDataOrigin) {
      this.marketDataOrigins.push(
        this.retrieveMarketsDataServices.find((x) => x.originType === dataOrigin)!.retrieve()
      );
    }
  }

  protected processMarkets(markets: Market[]): Market[] {
    let filteredMarkets: Market[] = [];
    const cmsMarkets = markets.filter((m) => m.isExternalMarket !== undefined);
    const pssMarkets = markets.filter((m) => !m.hasOwnProperty(EnumResourcesCmsProperties.isExternalMarket));
    const notConfiguredPssMarkets = pssMarkets.filter(
      (pm) => !cmsMarkets.some((cm) => cm.origin === pm.origin && cm.destination === pm.destination)
    );
    filteredMarkets = [...notConfiguredPssMarkets, ...cmsMarkets];
    return filteredMarkets;
  }

  protected processStations(stations: Station[]): Station[] {
    let filteredStations: Station[] = [];
    const cmsStations = stations.filter((s) => s.isExternalStation !== undefined);
    const pssStations = stations.filter((s) => !s.hasOwnProperty(EnumResourcesCmsProperties.isExternalStation));
    const notConfiguredPssStations = pssStations.filter((ps) => !cmsStations.some((cs) => cs.code === ps.code));
    filteredStations = [...notConfiguredPssStations, ...cmsStations];
    return filteredStations;
  }
}
