import { Component, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingProgressService } from '../services/booking-progress/booking-progress.service';

declare const flatpickr: any;

@Component({
  selector: 'pb-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container my-5">
      <div class="p-4 bg-light border rounded shadow">
        <h2 class="mb-4 text-primary">Find Your Flight</h2>
        <form class="row g-3 align-items-end">
          <div class="col-md-4">
            <label for="from" class="form-label">From</label>
            <select id="from" class="form-select" [(ngModel)]="from" name="from">
              <option [ngValue]="null" disabled selected>Select origin</option>
              <option>New York (JFK)</option>
              <option>London (LHR)</option>
              <option>Paris (CDG)</option>
              <option>Tokyo (NRT)</option>
              <option>Madrid (MAD)</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="to" class="form-label">To</label>
            <select id="to" class="form-select" [(ngModel)]="to" name="to">
              <option [ngValue]="null" disabled selected>Select destination</option>
              <option>Rome (FCO)</option>
              <option>Berlin (BER)</option>
              <option>Los Angeles (LAX)</option>
              <option>Dubai (DXB)</option>
              <option>Buenos Aires (EZE)</option>
            </select>
          </div>
          <div class="col-md-2">
            <label for="departure" class="form-label">Departure</label>
            <input type="text" class="form-control datepicker" id="departure" [(ngModel)]="departure" name="departure">
          </div>
          <div class="col-md-2">
            <label for="return" class="form-label">Return</label>
            <input type="text" class="form-control datepicker" id="return" [(ngModel)]="returnDate" name="returnDate">
          </div>
          <div class="col-12 text-end">
            <button
              class="btn btn-primary btn-lg mt-3"
              [disabled]="!isFormValid()"
              (click)="goToResults()"
            >
              Search Flights
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SearchComponent implements AfterViewInit {
  private progress = inject(BookingProgressService);

  public from: string | null = null;
  public to: string | null = null;
  public departure: string | null = null;
  public returnDate: string | null = null;

  public ngOnInit(): void {
    this.progress.initToken();
  }

  public ngAfterViewInit(): void {
    flatpickr('.datepicker', {
      dateFormat: 'Y-m-d'
    });
  }

  public isFormValid(): boolean {
    return !!(this.from && this.to && this.departure && this.returnDate);
  }

  public goToResults(): void {
    if (this.isFormValid()) {
      // this.progress.completeStep('results');
      // this.router.navigate(['results']);
      this.progress.markBookingProcessAsCompleted('home', 'results');
    }
  }
}
