import { NgClass } from '@angular/common';
import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { ButtonStyles, createResponsiveSignal, ViewportSizeService } from '@dcx/ui/libs';

import { DsGroupOptionsItemComponent } from '../group-options-item/group-options-item.component';
import { GroupOptionElementData } from '../models/group-option-element.model';

@Component({
  selector: 'ds-group-options-list',
  templateUrl: './group-options-list.component.html',
  imports: [NgClass, DsGroupOptionsItemComponent],
  host: {
    class: 'group-options-list',
    '[class.group-options-list--scrollable]': 'shouldEnableScroll()',
  },
  standalone: true,
})
export class DsGroupOptionsListComponent implements OnDestroy {
  public optionList = input.required<GroupOptionElementData[]>();
  public templateGrid = input.required<string>();
  public enableHorizontalScroll = input<boolean>(false);
  public buttonStyle = input<ButtonStyles>(ButtonStyles.PRIMARY);

  private readonly viewportSizeService = inject(ViewportSizeService);
  private isScrollableViewport: ReturnType<typeof createResponsiveSignal>[0] = signal(false);
  private destroyMediaQueryListener: () => void = () => {};

  /**
   * Grid classes computed from templateGrid input
   */
  public readonly gridClasses = computed<string[]>(() => [
    'group-options-list_grid',
    this.templateGrid() ? `go--grid-${this.templateGrid()}cols` : '',
  ]);

  /**
   * Determines if horizontal scroll should be enabled based on:
   * 1. enableHorizontalScroll config
   * 2. viewport width < scrollable breakpoint
   */
  public readonly shouldEnableScroll = computed<boolean>(
    () => this.enableHorizontalScroll() && this.isScrollableViewport()
  );

  constructor() {
    this.initScrollableViewport();
  }

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
  }

  private initScrollableViewport(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--group-options-scrollable-breakpoint');
    const mediaQuery = `(width < ${breakpoint}px)`;

    [this.isScrollableViewport, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }
}
