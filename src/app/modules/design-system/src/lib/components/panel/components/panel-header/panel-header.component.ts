import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  inject,
  Input,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';

import { PanelTitleDirective } from '../../directives/panel-title.directive';

@Component({
  selector: 'panel-header',
  templateUrl: './panel-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ds-panel-header' },
  imports: [],
  standalone: true,
})
export class PanelHeaderComponent implements AfterContentInit {
  @Input() public titleId?: string;

  @ContentChild(PanelTitleDirective, { read: PanelTitleDirective })
  public titleDirective?: PanelTitleDirective;

  public readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  public ngAfterContentInit(): void {
    /**
     * If a title element is projected and a titleId is provided,
     * set the element's id to match the ARIA reference.
     * Avoid overriding if the element already has an explicit id.
     */
    if (this.titleDirective && this.titleId) {
      const currentId = this.titleDirective.elementRef.nativeElement.id;
      if (!currentId) {
        this.renderer.setAttribute(this.titleDirective.elementRef.nativeElement, 'id', this.titleId);
      }
    }
  }
}
