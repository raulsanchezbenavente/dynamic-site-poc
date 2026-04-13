import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';

@Component({
  selector: 'ads',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
})
export class AdsComponent {
  public baseConfig = input<{ url?: string } | null>(null);

  public heroImageUrl = computed(() => this.baseConfig()?.url ?? DEFAULT_HERO_IMAGE);
}
