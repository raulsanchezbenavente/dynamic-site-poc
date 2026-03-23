import { CommonModule } from '@angular/common';
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

import { DynamicBlocksComponent } from '../dynamic-blocks/dynamic-blocks.component';

import { CmsTabContract } from './models/cms-tab-contract.model';

@Component({
  selector: 'tabs',
  standalone: true,
  imports: [CommonModule, DynamicBlocksComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent implements OnInit, OnDestroy, AfterViewInit {
  public tabsId = input<string | null | undefined>(undefined);
  public tabs = input<CmsTabContract[] | null | undefined>(undefined);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly title = inject(Title);
  private readonly destroy$ = new Subject<void>();
  private readonly tabsOverride = signal<Array<{ name: string; title?: string; secondaryText?: string }>>([]);
  private readonly _tabsSubject = new BehaviorSubject<CmsTabContract | null>(null);
  public readonly tabs$ = this._tabsSubject.asObservable();

  public activeId = model<string | undefined>(undefined);
  public indicatorLeft = signal(0);
  public indicatorWidth = signal(0);
  public indicatorTransform = computed(() => `translateX(${this.indicatorLeft()}px)`);

  @ViewChild('tabsRoot', { static: true })
  private tabsRoot?: ElementRef<HTMLElement>;

  @ViewChildren('tabButton')
  private tabButtons?: QueryList<ElementRef<HTMLElement>>;

  public viewTabs = computed(() => {
    const raw = this.tabs();
    const arr = Array.isArray(raw) ? raw : [];

    const normalized = arr
      .map((t: Partial<CmsTabContract> & { components?: unknown[] }) => {
        const tabId = String(t?.tabId ?? '').trim();
        const name = String(t?.name ?? '').trim();
        const title = String(t?.title ?? '').trim();
        const secondaryText = String(t?.secondaryText ?? '').trim();
        const pageId = String(t?.pageId ?? '').trim();
        const components = Array.isArray(t?.components) ? t.components : [];
        if (!tabId || !name) return null;
        return { tabId, name, title, secondaryText, pageId, components };
      })
      .filter(Boolean) as Array<{
      tabId: string;
      name: string;
      title: string;
      secondaryText?: string;
      pageId: string;
      components: unknown[];
    }>;

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
        this.activeId.set(tabs[0].tabId);
        this.setPageTitle(tabs[0]);
      }
    });

    effect(() => {
      this.activeId();
      this.viewTabs();
      queueMicrotask(() => this.updateIndicator());
    });
  }

  public ngOnInit(): void {
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
      if (this.tabsId()) {
        const overrides = this.siteConfig.getTabNamesByTabsId(this.tabsId()!, lang);
        this.tabsOverride.set(overrides);
        const tabName: string | undefined = overrides.find((o) => {
          const currentTab = this.viewTabs().find((t) => t.tabId === this.activeId());
          return o.name === currentTab?.name;
        })?.name;
        this.setActiveTabName(tabName);
      }

      const currentTab = this.viewTabs().find((t) => t.tabId === this.activeId());
      this.setPageTitle(currentTab);
    });

    this.routerHelper.activeTab$.pipe(takeUntil(this.destroy$)).subscribe((tabId: string) => {
      const tab: CmsTabContract | undefined = this.viewTabs().find((t) => t.tabId === tabId);
      this.activeId.set(tab?.tabId);
      this.setActiveTabName(tab?.name);
      this.setPageTitle(tab);
      this.select(tab!, true);
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
        this.setActiveTabName(tabs[0]?.name, 'replace');
      });
    }
    if (!tabs.length) return;
    let tab: CmsTabContract | undefined = tabs.find((t) => t.name === qpTab);

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
      this.setPageTitle(tab);
    }
  }

  public select(tab: CmsTabContract, stopPropagation: boolean = false): void {
    if (this.activeId() === tab.tabId) return;
    this.activeId.set(tab.tabId);
    this.setActiveTabName(tab.name, 'push');
    this.setPageTitle(tab);
    if (stopPropagation) return;
    this._tabsSubject.next(tab);
    const customEvent: CustomEvent<{ tab: CmsTabContract }> = new CustomEvent('activeChange', {
      detail: { tab },
    });
    globalThis.dispatchEvent(customEvent);
  }

  private setActiveTabName(tabName: string | undefined, historyMode: 'push' | 'replace' = 'replace'): void {
    const url = new URL(globalThis.location.href);
    const params = new URLSearchParams(url.search);
    params.set('activeTab', tabName ?? '');

    const normalizedQuery = Array.from(params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const nextUrl = `${url.pathname}${normalizedQuery ? `?${normalizedQuery}` : ''}${url.hash}`;
    const currentUrl = `${url.pathname}${url.search}${url.hash}`;

    if (nextUrl !== currentUrl) {
      if (historyMode === 'push') {
        globalThis.history.pushState({}, '', nextUrl);
      } else {
        globalThis.history.replaceState({}, '', nextUrl);
      }
    }
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
    this.destroy$.next();
    this.destroy$.complete();
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
}
