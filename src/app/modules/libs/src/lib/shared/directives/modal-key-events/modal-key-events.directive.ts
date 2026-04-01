import { DOCUMENT } from '@angular/common';
import { Directive, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

import { EnumModalKeyEventType, KeyCodeEnum } from '../../enums';
import { ModalKeyEventStrategyConfigModel } from '../../model';
import { ModalKeyEventContext } from '../../providers/modal-key-event.context';

@Directive({
  selector: '[modalKeyEvents]',
  providers: [ModalKeyEventContext],
  standalone: true,
})
export class ModalKeyEventsDirective implements OnInit, OnDestroy, OnChanges {
  private readonly KEY_DOWN_EVENT = 'keydown';
  private keyboardEventValue$!: Subscription | null;
  private closeModalValue$!: Subscription;
  /**
   * Input property that specifies the type of modal key events to handle.
   * Should be one of the values from the EnumModalKeyEventType enumeration.
   */
  @Input() public modalKeyEventType!: EnumModalKeyEventType;

  /**
   * Input property that defines the ID of the mouse trapping section within the component.
   * This section is used to capture mouse events when the modal is active.
   */
  @Input() public mouseTrappingSectionId!: string;

  /**
   * Input property that controls whether the key events listener is active.
   * Set this to true to enable listening for key events; false to disable it.
   */
  @Input() public keyEventsListenerIsActive!: boolean;

  /**
   * Input property informing the html element id which will be observed for changes to know when we have to reset the focus index
   */
  @Input() public mouseTrappingSubElementIdToResetIndex!: string;

  /**
   * An array of IDs representing external elements to be included in the modal trapping service for focus management.
   * This property allows specifying additional elements outside the modal that should receive focus.
   */

  @Input() public extraFocusableElementIds!: string[];

  @Input() public elementsToDisableLRKeys!: string[];

  @Input() public disableAutoFocus: boolean = false;

  @Output() public closeModalEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    @Optional() @Inject(DOCUMENT) protected document: Document,
    private readonly modalKeyEventContext: ModalKeyEventContext
  ) {}

  public ngOnInit(): void {
    if (this.keyEventsListenerIsActive) {
      this.enableEventsListener();
    }
  }

  public ngOnChanges(): void {
    if (this.keyEventsListenerIsActive) {
      this.enableEventsListener();
    } else {
      this.disableEventsListener();
    }
  }

  public ngOnDestroy(): void {
    this.disableEventsListener();
    if (this.closeModalValue$) {
      this.closeModalValue$.unsubscribe();
    }
  }

  public onKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    this.keyPreventDefault(event);
    this.modalKeyEventContext.onKeyEvent(event);
  }

  private setCloseModalEvent(): void {
    this.closeModalValue$ = this.modalKeyEventContext.closeModalEvent().subscribe(() => {
      this.closeModalEvent.emit();
    });
  }

  private enableEventsListener(): void {
    if (!this.keyboardEventValue$) {
      const modalKeyEventStrategyConfigModel: ModalKeyEventStrategyConfigModel = {
        modalKeyEventType: this.modalKeyEventType,
        mouseTrappingSectionId: this.mouseTrappingSectionId,
        mouseTrappingSubElementIdToResetIndex: this.mouseTrappingSubElementIdToResetIndex,
        elementsToDisableLRKeys: this.elementsToDisableLRKeys,
        extraFocusableElementIds: this.extraFocusableElementIds,
        disableAutoFocus: this.disableAutoFocus,
      };

      this.modalKeyEventContext.setStrategy(modalKeyEventStrategyConfigModel);
      this.setCloseModalEvent();

      this.keyboardEventValue$ = fromEvent<KeyboardEvent>(this.document, this.KEY_DOWN_EVENT).subscribe((event) => {
        this.onKeydown(event);
      });
    }
  }

  private disableEventsListener(): void {
    if (this.keyboardEventValue$) {
      this.keyboardEventValue$.unsubscribe();
      this.keyboardEventValue$ = null;
      this.modalKeyEventContext.resetFocusIndex();
    }
  }

  private keyPreventDefault(event: KeyboardEvent): void {
    if (this.modalKeyEventType !== EnumModalKeyEventType.DROPDOWN) {
      if (event.key === KeyCodeEnum.TAB) {
        event.preventDefault();
      }
    }
    switch (event.key) {
      case KeyCodeEnum.ESCAPE:
      case KeyCodeEnum.ARROW_DOWN:
      case KeyCodeEnum.ARROW_UP:
      case KeyCodeEnum.ARROW_LEFT:
      case KeyCodeEnum.ARROW_RIGHT:
        event.preventDefault();
        break;
      default:
        break;
    }
  }
}
