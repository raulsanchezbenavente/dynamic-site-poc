import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface RteInjectorConfig {
  content?: string;
}

@Component({
  selector: 'rte-injector',
  standalone: true,
  templateUrl: './rte-injector.component.html',
  styleUrl: './rte-injector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RteInjectorComponent {
  public readonly config = input<RteInjectorConfig | null | undefined>(undefined);

  public readonly htmlContent = computed(() => this.config()?.content ?? '');
}
