import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'booking-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './booking-footer.component.html',
  styleUrl: './booking-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFooterComponent {
  public outboundDate = input<string>('Jue 12 Feb 2026');
  public outboundFrom = input<string>('MAD');
  public outboundTo = input<string>('AUA');
  public outboundTime = input<string>('17:20');

  public returnDate = input<string>('Dom 15 Feb 2026');
  public returnFrom = input<string>('AUA');
  public returnTo = input<string>('MAD');
  public returnTime = input<string>('12:05');

  public passengersLabelKey = input<string>('BOOKING_FOOTER.PASSENGERS');
  public passengersValue = input<string>('1 pasajero');

  public totalLabelKey = input<string>('BOOKING_FOOTER.TOTAL_FOR');
  public totalValue = input<string>('€ 2.979,92');
  public totalCaptionKey = input<string>('BOOKING_FOOTER.TOTAL_CAPTION');

  public ctaLabelKey = input<string>('BOOKING_FOOTER.CTA_PAY');
  public disabled = input<boolean>(false);
  public sticky = input<boolean>(true);

  @Output() public ctaClick = new EventEmitter<void>();

  public onCtaClick(): void {
    if (this.disabled()) return;
    this.ctaClick.emit();
  }
}
