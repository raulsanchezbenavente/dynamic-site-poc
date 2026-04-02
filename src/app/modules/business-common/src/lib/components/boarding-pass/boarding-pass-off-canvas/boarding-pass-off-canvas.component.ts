import { Component, inject, input, OnInit, output } from '@angular/core';
import { OffCanvasBodyDirective, OffCanvasComponent, OffCanvasConfig } from '@dcx/ui/design-system';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BoardingPassPreviewComponent } from '../boarding-pass-preview/boarding-pass-preview.component';
import { translationKeys } from '../translations/translation-keys';

import { BoardingPassOffCanvasData } from './models/boarding-pass-off-canvas-data.model';

@Component({
  selector: 'boarding-pass-off-canvas',
  templateUrl: './boarding-pass-off-canvas.component.html',
  styleUrls: ['./styles/boarding-pass-off-canvas.styles.scss'],
  host: {
    class: 'boarding-pass-off-canvas',
  },
  imports: [TranslateModule, OffCanvasBodyDirective, OffCanvasComponent, BoardingPassPreviewComponent],
  standalone: true,
})
export class BoardingPassOffCanvasComponent implements OnInit {
  public offCanvasConfig!: OffCanvasConfig;
  public data = input.required<BoardingPassOffCanvasData>();
  public closeOffCanvas = output<void>();

  private readonly translate = inject(TranslateService);

  public ngOnInit(): void {
    this.internalInit();
  }

  public onCloseOffCanvas(): void {
    this.closeOffCanvas.emit();
  }

  private internalInit(): void {
    this.setOffCanvasConfig();
  }

  private setOffCanvasConfig(): void {
    this.offCanvasConfig = {
      offCanvasHeaderConfig: {
        title: this.translate.instant(translationKeys.BoardingPassTitle),
      },
      panelClass: 'boarding-pass-off-canvas',
    };
  }
}
