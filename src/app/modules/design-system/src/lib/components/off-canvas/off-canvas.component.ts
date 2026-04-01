import {
  AfterViewInit,
  Component,
  computed,
  EventEmitter,
  input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MergeConfigsService } from '@dcx/ui/libs';
import { NgbOffcanvas, NgbOffcanvasOptions, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';

import { OffCanvasHeaderComponent } from './components/off-canvas-header/off-canvas-header.component';
import { OffCanvasConfig } from './models/off-canvas-config.model';

const DEFAULT_OFF_CANVAS_CONFIG: OffCanvasConfig = {
  offCanvasHeaderConfig: {
    title: 'Setting a header title is obligatory',
  },
  animation: true,
  position: 'bottom',
  scroll: false,
  showCloseButton: true,
};

@Component({
  selector: 'off-canvas',
  templateUrl: './off-canvas.component.html',
  styleUrls: ['./styles/off-canvas.styles.scss'],
  host: { class: 'ds-off-canvas' },
  encapsulation: ViewEncapsulation.None,
  imports: [OffCanvasHeaderComponent],
  standalone: true,
})
export class OffCanvasComponent implements AfterViewInit, OnDestroy {
  public readonly config = input.required<Partial<OffCanvasConfig>>();
  @ViewChild('content') public content!: TemplateRef<unknown>;

  @Output() public offcanvasClosedEmitter = new EventEmitter<void>();

  private offcanvasRef?: NgbOffcanvasRef;
  protected readonly resolvedConfig = computed<OffCanvasConfig>(() =>
    this.mergeConfigsService.mergeConfigs(DEFAULT_OFF_CANVAS_CONFIG, this.config())
  );

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly mergeConfigsService: MergeConfigsService
  ) {}

  public ngAfterViewInit(): void {
    this.open();
  }

  public ngOnDestroy(): void {
    this.offcanvasService.dismiss();
  }

  public open(): void {
    const resolvedConfig = this.resolvedConfig();
    const options: NgbOffcanvasOptions = {
      animation: resolvedConfig.animation,
      ariaDescribedBy: resolvedConfig.ariaDescribedBy,
      ariaLabelledBy: resolvedConfig.ariaLabelledBy,
      backdropClass: resolvedConfig.backdropClass,
      panelClass: resolvedConfig.panelClass,
      position: resolvedConfig.position,
      scroll: resolvedConfig.scroll,
    };

    this.offcanvasRef = this.offcanvasService.open(this.content, options);
    this.subcribeToOffcanvasClosed();
  }

  public dismiss(): void {
    this.offcanvasService.dismiss();
  }

  private subcribeToOffcanvasClosed(): void {
    this.offcanvasRef?.hidden.subscribe(() => {
      this.offcanvasClosedEmitter.emit();
    });
  }
}
