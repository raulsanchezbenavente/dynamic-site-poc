import { Component, computed, ElementRef, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { collapseAnimationV2, generateIdWithUUID, KeyCodeEnum } from '@dcx/ui/libs';

@Component({
  selector: 'ds-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./styles/accordion-item.styles.scss'],
  host: {
    class: 'ds-accordion-item',
  },
  animations: [collapseAnimationV2],
  standalone: true,
})
export class AccordionItemComponent implements OnInit {
  public id = input<string | undefined>(undefined);
  public title = input.required<string>();
  public isInitiallyExpanded = input<boolean>(false);
  public isDisabled = input<boolean>(false);
  public headingLevel = input<number>(3);

  public readonly toggleRequested = output<void>();
  public readonly navigationKeydown = output<KeyboardEvent>();

  @ViewChild('triggerButton', { static: true })
  private readonly triggerButtonRef!: ElementRef<HTMLButtonElement>;

  public isCollapsed = signal(true);
  public internalId = signal('');

  public triggerId = computed(() => `${this.internalId()}-trigger`);
  public contentId = computed(() => `${this.internalId()}-content`);

  public ngOnInit(): void {
    const baseId = this.id() ?? generateIdWithUUID('accordionItem');

    this.internalId.set(baseId);
    this.isCollapsed.set(!this.isInitiallyExpanded());
  }

  public onToggleRequest(): void {
    if (this.isDisabled()) return;

    this.toggleRequested.emit();
  }

  public toggle(): void {
    if (this.isDisabled()) return;

    this.isCollapsed.update((value: boolean) => !value);
  }

  public collapse(): void {
    this.isCollapsed.set(true);
  }

  public onKeydown(event: KeyboardEvent): void {
    const handledKeys = [KeyCodeEnum.ARROW_DOWN, KeyCodeEnum.ARROW_UP];
    if (handledKeys.includes(event.key as KeyCodeEnum)) {
      event.preventDefault();
      this.navigationKeydown.emit(event);
    }
  }

  public focusTrigger(): void {
    this.triggerButtonRef.nativeElement.focus();
  }
}
