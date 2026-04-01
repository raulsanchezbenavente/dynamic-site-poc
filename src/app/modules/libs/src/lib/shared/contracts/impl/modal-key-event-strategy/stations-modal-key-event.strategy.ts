import { EnumModalKeyEventType } from '../../../enums/enum-modal-key-event-type';
import { IModalKeyEventStrategy } from '../../../interfaces/modal-key-event-strategy.interface';
import { ModalKeyEventStrategyConfigModel } from '../../../model/modal-key-event/modal-key-event-strategy-config.model';

import { BaseModalKeyEventStrategy } from './base-modal-key-event.strategy';

export class StationsModalKeyEventStrategy extends BaseModalKeyEventStrategy implements IModalKeyEventStrategy {
  type = EnumModalKeyEventType.STATIONS;

  public setFocusableElements(config: ModalKeyEventStrategyConfigModel): void {
    this.mouseTrappingSectionId = config.mouseTrappingSectionId;
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
  }

  public override onTabPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);

    const fromModal = document.getElementById('departureStationsListId');
    const toModal = document.getElementById('arrivalStationsListId');
    const activeElement = document.activeElement;

    if (!fromModal && !toModal) {
      return;
    }

    if (!(fromModal?.contains(activeElement) || toModal?.contains(activeElement))) {
      return;
    }

    const focusedElements = document.getElementsByClassName('is-focused');
    if (
      !focusedElements.length ||
      !this.focusableElements?.length ||
      this.focusableElements[1] === document.activeElement
    ) {
      return;
    }

    const focusedElement = focusedElements[0];
    const tabbableElements = this.getTabbableElements(focusedElement);

    const focusedIndex = this.focusableElements.indexOf(tabbableElements[0]);

    if (focusedIndex === 0) {
      (this.focusableElements[1] as HTMLElement).focus();
    } else {
      const departureElement = document.getElementById('departureDateButtonId') as HTMLElement;
      departureElement.click();
    }
  }

  public override onShiftTabPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
    const focusedElements = document.getElementsByClassName('is-focused');
    if (focusedElements.length === 0) {
      return;
    }

    const focusedElement = focusedElements[0];
    const tabbableElements = this.getTabbableElements(focusedElement);

    const focusedIndex = this.focusableElements.indexOf(tabbableElements[0]);

    if (focusedIndex === 1) {
      (this.focusableElements[0] as HTMLElement).click();
    } else {
      const journeyType = document.querySelector(
        '#ibeSearchJourneyTypeControlId .switch-button_item--active input'
      ) as HTMLElement;
      journeyType.click();
      journeyType.focus();
    }
  }

  public onElementWithIdClick!: (id: string) => void;

  public override onArrowUpPress() {}

  public override onArrowDownPress() {}

  public override onArrowLeftPress() {}

  public override onArrowRightPress() {}
}
