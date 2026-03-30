import { inject, Injectable, TemplateRef, Type } from '@angular/core';
import { EventBusService, IbeEventTypeEnum, ModalClosedEvent, ModalDialogActionType } from '@dcx/ui/libs';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';

import { ModalDialogConfig } from '../models/modal-dialog.config';

@Injectable({ providedIn: 'root' })
export class ModalDialogService {
  private readonly modalSvc = inject(NgbModal);
  private readonly eventBusService = inject(EventBusService);
  private modalRef: NgbModalRef | null = null;

  public openModal(
    config: ModalDialogConfig,
    content: Type<unknown> | TemplateRef<unknown> | string,
    componentInstanceConfig?: Record<string, unknown>,
    allowMultiple: boolean = false
  ): Observable<ModalDialogActionType> {
    if (this.modalRef && !allowMultiple) {
      return new Subject<ModalDialogActionType>().asObservable();
    }

    const actionSubject = new Subject<ModalDialogActionType>();
    const options: NgbModalOptions = {
      centered: config.layoutConfig?.centered ?? true,
      backdrop: config.layoutConfig?.backdrop ?? true,
      size: config.layoutConfig?.size as any,
      fullscreen: config.layoutConfig?.fullscreen as any,
      backdropClass: config.layoutConfig?.modalOverlayClass,
      windowClass: config.layoutConfig?.modalWrapperClass,
      modalDialogClass: config.layoutConfig?.modalDialogClass,
      ariaLabelledBy: config.ariaAttributes?.ariaLabelledBy,
      ariaDescribedBy: config.ariaAttributes?.ariaDescribedBy,
    };

    const modalRef = this.modalSvc.open(content, options);
    if (!allowMultiple) {
      this.modalRef = modalRef;
    }

    if (modalRef.componentInstance && componentInstanceConfig) {
      modalRef.componentInstance.config = { ...componentInstanceConfig };
    }

    modalRef.dismissed.subscribe(() => {
      const event: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: { actionType: ModalDialogActionType.BLUR },
      };
      this.eventBusService.notifyEvent(event);
      actionSubject.next(ModalDialogActionType.BLUR);
    });

    modalRef.result.finally(() => {
      if (!allowMultiple) {
        this.modalRef = null;
      }
      actionSubject.complete();
    });

    return actionSubject.asObservable();
  }

  public closeActiveModal(): void {
    this.modalRef?.dismiss();
  }

  public closeAllModals(): void {
    this.closeActiveModal();
    this.modalSvc.dismissAll();
  }
}
