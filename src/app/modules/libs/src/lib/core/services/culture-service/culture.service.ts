import { computed, Injectable, Signal, signal } from '@angular/core';

import { UserCulture } from '../../models';

import { DEFAULT_CULTURE } from './default-culture';

@Injectable({ providedIn: 'root' })
export class CultureService {
  private readonly _cultures = signal<Record<string, UserCulture>>({
    DEFAULT: DEFAULT_CULTURE,
  });

  private readonly _defaultCultureId = signal<string>('DEFAULT');

  // Signal for the preferred (default) culture
  private readonly _defaultCultureSignal: Signal<UserCulture> = computed(() => {
    const id = this._defaultCultureId();
    return this._cultures()[id] ?? DEFAULT_CULTURE;
  });

  // Cache of signals by id to avoid recreating them on each call
  private readonly _cultureSignals = new Map<string, Signal<UserCulture>>();

  /**
   * Reactive getter with the desired syntax:
   * - culture() -> default
   * - culture('SECONDARY_CULTURE') -> that culture or fallback to default
   */
  public culture(cultureId?: string): UserCulture {
    if (!cultureId) {
      return this._defaultCultureSignal();
    }

    let sig = this._cultureSignals.get(cultureId);
    if (!sig) {
      sig = computed(() => this._cultures()[cultureId] ?? this._defaultCultureSignal());
      this._cultureSignals.set(cultureId, sig);
    }

    return sig();
  }

  /**
   * - setCulture(culture) -> updates the default
   * - setCulture(culture, 'ANY_ID') -> creates/updates that culture
   */
  public setCulture(culture: UserCulture, cultureId?: string): void {
    const targetId = cultureId ?? this._defaultCultureId();

    this._cultures.update((cultures) => ({
      ...cultures,
      [targetId]: culture,
    }));
  }

  /**
   * Changes which id is the default (without changing values).
   */
  public setDefaultCulture(cultureId: string): void {
    this._defaultCultureId.set(cultureId);

    this._cultures.update((cultures) =>
      cultures[cultureId]
        ? cultures
        : {
            ...cultures,
            [cultureId]: this._defaultCultureSignal(),
          }
    );
  }

  public removeCulture(cultureId: string): void {
    if (cultureId === this._defaultCultureId()) return;

    this._cultures.update((cultures) => {
      const { [cultureId]: _, ...rest } = cultures;
      return rest;
    });

    this._cultureSignals.delete(cultureId);
  }
}
