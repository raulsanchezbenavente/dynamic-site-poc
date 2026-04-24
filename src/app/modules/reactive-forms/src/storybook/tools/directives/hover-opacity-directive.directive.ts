import { AfterViewInit, Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[hoverOpacity]',
})
export class HoverOpacityDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  public ngAfterViewInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'default');
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 500ms ease-in-out');
  }

  @HostListener('mouseover') public onMouseOver(): void {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
  }

  @HostListener('mouseout') public onMouseOut(): void {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
  }
}
