import { CommonModule, DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    HostListener,
    inject,
    input,
    model,
    OnDestroy,
    OnInit,
    QueryList,
    signal,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AppLang, RouterHelperService, SiteConfigService } from '@navigation';
import { BehaviorSubject, filter, Subject, takeUntil } from 'rxjs';

import { BlockOutletComponent } from '../block-outlet/block-outlet.component';

import { CmsTabContract, CmsTabLayout, CmsTabLayoutRow } from './models/cms-tab-contract.model';

type ViewTab = CmsTabContract & {
  tabId: string;
  name: string;
  title: string;
  pageId: string;
  layout: CmsTabLayoutRow[];
};

type ComponentReadyDetail = {
  batchId?: string;
  componentId?: string;
  component?: string;
  state?: string;
};

type TrackedTabComponent = {
  batchId: string;
  componentId: string;
  component: string;
};

@Component({
  selector: 'tabs',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent implements OnInit, OnDestroy, AfterViewInit {
  private static readonly MIN_SKELETON_VISIBLE_MS = 1000;

  public tabsId = input<string | null | undefined>(undefined);
  public tabs = input<CmsTabContract[] | null | undefined>(undefined);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly destroy$ = new Subject<void>();
  private readonly tabsOverride = signal<Array<{ name: string; title?: string; secondaryText?: string }>>([]);
  private readonly _tabsSubject = new BehaviorSubject<CmsTabContract | null>(null);
  private readonly renderedTabState = signal<Record<string, boolean>>({});
  private readonly tabLoadingState = signal<Record<string, boolean>>({});
  private expectedComponentsByTab = new Map<string, TrackedTabComponent[]>();
  private readyComponentIdsByTab = new Map<string, Set<string>>();
  private deferredComponentIds = new Set<string>();
  private skeletonShownAtByTab = new Map<string, number>();
  private skeletonHideTimerByTab = new Map<string, ReturnType<typeof setTimeout>>();
  private initialSkeletonSuppressedTabId: string | null = null;
  public readonly tabs$ = this._tabsSubject.asObservable();

  public activeId = model<string | undefined>(undefined);
  public indicatorLeft = signal(0);
  public indicatorWidth = signal(0);
  public indicatorTransform = computed(() => `translateX(${this.indicatorLeft()}px)`);

  @ViewChild('tabsRoot', { static: true })
  private readonly tabsRoot?: ElementRef<HTMLElement>;

  @ViewChildren('tabButton')
  private readonly tabButtons?: QueryList<ElementRef<HTMLElement>>;

  public viewTabs = computed(() => {
    const raw = this.tabs();
    const arr = Array.isArray(raw) ? raw : [];

    const normalized = arr
      .map((tab: Partial<CmsTabContract>) => {
        const tabId = String(tab?.tabId ?? '').trim();
        const name = String(tab?.name ?? '').trim();
        const title = String(tab?.title ?? '').trim();
        const secondaryText = String(tab?.secondaryText ?? '').trim();
        const pageId = String(tab?.pageId ?? '').trim();
        const layout = this.resolveTabLayoutRows(tab.layout);
        if (!tabId || !name) return null;
        return { tabId, name, title, secondaryText, pageId, layout };
      })
      .filter(Boolean) as ViewTab[];

    const overrides = this.tabsOverride();
    if (!overrides.length) return normalized;

    return normalized.map((tab, index) => {
      const override = overrides[index];
      if (!override) return tab;
      return {
        ...tab,
        name: override.name ?? tab.name,
        title: override.title ?? tab.title,
        secondaryText: override.secondaryText ?? tab.secondaryText,
      };
    });
  });

  private resolveTabLayoutRows(layout: CmsTabLayout | CmsTabLayoutRow[] | undefined): CmsTabLayoutRow[] {
    if (Array.isArray(layout)) {
      return layout;
    }

    return layout?.rows ?? [];
  }

  // public activeTab = computed(() => {
  //   const tabs = this.viewTabs();
  //   const tabId = this.activeId();
  //   const activeTab: CmsTabContract | undefined = tabs.find(t => t.tabId === tabId);
  //   if (!tabs.length) return undefined;
  //   return tabs.find(t => t.tabId === tabId) ?? tabs[0];
  // });

  constructor() {
    effect(() => {
      requestAnimationFrame(() => {
        const qpTab = this.route.snapshot.queryParamMap.get('activeTab') ?? undefined;
        this.navigateToTab(qpTab);
      });
    });

    effect(() => {
      const tabs = this.viewTabs();
      const current = this.activeId();
      if (!tabs.length) return;
      if (!current || !tabs.some((t) => t.tabId === current)) {
        const hasDeepLinkActiveTab = Boolean(this.route.snapshot.queryParamMap.get('activeTab'));
        if (!current && hasDeepLinkActiveTab) {
          return;
        }

        this.activeId.set(tabs[0].tabId);
        this.setPageTitle(tabs[0]);
      }
    });

    effect(() => {
      this.activeId();
      this.viewTabs();
      queueMicrotask(() => this.updateIndicator());
    });

    effect(() => {
      const tabs = this.viewTabs();
      const activeTabId = this.activeId();

      this.initializeTabReadiness(tabs);

      if (activeTabId) {
        this.ensureTabRendered(activeTabId);
      }

      if (activeTabId && this.isTabRendered(activeTabId)) {
        this.emitDeferredReadyForUnrenderedTabs(activeTabId);
      }
    });
  }

  public ngOnInit(): void {
    this.document.addEventListener('dynamic-page:component-ready', this.onComponentReady);

    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const activeTab: string | undefined =
          new URLSearchParams(event.url.split('?')[1]).get('activeTab') ?? undefined;
        this.navigateToTab(activeTab);
      });

    this.routerHelper.languageChange$.pipe(takeUntil(this.destroy$)).subscribe((lang: AppLang) => {
      const currentActiveTabId = this.activeId();

      if (this.tabsId()) {
        const overrides = this.siteConfig.getTabNamesByTabsId(this.tabsId()!, lang);
        this.tabsOverride.set(overrides);

        const tabName: string | undefined = overrides.find(
          (override) => String(override.tabId ?? '') === String(currentActiveTabId ?? '')
        )?.name;

        this.syncActiveTabName(tabName);
      }

      const currentTab = this.viewTabs().find((t) => t.tabId === currentActiveTabId);
      this.setPageTitle(currentTab);
    });

    this.routerHelper.activeTab$.pipe(takeUntil(this.destroy$)).subscribe((tabId: string) => {
      const tab = this.viewTabs().find((t) => t.tabId === tabId);
      if (!tab) return;
      this.activateTab(tab, { historyMode: 'push', emitEvent: true, allowReselect: true });
    });
  }

  public ngAfterViewInit(): void {
    this.tabButtons?.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateIndicator();
    });
    queueMicrotask(() => this.updateIndicator());
  }

  @HostListener('window:popstate')
  public onPopState(): void {
    const activeTab = new URLSearchParams(globalThis.location.search).get('activeTab') ?? undefined;
    this.navigateToTab(activeTab);
  }

  private navigateToTab(qpTab: string | undefined): void {
    const tabs = this.viewTabs();
    if (!qpTab) {
      const snapshotPath = this.route.snapshot.data?.['path'];
      const currentPath = globalThis.location.pathname;
      if (snapshotPath !== currentPath) return;

      qpTab = tabs[0]?.name;
      requestAnimationFrame(() => {
        this.syncActiveTabName(tabs[0]?.name, 'replace');
      });
    }
    if (!tabs.length) return;
    let tab = tabs.find((t) => t.name === qpTab);

    if (!tab && qpTab && this.tabsId()) {
      const normalizedTabName = qpTab.trim().toLowerCase();
      const matchedTabSummary = this.siteConfig
        .getTabNamesByTabsId(this.tabsId()!)
        .find((summary) => summary.name.trim().toLowerCase() === normalizedTabName);

      if (matchedTabSummary?.tabId) {
        tab = tabs.find((currentTab) => currentTab.tabId === matchedTabSummary.tabId);
      }
    }

    if (tab) {
      this.activeId.set(tab.tabId);
      this.ensureTabRendered(tab.tabId);
      this.setPageTitle(tab);
      return;
    }
  }

  public select(tab: CmsTabContract, stopPropagation: boolean = false): void {
    this.activateTab(tab, {
      historyMode: 'push',
      emitEvent: !stopPropagation,
      allowReselect: false,
    });
  }

  private syncActiveTabName(tabName: string | undefined, historyMode: 'push' | 'replace' = 'replace'): void {
    this.routerHelper.syncActiveTabUrl(tabName, historyMode);
  }

  private activateTab(
    tab: CmsTabContract,
    options: { historyMode: 'push' | 'replace'; emitEvent: boolean; allowReselect: boolean }
  ): void {
    const tabId = String(tab.tabId ?? '').trim();
    if (!tabId) {
      return;
    }

    if (!options.allowReselect && this.activeId() === tabId) {
      return;
    }

    this.activeId.set(tabId);
    this.ensureTabRendered(tabId);
    this.syncActiveTabName(tab.name, options.historyMode);
    this.setPageTitle(tab);

    if (this.tabsId()) {
      this.routerHelper.setCurrentTabId(this.tabsId()!, tabId);
    }

    if (!options.emitEvent) {
      return;
    }

    this._tabsSubject.next(tab);
    const customEvent: CustomEvent<{ tab: CmsTabContract }> = new CustomEvent('activeChange', {
      detail: { tab },
    });
    globalThis.dispatchEvent(customEvent);
  }

  private setPageTitle(tab: CmsTabContract | undefined): void {
    if (!tab) return;
    const nextTitle = (tab.title ?? tab.name ?? '').trim();
    if (!nextTitle) return;
    this.title.setTitle(nextTitle);
  }

  public trackById(_: number, tab: { tabId: string }): string {
    return tab.tabId;
  }

  public tabButtonId(tabId: string): string {
    return `tab-${tabId}`;
  }

  public tabPanelId(tabId: string): string {
    return `tab-panel-${tabId}`;
  }

  public ngOnDestroy(): void {
    this.document.removeEventListener('dynamic-page:component-ready', this.onComponentReady);
    for (const timer of this.skeletonHideTimerByTab.values()) {
      clearTimeout(timer);
    }
    this.skeletonHideTimerByTab.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public isTabRendered(tabId: string): boolean {
    return this.renderedTabState()[tabId] === true;
  }

  public isTabLoading(tabId: string): boolean {
    if (this.initialSkeletonSuppressedTabId === tabId) {
      return false;
    }

    return this.tabLoadingState()[tabId] === true;
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.updateIndicator();
  }

  private updateIndicator(): void {
    const rootEl = this.tabsRoot?.nativeElement;
    if (!rootEl) return;

    const active = this.activeId();
    if (!active || !this.tabButtons?.length) {
      this.indicatorWidth.set(0);
      return;
    }

    const button = this.tabButtons.find((ref) => ref.nativeElement.getAttribute('id') === this.tabButtonId(active));

    if (!button) {
      this.indicatorWidth.set(0);
      return;
    }

    const rootRect = rootEl.getBoundingClientRect();
    const buttonRect = button.nativeElement.getBoundingClientRect();
    const left = buttonRect.left - rootRect.left;
    this.indicatorLeft.set(left);
    this.indicatorWidth.set(buttonRect.width);
  }

  private onComponentReady = (event: Event): void => {
    const detail = (event as CustomEvent<ComponentReadyDetail>).detail;
    if (String(detail?.state ?? '') === 'deferred') {
      return;
    }

    const componentId = String(detail?.componentId ?? '').trim();
    if (!componentId) {
      return;
    }

    const tabId = this.findTabIdByComponentId(componentId);
    if (!tabId) {
      return;
    }

    const readySet = this.readyComponentIdsByTab.get(tabId) ?? new Set<string>();
    if (readySet.has(componentId)) {
      return;
    }

    readySet.add(componentId);
    this.readyComponentIdsByTab.set(tabId, readySet);
    this.updateTabLoadingState(tabId);
  };

  private ensureTabRendered(tabId: string): void {
    const current = this.renderedTabState();
    if (current[tabId]) {
      this.updateTabLoadingState(tabId);
      return;
    }

    if (!this.initialSkeletonSuppressedTabId && Object.keys(current).length === 0) {
      this.initialSkeletonSuppressedTabId = tabId;
    }

    this.renderedTabState.set({
      ...current,
      [tabId]: true,
    });

    this.updateTabLoadingState(tabId);
  }

  private initializeTabReadiness(tabs: ViewTab[]): void {
    const nextExpected = new Map<string, TrackedTabComponent[]>();
    const nextReady = new Map<string, Set<string>>();
    const nextAllExpectedIds = new Set<string>();

    for (const tab of tabs) {
      const expectedComponents = this.collectTrackedComponentsFromRows(tab.layout);
      nextExpected.set(tab.tabId, expectedComponents);

      const expectedIds = new Set(expectedComponents.map((item) => item.componentId));
      for (const id of expectedIds) {
        nextAllExpectedIds.add(id);
      }

      const previousReady = this.readyComponentIdsByTab.get(tab.tabId) ?? new Set<string>();
      const keptReady = new Set<string>();
      for (const id of previousReady) {
        if (expectedIds.has(id)) {
          keptReady.add(id);
        }
      }
      nextReady.set(tab.tabId, keptReady);
    }

    this.expectedComponentsByTab = nextExpected;
    this.readyComponentIdsByTab = nextReady;
    this.deferredComponentIds = new Set(Array.from(this.deferredComponentIds).filter((id) => nextAllExpectedIds.has(id)));

    const validTabIds = new Set(tabs.map((tab) => tab.tabId));
    this.pruneSkeletonState(validTabIds);

    const existingRenderState = this.renderedTabState();
    const nextRenderState: Record<string, boolean> = {};
    for (const tab of tabs) {
      if (existingRenderState[tab.tabId]) {
        nextRenderState[tab.tabId] = true;
      }
    }
    if (!this.areBooleanRecordsEqual(existingRenderState, nextRenderState)) {
      this.renderedTabState.set(nextRenderState);
    }

    const currentLoadingState = this.tabLoadingState();
    const nextLoadingState: Record<string, boolean> = {};
    for (const [tabId, isLoading] of Object.entries(currentLoadingState)) {
      if (nextRenderState[tabId] && isLoading) {
        nextLoadingState[tabId] = true;
      }
    }
    if (!this.areBooleanRecordsEqual(currentLoadingState, nextLoadingState)) {
      this.tabLoadingState.set(nextLoadingState);
    }

    for (const tab of tabs) {
      if (nextRenderState[tab.tabId]) {
        this.updateTabLoadingState(tab.tabId);
      }
    }
  }

  private collectTrackedComponentsFromRows(rows: CmsTabLayoutRow[]): TrackedTabComponent[] {
    const components: TrackedTabComponent[] = [];

    for (const row of rows) {
      for (const col of row?.cols ?? []) {
        const batchId = String(col?.['__dynamicPageBatchId'] ?? '').trim();
        const componentId = String(col?.['__dynamicPageComponentId'] ?? '').trim();
        const component = String(col?.['__dynamicPageComponentName'] ?? col?.component ?? '').trim();

        if (batchId && componentId && component) {
          components.push({ batchId, componentId, component });
        }
      }
    }

    return components;
  }

  private findTabIdByComponentId(componentId: string): string | null {
    for (const [tabId, expectedComponents] of this.expectedComponentsByTab.entries()) {
      if (expectedComponents.some((item) => item.componentId === componentId)) {
        return tabId;
      }
    }

    return null;
  }

  private updateTabLoadingState(tabId: string): void {
    const current = this.tabLoadingState();
    const isLoading = this.shouldTabBeLoading(tabId);

    if (this.initialSkeletonSuppressedTabId === tabId) {
      return;
    }

    if (isLoading) {
      this.clearSkeletonHideTimer(tabId);

      if (current[tabId] === true) {
        return;
      }

      this.skeletonShownAtByTab.set(tabId, Date.now());
      this.tabLoadingState.set({
        ...current,
        [tabId]: true,
      });
      return;
    }

    if (current[tabId] !== true) {
      this.clearSkeletonHideTimer(tabId);
      this.skeletonShownAtByTab.delete(tabId);
      return;
    }

    const shownAt = this.skeletonShownAtByTab.get(tabId) ?? 0;
    const elapsed = Date.now() - shownAt;
    const remaining = DsTabsComponent.MIN_SKELETON_VISIBLE_MS - elapsed;

    if (remaining <= 0) {
      this.clearSkeletonHideTimer(tabId);
      this.skeletonShownAtByTab.delete(tabId);
      const nextState = { ...current };
      delete nextState[tabId];
      this.tabLoadingState.set(nextState);
      return;
    }

    if (this.skeletonHideTimerByTab.has(tabId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.skeletonHideTimerByTab.delete(tabId);

      if (this.shouldTabBeLoading(tabId)) {
        return;
      }

      const liveState = this.tabLoadingState();
      if (liveState[tabId] !== true) {
        this.skeletonShownAtByTab.delete(tabId);
        return;
      }

      const nextState = { ...liveState };
      delete nextState[tabId];
      this.tabLoadingState.set(nextState);
      this.skeletonShownAtByTab.delete(tabId);
    }, remaining);

    this.skeletonHideTimerByTab.set(tabId, timer);
  }

  private emitDeferredReadyForUnrenderedTabs(activeTabId: string | undefined): void {
    for (const [tabId, expectedComponents] of this.expectedComponentsByTab.entries()) {
      if (tabId === activeTabId || this.isTabRendered(tabId)) {
        continue;
      }

      for (const tracked of expectedComponents) {
        if (this.deferredComponentIds.has(tracked.componentId)) {
          continue;
        }

        this.deferredComponentIds.add(tracked.componentId);
        this.document.dispatchEvent(
          new CustomEvent<ComponentReadyDetail>('dynamic-page:component-ready', {
            detail: {
              batchId: tracked.batchId,
              componentId: tracked.componentId,
              component: tracked.component,
              state: 'deferred',
            },
          })
        );
      }
    }
  }

  private areBooleanRecordsEqual(left: Record<string, boolean>, right: Record<string, boolean>): boolean {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const key of leftKeys) {
      if (left[key] !== right[key]) {
        return false;
      }
    }

    return true;
  }

  private shouldTabBeLoading(tabId: string): boolean {
    const expectedCount = this.expectedComponentsByTab.get(tabId)?.length ?? 0;
    const readyCount = this.readyComponentIdsByTab.get(tabId)?.size ?? 0;
    return readyCount < expectedCount;
  }

  private clearSkeletonHideTimer(tabId: string): void {
    const timer = this.skeletonHideTimerByTab.get(tabId);
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.skeletonHideTimerByTab.delete(tabId);
  }

  private pruneSkeletonState(validTabIds: Set<string>): void {
    for (const [tabId] of this.skeletonHideTimerByTab) {
      if (validTabIds.has(tabId)) {
        continue;
      }

      this.clearSkeletonHideTimer(tabId);
    }

    for (const [tabId] of this.skeletonShownAtByTab) {
      if (!validTabIds.has(tabId)) {
        this.skeletonShownAtByTab.delete(tabId);
      }
    }
  }
}
