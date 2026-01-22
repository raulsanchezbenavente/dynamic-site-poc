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
      <!-- Aquí va el render dinámico de los componentes del tab -->
      <ds-dynamic-blocks [blocks]="tab.components"></ds-dynamic-blocks>
    </section>
  `,
  styles: [`
    .ds-tabs {
      display: flex;
      gap: .5rem;
      padding-top: .5rem;
      flex-wrap: wrap;
      background: #f7f7f7;
      margin-right: auto;
      margin-left: auto;
      width: 1100px;
      // width: calc(100% - 300px);
    }

    .ds-tab {
      border: 1px solid transparent;
      padding: .5rem .75rem;
      border-radius: .5rem;
      cursor: pointer;
    }

    .ds-tab.is-active {
      background: #fffcfc;
      border-color: #ddd;
      font-weight: 600;
    }

    .ds-tab-panel {
      padding: .5rem;
      background: #f7f7f7;
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

  // Tabs del contrato
  tabs = input<CmsTabContract[] | null | undefined>(undefined);

  // Two-way signal (compatible con [(activeId)])
  activeId = model<string | undefined>(undefined);

  // Normalizamos: id + name + components
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
    // 1) Si viene ?tab=... lo usamos para seleccionar
    effect(() => {
      const qpTab = this.route.snapshot.queryParamMap.get('tab') ?? undefined;
      const tabs = this.viewTabs();
      if (!tabs.length) return;

      if (qpTab && tabs.some(t => t.id === qpTab) && this.activeId() !== qpTab) {
        this.activeId.set(qpTab);
      }
    });

    // 2) Si no hay activeId válido, fijamos el primero
    effect(() => {
      const tabs = this.viewTabs();
      const current = this.activeId();

      if (!tabs.length) return;

      if (!current || !tabs.some(t => t.id === current)) {
        this.activeId.set(tabs[0].id);
      }
    });
  }

  select(id: string): void {
    if (this.activeId() === id) return;

    this.activeId.set(id);

    // Sync con URL: ?tab=<id> (sin recargar)
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
