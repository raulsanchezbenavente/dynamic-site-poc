import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClipboardCopyHelperService {
  public copy(value: string): void {
    navigator.clipboard.writeText(value).catch((err) => {
      console.error('Clipboard copy failed:', err);
    });
  }
}
