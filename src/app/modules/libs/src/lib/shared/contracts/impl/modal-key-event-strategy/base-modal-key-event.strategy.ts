import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

export abstract class BaseModalKeyEventStrategy {
  public focusableElements!: Element[];
  public mouseTrappingSectionId!: string;
  protected focusedElementIndex: number;
  protected prevFocusedElement!: Element;
  protected closeModalSubject = new Subject<void>();
  private isFirstRender!: boolean;

  constructor() {
    this.focusedElementIndex = -1;
  }

  public focusNextElement(focusableElements: Element[]): void {
    this.adjustIndex(focusableElements, 0);
    this.focusedElementIndex = (this.focusedElementIndex + 1) % focusableElements.length;

    this.prevFocusedElement = focusableElements[this.focusedElementIndex];
    this.focusCurrentElement(focusableElements);
  }

  public focusPreviousElement(focusableElements: Element[]): void {
    this.adjustIndex(focusableElements, -1);

    if (this.focusedElementIndex === -1) {
      this.focusedElementIndex = focusableElements.length - 1;
    } else {
      this.focusedElementIndex = (this.focusedElementIndex - 1 + focusableElements.length) % focusableElements.length;
    }

    this.prevFocusedElement = focusableElements[this.focusedElementIndex];
    this.focusCurrentElement(focusableElements);
  }

  public getFocusableElements(sectionId: string): Element[] {
    const element = document.getElementById(sectionId);

    if (!element) {
      return [];
    }

    const tabbableElements = this.getTabbableElements(element);

    const focusableElements = Array.from(tabbableElements).filter((elem: any) => {
      const tabIndexAttr = elem.getAttribute('tabindex');
      return tabIndexAttr !== '-1';
    });

    return focusableElements;
  }

  public getFocusableElementsAndFocusFirst(sectionId: string): Element[] {
    const focusableElements = this.getFocusableElements(sectionId);
    this.isFirstRender = true;
    if (focusableElements.length > 0) {
      this.focusNextElement(focusableElements);
    }

    return focusableElements;
  }

  public getTabbableElements(element: Element): Element[] {
    const selectors = [
      'a[href]:not([hidden])',
      'button:not([hidden]):not([disabled])',
      'input:not([hidden]):not([disabled]):not([readonly])',
      'select:not([hidden]):not([disabled])',
      'textarea:not([hidden]):not([disabled])',
      '[tabindex]:not([hidden]):not([disabled])',
    ];

    const selectorString = selectors.join(', ');

    const tabbableElements = Array.from(element.querySelectorAll(selectorString)).filter((el: any) => {
      const style = getComputedStyle(el);
      return style.display !== 'none' && el.offsetHeight > 0;
    });

    return tabbableElements;
  }

  public resetIndex(): void {
    this.focusedElementIndex = -1;
  }

  public onArrowUpPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
    this.focusPreviousElement(this.focusableElements);
  }

  public onArrowDownPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
    this.focusNextElement(this.focusableElements);
  }

  public onArrowLeftPress(): void {
    this.focusPreviousElement(this.focusableElements);
  }

  public onArrowRightPress(): void {
    this.focusNextElement(this.focusableElements);
  }

  public onTabPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
    this.focusNextElement(this.focusableElements);
  }

  public onShiftTabPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
    this.focusPreviousElement(this.focusableElements);
  }

  public onEnterPress(): void {
    this.focusableElements = this.getFocusableElements(this.mouseTrappingSectionId);
  }

  public onEscPress(): void {
    this.closeModalSubject.next(undefined);
  }

  public closeModalEvent(): Observable<void> {
    return this.closeModalSubject.asObservable();
  }

  private focusCurrentElement(focusableElements: Element[]): void {
    const targetElement = focusableElements[this.focusedElementIndex];
    if (targetElement) {
      (targetElement as HTMLElement).focus();
    }
  }

  private adjustIndex(focusableElements: Element[], shift: number): void {
    if (this.focusedElementIndex < 0 || !this.prevFocusedElement) {
      if (this.isFirstRender) {
        const activeElement = document.activeElement;
        const index = activeElement ? focusableElements.indexOf(activeElement) : 0;
        if (index != -1) {
          this.focusedElementIndex = index - 1;
        }
        this.isFirstRender = false;
      }
      return;
    }

    const focusedElement = focusableElements[this.focusedElementIndex];
    if (focusedElement === this.prevFocusedElement) {
      return;
    }

    const prevFocusedElementIndex = focusableElements.indexOf(this.prevFocusedElement);
    if (prevFocusedElementIndex < 0) {
      this.focusedElementIndex += shift;
      return;
    }
    const dIndex = prevFocusedElementIndex - this.focusedElementIndex;
    this.focusedElementIndex += dIndex;
  }
}
