import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DsButtonComponent,
  DsLayoutSwapperComponent,
  IconComponent,
  LayoutSlotDirective,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelHeaderAsideDirective,
  PanelHeaderComponent,
  PanelIconDirective,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import { MergeConfigsService } from '@dcx/ui/libs';
import { RfErrorDisplayModes } from 'reactive-forms';

import { FORM_SUMMARY_CONFIG, FormSummaryButtonsConfig } from '../form-summary';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'rf-reduced-form-summary',
  imports: [
    DsButtonComponent,
    DsLayoutSwapperComponent,
    IconComponent,
    LayoutSlotDirective,
    PanelComponent,
    PanelContentDirective,
    PanelTitleDirective,
    PanelHeaderAsideDirective,
    PanelHeaderComponent,
    PanelIconDirective,
    PanelTitleDirective,
  ],
  templateUrl: './rf-reduced-form-summary.component.html',
  styleUrl: './styles/rf-reduced-form-summary.scss',
  host: { class: 'rf-reduced-form-summary' },
  encapsulation: ViewEncapsulation.None,
})
export class RfReducedFormSummaryComponent implements OnInit, AfterViewInit {
  public title = input.required<string>();
  public ariaLabelIcon = input<string>();
  public secondaryTitle = input<string>();
  public panelLabelledById = input<string | null>(null);
  public readonly titleElementId = input<string | null>(null);

  public viewChangedToForm = output<void>();

  public buttonsConfig = model<FormSummaryButtonsConfig>();

  public layoutSwapper = viewChild<DsLayoutSwapperComponent>('layoutSwap');

  protected displayErrorMode = RfErrorDisplayModes.TOUCHED;

  protected currentView = signal<'FORM' | 'EMPTY'>('EMPTY');
  public checked = signal<boolean>(false);
  public opened = signal<boolean>(false);

  public readonly elementRef = inject(ElementRef);

  protected panelConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
    icon: {
      name: 'check',
      ariaAttributes: {
        ariaLabel: '',
      },
    },
  };

  private readonly mergeConfigsService = inject(MergeConfigsService);
  private readonly defaultConfig = inject(FORM_SUMMARY_CONFIG, { optional: true }) as FormSummaryButtonsConfig;

  public ngOnInit(): void {
    this.initDefaultConfiguration();

    // Apply manually provided aria-labelledby to the panel config, if defined.
    // This ensures the panel references both its own title and any parent context for accessibility.
    if (this.panelLabelledById()) {
      this.panelConfig = {
        ...this.panelConfig,
        ariaAttributes: {
          ...this.panelConfig.ariaAttributes,
          ariaLabelledBy: this.panelLabelledById() ?? undefined,
        },
      };
    }

    if (this.panelConfig.icon?.ariaAttributes) {
      this.panelConfig.icon.ariaAttributes.ariaLabel = this.ariaLabelIcon();
    }
  }

  public ngAfterViewInit(): void {
    this.layoutSwapper()!.showProjection(this.currentView());
  }

  public onLayoutChange(view: 'FORM' | 'EMPTY'): void {
    const previousView = this.currentView();
    this.currentView.set(view);
    if (this.layoutSwapper()) {
      this.layoutSwapper()!.showProjection(view);
    }
    if (view === 'FORM' && previousView !== 'FORM') {
      this.opened.set(true);
      this.viewChangedToForm.emit();
    }
  }

  protected initDefaultConfiguration(): void {
    this.buttonsConfig.set(this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.buttonsConfig()));
  }

  public setChecked(value: boolean): void {
    this.checked.set(value);
    this.opened.set(true);
    this.updateEditButtonConfig();
  }

  public updateEditButtonConfig(): void {
    const config = this.buttonsConfig();
    if (config) {
      const newEditButtonConfig = {
        ...config.editButton,
        label: config.editButton?.label ?? '',
      };
      newEditButtonConfig.isDisabled = !this.checked();
      newEditButtonConfig.isDisabled = !this.opened();
      this.buttonsConfig.update((cfg) => ({ ...cfg, editButton: newEditButtonConfig }));
    }
  }
}
