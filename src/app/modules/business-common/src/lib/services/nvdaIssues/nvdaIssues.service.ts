import { inject, Injectable } from '@angular/core';

import { DetectionsService } from '../detections/detections.service';
import { Browser } from '../models/browsers.enum';

@Injectable({ providedIn: 'root' })
export class NvdaIssuesService {
  private readonly detections = inject(DetectionsService);

  public isEventFromMouse(event?: MouseEvent | null): boolean {
    if (!event) return true;
    if (event.clientX === 0 && event.clientY === 0) {
      return false;
    } else {
      const browser = this.detections.getBrowser();
      switch (browser) {
        case Browser.Chrome:
        case Browser.Edge: {
          const sc = (event as UIEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } }).sourceCapabilities;
          return Boolean(sc);
        }
        case Browser.Firefox: {
          const eventAux: PointerEvent = event as PointerEvent;
          return eventAux.pointerType === 'mouse';
        }
        case Browser.Safari: {
          return !(event.offsetX === 0 && event.offsetY === 0);
        }
        default:
          return true;
      }
    }
  }

  public isEventFromKeyboard(event?: MouseEvent | null): boolean {
    return !this.isEventFromMouse(event);
  }
}
