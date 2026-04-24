import { inject, Injectable } from '@angular/core';
import { BaseErrorResponse } from '@dcx/ui/api-layer';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, skipUntil, take } from 'rxjs/operators';

import {
  AlertType,
  ButtonStyles,
  LayoutSize,
  ModalClosedEvent,
  ModalDialogActionType,
  NotificationConfigModel,
} from '..';
import {
  ErrorsTranslationKeys,
  EventBusService,
  IbeEvent,
  IbeEventRedirect,
  IbeEventTypeEnum,
  RedirectService,
} from '../../core';

import { urlHelpers } from './../helpers/url-helper';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public isBootstraping!: boolean;
  public openDialogSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openDialog$: Observable<boolean> = this.openDialogSubject.asObservable();
  public eventNotifierSubscription!: Subscription;
  private readonly isOpenModal: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly genericErrorMessage: string = ErrorsTranslationKeys.Errors_Generic_Internal;
  private readonly genericModalTitle: string = ErrorsTranslationKeys.Errors_Wait_Title;
  private readonly translationService = inject(TranslateService);

  private readonly notificationConfig: Subject<NotificationConfigModel> = new Subject();
  public notificationConfig$: Observable<NotificationConfigModel> = this.notificationConfig.asObservable();

  constructor(
    protected eventBusService: EventBusService,
    protected redirectService: RedirectService
  ) {}

  /**
   * Method to display a simple message with type Error and a Primary button by default
   * Additional types and buttons can be specified using the notificationConfig parameter.
   * If there is other modal open, it can not open another modal
   *
   * @param config Configuration for message, title, type and buttons.
   */
  public showNotification(config: NotificationConfigModel): void {
    if (this.isOpenModal.value) {
      return;
    }
    config.alertType ??= AlertType.ERROR;
    this.notificationConfig.next(config);
    this.subscribeToModalClosedEvent(config);
    this.isOpenModal.next(true);
  }

  /**
   * @deprecated Use showNotification instead.
   *
   * Method to display a simple message with default type Error.
   * Other types can be specified using the notificationConfig parameter.
   * If there is other modal open, it can not open another modal
   *
   * @param message Simple message to be displayed
   * @param alertType Default is Error
   * @param notificationConfig Additional configuration for message, type and buttons.
   * This configuration object takes precedence over other arguments
   */
  public showError(
    message: string,
    alertType: AlertType = AlertType.ERROR,
    notificationConfig?: NotificationConfigModel
  ): void {
    const config = {
      message,
      alertType,
    };

    if (notificationConfig) {
      Object.assign(config, notificationConfig);
    }

    this.showNotification({
      message,
      alertType,
    });
  }

  /**
   * Show an error modal and redirect when the modal is closed
   * @param error error name
   * @param urlRedirect redirect page
   * @param typeAlert alert type
   */
  public showErrorAndRedirect(
    error: string,
    urlRedirect: string,
    typeAlert?: AlertType,
    notificationConfig?: NotificationConfigModel
  ): void {
    this.showNotification({
      message: notificationConfig?.message || error,
      alertType: typeAlert || AlertType.ERROR,
    });

    this.eventBusService.eventNotifier$
      .pipe(
        filter((x) => x.type === IbeEventTypeEnum.modalClosed),
        take(1)
      )
      .subscribe(() => {
        this.redirectEvent(urlRedirect);
      });
  }
  private subscribeToModalClosedEvent(notificationConfig?: NotificationConfigModel): void {
    if (this.eventNotifierSubscription) {
      this.eventNotifierSubscription.unsubscribe();
    }
    this.eventNotifierSubscription = this.eventBusService.eventNotifier$
      .pipe(
        filter((x: ModalClosedEvent | IbeEvent) => (x as IbeEvent).type === IbeEventTypeEnum.modalClosed),
        skipUntil(this.isOpenModal.pipe(filter(Boolean)))
      )
      .subscribe((event) => {
        this.isOpenModal.next(false);
        if (
          (event as ModalClosedEvent).payload.actionType === ModalDialogActionType.CONFIRM &&
          notificationConfig?.buttonPrimaryUrl
        ) {
          this.redirectEvent(notificationConfig.buttonPrimaryUrl);
        }

        if (
          notificationConfig?.buttonPrimaryCallBack &&
          (event as ModalClosedEvent).payload.actionType === ModalDialogActionType.CONFIRM
        ) {
          notificationConfig.buttonPrimaryCallBack();
        }

        if (
          notificationConfig?.onBlurCallback &&
          (event as ModalClosedEvent).payload.actionType === ModalDialogActionType.BLUR
        ) {
          notificationConfig.onBlurCallback();
        }
        if (
          notificationConfig?.buttonSecondaryLayout &&
          (event as ModalClosedEvent).payload.actionType === ModalDialogActionType.CANCEL
        ) {
          notificationConfig.buttonSecondaryCallBack?.();
        }
      });
  }

  /**
   * Notify redirect event
   * @param url to redirect
   * @param target to open
   */
  private redirectEvent(url: string, target = ''): void {
    const currentCulture = urlHelpers.getCultureFromCurrentUrl();
    const redirect: IbeEventRedirect = {
      url,
      type: this.redirectService.validateEventRedirectType(url),
      target,
    };

    this.eventBusService.notifyEvent({
      type: IbeEventTypeEnum.pageRedirected,
      redirectUrl: redirect,
      culture: currentCulture,
    });
  }

  public openModalTimeOut(callBack: () => void, callBackSecondary: () => void): void {
    this.showNotification({
      title: this.translationService.instant('Common.SessionTimeout.Title'),
      message: this.translationService.instant('Common.SessionTimeout.Message'),
      buttonPrimaryText: this.translationService.instant('Common.SessionTimeout.Button'),
      buttonSecondaryText: this.translationService.instant('Common.SessionTimeout.SearchAgain'),
      alertType: AlertType.NONE,
      buttonSecondaryLayout: { style: ButtonStyles.LINK, size: LayoutSize.SMALL },
      buttonPrimaryCallBack: callBack,
      buttonSecondaryCallBack: callBackSecondary,
      onBlurCallback: callBack,
    });
  }
  /**
   * Displays an error modal based on the provided error response.
   * It retrieves the error message corresponding to the error code.
   *
   * @param response The error response object containing the error code.
   */
  public showErrorModal(response: BaseErrorResponse, allowMultiple: boolean = true): void {
    const errorCode = this.extractErrorCode(response);
    this.showNotification({
      title: this.translationService.instant(this.genericModalTitle),
      message: this.getErrorTranslation(errorCode),
      alertType: AlertType.ERROR,
      buttonPrimaryText: this.translationService.instant('Common.OK'),
      allowMultiple: allowMultiple,
    });
  }

  private extractErrorCode(response: BaseErrorResponse): string | undefined {
    if (!response || typeof response !== 'object') {
      return undefined;
    }

    const responseObject = response as {
      code?: string;
      error?: {
        code?: string;
        error?: {
          code?: string;
        };
      };
    };

    return responseObject.error?.error?.code ?? responseObject.error?.code ?? responseObject.code;
  }

  /**
   * Retrieves the translated error message for a given error code.
   * If the specific translation for the error code is not found, it returns a generic error message.
   *
   * @param errorCode The code of the error to translate.
   * @returns The translated error message or a generic error message.
   */
  private getErrorTranslation(errorCode?: string): string {
    const genericMessage = this.translationService.instant(this.genericErrorMessage);

    if (!errorCode) {
      return genericMessage;
    }

    const translationKey = `${errorCode}`;
    const translationMessage = this.translationService.instant(translationKey);

    return translationKey === translationMessage ? genericMessage : translationMessage;
  }
}
