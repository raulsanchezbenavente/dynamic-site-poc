import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  inject,
  model,
  QueryList,
} from '@angular/core';

import { LayoutSlotDirective } from './directives/layout-slot.directive';

@Component({
  selector: 'ds-layout-swapper',
  templateUrl: './layout-swapper.component.html',
  imports: [NgStyle, NgTemplateOutlet],
  standalone: true,
})
export class DsLayoutSwapperComponent implements AfterContentInit {
  @ContentChildren(LayoutSlotDirective) public slots!: QueryList<LayoutSlotDirective>;

  public activeSlotName = model<string>('');
  private readonly changeDetector = inject(ChangeDetectorRef);

  public ngAfterContentInit(): void {
    if (!this.activeSlotName() && this.slots.first) {
      this.activeSlotName.set(this.slots.first.slotName);
    }
  }

  public showProjection(slotName: string): void {
    const exists = this.slots?.find((s) => s.slotName === slotName);
    if (exists) {
      this.changeDetector.markForCheck();
      this.activeSlotName.set(slotName);
    } else {
      console.warn(`Slot "${slotName}" doesn't found.`);
    }
  }
}
