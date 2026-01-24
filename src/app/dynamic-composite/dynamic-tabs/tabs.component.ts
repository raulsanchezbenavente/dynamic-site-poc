import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DsDynamicBlocksComponent } from '../dynamic-blocks.component';
import { Subject, takeUntil } from 'rxjs';
import { RouterHelperService } from '../../services/router-helper/router-helper.service';
import { CmsTabContract } from './models/cms-tab-contract.model';

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule, DsDynamicBlocksComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent {
  public tabsId = input<string | null | undefined>(undefined);
  public tabs = input<CmsTabContract[] | null | undefined>(undefined);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly destroy$ = new Subject<void>();

  public activeId = model<string | undefined>(undefined);

  public viewTabs = computed(() => {
    const raw = this.tabs();
    const arr = Array.isArray(raw) ? raw : [];

    return arr
      .map((t: any) => {
        const tabId = String(t?.tabId ?? '').trim();
        const name = String(t?.name ?? '').trim();
        const title = String(t?.title ?? '').trim();
        const pageId = String(t?.pageId ?? '').trim();
        const components = Array.isArray(t?.components) ? t.components : [];
        if (!tabId || !name) return null;
        return { tabId, name, title, pageId, components };
      })
      .filter(Boolean) as Array<{ tabId: string; name: string; title: string; pageId: string; components: any[] }>;
  });

  public activeTab = computed(() => {
    const tabs = this.viewTabs();
    const tabId = this.activeId();

    const activeTab: CmsTabContract | undefined = tabs.find(t => t.tabId === tabId);
    this.routerHelper.setCurrentTabId(this.tabsId()!, activeTab?.pageId!);

    console.log(this.tabsId(), activeTab?.pageId!);

    if (!tabs.length) return undefined;
    return tabs.find(t => t.tabId === tabId) ?? tabs[0];
  });

  constructor() {
    effect(() => {
      const qpTab = this.route.snapshot.queryParamMap.get('activeTab') ?? undefined;
      const tabs = this.viewTabs();
      if (!tabs.length) return;

      if (qpTab && tabs.some(t => t.tabId === qpTab) && this.activeId() !== qpTab) {
        this.activeId.set(qpTab);
      }
    });

    effect(() => {
      const tabs = this.viewTabs();
      const current = this.activeId();

      if (!tabs.length) return;

      if (!current || !tabs.some(t => t.tabId === current)) {
        this.activeId.set(tabs[0].tabId);
      }
    });
  }

  public ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const qpTab = params.get('activeTab') ?? undefined;
        const tabs = this.viewTabs();

        if (!qpTab) return;
        if (!tabs.length) return;

        if (tabs.some(t => t.tabId === qpTab) && this.activeId() !== qpTab) {
          this.activeId.set(qpTab);
        }
      });
    console.log(this.tabsId());
    console.log(this.activeId());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(id: string): void {
    console.log('tabs');
    console.log(this.tabs());
    if (this.activeId() === id) return;

    this.activeId.set(id);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { activeTab: id },
      queryParamsHandling: 'merge',
    });
  }

  trackById(_: number, tab: { tabId: string }): string {
    return tab.tabId;
  }

  tabButtonId(tabId: string): string {
    return `ds-tab-${tabId}`;
  }

  tabPanelId(tabId: string): string {
    return `ds-tabpanel-${tabId}`;
  }
}
