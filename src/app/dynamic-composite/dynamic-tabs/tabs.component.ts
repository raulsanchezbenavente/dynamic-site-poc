import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { RouterHelperService } from '../../services/router-helper/router-helper.service';
import { AppLang } from '../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../services/site-config/site-config.service';
import { DsDynamicBlocksComponent } from '../dynamic-blocks.component';
import { CmsTabContract } from './models/cms-tab-contract.model';

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule, DsDynamicBlocksComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent implements OnInit, OnDestroy {
  public tabsId = input<string | null | undefined>(undefined);
  public tabs = input<CmsTabContract[] | null | undefined>(undefined);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly destroy$ = new Subject<void>();
  private readonly tabsOverride = signal<Array<{ name: string; title?: string; secondaryText?: string }>>([]);

  public activeId = model<string | undefined>(undefined);

  public viewTabs = computed(() => {
    const raw = this.tabs();
    const arr = Array.isArray(raw) ? raw : [];

    const normalized = arr
      .map((t: any) => {
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
      components: any[];
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
      const qpTab = this.route.snapshot.queryParamMap.get('activeTab') ?? undefined;
      this.navigateToTab(qpTab);
    });

    effect(() => {
      const tabs = this.viewTabs();
      const current = this.activeId();
      if (!tabs.length) return;
      if (!current || !tabs.some((t) => t.tabId === current)) {
        this.activeId.set(tabs[0].tabId);
      }
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
        this.setActiveTabName(
          overrides.find((o) => {
            const currentTab = this.viewTabs().find((t) => t.tabId === this.activeId());
            return o.name === currentTab?.name;
          })?.name
        );
      }
    });

    this.routerHelper.activeTab$.pipe(takeUntil(this.destroy$)).subscribe((tabId: string) => {
      const tab: CmsTabContract | undefined = this.viewTabs().find((t) => t.tabId === tabId);
      this.activeId.set(tab?.tabId);
      this.select(tab!);
    });
  }

  private navigateToTab(qpTab: string | undefined): void {
    const tabs = this.viewTabs();
    if (!qpTab) {
      qpTab = tabs[0]?.name;
      requestAnimationFrame(() => {
        this.setActiveTabName(tabs[0]?.name);
      });
    }
    if (!tabs.length) return;
    const tab: CmsTabContract | undefined = tabs.find((t) => t.name === qpTab);
    if (this.tabsId() && tab?.tabId && tab.pageId) {
      if (tab) {
        this.activeId.set(tab.tabId);
      }
      this.routerHelper.setCurrentTabId(this.tabsId()!, tab?.pageId);
    }
  }

  public select(tab: CmsTabContract): void {
    console.log(tab);

    if (this.activeId() === tab.tabId) return;
    this.activeId.set(tab.tabId);
    this.setActiveTabName(tab.name);
  }

  private setActiveTabName(tabName: string | undefined): void {
    const url = new URL(window.location.href);
    url.searchParams.set('activeTab', tabName ?? '');
    window.history.pushState({}, '', url.toString());
  }

  public trackById(_: number, tab: { tabId: string }): string {
    return tab.tabId;
  }

  public tabButtonId(tabId: string): string {
    return `ds-tab-${tabId}`;
  }

  public tabPanelId(tabId: string): string {
    return `ds-tabpanel-${tabId}`;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
