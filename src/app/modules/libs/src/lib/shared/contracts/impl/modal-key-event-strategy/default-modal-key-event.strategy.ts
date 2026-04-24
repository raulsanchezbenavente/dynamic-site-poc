import { EnumModalKeyEventType } from '../../../enums/enum-modal-key-event-type';
import { IModalKeyEventStrategy } from '../../../interfaces/modal-key-event-strategy.interface';
import { ModalKeyEventStrategyConfigModel } from '../../../model/modal-key-event/modal-key-event-strategy-config.model';

import { BaseModalKeyEventStrategy } from './base-modal-key-event.strategy';

export class DefaultModalKeyEventStrategy extends BaseModalKeyEventStrategy implements IModalKeyEventStrategy {
  public type = EnumModalKeyEventType.DEFAULT;

  public setFocusableElements(config: ModalKeyEventStrategyConfigModel): void {
    this.mouseTrappingSectionId = config.mouseTrappingSectionId;
    setTimeout(() => {
      this.focusableElements = this.getFocusableElementsAndFocusFirst(this.mouseTrappingSectionId);
    });
  }

  public onElementWithIdClick!: (id: string) => void;
}
