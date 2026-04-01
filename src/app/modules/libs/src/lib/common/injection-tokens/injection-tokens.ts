import { InjectionToken } from '@angular/core';

import { IRetrieveAlertsData, IRetrieveMarketsData, IRetrieveStationsData } from '../services/contracts';

export const RETRIEVE_STATIONS_DATA_SERVICE = new InjectionToken<IRetrieveStationsData>('RetrieveStationsDataService');

export const RETRIEVE_MARKETS_DATA_SERVICE = new InjectionToken<IRetrieveMarketsData>('RetrieveMarketsDataService');

export const RETRIEVE_ALERTS_DATA_SERVICE = new InjectionToken<IRetrieveAlertsData>('RetrieveAlertsDataService');
