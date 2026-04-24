import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GlobalLoaderService, NvdaIssuesService } from '@dcx/ui/business-common';
import {
  DsButtonComponent,
  DsLayoutSwapperComponent,
  DsSummaryBuilderComponent,
  DsSummaryRendererComponent,
  LayoutSlotDirective,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelDescriptionDirective,
  PanelHeaderAsideDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
  SummaryBuilderGridConfig,
  SummaryDataRenderer,
} from '@dcx/ui/design-system';
import { createResponsiveSignal, MergeConfigsService, ViewportSizeService } from '@dcx/ui/libs';
import {
  DsFormBlockerComponent,
  FormBuilderConfig,
  GridBuilderComponent,
  GridBuilderCustomType,
  RfBaseReactiveComponent,
  RfErrorDisplayModes,
  RfFormBuilderComponent,
  RfFormControl,
  SummaryBuilderAdditions,
  SummaryBuilderService,
} from 'reactive-forms';
import { BehaviorSubject, Observable } from 'rxjs';

import { FormSummaryViews } from './enums/form-summary-views';
import { FormSummaryButtonsConfig } from './models/form-summary-buttons-config.model';
import { RfFormSummaryStore } from './store/rf-form-summary.store';
import { FORM_SUMMARY_CONFIG } from './tokens/form-summary-buttons-default-config.token';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'form-summary',
  templateUrl: './form-summary.component.html',
  styleUrl: './styles/form-summary.styles.scss',
  host: { class: 'form-summary' },
  imports: [
    ReactiveFormsModule,
    RfFormBuilderComponent,
    DsFormBlockerComponent,
    GridBuilderComponent,
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelHeaderAsideDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
    DsLayoutSwapperComponent,
    NgTemplateOutlet,
    DsSummaryRendererComponent,
    DsSummaryBuilderComponent,
    DsButtonComponent,
    LayoutSlotDirective,
  ],
})
export class FormSummaryComponent implements OnInit, OnDestroy {
  public saveForm = output<unknown>();
  public cancelForm = output<boolean>();
  public focusEdit = output<boolean>();

  public buttonsConfig = model<FormSummaryButtonsConfig>();

  public allowedViews = input<string[]>([
    FormSummaryViews.FORM_BUILDER,
    FormSummaryViews.SUMMARY,
    FormSummaryViews.EMPTY,
  ]);
  public title = input.required<string>();
  public secondaryTitle = input<string>();
  public description = input<string>();
  public formName = input.required<string>();
  public columns = input<number>(2);
  public customFields = input<GridBuilderCustomType>({});
  public formBuilderConfig = model<FormBuilderConfig>({});
  public initialView = input<string>(FormSummaryViews.FORM_BUILDER);
  public additions = input<SummaryBuilderAdditions>({});
  public subtractions = input<string[]>([]);
  public hiddenControls = input<string[]>([]);
  public readonly editButton = viewChild<DsButtonComponent>('editButton');

  protected panelConfig: PanelBaseConfig = {
    appearance: PanelAppearance.BORDER,
  };
  public readonly titleElementId = input<string | null>(null);
  public readonly titleParentElementId = input<string | null>(null);

  public layoutSwapper = viewChild<DsLayoutSwapperComponent>('layoutSwap');
  public formBuilder = viewChild<RfFormBuilderComponent>('formBuilder');
  public bypassConfigToReplace: Record<string, any> = {};
  public bypassConfigSummaryToCreator: Record<string, SummaryDataRenderer> = {};
  public summaryGridConfig = model<SummaryBuilderGridConfig>({
    columns: this.columns(),
  });
  public isResponsive!: ReturnType<typeof createResponsiveSignal>[0];
  public selectedTemplate = signal<string>(FormSummaryViews.FORM_BUILDER);

  protected sharedConfig!: FormBuilderConfig;
  protected displayErrorMode = RfErrorDisplayModes.TOUCHED;
  protected FormSummaryViews = FormSummaryViews;

  private previousData: Record<string, any> = {};
  private storedEvent: MouseEvent | null = null;
  private readonly isSaving = signal<boolean>(false);

  private readonly summaryBuilderService = inject(SummaryBuilderService);
  private readonly store = inject(RfFormSummaryStore);
  private readonly globalLoaderService = inject(GlobalLoaderService);

  private readonly mergeConfigsService = inject(MergeConfigsService);
  private readonly defaultConfig = inject(FORM_SUMMARY_CONFIG, { optional: true }) as FormSummaryButtonsConfig;

  private destroyMediaQueryListener: () => void = () => {};
  private readonly selectedViewSubject = new BehaviorSubject<string>(FormSummaryViews.FORM_BUILDER);
  public selectedView$: Observable<string> = this.selectedViewSubject.asObservable();
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly nvdaIssuesService = inject(NvdaIssuesService);
  public anyFormBuilderActive = this.store.isAnyFormBuilderActive();

  constructor() {
    effect(() => {
      const view = this.store.getSelectedView(this.formName())();
      this.selectedTemplate.set(view);
      const formBuilder = this.formBuilder();
      if (formBuilder?.config() && view === FormSummaryViews.SUMMARY) {
        this.parseConfig();
      }

      if (this.store.getForceParseConfig(this.formName())()) {
        this.parseConfig();
        this.store.changeView(this.formName(), view);
      }
      const swapper = this.layoutSwapper();
      if (swapper) {
        swapper.showProjection(view);
      }
      if (this.selectedViewSubject.value !== view && formBuilder?.form) {
        this.selectedViewSubject.next(view);
      }
    });
  }

