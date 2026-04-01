import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  HostBinding,
  inject,
  Inject,
  model,
  OnInit,
  Optional,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { GenerateIdPipe, MergeConfigsService } from '@dcx/ui/libs';

import { PanelHeaderComponent } from './components/panel-header/panel-header.component';
import { PanelContentDirective } from './directives/panel-content.directive';
import { PanelBaseConfig } from './models/panel-base.config';
import { PANEL_CONFIG } from './tokens/panel-default-config.token';

/**
 * PanelComponent
 *
 * Reusable layout container that provides a styled visual wrapper with optional header and content alignment.
 * Supports configurable layout, appearance, and ARIA attributes for accessibility.
 *
 * Accessibility: If `aria-label` or `aria-labelledby` is set via `ariaAttributes`, the component will automatically include `role="region"`
 * to improve accessibility semantics.
 */
@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./styles/panel.styles.scss'],
  host: { class: 'ds-panel' },
  exportAs: 'panel',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  standalone: true,
})
export class PanelComponent implements OnInit, AfterContentInit {
  public config = model<Partial<PanelBaseConfig>>({});

  public panelHeaderCmp = contentChild(PanelHeaderComponent);
  public panelContentEl = contentChild(PanelContentDirective, { read: ElementRef });

  private readonly generateId = inject(GenerateIdPipe);

  constructor(
    private readonly mergeConfigsService: MergeConfigsService,
    private readonly renderer: Renderer2,
    @Inject(PANEL_CONFIG)
    @Optional()
    private readonly defaultConfig: PanelBaseConfig
  ) {}

  public ngOnInit(): void {
    this.initDefaultConfiguration();
  }

  public ngAfterContentInit(): void {
    const config = this.config();

    const ariaAttrs = config.ariaAttributes ?? {};
    const panelHeaderCmp = this.panelHeaderCmp();
    const titleDirective = panelHeaderCmp?.titleDirective;
    const isAriaLabelledByUnset = !ariaAttrs.ariaLabelledBy;

    /**
     * Automatically generate an ID for the panel title if:
     * - a <h2 panelTitle> directive is projected
     * - the user hasn't explicitly set aria-labelledby
     */
    if (titleDirective && isAriaLabelledByUnset) {
      const currentId = titleDirective.elementRef.nativeElement.id;
      const ariaId = currentId || this.generateId.transform('panelTitleId');
      this.config.set({
        ...config,
        ariaAttributes: {
          ...ariaAttrs,
          ariaLabelledBy: ariaId,
        },
      });
      if (!currentId) {
        this.renderer.setAttribute(titleDirective.elementRef.nativeElement, 'id', ariaId);
      }
    }

    // Apply alignment class to <panel-header> if specified in config
    const headerAlign = config.layoutConfig?.headerHorizontalAlign;
    const headerCmp = this.panelHeaderCmp();
    if (headerCmp?.elementRef?.nativeElement && headerAlign) {
      this.renderer.addClass(headerCmp.elementRef.nativeElement, `ds-panel-header--align-${headerAlign}`);
    }

    // Apply alignment class to <div panelContent> if specified in config
    const contentAlign = config.layoutConfig?.contentHorizontalAlign;
    const contentEl = this.panelContentEl();
    if (contentEl && contentAlign) {
      this.renderer.addClass(contentEl.nativeElement, `ds-panel-content--align-${contentAlign}`);
    }
  }

  @HostBinding('class')
  get hostClassList(): string {
    return this.hostClasses.join(' ').trim();
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string | null {
    return this.config()?.ariaAttributes?.ariaLabel ?? null;
  }

  @HostBinding('attr.aria-labelledby')
  get ariaLabelledBy(): string | null {
    return this.config()?.ariaAttributes?.ariaLabelledBy ?? null;
  }

  /**
   * Automatically sets `role="region"` when either `aria-label` or `aria-labelledby` is defined.
   * This improves screen reader navigation by marking the panel as a landmark region.
   */
  @HostBinding('attr.role')
  get role(): string | null {
    const ariaAttrs = this.config()?.ariaAttributes;
    return ariaAttrs?.ariaLabel || ariaAttrs?.ariaLabelledBy ? 'region' : null;
  }

  get hostClasses(): string[] {
    const config = this.config();
    return [
      config.appearance ? `ds-panel--appearance-${config.appearance}` : '',
      config.sectionsColors ? `ds-panel-section ds-panel-section--${config.sectionsColors}` : '',
    ];
  }

  private initDefaultConfiguration(): void {
    this.config.set(this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config()));
  }
}
