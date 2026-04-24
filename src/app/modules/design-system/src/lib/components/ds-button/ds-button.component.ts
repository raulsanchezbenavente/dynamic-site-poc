import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Inject,
  input,
  model,
  OnInit,
  Optional,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { BUTTON_CONFIG, ButtonConfig, HorizontalAlign, MergeConfigsService } from '@dcx/ui/libs';

import { IconComponent } from '../icon/icon.component';

import { ButtonRenderAs } from './enums/button-render-as.enum';

@Component({
  selector: 'ds-button',
  templateUrl: './ds-button.component.html',
  styleUrls: ['./styles/ds-button.styles.scss'],
  host: { class: 'ds-button-container' },
  imports: [NgClass, NgTemplateOutlet, IconComponent],
  standalone: true,
})
export class DsButtonComponent implements OnInit {
  public readonly ButtonRenderAs = ButtonRenderAs;
  public readonly HorizontalAlign = HorizontalAlign;
  public readonly input = viewChild<ElementRef>('button');
  public config = model.required<Partial<ButtonConfig>>({});
  @Output() private readonly buttonClicked = new EventEmitter<void>();
  public ariaPressed?: boolean;

  public ariaExpanded = input<boolean | null | undefined>(undefined);
  private readonly _internalExpanded = signal<boolean | null>(null);

  public isAriaDisabled = computed(() => {
    return this.config().ariaAttributes?.ariaDisabled || this.config().isLoading ? true : null;
  });
  public getLabel = computed(() =>
    this.config().isLoading && this.config().loadingLabel ? this.config().loadingLabel : this.config().label
  );

  public resolvedExpanded = computed<boolean | null>(() => {
    return this.ariaExpanded() ?? this._internalExpanded();
  });

  /**
   * Resolves which HTML element to render.
   * If renderAs is explicitly set, use it; otherwise fall back to current behaviour.
   */
  public resolveRenderAs = computed<ButtonRenderAs>(() => {
    const cfg = this.config();
    if (cfg.renderAs) {
      return cfg.renderAs as ButtonRenderAs;
    }
    return cfg.link ? ButtonRenderAs.ANCHOR : ButtonRenderAs.BUTTON;
  });

  constructor(
    private readonly mergeConfigsService: MergeConfigsService,
    @Inject(BUTTON_CONFIG)
    @Optional()
    private readonly defaultConfig: ButtonConfig
  ) {}

  public ngOnInit(): void {
    this.initDefaultConfiguration();
  }

  /**
   * Click handler:
   * - Emits buttonClicked.
   * - Toggles internal ariaExpanded only if no external value is passed.
   * - Supports both controlled (parent sets ariaExpanded)
   *   and uncontrolled (self-toggle) usage.
   */
  public onClick(): void {
    if (this.isAriaDisabled()) return;
    if (this.ariaExpanded() == null && this.config().ariaAttributes?.hasOwnProperty('ariaExpanded')) {
      this._internalExpanded.update((v) => !v);
    }
    this.buttonClicked.emit();
  }

  /** Set the focus on focussable element */
  public focus(): void {
    if (this.input()) {
      this.input()?.nativeElement.focus();
    }
  }

  private initDefaultConfiguration(): void {
    if (this.config()?.icon) {
      this.config().icon!.position ??= HorizontalAlign.LEFT;
    }

    this.config.update((currentValue) => this.mergeConfigsService.mergeConfigs(this.defaultConfig, currentValue));
  }
}
