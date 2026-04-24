import { Injectable } from '@angular/core';

/**
 * Service to detect whether the user's last interaction was via keyboard or mouse.
 * This is primarily used to enable accessible focus management (e.g., showing outlines
 * only on keyboard navigation) and to support components that adapt behavior based on input method.
 *
 * The service listens globally to `keydown` and `mousedown` events to track the interaction mode.
 * Use `isKeyboardMode()` to determine if the current context should respond with keyboard-first behavior.
 */

@Injectable({ providedIn: 'root' })
export class KeyboardMouseInteractionService {
  private lastInteractionWasKeyboard = false;

  constructor() {
    globalThis.addEventListener('keydown', this.setKeyboardMode);
    globalThis.addEventListener('mousedown', this.setMouseMode);
  }

  public isKeyboardMode(): boolean {
    return this.lastInteractionWasKeyboard;
  }

  private readonly setKeyboardMode = (): void => {
    this.lastInteractionWasKeyboard = true;
  };

  private readonly setMouseMode = (): void => {
    this.lastInteractionWasKeyboard = false;
  };
}
