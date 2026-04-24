import { inject, Injectable } from '@angular/core';
import {
  AlertType,
  EnumStorageKey,
  ErrorsTranslationKeys,
  IbeEventRedirectType,
  NotificationService,
  RedirectionService,
  StorageService,
  WindowHelper,
  CommonTranslationKeys,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { PageBackModel } from '../models/page-back.model';

@Injectable({ providedIn: 'root' })
export class PageBackService {
  private readonly storageService = inject(StorageService);
  private readonly redirectService = inject(RedirectionService);
  protected notificationService = inject(NotificationService);
  protected translationService = inject(TranslateService);

  public saveDeniedUrl(): void {
    const pageBackValue: PageBackModel = {
      deniedPage: WindowHelper.getPath() ?? '',
      pageBackUrl: '',
    };
    this.storageService.setSessionStorage(EnumStorageKey.PageBackUrl, pageBackValue);
  }
  public saveRedirectUrl(): void {
    const pageBackValue = this.storageService.getSessionStorage(EnumStorageKey.PageBackUrl);
    if (pageBackValue) {
      pageBackValue.pageBackUrl = WindowHelper.getPath();
      this.storageService.setSessionStorage(EnumStorageKey.PageBackUrl, pageBackValue);
    }
  }
  public getSavedUrl(): string | null {
    const pageBackValue = this.storageService.getSessionStorage(EnumStorageKey.PageBackUrl);
    return pageBackValue ? pageBackValue.pageBackUrl : null;
  }
  public getDeniedUrl(): string | null {
    const pageBackValue = this.storageService.getSessionStorage(EnumStorageKey.PageBackUrl);
    return pageBackValue ? pageBackValue.deniedPage : null;
  }
  public clearSavedUrl(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.PageBackUrl);
  }
  public validatePageBackUrl(): void {
    if (WindowHelper.getPath() === this.getDeniedUrl()) this.showPopupError();
  }
  private redirectToPageBackUrl(): void {
    this.redirectService.redirect(IbeEventRedirectType.internalRedirect, this.getSavedUrl() ?? '');
  }

  private showPopupError(): void {
    this.notificationService.showNotification({
      title: this.translationService.instant(ErrorsTranslationKeys.Error_Navigation_BackNotAllowed_Title),
      message: this.translationService.instant(ErrorsTranslationKeys.Error_Navigation_BackNotAllowed_Message),
      alertType: AlertType.ERROR,
      buttonPrimaryText: this.translationService.instant(CommonTranslationKeys.Common_OK),
      buttonPrimaryCallBack: () => this.redirectToPageBackUrl(),
      onBlurCallback: () => this.redirectToPageBackUrl(),
    });
  }
}
