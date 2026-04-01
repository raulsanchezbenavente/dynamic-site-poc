import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { EnumResizeWindowSize } from '../enums';
import { WindowSize } from '../model/resize/window-size';

@Injectable({ providedIn: 'root' })
export class ResizeSvc {
  public width$: Observable<number>;
  public height$: Observable<number>;
  public layout$: Observable<string>;

  constructor() {
    const windowSize$ = new BehaviorSubject(this.getWindowSize()); // most recent and subsequent values
    this.width$ = windowSize$.pipe(
      map((x) => x?.width),
      distinctUntilChanged()
    );
    this.height$ = windowSize$.pipe(
      map((x) => x?.height),
      distinctUntilChanged()
    );
    this.layout$ = windowSize$.pipe(
      map((x) => x?.layout),
      distinctUntilChanged()
    ) as Observable<string>;
    fromEvent(globalThis, EnumResizeWindowSize.propertyResize).pipe(map(this.getWindowSize)).subscribe(windowSize$);
  }

  protected getWindowSize(): WindowSize {
    let size: EnumResizeWindowSize;

    if (globalThis.innerWidth <= 479) {
      size = EnumResizeWindowSize.sizeXs;
    } else if (globalThis.innerWidth >= 480 && globalThis.innerWidth <= 639) {
      size = EnumResizeWindowSize.sizeS;
    } else if (globalThis.innerWidth >= 640 && globalThis.innerWidth <= 767) {
      size = EnumResizeWindowSize.sizeM;
    } else if (globalThis.innerWidth >= 768 && globalThis.innerWidth <= 991) {
      size = EnumResizeWindowSize.sizeL;
    } else if (globalThis.innerWidth >= 992 && globalThis.innerWidth < 1248) {
      size = EnumResizeWindowSize.sizeXL;
    } else {
      size = EnumResizeWindowSize.sizeXXL;
    }

    return {
      height: globalThis.innerHeight,
      width: globalThis.innerWidth,
      layout: size,
    };
  }
}
