/**
 * A11y: Keyboard focus detection
 * Adds `keyboard-focus-mode` to <body> so focus outlines are only visible
 * during keyboard/AT navigation, not mouse use.
 *
 * Detection strategy — three layers:
 *
 * 1. keydown (nav keys) → add class, reset pointer state.
 *
 * 2. focusin fallback (NVDA intercept): NVDA captures Tab at OS level so
 *    `keydown` may never fire in the page. `focusin` on any interactive element
 *    adds the class unless the immediately preceding event was a `pointerdown`
 *    (`isPointerDrivenFocus` flag, set by pointerdown, consumed by focusin).
 *
 * 3. pointerdown → remove class only for confirmed real mouse clicks:
 *    - `hadPointerMoved`: cursor moved since last keyboard nav → real click.
 *    - Stationary click (no prior move): open `pendingRealClick` recovery —
 *      if the cursor moves afterwards, it was real and the class is removed.
 *    - Multiple consecutive stationary clicks do NOT confirm a real interaction.
 *      NVDA can fire several synthetic pointerdown events in a row without any
 *      pointermove between them, so only cursor movement is a safe confirmation.
 *    - AT synthetic clicks (NVDA/JAWS after Enter/Space < 100 ms): suppressed
 *      via `lastActivationKeyTime`; `pendingRealClick` is never set.
 *    - Touch: always real, class removed immediately.
 */

const navigationKeys = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

const SYNTHETIC_CLICK_WINDOW_MS = 100;

/** Elements that can receive keyboard focus and should trigger keyboard-focus-mode. */
const INTERACTIVE_SELECTOR = 'a,button,input,select,textarea,[tabindex]';

let isInitialized = false;
let hadPointerMoved = false;
let pendingRealClick = false;
let lastActivationKeyTime = 0;
/**
 * Set by `pointerdown` to indicate that the next `focusin` is driven by a
 * pointer interaction (mouse click) and should NOT add keyboard-focus-mode.
 * Consumed and reset by the next interactive `focusin`.
 */
let isPointerDrivenFocus = false;

const handleFocusIn = (event: FocusEvent): void => {
  const target = event.target as HTMLElement | null;
  if (!target?.matches(INTERACTIVE_SELECTOR)) {
    return;
  }
  // NVDA (and other ATs) may intercept Tab before it reaches the page's keydown
  // listener. focusin always fires when real DOM focus changes. If this focus
  // was not caused by a pointer interaction, treat it as keyboard/AT navigation.
  if (!isPointerDrivenFocus) {
    document.body.classList.add('keyboard-focus-mode');
  }
  isPointerDrivenFocus = false;
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (navigationKeys.has(event.key)) {
    hadPointerMoved = false;
    pendingRealClick = false;
    isPointerDrivenFocus = false;
    lastActivationKeyTime = 0;
    document.body.classList.add('keyboard-focus-mode');
  }
  // Track activation keys that AT tools use to synthesise pointer clicks.
  if (event.key === 'Enter' || event.key === ' ') {
    lastActivationKeyTime = Date.now();
  }
};

const handlePointerMove = (): void => {
  hadPointerMoved = true;

  // Stationary-click recovery: the cursor moved after a click that had no prior
  // movement — this confirms a real user interaction, so remove the class now.
  if (pendingRealClick) {
    pendingRealClick = false;
    document.body.classList.remove('keyboard-focus-mode');
  }
};

const handlePointerDown = (event: PointerEvent): void => {
  isPointerDrivenFocus = true;
  // Touch is always a real physical interaction — no AT synthesises touch events.
  if (event.pointerType === 'touch') {
    document.body.classList.remove('keyboard-focus-mode');
    return;
  }

  if (event.pointerType === 'mouse') {
    if (hadPointerMoved) {
      // Cursor moved since last keyboard nav → confirmed real click.
      document.body.classList.remove('keyboard-focus-mode');
      hadPointerMoved = false;
    } else {
      // No cursor movement since last keyboard nav.
      // Only open recovery window if this pointerdown was NOT preceded by an
      // activation key (Enter/Space), which AT tools use to synthesise clicks.
      //
      // IMPORTANT: do NOT confirm a real interaction here even if pendingRealClick
      // is already true (i.e. a second consecutive stationary click). NVDA can emit
      // multiple synthetic pointerdown events in a row without any pointermove
      // between them. The only safe confirmation signal is cursor movement.
      const isLikelySynthetic = Date.now() - lastActivationKeyTime < SYNTHETIC_CLICK_WINDOW_MS;
      if (!isLikelySynthetic) {
        pendingRealClick = true;
      }
    }
  }
};

/**
 * Initializes keyboard focus detection for Storybook preview.
 */
export function initKeyboardFocusDetection(): void {
  if (typeof globalThis === 'undefined' || isInitialized) {
    return;
  }

  isInitialized = true;

  globalThis.addEventListener('focusin', handleFocusIn, true);
  globalThis.addEventListener('keydown', handleKeyDown, true);
  globalThis.addEventListener('pointermove', handlePointerMove, true);
  globalThis.addEventListener('pointerdown', handlePointerDown, true);
}
