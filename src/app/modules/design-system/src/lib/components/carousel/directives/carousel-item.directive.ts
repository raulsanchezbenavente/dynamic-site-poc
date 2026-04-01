import { Directive } from '@angular/core';

@Directive({
  selector: '[carouselItem]',
  host: { class: 'ds-carousel-item' },
  standalone: true,
})
export class CarouselItemDirective {}
