import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViewportSizeService implements OnDestroy {
  /**
   * Store 1% of the viewport height so consumers can do calc(var(--vh)*N)
   * instead of relying on native 100vh (which breaks on mobile toolbars).
   * keep var(--vh) as "1% of the viewport" so components can safely do calc(var(--vh)*N) and avoid raw 100vh issues
   */
  public VIEWPORT_HEIGHT_PERCENTAGE = 0.01;
  public windowWidthSubject$ = new BehaviorSubject<number>(this.getViewportWidth());
  public windowHeightSubject$ = new BehaviorSubject<number>(this.getViewportHeight());
  protected subscriptions: Subscription[] = [];

  constructor() {
    this.subscribeToWindowResizeEvent();
  }

  public ngOnDestroy(): void {
    for (const x of this.subscriptions) {
      x?.unsubscribe();
    }
  }

  /**
   * Get window width and set it as a custom property css (--vw)
   */
  public setComputeViewportWidth(): void {
    const vw = this.getViewportWidth();
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  }

  /**
   * get viewport height with percentage
   */
  public getViewportHeight(): number {
    return this.getWindow().innerHeight * this.VIEWPORT_HEIGHT_PERCENTAGE;
  }

  /**
   * Get window height and set it as a custom property css (--vh)
   */
  public setComputeViewportHeight(): void {
    const vh = this.getViewportHeight();
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * Get computed property
   * @param layoutBreakpoint breakpoint obtained of :root { --my-var: 768; }
   * @param layoutBreakpointByDefault if layoutBreakpoint var is empty, get it from this
   * @return number breakpoint
   */
  public getComponentLayoutBreakpoint(layoutBreakpoint: string, layoutBreakpointByDefault = 768): number {
    const componentLayoutWidth = +getComputedStyle(document.documentElement)
      .getPropertyValue(layoutBreakpoint)
      .split('px')[0];
    return componentLayoutWidth && componentLayoutWidth !== 0 ? componentLayoutWidth : layoutBreakpointByDefault;
  }

  /**
   * Get window -> this method is necessary to mock
   * @returns Window object
   */
  protected getWindow(): typeof globalThis {
    return globalThis;
  }

  /**
   * Get viewport width
   * @returns number innerWidth of Window
   */
  protected getViewportWidth(): number {
    return this.getWindow().innerWidth;
  }

  /**
   * Get an observable of window resize event.
   * This method is required in order to test the service, although it is not possible to mock rxjs.fromEvent method
   * https://github.com/ReactiveX/rxjs/issues/3848
   */
  private getWindowResizeObservable(): Observable<Event> {
    return fromEvent(this.getWindow(), 'resize');
  }

  private getWindowOrientationChangeObservable(): Observable<Event> {
    return fromEvent(this.getWindow(), 'orientationchange');
  }

  /**
   * Subscribe to window resize event and call handleWindowResizeEvent handler
   */
  private subscribeToWindowResizeEvent(): void {
    this.initializeViewportWidthAndHeight();

    const resizeSub = this.getWindowResizeObservable().subscribe({
      next: () => {
        this.handleWindowResizeEvent();
      },
    });

    this.subscriptions.push(resizeSub);

    const orientationSub = this.getWindowOrientationChangeObservable().subscribe({
      next: () => {
        this.handleWindowResizeEvent();
      },
    });

    this.subscriptions.push(orientationSub);
  }

  /**
   * If not exists a custom property css for height or width
   * get window width and set it as a custom property css (--vw) and
   * get window height and set it as a custom property css (--vh).
   */
  private initializeViewportWidthAndHeight(): void {
    if (!document.documentElement.style.cssText.includes('vw')) {
      this.setComputeViewportWidth();
    }

    if (!document.documentElement.style.cssText.includes('vh')) {
      this.setComputeViewportHeight();
    }
  }

  /**
   * Set windowWidthSubject$ and windowHeightSubject$ with the new value of window width
   * and height calling setComputeViewportWidth and setComputeViewportHeight
   */
  private handleWindowResizeEvent(): void {
    this.windowWidthSubject$.next(this.getViewportWidth());
    this.setComputeViewportWidth();

    this.windowHeightSubject$.next(this.getViewportHeight());
    this.setComputeViewportHeight();
  }
}
