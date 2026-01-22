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

export type CmsTabContract = {
  id?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  components?: any[];
};

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule, DsDynamicBlocksComponent],
  template: `
    <div class="ds-tabs" role="tablist" aria-label="Tabs">
      <button
        type="button"
        class="ds-tab"
        role="tab"
        *ngFor="let tab of viewTabs(); trackBy: trackById"
        [attr.id]="tabButtonId(tab.id)"
        [attr.aria-controls]="tabPanelId(tab.id)"
        [attr.aria-selected]="tab.id === activeId()"
        [class.is-active]="tab.id === activeId()"
        (click)="select(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <section
      class="ds-tab-panel"
      role="tabpanel"
      *ngIf="activeTab() as tab"
      [attr.id]="tabPanelId(tab.id)"
      [attr.aria-labelledby]="tabButtonId(tab.id)"
    >
      <ds-dynamic-blocks [blocks]="tab.components"></ds-dynamic-blocks>
    </section>
  `,
  styles: [`
    .ds-tabs{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 48px;                 /* espacio entre tabs */
      border-bottom: 1px solid #d9d9d9;
      background: #fff;
      padding: 0 8px;
      margin-right: auto;
      margin-left: auto;
      width: 1100px;
      // width: calc(100% - 300px);
    }

    /* tab base */
    .ds-tab{
      position: relative;
      border: 0;
      background: transparent;
      cursor: pointer;

      padding: 14px 10px 12px;
      font-size: 16px;
      font-weight: 500;
      color: #6a6a6a;

      /* evita “highlight” feo */
      outline: none;
    }

    .ds-tab::after{
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;              /* que pise la línea gris */
      height: 3px;
      background: transparent;
      border-radius: 2px 2px 0 0;
    }

    .ds-tab.is-active{
      color: #111;
      font-weight: 800;
    }

    .ds-tab.is-active::after{
      background: #18a33a;       /* verde */
    }

    .ds-tab:hover{
      color: #111;
    }

    .ds-tab:focus-visible{
      outline: 2px solid rgba(24,163,58,.35);
      outline-offset: 4px;
      border-radius: 8px;
    }

    .ds-tab-panel{
      padding-top: 18px;
      background: transparent;
      margin-right: auto;
      margin-left: auto;
      width: 1100px;
      // width: calc(100% - 300px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTabsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  tabs = input<CmsTabContract[] | null | undefined>(undefined);

  activeId = model<string | undefined>(undefined);

  viewTabs = computed(() => {
    const raw = this.tabs();
    const arr = Array.isArray(raw) ? raw : [];

    return arr
      .map((t: any) => {
        const id = String(t?.id ?? t?.name ?? t?.title ?? '').trim();
        const name = String(t?.title ?? t?.name ?? t?.id ?? '').trim();
        const components = Array.isArray(t?.components) ? t.components : [];
        if (!id || !name) return null;
        return { id, name, components };
      })
      .filter(Boolean) as Array<{ id: string; name: string; components: any[] }>;
  });

  activeTab = computed(() => {
    const tabs = this.viewTabs();
    const id = this.activeId();
    if (!tabs.length) return undefined;
    return tabs.find(t => t.id === id) ?? tabs[0];
  });

  constructor() {
    effect(() => {
      const qpTab = this.route.snapshot.queryParamMap.get('tab') ?? undefined;
      const tabs = this.viewTabs();
      if (!tabs.length) return;

      if (qpTab && tabs.some(t => t.id === qpTab) && this.activeId() !== qpTab) {
        this.activeId.set(qpTab);
      }
    });

    effect(() => {
      const tabs = this.viewTabs();
      const current = this.activeId();

      if (!tabs.length) return;

      if (!current || !tabs.some(t => t.id === current)) {
        this.activeId.set(tabs[0].id);
      }
    });
  }

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const qpTab = params.get('tab') ?? undefined;
        const tabs = this.viewTabs(); // si esto es computed signal, úsalo como viewTabs()

        if (!qpTab) return;
        if (!tabs.length) return;

        if (tabs.some(t => t.id === qpTab) && this.activeId() !== qpTab) {
          this.activeId.set(qpTab);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(id: string): void {
    if (this.activeId() === id) return;

    this.activeId.set(id);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: id },
      queryParamsHandling: 'merge',
    });
  }

  trackById(_: number, tab: { id: string }): string {
    return tab.id;
  }

  tabButtonId(tabId: string): string {
    return `ds-tab-${tabId}`;
  }

  tabPanelId(tabId: string): string {
    return `ds-tabpanel-${tabId}`;
  }
}
