import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit, OnDestroy, OnChanges {
  @Input()
  public clickOutsideListenerIsActive = true;

  @Output()
  public clickOutside = new EventEmitter<MouseEvent>();

  private readonly unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    protected element: ElementRef,
    // tslint:disable-next-line: no-any
    @Optional() @Inject(DOCUMENT) protected document: any
  ) {}

  public ngOnInit(): void {
    if (this.clickOutsideListenerIsActive) {
      this.listenForOutsideClicks();
    }
  }

  public ngOnChanges(): void {
    if (this.clickOutsideListenerIsActive) {
      this.listenForOutsideClicks();
    } else {
      this.ngOnDestroy();
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  public listenForOutsideClicks(): void {
    setTimeout(() => {
      const bodyTouch = fromEvent<MouseEvent>(this.document, 'touchstart');
      const bodyClick = fromEvent<MouseEvent>(this.document, 'click');
      const eventsOutside = merge(bodyTouch, bodyClick);
      eventsOutside
        .pipe(
          takeUntil(this.unsubscribe$),
          filter((event) => {
            const clickTarget = event.target as HTMLElement;
            return !this.isOrContainsClickTarget(this.element.nativeElement, clickTarget);
          })
        )
        .subscribe(() => {
          this.clickOutside.emit(null!);
        });
    }, 0);
  }

  protected isOrContainsClickTarget(element: HTMLElement, clickTarget: HTMLElement): boolean {
    return element === clickTarget || element.contains(clickTarget);
  }
}
