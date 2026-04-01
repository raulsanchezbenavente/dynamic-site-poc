import { NgClass, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  signal,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'tooltip-text',
  templateUrl: './tooltip-text.component.html',
  styleUrls: ['./styles/tooltip-text.styles.scss'],
  host: { class: 'tooltip-text' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, NgStyle],
  standalone: true,
})
export class TooltipTextComponent {
  // Reactive inputs
  public tooltip = input<string>('');
  public position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  public manual = input<boolean>(false);

  @ViewChild('triggerEl', { static: true }) public triggerElRef!: ElementRef<HTMLElement>;

  // Reactive state
  public styles = signal<Record<string, string>>({});
  private readonly visible = signal(false);
  public readonly tooltipId = crypto.randomUUID();

  // Public visibility accessor
  public get isTooltipVisible(): boolean {
    return this.visible();
  }

  public popupClasses = computed(() => `tooltip-text_popup--${this.position()}`);

  // Reposition when position changes while visible
  private readonly repositionEffect = effect(() => {
    if (this.visible() && this.triggerElRef && this.position()) {
      this.updateTooltipPosition();
    }
  });

  // Reposition after text changes while visible (width/height may change)
  private readonly textChangeEffect = effect(() => {
    if (this.visible() && this.tooltip()) {
      queueMicrotask(() => this.updateTooltipPosition());
    }
  });

  // Auto hover show (only in non-manual mode)
  @HostListener('mouseenter')
  public onMouseEnter(): void {
    if (this.manual()) return;
    if (!this.tooltip()) return;
    this.visible.set(true);
    this.updateTooltipPosition();
  }

  // Auto hover hide (only in non-manual mode)
  @HostListener('mouseleave')
  public onMouseLeave(): void {
    if (this.manual()) return;
    if (!this.tooltip()) return;
    this.visible.set(false);
  }

  // Programmatic show (used by parent in manual mode)
  public show(): void {
    if (!this.tooltip()) return;
    if (!this.visible()) {
      this.visible.set(true);
    }
    this.updateTooltipPosition();
  }

  // Programmatic hide
  public hide(): void {
    if (this.visible()) {
      this.visible.set(false);
    }
  }

  // Compute fixed positioning relative to trigger element
  private updateTooltipPosition(): void {
    const rect = this.triggerElRef.nativeElement.getBoundingClientRect();
    const spacingVer = 2;
    const spacingHor = 6;
    const style: Record<string, string> = { position: 'fixed', zIndex: '9999' };

    switch (this.position()) {
      case 'top':
        style['top'] = `${rect.top - spacingVer}px`;
        style['left'] = `${rect.left + rect.width / 2}px`;
        break;
      case 'bottom':
        style['top'] = `${rect.bottom + spacingVer}px`;
        style['left'] = `${rect.left + rect.width / 2}px`;
        break;
      case 'left':
        style['top'] = `${rect.top + rect.height / 2}px`;
        style['left'] = `${rect.left - spacingHor}px`;
        break;
      case 'right':
        style['top'] = `${rect.top + rect.height / 2}px`;
        style['left'] = `${rect.right + spacingHor}px`;
        break;
    }
    this.styles.set(style);
  }
}
