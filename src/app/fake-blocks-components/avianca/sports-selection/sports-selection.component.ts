import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'sports-selection',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './sports-selection.component.html',
  styleUrl: './sports-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportsSelectionComponent {
  @Output() public closed = new EventEmitter<void>();

  public legs = ['SPORTS.LEGS.OUTBOUND', 'SPORTS.LEGS.RETURN'];
  public activeLeg = this.legs[0];

  public passengers = [
    { id: 'p1', nameKey: 'SPORTS.PASSENGERS.P1', total: '€ 0,00' },
    { id: 'p2', nameKey: 'SPORTS.PASSENGERS.P2', total: '€ 0,00' },
  ];
  public activePassengerId = this.passengers[0].id;

  public items = [
    { id: 'bike', nameKey: 'SPORTS.ITEMS.BIKE', price: 130, imageUrl: '/assets/illustrations/extras/bike.svg', qty: 0 },
    { id: 'golf', nameKey: 'SPORTS.ITEMS.GOLF', price: 130, imageUrl: '/assets/illustrations/extras/golf.svg', qty: 0 },
    { id: 'surf', nameKey: 'SPORTS.ITEMS.SURF', price: 130, imageUrl: '/assets/illustrations/extras/surf.svg', qty: 0 },
    {
      id: 'kitesurf',
      nameKey: 'SPORTS.ITEMS.KITESURF',
      price: 130,
      imageUrl: '/assets/illustrations/extras/kitesurfing.svg',
      qty: 0,
    },
    { id: 'ski', nameKey: 'SPORTS.ITEMS.SKI', price: 130, imageUrl: '/assets/illustrations/extras/ski.svg', qty: 0 },
    {
      id: 'hangglide',
      nameKey: 'SPORTS.ITEMS.HANG_GLIDING',
      price: 45.94,
      imageUrl: '/assets/illustrations/extras/hang-gliding.svg',
      qty: 0,
    },
  ];

  public setLeg(leg: string): void {
    this.activeLeg = leg;
  }

  public setPassenger(id: string): void {
    this.activePassengerId = id;
  }

  public increment(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) item.qty += 1;
  }

  public decrement(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) item.qty = Math.max(0, item.qty - 1);
  }

  public totalFor(id: string): string {
    const item = this.items.find((i) => i.id === id);
    if (!item) return this.formatPrice(0);
    return this.formatPrice(item.qty * item.price);
  }

  public totalAll(): string {
    const total = this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    return this.formatPrice(total);
  }

  public formatPrice(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  }

  @HostListener('document:keydown.escape')
  public handleEscape(): void {
    this.closed.emit();
  }
}
