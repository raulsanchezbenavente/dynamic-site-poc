import {
  AfterContentInit,
  Component,
  ContentChildren,
  input,
  OnDestroy,
  OutputRefSubscription,
  QueryList,
} from '@angular/core';
import { KeyCodeEnum } from '@dcx/ui/libs';

import { AccordionItemComponent } from './components/accordion-item/accordion-item.component';
import { AccordionConfig } from './models/accordion.config';

@Component({
  selector: 'ds-accordion',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./styles/accordion.styles.scss'],
  host: { class: 'ds-accordion' },
  standalone: true,
})
export class AccordionComponent implements AfterContentInit, OnDestroy {
  public config = input<AccordionConfig>({});

  @ContentChildren(AccordionItemComponent)
  private readonly items!: QueryList<AccordionItemComponent>;

  private subscriptions: OutputRefSubscription[] = [];

  public ngAfterContentInit(): void {
    this.setupItemListeners();
  }

  public ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private setupItemListeners(): void {
    this.items.forEach((item: AccordionItemComponent) => {
      const toggleSub = item.toggleRequested.subscribe(() => {
        this.handleToggleRequest(item);
      });

      const keydownSub = item.navigationKeydown.subscribe((event: KeyboardEvent) => {
        this.handleKeydown(event, item);
      });

      this.subscriptions.push(toggleSub, keydownSub);
    });
  }

  private handleToggleRequest(activeItem: AccordionItemComponent): void {
    const allowMultipleExpanded = this.config().allowMultipleExpanded ?? false;

    if (!allowMultipleExpanded) {
      this.closeAllExcept(activeItem);
    }

    activeItem.toggle();
  }

  private closeAllExcept(active: AccordionItemComponent): void {
    this.items.forEach((item: AccordionItemComponent) => {
      if (item !== active) {
        item.collapse();
      }
    });
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach((sub: OutputRefSubscription) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private handleKeydown(event: KeyboardEvent, currentItem: AccordionItemComponent): void {
    const itemsArray = this.items.toArray();
    const currentIndex = itemsArray.indexOf(currentItem);

    let targetIndex: number | null = null;

    switch (event.key) {
      case KeyCodeEnum.ARROW_DOWN:
        targetIndex = (currentIndex + 1) % itemsArray.length;
        break;
      case KeyCodeEnum.ARROW_UP:
        targetIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
        break;
    }

    if (targetIndex !== null) {
      itemsArray[targetIndex].focusTrigger();
    }
  }
}
