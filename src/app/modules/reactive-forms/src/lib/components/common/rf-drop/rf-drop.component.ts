import { AfterViewInit, Component, ElementRef, HostListener, inject, model, output, Renderer2 } from '@angular/core';

@Component({
  selector: 'rf-drop',
  templateUrl: './rf-drop.component.html',
  styleUrl: './styles/rf-drop.styles.scss',
})
export class RfDropComponent implements AfterViewInit {
  public open = output<boolean>();
  public overflowThreshold = model<number>(20);
  public button!: HTMLElement;
  public content!: HTMLElement;
  public closes!: NodeListOf<HTMLElement>;
  public disabled = model<boolean>(false);
  public isOpen: boolean = false;
  public autoflipThreshold: number = 0;

  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  constructor() {}

  @HostListener('document:click', ['$event'])
  public closeDropdown(event: Event): void {
    if (this.content) {
      const element = this.content;
      if (
        this.isOpen &&
        this.button &&
        this.content &&
        !this.button.contains(event.target as Node) &&
        !element.contains(event.target as Node)
      ) {
        this.isOpen = false;
        this.renderer.setStyle(element, 'display', 'none');
        this.emitEventChangeIsOpen();
      }
    }
  }

  public ngAfterViewInit(): void {
    this.button = this.elementRef.nativeElement.querySelector('[buttondrop]') as HTMLElement;
    this.content = this.elementRef.nativeElement.querySelector('[contentdrop]') as HTMLElement;
    this.closes = this.elementRef.nativeElement.querySelectorAll('[closedrop]') as NodeListOf<HTMLElement>;
    if (this.button) {
      this.button.addEventListener('click', () => this.toggleDropdown());
    }
    if (this.content) {
      this.renderer.setStyle(this.content, 'position', 'absolute');
      this.renderer.setStyle(this.content, 'display', 'none');
    }
    if (this.closes) {
      for (const close of Array.from(this.closes)) {
        this.addCloseEvent(close);
      }
    }
  }

  public addCloseEvent(element: HTMLElement): void {
    element.addEventListener('click', (event: Event) => {
      if (!this.hasCloseExceptionDropAttribute(event?.target as Node)) {
        this.toggleDropdown();
      }
    });
  }

  public openDrop(): void {
    this.toggleDropdown(true);
  }

  public closeDrop(): void {
    this.toggleDropdown(false);
  }

  private toggleDropdown(isOpen?: boolean): void {
    if (this.content && !this.disabled()) {
      this.isOpen = isOpen ?? !this.isOpen;
      this.renderer.setStyle(this.content, 'display', this.isOpen ? 'block' : 'none');
      if (this.isOpen) {
        this.autoflipThreshold = this.content.offsetHeight + this.overflowThreshold();
        this.setPosition();
      }
      this.emitEventChangeIsOpen();
    }
  }

  private setPosition(): void {
    const buttonRect = this.button.getBoundingClientRect();
    const contentRect = this.content.getBoundingClientRect();
    const viewportHeight = globalThis.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow < this.autoflipThreshold && spaceAbove > contentRect.height) {
      this.renderer.setStyle(this.content, 'bottom', `${buttonRect.height}px`);
      this.renderer.setStyle(this.content, 'top', 'auto');
    } else {
      this.renderer.setStyle(this.content, 'top', `${buttonRect.height}px`);
      this.renderer.setStyle(this.content, 'bottom', 'auto');
    }
  }

  private emitEventChangeIsOpen(): void {
    this.open.emit(this.isOpen);
  }

  private hasCloseExceptionDropAttribute(node: Node): boolean {
    if (node instanceof Element) {
      return node.hasAttribute('closeexceptiondrop');
    }
    return false;
  }
}
