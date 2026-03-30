import { IbeEvent, IbeEventTypeEnum } from '../../core/models';
import { ModalDialogActionType } from '../enums';

export interface ModalClosedEvent extends IbeEvent {
  type: IbeEventTypeEnum.modalClosed;
  payload: {
    actionType: ModalDialogActionType;
  };
}
