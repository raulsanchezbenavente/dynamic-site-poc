import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[preventMouseFocusOnClick]',
  standalone: true,
})
export class PreventMouseFocusDirective {
  @HostListener('mousedown', ['$event'])
  public preventMouseFocusOnClick(mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
  }
}
