import { signal, Signal } from '@angular/core';

/**
 * Creates a Signal<boolean> that reflects whether the current viewport
 * matches the given media query.
 *
 * @param query Media query string (e.g. "(max-width: 768px)")
 * @returns A tuple: [readonly Signal<boolean>, cleanup function]
 *
 * Usage:
 * const [isResponsive, cleanup] = createResponsiveSignal('(max-width: 768px)');
 * Call cleanup() in ngOnDestroy to remove the media query listener.
 */
export function createResponsiveSignal(query: string): [Signal<boolean>, () => void] {
  const internal = signal<boolean>(false);
  const mediaQuery: MediaQueryList = globalThis.matchMedia(query);
  internal.set(mediaQuery.matches);

  const listener = (e: MediaQueryListEvent): void => {
    internal.set(e.matches);
  };

  mediaQuery.addEventListener('change', listener);

  const cleanup = (): void => {
    mediaQuery.removeEventListener('change', listener);
  };

  return [internal.asReadonly(), cleanup];
}
