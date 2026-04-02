import { inject, Injectable } from '@angular/core';

import { HttpMethods } from '../enums/http-methods.enum';
import { HttpInterceptorToastModel } from '../models/http-interceptor-toast/http-interceptor-toast.model';
import { Toast, ToastService, ToastStatus } from '@dcx/ui/design-system';

@Injectable({ providedIn: 'root' })
export class ToastRequestConfigsService {
  private readonly toastService = inject(ToastService);
  public readonly configs: HttpInterceptorToastModel[] = [
    {
      path: 'accounts/api/v2/session',
      method: HttpMethods.POST,
      container: (): string => {
        return this.toastService.getSection();
      },
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.PersonalForm.Alert_Saved_Message',
      } as Toast,
      // Error config example for the future
      // configError: {
      //   status: ToastStatus.ERROR,
      //   message: 'AccountProfile.PersonalForm.Alert_Failed_Message',
      // } as Toast,
    },
    {
      path: 'accounts/api/v2/session',
      method: HttpMethods.PATCH,
      // Using a fixed container: all profile form toasts go to the same slot.
      // (Previous dynamic container logic kept for reference in case per-form positioning is needed again.)

      // container: (): string => {
      //   return this.toastService.getSection();
      // },
      container: 'accountMyProfileToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.PersonalForm.Alert_Updated_Message',
      } as Toast,
    },
    {
      path: 'accounts/api/v1/account/addEmergencyContact',
      method: HttpMethods.POST,
      container: 'accountMyProfileToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.EmergencyContactForm.Alert_Saved_Message',
      } as Toast,
    },
    {
      path: 'accounts/api/v1/account/updateEmergencyContact',
      method: HttpMethods.PATCH,
      container: 'accountMyProfileToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.EmergencyContactForm.Alert_Updated_Message',
      } as Toast,
    },
    {
      path: 'accounts/api/v2/account/travelDocuments',
      method: HttpMethods.PATCH,
      container: 'travelDocumentsToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.DocumentsForm.Alert_Saved_Message',
      } as Toast,
    },
    {
      path: 'accounts/api/v1/account/addTravelCompanion',
      method: HttpMethods.POST,
      container: 'accountCompanionsToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.CompanionsForm.Alert_Saved_Message',
      } as Toast,
    },
    {
      path: 'accounts/api/v1/account/updateTravelCompanion',
      method: HttpMethods.PATCH,
      container: 'accountCompanionsToast_Id',
      config: {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.CompanionsForm.Alert_Updated_Message',
      } as Toast,
    },
  ];
}
