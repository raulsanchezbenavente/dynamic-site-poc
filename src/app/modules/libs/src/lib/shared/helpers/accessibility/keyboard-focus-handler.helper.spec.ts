import { initKeyboardFocusDetection } from './keyboard-focus-handler.helper';

describe('KeyboardFocusHandlerService – initKeyboardFocusDetection', () => {
  const KEYBOARD_FOCUS_CLASS = 'keyboard-focus-mode';

  beforeAll(() => {
    initKeyboardFocusDetection();
  });

  beforeEach(() => {
    document.body.classList.remove(KEYBOARD_FOCUS_CLASS);
  });

  // ── Helper factories ──────────────────────────────────────────────

  function dispatchKeyDown(key: string): void {
    globalThis.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  function dispatchPointerMove(): void {
    globalThis.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
  }

  function dispatchPointerDown(
    pointerType: string,
    buttons: number = 1,
  ): void {
    const event = new PointerEvent('pointerdown', { pointerType, buttons, bubbles: true });

    // Chrome Headless on Linux may not propagate PointerEvent init properties.
    // Force-set them so tests behave consistently across environments.
    if (event.pointerType !== pointerType) {
      Object.defineProperty(event, 'pointerType', { value: pointerType, writable: false });
    }
    if (event.buttons !== buttons) {
      Object.defineProperty(event, 'buttons', { value: buttons, writable: false });
    }

    globalThis.dispatchEvent(event);
  }

  function dispatchFocusIn(target: HTMLElement): void {
    const event = new FocusEvent('focusin', { bubbles: true });
    Object.defineProperty(event, 'target', { value: target, writable: false });
    globalThis.dispatchEvent(event);
  }

  // ── Idempotency ───────────────────────────────────────────────────

  describe('initialization', () => {
    it('should not throw when called multiple times', () => {
      expect(() => initKeyboardFocusDetection()).not.toThrow();
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────

  describe('keydown – navigation keys', () => {
    const navigationKeys = [
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ];

    navigationKeys.forEach((key) => {
      it(`should add "${KEYBOARD_FOCUS_CLASS}" when "${key}" is pressed`, () => {
        dispatchKeyDown(key);
        expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
      });
    });
  });

  describe('keydown – non-navigation keys', () => {
    it('should NOT add keyboard-focus-mode for regular character keys', () => {
      dispatchKeyDown('a');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });

    it('should NOT add keyboard-focus-mode for Enter key', () => {
      dispatchKeyDown('Enter');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });

    it('should NOT add keyboard-focus-mode for Escape key', () => {
      dispatchKeyDown('Escape');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });
  });

  // ── Pointer interaction ───────────────────────────────────────────

  describe('pointerdown – real pointer', () => {
    it('should remove keyboard-focus-mode on mouse click after cursor movement', () => {
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      // Cursor moved since last keyboard nav → confirmed real click
      dispatchPointerMove();
      dispatchPointerDown('mouse', 1);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });

    it('should NOT remove keyboard-focus-mode on stationary click immediately after keyboard navigation', () => {
      // No pointermove between Tab and click → treated as potentially synthetic
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      dispatchPointerDown('mouse', 1);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
    });

    it('should remove keyboard-focus-mode when cursor moves after a stationary click', () => {
      dispatchKeyDown('Tab');
      dispatchPointerDown('mouse', 1); // no prior pointermove
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      // Cursor movement after the click confirms it was a real interaction
      dispatchPointerMove();

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });

    it('should remove keyboard-focus-mode on touch interaction when last input was NOT keyboard', () => {
      dispatchKeyDown('Tab');
      dispatchPointerDown('mouse', 1);
      document.body.classList.add(KEYBOARD_FOCUS_CLASS);

      dispatchPointerDown('touch', 1);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
    });
  });

  describe('pointerdown – NVDA virtual clicks (a11y)', () => {
    it('should NOT remove keyboard-focus-mode for pointerType="" (NVDA virtual click)', () => {
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      // NVDA emits pointerdown with empty pointerType
      dispatchPointerDown('', 1);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
    });

    it('should NOT remove keyboard-focus-mode for pointerType="pen" (non-standard)', () => {
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      dispatchPointerDown('pen', 1);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
    });

    it('should NOT remove keyboard-focus-mode when buttons !== 1 (e.g. right-click)', () => {
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      dispatchPointerDown('mouse', 2);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
    });
  });

  // ── Focus-in handling ─────────────────────────────────────────────

  describe('focusin – after keyboard navigation', () => {
    beforeEach(() => {
      // Set lastInputWasKeyboard = true by pressing Tab
      dispatchKeyDown('Tab');
      // Remove the class so we can verify focusin adds it
      document.body.classList.remove(KEYBOARD_FOCUS_CLASS);
    });

    const interactiveSelectors: Array<{ tag: string; attrs?: Record<string, string> }> = [
      { tag: 'a' },
      { tag: 'button' },
      { tag: 'input' },
      { tag: 'select' },
      { tag: 'textarea' },
      { tag: 'div', attrs: { tabindex: '0' } },
    ];

    interactiveSelectors.forEach(({ tag, attrs }) => {
      const label = attrs ? `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}>` : `<${tag}>`;

      it(`should add keyboard-focus-mode when focus moves to ${label}`, () => {
        const el = document.createElement(tag);
        if (attrs) {
          Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        }
        document.body.appendChild(el);

        dispatchFocusIn(el);

        expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
        el.remove();
      });
    });

    it('should NOT add keyboard-focus-mode when focus moves to non-interactive element', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      dispatchFocusIn(el);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
      el.remove();
    });
  });

  describe('focusin – after pointer interaction', () => {
    it('should NOT add keyboard-focus-mode when last input was pointer', () => {
      // Reset lastInputWasKeyboard via real pointer
      dispatchKeyDown('Tab');
      dispatchPointerDown('mouse', 1);
      document.body.classList.remove(KEYBOARD_FOCUS_CLASS);

      const button = document.createElement('button');
      document.body.appendChild(button);

      dispatchFocusIn(button);

      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();
      button.remove();
    });
  });

  // ── Interaction flow: keyboard → pointer → keyboard ───────────────

  describe('full interaction cycle', () => {
    it('should toggle keyboard-focus-mode correctly across input method changes', () => {
      // 1. Keyboard → class added
      dispatchKeyDown('Tab');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      // 2. Stationary click (no pointermove) → class stays, recovery window open
      dispatchPointerDown('mouse', 1);
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();

      // 3. Cursor moves → confirms real interaction, class removed
      dispatchPointerMove();
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeFalse();

      // 4. Keyboard again → class added
      dispatchKeyDown('ArrowDown');
      expect(document.body.classList.contains(KEYBOARD_FOCUS_CLASS)).toBeTrue();
    });
  });
});
