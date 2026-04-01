import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { EventBusService, GenerateIdPipe, IbeEventTypeEnum, KeyCodeEnum, MergeConfigsService } from '@dcx/ui/libs';
import { filter, Subject, takeUntil } from 'rxjs';

import { PanelTitleDirective } from '../panel';
import { PanelHeaderComponent } from '../panel/components/panel-header/panel-header.component';
import { PanelContentDirective } from '../panel/directives/panel-content.directive';
import { PanelDescriptionDirective } from '../panel/directives/panel-description.directive';
import { PanelComponent } from '../panel/panel.component';

import { ExpansionPanelConfig } from './models/expansion-panel.config';
import { EXPANSION_PANEL_CONFIG } from './tokens/expansion-panel-default-config.token';

@Component({
  selector: 'expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./styles/expansion-panel.styles.scss'],
  host: {
    class: 'expansion-panel',
  },
  imports: [
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
  standalone: true,
})
export class ExpansionPanelComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public config!: ExpansionPanelConfig;
  public isExpanded: boolean = false;

  public expansionPanelHeaderId: string = '';
  public expansionPanelContentId: string = '';
  private readonly unsubscribe$: Subject<void> = new Subject();

  constructor(
    protected generateId: GenerateIdPipe,
    protected eventBusService: EventBusService,
    protected elementRef: ElementRef,
    @Inject(EXPANSION_PANEL_CONFIG) @Optional() private readonly defaultConfig: ExpansionPanelConfig,
    private readonly mergeConfigsService: MergeConfigsService
  ) {}

  public ngOnInit(): void {
    if (this.defaultConfig && this.config) {
      this.initDefaultConfiguration();
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  public onToggle(): void {
    if (this.config?.isCollapsible) {
      this.isExpanded = !this.isExpanded;
    }
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === KeyCodeEnum.ENTER) {
      this.onToggle();
    }
  }

  protected internalInit(): void {
    // Method intentionally left blank.
  }

  protected subscribeToFocusEvent(): void {
    this.eventBusService.eventNotifier$
      .pipe(
        filter((x) => x.type === IbeEventTypeEnum.focusExpansionPanel),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event) => {
        const focusTarget = this.elementRef.nativeElement.querySelector(`#${event?.payload?.id}`);
        if (focusTarget) {
          focusTarget.focus();
        }
      });
  }

  private initDefaultConfiguration(): void {
    this.config = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config);

    this.isExpanded = !!(this.config?.isCollapsible ? this.config.isExpanded : true);
    this.expansionPanelHeaderId = this.getTransformedId('expansionPanelHeader_');
    this.expansionPanelContentId = this.getTransformedId('expansionPanelContent_');
    this.subscribeToFocusEvent();
  }

  private getTransformedId(key: string): string {
    return this.config.panel.ariaAttributes?.ariaLabelledBy ?? this.generateId.transform(key);
  }
}
