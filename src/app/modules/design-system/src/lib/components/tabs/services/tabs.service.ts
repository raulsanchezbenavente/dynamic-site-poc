import { Injectable, Signal, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { TabConfig } from '../models/tab.config';

/**
 * TabsService
 * Central service to publish tab selection events so that any component
 * (outside of the tab component tree) can react to tab changes.
 *
 * Features:
 * - Emits the currently selected TabConfig as an observable.
 * - Supports optional grouping (multiple independent tab contexts) via a group key.
 * - Exposes both RxJS (selectedTab$) and Angular Signals (selectedTabSignal) APIs.
 */
@Injectable({ providedIn: 'root' })
export class TabsService {
  private readonly groups = new Map<string, BehaviorSubject<TabConfig | null>>();
  private readonly groupSignals = new Map<string, Signal<TabConfig | null>>();

  /** Selects (publishes) a tab for the given group (default group if omitted). */
  public select(tab: TabConfig, group = 'default'): void {
    this.getSubject(group).next(tab);
    const sig = this.groupSignals.get(group) as any as { set?: (v: TabConfig | null) => void } | undefined;
    sig?.set?.(tab);
  }

  /** Observable stream for the selected tab in the specified group. */
  public selectedTab$(group = 'default'): Observable<TabConfig | null> {
    return this.getSubject(group).asObservable();
  }

  /** Signal accessor for template-friendly consumption. */
  public selectedTabSignal(group = 'default'): Signal<TabConfig | null> {
    if (!this.groupSignals.has(group)) {
      const subj = this.getSubject(group);
      const sig = signal<TabConfig | null>(subj.value);
      // Keep signal in sync when subject changes (lightweight manual subscription)
      subj.subscribe((v) => {
        const s = this.groupSignals.get(group) as any as { set?: (val: TabConfig | null) => void } | undefined;
        s?.set?.(v);
      });
      this.groupSignals.set(group, sig);
    }
    return this.groupSignals.get(group)!;
  }

  /** Synchronous getter for current selected tab in a group. */
  public getCurrent(group = 'default'): TabConfig | null {
    return this.getSubject(group).value;
  }

  private getSubject(group: string): BehaviorSubject<TabConfig | null> {
    if (!this.groups.has(group)) {
      this.groups.set(group, new BehaviorSubject<TabConfig | null>(null));
    }
    return this.groups.get(group)!;
  }
}
