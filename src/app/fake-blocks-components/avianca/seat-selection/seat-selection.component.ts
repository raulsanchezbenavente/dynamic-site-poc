import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatSelectionComponent {
  @Output() public close = new EventEmitter<void>();

  public legs = ['MAD - BOG', 'BOG - AUC', 'AUC - BOG', 'BOG - MAD'];
  public activeLeg = this.legs[0];

  public seatRows = Array.from({ length: 14 }, (_, index) => index + 8);
  public seatColumns = ['A', 'B', 'C', 'aisle', 'D', 'E', 'F', 'G', 'aisle', 'J', 'K'];

  public selectedSeat: string | null = null;

  private plusSeats = new Set(['A8', 'B8', 'F8', 'J8', 'D9', 'E9', 'G9', 'K9', 'C10', 'F10', 'J10']);
  private exitSeats = new Set(['D12', 'E12', 'F12', 'G12']);
  private unavailableSeats = new Set([
    'C8',
    'D8',
    'E8',
    'G8',
    'K8',
    'A9',
    'B9',
    'C9',
    'E9',
    'F9',
    'J9',
    'K10',
    'A11',
    'B11',
    'C11',
    'K11',
    'A12',
    'B12',
    'C12',
    'J12',
    'K12',
    'A14',
    'B14',
    'C14',
    'J14',
    'K14',
    'K15',
    'K16',
    'K17',
    'A18',
    'B18',
    'C18',
    'K18',
    'A19',
    'K19',
    'A20',
    'K20',
    'A21',
    'K21',
  ]);

  public setLeg(leg: string): void {
    this.activeLeg = leg;
    this.selectedSeat = null;
  }

  public getSeatId(row: number, column: string): string {
    return `${column}${row}`;
  }

  public isUnavailable(seatId: string): boolean {
    return this.unavailableSeats.has(seatId);
  }

  public isPlus(seatId: string): boolean {
    return this.plusSeats.has(seatId);
  }

  public isExit(seatId: string): boolean {
    return this.exitSeats.has(seatId);
  }

  public selectSeat(seatId: string): void {
    if (this.isUnavailable(seatId)) {
      return;
    }

    this.selectedSeat = seatId;
  }
}
