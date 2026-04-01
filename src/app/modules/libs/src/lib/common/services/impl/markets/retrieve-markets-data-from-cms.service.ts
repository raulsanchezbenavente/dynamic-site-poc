import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Market, urlHelpers } from '../../../../shared';
import { ResourceType } from '../../../../shared/enums/enum-resource-type';
import { ResourcesDataOrigin } from '../../../enums/enum-resources-data-origin';
import { MarketRepositoryCmsModel } from '../../../models/markets-reporitory-cms/market-repository-cms.model';
import { RepositoryDataRequest } from '../../../models/repository-data-request';
import { IRetrieveMarketsData } from '../../contracts';
import { RepositoryRetrieveProxyService } from '../../proxies';

@Injectable()
export class RetrieveMarketsDataFromCms implements IRetrieveMarketsData {
  originType: ResourcesDataOrigin;

  constructor(protected repositoryRetrieveProxyService: RepositoryRetrieveProxyService) {
    this.originType = ResourcesDataOrigin.CMS;
  }

  retrieve(): Observable<Market[]> {
    const repositoryRequest: RepositoryDataRequest = {
      culture: urlHelpers.getCultureFromCurrentUrl(),
      repositoryType: ResourceType.MARKETS,
    };

    return this.repositoryRetrieveProxyService.retrieve(repositoryRequest).pipe(
      map((response) => {
        if (!response) {
          return [];
        }

        return this.mapRepositoryToMarkets(response as unknown as MarketRepositoryCmsModel[]);
      })
    );
  }

  private mapRepositoryToMarkets(marketsRepository: MarketRepositoryCmsModel[]): Market[] {
    const mappedMarkets: Market[] = [];

    for (const marketRepository of marketsRepository) {
      this.processDestinations(marketRepository, mappedMarkets);
    }

    return mappedMarkets;
  }

  private processDestinations(marketRepository: MarketRepositoryCmsModel, mappedMarkets: Market[]): void {
    for (const destination of marketRepository.destinations) {
      if (destination.isEnabled) {
        this.addMarketPair(
          mappedMarkets,
          marketRepository.origin.code,
          destination.station.code,
          destination.isExternalMarket
        );
      }
    }
  }

  private addMarketPair(
    markets: Market[],
    originCode: string,
    destinationCode: string,
    isExternalMarket: boolean
  ): void {
    markets.push(
      {
        origin: originCode,
        destination: destinationCode,
        isExternalMarket: isExternalMarket,
      },
      {
        origin: destinationCode,
        destination: originCode,
        isExternalMarket: isExternalMarket,
      }
    );
  }
}
