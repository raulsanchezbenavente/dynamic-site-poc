import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ClickOutsideDirective,
  DictionaryType,
  DropdownVM,
  EnumModalKeyEventType,
  GenerateIdPipe,
  IValueEmitterComponent,
  KeyCodeEnum,
  ModalKeyEventsDirective,
} from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./styles/dropdown.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [NgClass, NgTemplateOutlet, TranslateModule, IconComponent, ModalKeyEventsDirective, ClickOutsideDirective],
  standalone: true,
})
export class DropdownComponent implements OnInit, AfterContentInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() public model!: DropdownVM;
  @Input() public innerComponent?: any;
  @Input() public triggerComponent?: boolean;
  @Input() public dropdownTriggerSection?: boolean;
  @Input() public translations!: DictionaryType;

  /**
   * If true, dropdown will open on first load.
   * This input is only considered once on init.
   */
  @Input() public initiallyOpen = false;

  @ViewChild('dropdownContentRef', { read: ElementRef })
  private readonly dropdownContentRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownTriggerRef') public dropdownTrigger!: ElementRef;

  @Output() public opened = new EventEmitter<void>();
  @Output() public closed = new EventEmitter<void>();
  @Output() public triggerFocus = new EventEmitter<void>();
  @Output() public triggerBlur = new EventEmitter<void>();
  @Output() public triggerMouseEnter = new EventEmitter<void>();
  @Output() public triggerMouseLeave = new EventEmitter<void>();

  /**
   * Returns the native element of the dropdown content container,
   * used for direct DOM access (e.g., scrolling or focusing options).
   */
  public getContentElement(): HTMLElement | null {
    return this.dropdownContentRef?.nativeElement ?? null;
  }

  public innerComponentSubscription: Subscription;
  public innerComponentIdSubscription: Subscription;
  public dropdownKeyboardSubscription: Subscription | null;

  /**
   * Properties used for accessibility
   */
  public triggerId: string = '';
  public contentId: string = '';
  public ariaControlsId: string = '';
  public modalKeyEventType = EnumModalKeyEventType.DROPDOWN;
  private optionListId: string = '';

  constructor(
    protected generateId: GenerateIdPipe,
    protected renderer: Renderer2
  ) {
    this.innerComponentIdSubscription = new Subscription();
    this.dropdownKeyboardSubscription = new Subscription();
    this.innerComponentSubscription = new Subscription();
  }

  public ngOnChanges(): void {
    this.model.isVisible = false;
  }

  public ngOnInit(): void {
    this.contentId = this.generateId.transform('dropdownContentId_');
    this.triggerId = this.generateId.transform('dropdownTriggerRef_');

    this.model.config.closeOnSelection ??= true;

    if (this.model.config.layoutConfig.isAlwaysVisible) {
      this.model.isVisible = true;
    }

    if (this.initiallyOpen) {
      this.model.isVisible = true;
    }

    if ((this.innerComponent as IValueEmitterComponent)?.idEmitter) {
      this.innerComponentIdSubscription = (this.innerComponent as IValueEmitterComponent).idEmitter.subscribe({
        next: (id: string) => {
          this.optionListId = id;
        },
      });
    }
  }

  public ngAfterContentInit(): void {
    this.ariaControlsId = this.optionListId && this.optionListId.length !== 0 ? this.optionListId : this.contentId;

    if (!this.model.config.closeOnSelection) return;

    this.innerComponentSubscription = this.innerComponent?.valueEmitter?.subscribe({
      next: () => {
        this.closeDropdown();
      },
    });
  }

  public ngAfterViewInit(): void {
    if (this.dropdownTrigger?.nativeElement) {
      const buttonElement = this.dropdownTrigger.nativeElement as HTMLElement;

      this.renderer.listen(buttonElement, 'focus', () => {
        this.enableDropdownEventListener();
      });

      this.renderer.listen(buttonElement, 'blur', () => {
        this.disableDropdownEventListener();
      });
    }
  }

  public ngOnDestroy(): void {
    this.innerComponentSubscription?.unsubscribe();
    this.innerComponentIdSubscription?.unsubscribe();
    this.disableDropdownEventListener();
  }

  public closeDropdown(): void {
    if (!this.model.isVisible) return;
    this.model.isVisible = false;
    this.closed.emit();
    requestAnimationFrame(() => {
      this.dropdownTrigger?.nativeElement?.focus();
    });
  }

  public openDropdown(): void {
    if (this.model.isVisible) return;

    const isAlwaysVisible = this.model.config.layoutConfig?.isAlwaysVisible;
    if (isAlwaysVisible) return;

    this.model.isVisible = true;
    this.opened.emit();
  }

  private enableDropdownEventListener(): void {
    this.dropdownKeyboardSubscription ??= fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event) => {
      switch (event.key) {
        case KeyCodeEnum.ARROW_DOWN:
        case KeyCodeEnum.ARROW_UP:
          event.preventDefault();
          this.openDropdown();
          break;
      }
    });
  }

  private disableDropdownEventListener(): void {
    this.dropdownKeyboardSubscription?.unsubscribe();
    this.dropdownKeyboardSubscription = null;
  }

  /**
   * Scrolls the dropdown content container to ensure the selected option is visible.
   * Should be used after the dropdown is opened, when DOM is fully rendered.
   * Uses `requestAnimationFrame` to avoid issues with timing/render delays.
   *
   * Note: This is safe to call even when the content is not an options list.
   */
  public scrollToSelectedOptionInContent(): void {
    requestAnimationFrame(() => {
      const content = this.dropdownContentRef?.nativeElement;
      const selectedEl = content?.querySelector('[aria-selected="true"]');

      if (selectedEl instanceof HTMLElement) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    });
  }
}
