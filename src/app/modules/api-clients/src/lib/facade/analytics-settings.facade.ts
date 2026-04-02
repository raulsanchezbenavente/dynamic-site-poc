import { inject, Injectable } from '@angular/core';
import { AnalyticsConfig } from '@dcx/module/analytics';
import { AnalyticsSettingsAdapter } from '@dcx/ui/business-common';
import { catchError, map, Observable, of } from 'rxjs';

import { CmsConfigClient } from '../cmsConfig-api';

export interface MappedAnalyticsSettings {
  analyticsConfig?: AnalyticsConfig;
  activateCustomPageViewEvent?: boolean;
  gaGtmColiving?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsSettingsFacade {
  private readonly cmsConfigClient = inject(CmsConfigClient);

  public getAnalyticsSettings(): Observable<MappedAnalyticsSettings | null> {
    return this.cmsConfigClient.analyticsSettings().pipe(
      catchError((error) => {
        console.error('Failed to fetch analytics settings:', error);
        return of(null);
      }),
      map((settings) => {
        if (!settings) {
          return null;
        }
        return {
          analyticsConfig: AnalyticsSettingsAdapter.adaptAnalyticsConfig(settings.analyticsConfig),
          activateCustomPageViewEvent: settings.activateCustomPageViewEvent,
          gaGtmColiving: settings.gaGtmColiving,
        };
      })
    );
  }
}
