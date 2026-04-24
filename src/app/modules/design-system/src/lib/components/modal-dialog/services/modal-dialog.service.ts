import { inject, Injectable, TemplateRef, Type } from '@angular/core';
import {
  EventBusService,
  GenerateIdPipe,
  IbeEventTypeEnum,
  ModalClosedEvent,
  ModalDialogActionType,
} from '@dcx/ui/libs';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';

import { ModalDialogComponent } from '../modal-dialog.component';
import { ModalDialogConfig } from '../models/modal-dialog.config';
import { ModalLayoutConfig } from '../models/modal-layout.config';

@Injectable({ providedIn: 'root' })
export class ModalDialogService {
  public readonly generateId = inject(GenerateIdPipe);
  private readonly modalSvc = inject(NgbModal);
  private readonly eventBusService = inject(EventBusService);
  private modalRef: NgbModalRef | null = null;
  private currentModalPriority: number = 0;

  /**
   * Subject for emitting actions from the modal if you are using the modal-dialog component, it
   * could be use to suscribe to cancel or confirm action.
   */
  private actionSubject!: Subject<ModalDialogActionType>;

  /**
   * Opens a modal dialog with the provided configuration and content.
   *
   * @param modalDialogConfig - Configuration options for the modal.
   * @param content - The content or component to display inside the modal.
   * @param componentInstanceConfig - Additional configuration for the component instance.
   * @param allowMultiple - Allows opening multiple modals when true.
   * @returns An Observable that emits modal actions.
   */
  /**
   * Opens a modal with strongly typed content targets. `content` mirrors the valid inputs for `NgbModal.open`
   * (Angular components, templates, or template ids) so callers get compile-time hints instead of `any`.
   * Optional `componentInstanceConfig` lets feature modules pass extra inputs to projected components.
   */
  public openModal(
    config: ModalDialogConfig,
    content: Type<unknown> | TemplateRef<unknown> | string = ModalDialogComponent,
    componentInstanceConfig?: Record<string, unknown>,
    allowMultiple: boolean = false,
    priority: number = 0
  ): Observable<ModalDialogActionType> {
    if (priority > 0 && priority > this.currentModalPriority) {
      this.modalSvc.dismissAll();
      this.modalRef = null;
      this.currentModalPriority = 0;
    }

    if (this.currentModalPriority > 0 && priority < this.currentModalPriority) {
      return new Subject<ModalDialogActionType>().asObservable();
    }

    // Only prevents multiple modals if allowMultiple is false
    if (this.modalRef && !allowMultiple) {
      return this.actionSubject.asObservable();
    }

    const actionSubject = new Subject<ModalDialogActionType>();
    const options = this.buildModalOptions(config);
    const modalRef = this.modalSvc.open(content, options);

    if (priority > this.currentModalPriority) {
      this.currentModalPriority = priority;
    }

    if (!allowMultiple) {
      this.modalRef = modalRef;
      this.actionSubject = actionSubject;
    }

    if (modalRef.componentInstance) {
      modalRef.componentInstance.modalDialogConfig = { ...config };

      if (componentInstanceConfig) {
        modalRef.componentInstance.config = { ...componentInstanceConfig };
      }
    }

    modalRef.dismissed.subscribe(() => {
      actionSubject.next(ModalDialogActionType.BLUR);

      const event: ModalClosedEvent = {
        type: IbeEventTypeEnum.modalClosed,
        payload: {
          actionType: ModalDialogActionType.BLUR,
        },
      };
      this.eventBusService.notifyEvent(event);
    });

    if (modalRef.componentInstance?.closeModal) {
      modalRef.componentInstance.closeModal.subscribe(() => {
        if (allowMultiple) {
          modalRef.dismiss();
        } else {
          this.closeActiveModal();
        }
      });
    }

    if (modalRef.componentInstance?.actionEmitter) {
      modalRef.componentInstance.actionEmitter.subscribe((action: ModalDialogActionType) => {
        actionSubject.next(action);
      });
    }

    modalRef.result.finally(() => {
      if (!allowMultiple) {
        this.modalRef = null;
      }
      if (priority >= this.currentModalPriority) {
        this.currentModalPriority = 0;
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

  /**
   * Updates the layout-related options (fullscreen, classes, size) of the currently active modal without
   * forcing a close/reopen cycle. Internally uses `NgbModalRef.update`, so it’s safe to call repeatedly
   * as breakpoints or themes change. No-ops if there’s no active modal or no layout config.
   */
  public updateActiveModalLayout(layoutConfig?: ModalLayoutConfig): void {
    if (!this.modalRef || !layoutConfig) {
      return;
    }

    this.modalRef.update({
      centered: layoutConfig.centered,
      size: layoutConfig.size,
      fullscreen: layoutConfig.fullscreen,
      modalDialogClass: layoutConfig.modalDialogClass,
      windowClass: layoutConfig.modalWrapperClass,
      backdropClass: layoutConfig.modalOverlayClass,
    });
  }

  private buildModalOptions(config: ModalDialogConfig): NgbModalOptions {
    const generatedId = this.generateId.transform('modalHeaderId_');

    config.ariaAttributes ??= {};
    config.ariaAttributes.ariaLabelledBy ??= generatedId;

    return {
      centered: config.layoutConfig?.centered ?? true,
      size: config.layoutConfig?.size,
      fullscreen: config.layoutConfig?.fullscreen,
      backdropClass: config.layoutConfig?.modalOverlayClass,
      windowClass: config.layoutConfig?.modalWrapperClass,
      modalDialogClass: config.layoutConfig?.modalDialogClass,
      ariaLabelledBy: config.ariaAttributes.ariaLabelledBy,
      ariaDescribedBy: config.ariaAttributes.ariaDescribedBy,
      backdrop: config.layoutConfig?.backdrop ?? true,
    };
  }
}
