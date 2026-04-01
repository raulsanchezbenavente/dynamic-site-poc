import { Observable } from 'rxjs';

import { EnumModalKeyEventType } from '../enums/enum-modal-key-event-type';
import { ModalKeyEventStrategyConfigModel } from '../model/modal-key-event/modal-key-event-strategy-config.model';

export interface IModalKeyEventStrategy {
  type: EnumModalKeyEventType;
  setFocusableElements: (config: ModalKeyEventStrategyConfigModel) => void;
  onEnterPress: () => void;
  onEscPress: () => void;
  onArrowUpPress: () => void;
  onArrowDownPress: () => void;
  onArrowLeftPress: () => void;
  onArrowRightPress: () => void;
  onTabPress: () => void;
  onShiftTabPress: () => void;
  onElementWithIdClick: (id: string) => void;
  resetIndex: () => void;
  closeModalEvent: () => Observable<void>;
}