  public ngOnInit(): void {
    this.store.register(this.formName(), this, this.initialView());
    this.initDefaultConfiguration();
    this.setIsResponsive();

    // Apply manually provided aria-labelledby to the panel config, if defined.
    // This ensures the panel references both its own title and any parent context for accessibility.
    if (this.titleElementId()) {
      this.panelConfig = {
        ...this.panelConfig,
        ariaAttributes: {
          ...this.panelConfig.ariaAttributes,
          ariaLabelledBy: [this.titleParentElementId(), this.titleElementId()].filter(Boolean).join(' ') || undefined,
        },
      };
    }
  }

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
    this.store.unregister(this.formName());
  }

  public parseConfig(): void {
    this.bypassConfigSummaryToCreator = this.summaryBuilderService.calculateConfig(
      this.formBuilder()!,
      this.additions(),
      this.subtractions()
    );
    this.changeDetector.markForCheck();
    this.storeDataForm();
  }

  private storeDataForm(): void {
    this.previousData = this.formBuilder()?.form?.getRawValue();
  }

  public changeLayoutView(view: FormSummaryViews, event?: MouseEvent): void {
    this.store.changeView(this.formName(), view);
    this.focusElement(event, view);
    if (this.selectedViewSubject.value !== view) {
      this.selectedViewSubject.next(view);
    }
  }

  /**
   * Focuses the first invalid element in the form builder
   */
  private handlefocusFirstInvalidField(): void {
    const form = this.formBuilder()?.form;
    if (!form) {
      return;
    }

    requestAnimationFrame(() => {
      form.focusFirstInvalidField();
    });
  }

  private firstKeyFromJsonText(json: FormBuilderConfig): string {
    return Object.keys(json)[0];
  }

  protected markAllAsTouched(): void {
    this.formBuilder()?.form?.markAllAsTouched();
  }

  protected normalizeOneLevel<T extends object>(obj: T): T {
    const normalized: any = {};
    for (const key of Object.keys(obj)) {
      normalized[key] = obj[key as keyof T] === undefined ? null : obj[key as keyof T];
    }
    return normalized;
  }

  protected onCancel(event: MouseEvent): void {
    const previousDataKeys = Object.keys(this.previousData);
    const existPreviousData = previousDataKeys.length > 0;
    if (existPreviousData) {
      this.formBuilder()?.form?.setValue(this.normalizeOneLevel(this.previousData));
      this.changeLayoutView(FormSummaryViews.SUMMARY);
      this.focusElement(event, FormSummaryViews.SUMMARY);
    }
    if (this.isEmpty(this.previousData)) {
      this.focusEdit.emit(false);
    }
    this.cancelForm.emit(existPreviousData);
  }

  private isEmpty(o: any): boolean {
    if (!o || typeof o !== 'object') return true;
    return Object.values(o).every(
      (v) => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
    );
  }

  protected onSave(event: MouseEvent): void {
    if (this.isSaving()) {
      return;
    }

    this.markAllAsTouched();

    if (!this.isFormValid()) {
      this.handlefocusFirstInvalidField();
      return;
    }

    this.emitFormData();
    if (event) {
      this.storedEvent = event;
    }
  }

  private focusElement(event: MouseEvent | null | undefined, view: FormSummaryViews): void {
    if (!event) return;
    if (this.nvdaIssuesService.isEventFromKeyboard(event)) {
      if (view === FormSummaryViews.FORM_BUILDER) {
        const firstElementFormId: string = this.firstKeyFromJsonText(this.sharedConfig);
        const componentToFocus = (this.formBuilder()?.form?.get(firstElementFormId) as unknown as RfFormControl)
          .rfComponent;
        requestAnimationFrame(() => {
          (componentToFocus as RfBaseReactiveComponent).focus();
        });
      }
      if (view === FormSummaryViews.SUMMARY) {
        requestAnimationFrame(() => {
          if (this.editButton()) {
            this.editButton()?.focus();
            this.focusEdit.emit(true);
          }
        });
      }
    }
  }

  public focusAfterSave(): void {
    this.focusElement(this.storedEvent, FormSummaryViews.SUMMARY);
  }

  /**
   * Toggles save loading state: displays/hides button loader and blocks/unblocks the entire site
   * @param isLoading - true to show loading state, false to hide it
   */
  public showSaveLoadingState(isLoading: boolean): void {
    if (this.isSaving() === isLoading) {
      return;
    }

    this.isSaving.set(isLoading);

    if (isLoading) {
      this.globalLoaderService.show(true);
    } else {
      this.globalLoaderService.hide(false);
    }

    if (this.buttonsConfig()?.saveButton) {
      const currentConfig = this.buttonsConfig()!;

      currentConfig.saveButton = {
        ...currentConfig.saveButton!,
        isLoading: isLoading,
      };

      if (this.buttonsConfig()?.cancelButton) {
        currentConfig.cancelButton = {
          ...currentConfig.cancelButton!,
          isDisabled: isLoading,
        };
      }

      this.buttonsConfig.set({ ...currentConfig });
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Returns whether the form is currently in a saving state
   */
  public isSaveLoading(): boolean {
    return this.isSaving();
  }

  private isFormValid(): boolean {
    return this.formBuilder()?.form?.valid ?? false;
  }

  private emitFormData(): void {
    const formData = this.formBuilder()!.form!.getRawValue();
    this.saveForm.emit(formData);
  }

  protected initDefaultConfiguration(): void {
    this.buttonsConfig.set(this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.buttonsConfig()));
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--form-summary-layout-breakpoint');
    const mediaQuery = `(max-width: ${breakpoint}px)`;

    [this.isResponsive, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }
}
