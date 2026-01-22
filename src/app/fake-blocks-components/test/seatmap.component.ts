import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingProgressService } from '../../services/booking-progress/booking-progress.service';

@Component({
  selector: 'pb-seatmap',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container my-5">
      <h2 class="text-primary mb-4 text-center">Select Your Seat</h2>

      <div class="plane-frame mx-auto p-3 bg-white rounded-5 shadow" style="max-width: 500px;">
        <!-- Header with seat letters -->
        <div class="d-flex align-items-center justify-content-center mb-2">
          <div class="seat-label seat-row-number"></div>
          <ng-container *ngFor="let seat of seatColumns">
            <div class="seat-label" *ngIf="seat !== 'aisle'">{{ seat }}</div>
            <div class="seat-label" *ngIf="seat === 'aisle'" style="width: 20px;"></div>
          </ng-container>
        </div>

        <!-- Rows -->
        <div *ngFor="let row of seatRows" class="d-flex align-items-center justify-content-center mb-1">
          <div class="seat-label seat-row-number">{{ row }}</div>

          <ng-container *ngFor="let seat of seatColumns">
            <div *ngIf="seat === 'aisle'" style="width: 20px;"></div>
            <div
              *ngIf="seat !== 'aisle'"
              class="seat-box me-1"
              [class.selected]="selectedSeat === seat + row"
              (click)="selectSeat(seat + row)"
            >
              {{ seat }}
            </div>
          </ng-container>
        </div>
      </div>

      <div class="text-center mt-4">
        <p *ngIf="selectedSeat" class="text-success mb-2">
          Selected Seat: <strong>{{ selectedSeat }}</strong>
        </p>
        <button class="btn btn-primary btn-lg" (click)="goToResults()">Proceed to Payment</button>
      </div>
    </div>
  `,
  styles: [`
    .plane-frame {
      border: 4px solid #ccc;
      border-radius: 40px;
      background: #f8f9fa;
    }

    .seat-label {
      width: 35px;
      text-align: center;
      font-weight: bold;
      color: #666;
    }

    .seat-row-number {
      margin-right: 8px;
    }

    .seat-box {
      width: 35px;
      height: 35px;
      background-color: #e0e0e0;
      border: 2px solid #666;
      border-radius: 4px;
      text-align: center;
      line-height: 30px;
      font-size: 14px;
      cursor: pointer;
      transition: 0.2s;
    }

    .seat-box:hover {
      background-color: #d0d0d0;
    }

    .seat-box.selected {
      background-color: #198754;
      color: white;
      border-color: #145c32;
    }
  `]
})
export class SeatmapComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public seatRows = Array.from({ length: 30 }, (_, i) => i + 1);
  public seatColumns = ['A', 'B', 'C', 'aisle', 'D', 'E', 'F'];
  public selectedSeat: string | null = null;

  public selectSeat(seat: string): void {
    this.selectedSeat = seat;
  }

  public goToResults(): void {
    // this.progress.completeStep('seatmap');
    // this.router.navigate(['payment']);
    this.progress.markBookingProcessAsCompleted('seatmap', 'payment');
  }
}
