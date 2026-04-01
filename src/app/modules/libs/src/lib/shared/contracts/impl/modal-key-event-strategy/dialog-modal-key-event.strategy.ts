import { noop, Observable } from 'rxjs';

import { EnumModalKeyEventType } from '../../../enums/enum-modal-key-event-type';
import { IModalKeyEventStrategy } from '../../../interfaces/modal-key-event-strategy.interface';
import { ModalKeyEventStrategyConfigModel } from '../../../model/modal-key-event/modal-key-event-strategy-config.model';

export class DialogModalKeyEventStrategy implements IModalKeyEventStrategy {
  public type = EnumModalKeyEventType.DIALOG;

  public onEnterPress(): void {
    noop();
  }

  public onEscPress(): void {
    noop();
  }

  public onArrowUpPress(): void {
    noop();
  }

  public onArrowDownPress(): void {
    noop();
  }

  public onArrowLeftPress(): void {
    noop();
  }

  public onArrowRightPress(): void {
    noop();
  }

  public onTabPress(): void {
    noop();
  }

  public onShiftTabPress(): void {
    noop();
  }

  public onElementWithIdClick(id: string): void {
    noop();
  }

  public setFocusableElements(config: ModalKeyEventStrategyConfigModel): void {
    noop();
  }

  public resetIndex(): void {
    noop();
  }

  public closeModalEvent!: () => Observable<void>;
}
