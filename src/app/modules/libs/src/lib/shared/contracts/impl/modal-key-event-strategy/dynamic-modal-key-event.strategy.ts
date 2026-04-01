import { EnumModalKeyEventType } from '../../../enums/enum-modal-key-event-type';
import { IModalKeyEventStrategy } from '../../../interfaces/modal-key-event-strategy.interface';
import { ModalKeyEventStrategyConfigModel } from '../../../model/modal-key-event/modal-key-event-strategy-config.model';

import { BaseModalKeyEventStrategy } from './base-modal-key-event.strategy';

export class DynamicModalKeyEventStrategy extends BaseModalKeyEventStrategy implements IModalKeyEventStrategy {
  public type = EnumModalKeyEventType.DYNAMIC;

  private mouseTrappingSubElementIdToResetIndex!: string;

  public setFocusableElements(config: ModalKeyEventStrategyConfigModel): void {
    this.mouseTrappingSectionId = config.mouseTrappingSectionId;
    this.mouseTrappingSubElementIdToResetIndex = config.mouseTrappingSubElementIdToResetIndex;
    setTimeout(() => {
      this.focusableElements = this.getFocusableElementsAndFocusFirst(this.mouseTrappingSectionId);
    });
    this.handleMutation();
  }

  public onElementWithIdClick!: (id: string) => void;

  private handleMutation(): void {
    const targetNode = document.getElementById(this.mouseTrappingSubElementIdToResetIndex) ?? new Node();

    const observer = new MutationObserver((_) => {
      this.resetIndex();
    });

    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
  }
}
