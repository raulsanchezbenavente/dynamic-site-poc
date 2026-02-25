import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal, Type } from '@angular/core';

import { componentMap } from '../../component-map';

@Component({
  selector: 'block-outlet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-outlet.component.html',
  styleUrl: './block-outlet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockOutletComponent {
  public block = input<any | null | undefined>(undefined);

  public loading = signal(false);
  public cmp = signal<Type<any> | null>(null);

  private readonly loadCmp = effect((onCleanup) => {
    const b = this.block();
    const loader = b?.component ? componentMap[b.component] : undefined;

    this.cmp.set(null);

    if (!loader) {
      this.loading.set(false);
      return;
    }

    let cancelled = false;
    this.loading.set(true);

    loader()
      .then((component) => {
        if (cancelled) return;
        this.cmp.set(component);
      })
      .catch(() => {
        if (cancelled) return;
        this.cmp.set(null);
      })
      .finally(() => {
        if (cancelled) return;
        this.loading.set(false);
      });

    onCleanup(() => {
      cancelled = true;
    });
  });

  public inputs = computed<Record<string, any>>(() => {
    const b = this.block();
    if (!b) return {};
    const { component, span, ...rest } = b;
    return rest;
  });
}
