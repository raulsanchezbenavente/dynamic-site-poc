import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'assist-selection',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './assist-selection.component.html',
  styleUrl: './assist-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistSelectionComponent {
  @Output() public close = new EventEmitter<void>();

  public passengers = [
    { id: 'all', nameKey: 'ASSIST.PASSENGERS.ALL', checked: false },
    { id: 'p1', nameKey: 'ASSIST.PASSENGERS.P1', checked: false },
    { id: 'p2', nameKey: 'ASSIST.PASSENGERS.P2', checked: false },
  ];

  public benefitsKeys = [
    'ASSIST.BENEFITS.MEDICAL',
    'ASSIST.BENEFITS.CANCEL',
    'ASSIST.BENEFITS.BAGGAGE',
  ];

  public togglePassenger(id: string): void {
    const passenger = this.passengers.find((p) => p.id === id);
    if (!passenger) return;

    const nextChecked = !passenger.checked;
    passenger.checked = nextChecked;

    if (id === 'all') {
      this.passengers.forEach((p) => {
        if (p.id !== 'all') p.checked = nextChecked;
      });
      return;
    }

    const allSelected = this.passengers
      .filter((p) => p.id !== 'all')
      .every((p) => p.checked);
    const allPassenger = this.passengers.find((p) => p.id === 'all');
    if (allPassenger) allPassenger.checked = allSelected;
  }
}
