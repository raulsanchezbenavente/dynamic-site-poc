import { inject, Injectable } from '@angular/core';
import {
  EnumStorageKey,
  IbeEventRedirectType,
  LoggerService,
  RedirectionService,
  StorageService,
  TabGuardService,
} from '@dcx/ui/libs';

@Injectable({ providedIn: 'root' })
export class NavigationGuardService {
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);
  private readonly redirectionService = inject(RedirectionService);
  private readonly tabGuardService = inject(TabGuardService);

  public setConfirmationPageAllowed(allowed: boolean): void {
    this.storageService.setSessionStorage(EnumStorageKey.ConfirmationPageAllowed, allowed);
  }
  public isConfirmationPageAllowed(): boolean {
    return this.storageService.getSessionStorage(EnumStorageKey.ConfirmationPageAllowed) === true;
  }

  /**
   * Redirect to a specified page and block confirmation page access.
   * Used when irregular navigation is detected.
   *
   * When TabGuardService has already detected the current tab as a duplicate,
   * this method is a no-op: the guard's own redirect to `urlHome` takes
   * priority, so we must not overwrite `window.location.href` with a
   * different URL.
   */
  public denyAccessAndRedirect(url: string = '/'): void {
    if (this.tabGuardService.isDuplicate()) {
      this.logger.info(
        'NavigationGuardService',
        'Skipping redirect — tab already detected as duplicate by TabGuardService',
      );
      return;
    }

    this.setConfirmationPageAllowed(false);
    this.logger.info('NavigationGuardService', 'Denying access and redirecting', { redirectUrl: url });
    this.redirectionService.redirect(IbeEventRedirectType.internalRedirect, url);
  }
}
