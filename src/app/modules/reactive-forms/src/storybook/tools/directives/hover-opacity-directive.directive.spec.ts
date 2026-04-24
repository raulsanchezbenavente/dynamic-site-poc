import { HoverOpacityDirective } from './hover-opacity-directive.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('HoverOpacityDirective', () => {
  let elementRefMock: ElementRef;
  let rendererMock: Renderer2;

  beforeEach(() => {
    elementRefMock = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    rendererMock = jasmine.createSpyObj('Renderer2', ['setStyle']);
  });

  it('should create an instance', () => {
    const directive = new HoverOpacityDirective(elementRefMock, rendererMock);
    expect(directive).toBeTruthy();
  });

  it('should set initial styles in ngAfterViewInit', () => {
    const directive = new HoverOpacityDirective(elementRefMock, rendererMock);
    directive.ngAfterViewInit();

    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'cursor', 'default');
    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'opacity', '0');
    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'transition', 'opacity 500ms ease-in-out');
  });

  it('should set opacity to 1 on mouseover', () => {
    const directive = new HoverOpacityDirective(elementRefMock, rendererMock);
    directive.onMouseOver();

    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'opacity', '1');
  });

  it('should set opacity to 0 on mouseout', () => {
    const directive = new HoverOpacityDirective(elementRefMock, rendererMock);
    directive.onMouseOut();

    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'opacity', '0');
  });
});
