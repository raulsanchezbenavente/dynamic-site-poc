import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'loyalty-overview-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loyalty-card.component.html',
  styleUrl: './loyalty-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyOverviewCardComponent {
  public name = input<string>('Perico');

  public memberNumber = input<string>('13440242314');
  public totalMiles = input<string>('600,700');
  public expirationDate = input<string>('31 de mayo de 2026');
  public async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Silencioso; si quieres, aquí puedes emitir un toast/evento
    }
  }
}
