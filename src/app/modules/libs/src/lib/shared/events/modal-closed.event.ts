import { IbeEvent, IbeEventTypeEnum } from '../../core';
import { ModalDialogActionType } from '../enums';

export interface ModalClosedEvent extends IbeEvent {
  type: IbeEventTypeEnum.modalClosed;
  payload: {
    actionType: ModalDialogActionType;
  };
}
