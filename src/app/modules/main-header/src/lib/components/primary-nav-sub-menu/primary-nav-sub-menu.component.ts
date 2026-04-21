import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  QueryList,
  ViewChildren,
  WritableSignal,
} from '@angular/core';
import { IconComponent } from '@dcx/storybook/design-system';
import { BannerComponent } from '@dcx/ui/business-common';
import { AccessibleLinkDirective, KeyCodeEnum, LinkTarget } from '@dcx/ui/libs';

import { MainMenuItem } from '../../models/main-menu-item.model';

@Component({
  selector: 'primary-nav-submenu',
  templateUrl: './primary-nav-sub-menu.component.html',
  styleUrls: ['./styles/primary-nav-submenu.styles.scss'],
  host: {
    class: 'primary-nav-submenu',
  },
  imports: [AccessibleLinkDirective, IconComponent, BannerComponent, CommonModule],
  standalone: true,
})
export class PrimaryNavSubMenuComponent {
  @Input({ required: true }) public isResponsive!: boolean;
  @Input({ required: true }) public focusedSubmenuIndex!: WritableSignal<number | null>;
  @Input() public sectionColor!: string | null;

  @Input() set menuItem(value: MainMenuItem) {
    this._menuItem = value;
  }
  get menuItem(): MainMenuItem {
    return this._menuItem;
  }

  @Output() public submenuTabOut = new EventEmitter<KeyboardEvent>();
  @Output() public closeMenuExternal = new EventEmitter<void>();

  @ViewChildren('submenuItem', { read: ElementRef })
  private readonly submenuItemRefs!: QueryList<ElementRef<HTMLElement>>;

  public readonly hostEl = inject(ElementRef<HTMLElement>);

  public LinkTarget = LinkTarget;

  private _menuItem!: MainMenuItem;

  /**
   * Focuses the first submenu item. Called from parent when submenu is opened via keyboard.
   */
  public focusFirstItem(): void {
    requestAnimationFrame(() => {
      const el = this.submenuItemRefs.first?.nativeElement;
      el?.focus();
    });
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case KeyCodeEnum.ESCAPE: {
        event.preventDefault();
        this.closeMenuExternal.emit();
        break;
      }

      case KeyCodeEnum.TAB: {
        if (this.isResponsive) return;
        this.submenuTabOut.emit(event);
        break;
      }
    }

    const items = this.submenuItemRefs.toArray();
    if (!items?.length) return;

    const currentIndex = items.findIndex((el) => el.nativeElement === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number;
    let prevIndex: number;

    switch (event.key) {
      case KeyCodeEnum.ARROW_DOWN: {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        this.focusedSubmenuIndex.set(nextIndex);
        items[nextIndex].nativeElement.focus();
        break;
      }

      case KeyCodeEnum.ARROW_UP: {
        event.preventDefault();
        prevIndex = (currentIndex - 1 + items.length) % items.length;
        this.focusedSubmenuIndex.set(prevIndex);
        items[prevIndex].nativeElement.focus();
        break;
      }
      default:
        break;
    }
  }
}
