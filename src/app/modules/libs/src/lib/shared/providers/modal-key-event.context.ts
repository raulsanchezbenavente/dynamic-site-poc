import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MODAL_KEY_EVENT_STRATEGY } from '../../common';
import { EnumModalKeyEventType, KeyCodeEnum } from '../enums';
import { IModalKeyEventStrategy } from '../interfaces';
import { ModalKeyEventStrategyConfigModel } from '../model';

@Injectable({ providedIn: 'root' })
export class ModalKeyEventContext {
  private modalKeyEventStrategy!: IModalKeyEventStrategy;

  constructor(@Inject(MODAL_KEY_EVENT_STRATEGY) protected modalKeyEventTypeStrategies: IModalKeyEventStrategy[]) {
    const modalEvent = modalKeyEventTypeStrategies.find((x) => x.type === EnumModalKeyEventType.DEFAULT);
    if (modalEvent) {
      this.modalKeyEventStrategy = modalEvent;
    }
  }

  public onKeyEvent(event: KeyboardEvent): void {
    if (this.modalKeyEventStrategy.type === EnumModalKeyEventType.DROPDOWN) {
      switch (event.key) {
        case KeyCodeEnum.ARROW_DOWN:
          this.modalKeyEventStrategy.onArrowDownPress();
          break;
        case KeyCodeEnum.ARROW_UP:
          this.modalKeyEventStrategy.onArrowUpPress();
          break;
        case KeyCodeEnum.ARROW_LEFT:
          this.modalKeyEventStrategy.onArrowLeftPress();
          break;
        case KeyCodeEnum.ARROW_RIGHT:
          this.modalKeyEventStrategy.onArrowRightPress();
          break;
      }
    }
    switch (event.key) {
      case KeyCodeEnum.ESCAPE:
        this.modalKeyEventStrategy.onEscPress();
        break;
      case KeyCodeEnum.ENTER:
        this.modalKeyEventStrategy.onEnterPress();
        break;
      case KeyCodeEnum.TAB:
        event.shiftKey ? this.modalKeyEventStrategy.onShiftTabPress() : this.modalKeyEventStrategy.onTabPress();
        break;
      default:
        break;
    }
  }

  public setStrategy(modalKeyEventStrategyConfigModel: ModalKeyEventStrategyConfigModel): void {
    const modalKeyEvent = this.modalKeyEventTypeStrategies.find(
      (modalTypeStrategy) => modalTypeStrategy.type === modalKeyEventStrategyConfigModel.modalKeyEventType
    );
    if (modalKeyEvent) {
      this.modalKeyEventStrategy = modalKeyEvent;
    }
    this.modalKeyEventStrategy.setFocusableElements(modalKeyEventStrategyConfigModel);
  }

  public resetFocusIndex(): void {
    if (this.modalKeyEventStrategy.resetIndex) {
      this.modalKeyEventStrategy.resetIndex();
    }
  }

  public closeModalEvent(): Observable<void> {
    return this.modalKeyEventStrategy.closeModalEvent();
  }
}
