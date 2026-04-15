import { inject, Injectable } from '@angular/core';
import { AnalyticsGaGtmColivingRewriteService, AnalyticsService } from '@dcx/module/analytics';
import { AnalyticsSettingsFacade, PointOfSalesFacade } from '@dcx/module/api-clients';
import { CutureConfigService } from '@dcx/ui/business-common';
import { initKeyboardFocusDetection, PointOfSaleService } from '@dcx/ui/libs';

import { Page404TrackerService } from './page-404-tracker.service';
import { PageViewInitializerService } from './page-view-initializer.service';
import { StorageSyncService } from './storage-sync.service';

@Injectable({
  providedIn: 'root',
})
export class InitialConfigService {
  private readonly analyticsGaGtmColivingRewriteService = inject(AnalyticsGaGtmColivingRewriteService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly analyticsSettingsFacade = inject(AnalyticsSettingsFacade);
  private readonly pageViewInitializerService = inject(PageViewInitializerService);
  private readonly cultureConfigService = inject(CutureConfigService);
  private readonly pointOfSaleService = inject(PointOfSaleService);
  private readonly posFacade = inject(PointOfSalesFacade);
  private readonly storageSyncService = inject(StorageSyncService);
  private readonly page404TrackerService = inject(Page404TrackerService);

  public initializePointOfSales(): void {
    this.posFacade.getPointOfSales().subscribe((pointsOfSaleItems) => {
      if (pointsOfSaleItems) {
        this.pointOfSaleService.initializePointsOfSale(pointsOfSaleItems);
        this.storageSyncService.syncFromStorage();
      }
      this.cultureConfigService.setInitialCulture();
    });
  }

  public initializeAnalyticsSettings(): void {
    this.analyticsSettingsFacade.getAnalyticsSettings().subscribe((settings) => {
      if (settings?.analyticsConfig) {
        this.analyticsService.setConfig(settings.analyticsConfig);
        this.page404TrackerService.initialize();

        if (settings.activateCustomPageViewEvent) {
          this.pageViewInitializerService.initialize();
        }

        this.analyticsGaGtmColivingRewriteService.initGaGtmColiving(settings.gaGtmColiving || false);
      }
    });
  }

  public initialize(): void {
    initKeyboardFocusDetection();
    this.initializePointOfSales();
    this.initializeAnalyticsSettings();
  }
}
