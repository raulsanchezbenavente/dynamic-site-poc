import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'priority-selection',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './priority-selection.component.html',
  styleUrl: './priority-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrioritySelectionComponent {
  @Output() public closed: EventEmitter<void> = new EventEmitter<void>();

  public tabs = ['PRIORITY.TABS.MADRID', 'PRIORITY.TABS.BOGOTA', 'PRIORITY.TABS.ARUBA', 'PRIORITY.TABS.BOGOTA'];
  public activeTab = this.tabs[0];

  public passengers = [
    { id: 'all', nameKey: 'PRIORITY.PASSENGERS.ALL', checked: false },
    { id: 'p1', nameKey: 'PRIORITY.PASSENGERS.P1', checked: false },
    { id: 'p2', nameKey: 'PRIORITY.PASSENGERS.P2', checked: false },
  ];

  public benefitsKeys = ['PRIORITY.BENEFITS.GROUPS', 'PRIORITY.BENEFITS.CHECKIN', 'PRIORITY.BENEFITS.AVIANCA'];

  public setTab(tab: string): void {
    this.activeTab = tab;
  }

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

    const allSelected = this.passengers.filter((p) => p.id !== 'all').every((p) => p.checked);
    const allPassenger = this.passengers.find((p) => p.id === 'all');
    if (allPassenger) allPassenger.checked = allSelected;
  }
}
